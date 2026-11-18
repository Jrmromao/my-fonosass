jest.mock('@/app/db', () => ({
  prisma: {
    auditEvent: {
      create: jest.fn(),
      findFirst: jest.fn(),
      deleteMany: jest.fn(),
    },
  },
}));

import { prisma } from '@/app/db';
import {
  AUDIT_RETENTION_MONTHS,
  AuditAction,
  purgeExpiredAuditEvents,
  recordAudit,
} from '@/lib/audit/audit';

const db = prisma as unknown as {
  auditEvent: Record<'create' | 'findFirst' | 'deleteMany', jest.Mock>;
};

beforeEach(() => {
  jest.resetAllMocks();
  jest.spyOn(Math, 'random').mockReturnValue(0.99); // never trigger the purge
  jest.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => jest.restoreAllMocks());

describe('recordAudit', () => {
  it('writes an event with the client IP from the request', async () => {
    db.auditEvent.create.mockResolvedValue({});
    const ok = await recordAudit({
      action: AuditAction.CACHE_CLEAR,
      actorType: 'ADMIN',
      actorId: 'u1',
      request: { headers: new Headers({ 'x-real-ip': '203.0.113.9' }) },
    });
    expect(ok).toBe(true);
    expect(db.auditEvent.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        action: 'admin.cache.clear',
        actorType: 'ADMIN',
        actorId: 'u1',
        ip: '203.0.113.9',
      }),
    });
  });

  it('truncates long metadata strings and caps the key count', async () => {
    db.auditEvent.create.mockResolvedValue({});
    const metadata: Record<string, string> = { long: 'x'.repeat(500) };
    for (let i = 0; i < 20; i++) metadata[`k${i}`] = 'v';
    await recordAudit({
      action: AuditAction.CACHE_CLEAR,
      actorType: 'ADMIN',
      metadata,
    });
    const saved = db.auditEvent.create.mock.calls[0][0].data.metadata;
    expect(saved.long).toHaveLength(120);
    expect(Object.keys(saved)).toHaveLength(10);
  });

  it('skips a throttled duplicate but still reports success', async () => {
    db.auditEvent.findFirst.mockResolvedValue({ id: 'recent' });
    const ok = await recordAudit({
      action: AuditAction.ADMIN_DENIED,
      actorType: 'USER',
      actorId: 'u1',
      throttleMs: 60_000,
    });
    expect(ok).toBe(true);
    expect(db.auditEvent.create).not.toHaveBeenCalled();
  });

  it('throttles anonymous events per IP', async () => {
    db.auditEvent.findFirst.mockResolvedValue(null);
    db.auditEvent.create.mockResolvedValue({});
    await recordAudit({
      action: AuditAction.APPROVAL_TOKEN_INVALID,
      actorType: 'ANONYMOUS',
      request: { headers: new Headers({ 'x-real-ip': '203.0.113.9' }) },
      throttleMs: 60_000,
    });
    expect(db.auditEvent.findFirst.mock.calls[0][0].where).toMatchObject({
      action: 'security.approval_token_invalid',
      ip: '203.0.113.9',
    });
  });

  it('never throws: a failed write returns false', async () => {
    db.auditEvent.create.mockRejectedValue(new Error('db down'));
    await expect(
      recordAudit({ action: AuditAction.CACHE_CLEAR, actorType: 'ADMIN' })
    ).resolves.toBe(false);
  });
});

describe('purgeExpiredAuditEvents', () => {
  it('deletes only events older than the retention window', async () => {
    db.auditEvent.deleteMany.mockResolvedValue({ count: 3 });
    const before = new Date();
    expect(await purgeExpiredAuditEvents()).toBe(3);
    const cutoff: Date =
      db.auditEvent.deleteMany.mock.calls[0][0].where.createdAt.lt;
    const months =
      (before.getFullYear() - cutoff.getFullYear()) * 12 +
      (before.getMonth() - cutoff.getMonth());
    expect(months).toBe(AUDIT_RETENTION_MONTHS);
  });
});
