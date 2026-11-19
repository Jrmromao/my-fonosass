jest.mock('@/app/db', () => ({
  prisma: {
    dataExportRequest: {
      count: jest.fn(),
      create: jest.fn(),
      updateMany: jest.fn(),
    },
    dataCorrectionRequest: {
      count: jest.fn(),
      create: jest.fn(),
      updateMany: jest.fn(),
      findUnique: jest.fn(),
    },
    processedWebhookEvent: { create: jest.fn(), deleteMany: jest.fn() },
  },
}));

import { prisma } from '@/app/db';
import {
  createCorrectionRequest,
  createCorrectionSchema,
  MAX_CORRECTION_REQUESTS_PER_DAY,
  resolveCorrectionRequest,
  resolveCorrectionSchema,
} from '@/lib/privacy/dataCorrectionRequests';
import {
  createExportRequest,
  MAX_REQUESTS_PER_DAY,
  recordExportDownload,
  toExportRequestDto,
} from '@/lib/privacy/dataExportRequests';
import {
  claimWebhookEvent,
  releaseWebhookEvent,
} from '@/lib/webhooks/idempotency';
import { Prisma } from '@prisma/client';

const db = prisma as any;
beforeEach(() => {
  jest.resetAllMocks();
  jest.spyOn(Math, 'random').mockReturnValue(0.99);
  jest.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => jest.restoreAllMocks());

describe('export requests', () => {
  it('creates an answered request with a 7-day link', async () => {
    db.dataExportRequest.count.mockResolvedValue(0);
    db.dataExportRequest.create.mockImplementation(async ({ data }: any) => ({
      id: 'r1',
      ...data,
    }));
    const res = await createExportRequest({ userId: 'u1' });
    expect(res.ok).toBe(true);
    const data = db.dataExportRequest.create.mock.calls[0][0].data;
    expect(data.status).toBe('COMPLETED');
    expect(data.expiresAt.getTime() - data.requestedAt.getTime()).toBe(
      7 * 86_400_000
    );
  });

  it('refuses beyond the daily limit', async () => {
    db.dataExportRequest.count.mockResolvedValue(MAX_REQUESTS_PER_DAY);
    expect((await createExportRequest({ userId: 'u1' })).ok).toBe(false);
    expect(db.dataExportRequest.create).not.toHaveBeenCalled();
  });

  it('counts downloads only for the owner, completed and unexpired', async () => {
    db.dataExportRequest.updateMany.mockResolvedValue({ count: 1 });
    expect(await recordExportDownload('r1', 'u1')).toBe(true);
    expect(
      db.dataExportRequest.updateMany.mock.calls[0][0].where
    ).toMatchObject({
      id: 'r1',
      userId: 'u1',
      status: 'COMPLETED',
    });
    db.dataExportRequest.updateMany.mockResolvedValue({ count: 0 });
    expect(await recordExportDownload('r1', 'someone-else')).toBe(false);
  });

  it('shows an expired completed request as EXPIRED with no link', () => {
    const dto = toExportRequestDto(
      {
        id: 'r1',
        userId: 'u',
        format: 'JSON',
        reason: null,
        status: 'COMPLETED',
        requestedAt: new Date('2026-01-01'),
        completedAt: new Date('2026-01-01'),
        expiresAt: new Date('2026-01-08'),
        downloadCount: 1,
        error: null,
      },
      new Date('2026-02-01')
    );
    expect(dto.status).toBe('EXPIRED');
    expect(dto.downloadUrl).toBeNull();
  });
});

describe('correction requests', () => {
  it('validates the description and the answer', () => {
    expect(
      createCorrectionSchema.safeParse({ description: 'curto' }).success
    ).toBe(false);
    expect(
      createCorrectionSchema.safeParse({ description: 'x'.repeat(1001) })
        .success
    ).toBe(false);
    expect(
      createCorrectionSchema.safeParse({ description: 'Meu nome está errado.' })
        .success
    ).toBe(true);
    expect(
      resolveCorrectionSchema.safeParse({
        status: 'PENDING',
        resolutionNote: 'x',
      }).success
    ).toBe(false);
    expect(
      resolveCorrectionSchema.safeParse({
        status: 'RESOLVED',
        resolutionNote: '',
      }).success
    ).toBe(false);
  });

  it('refuses beyond the daily limit', async () => {
    db.dataCorrectionRequest.count.mockResolvedValue(
      MAX_CORRECTION_REQUESTS_PER_DAY
    );
    expect(
      (
        await createCorrectionRequest({
          userId: 'u1',
          description: 'abcdefghijk',
        })
      ).ok
    ).toBe(false);
  });

  it('answers only PENDING requests (answers are final)', async () => {
    db.dataCorrectionRequest.updateMany.mockResolvedValue({ count: 0 });
    expect(
      await resolveCorrectionRequest({
        id: 'c1',
        adminDbUserId: 'a1',
        status: 'RESOLVED',
        resolutionNote: 'ok',
      })
    ).toBeNull();
    expect(db.dataCorrectionRequest.updateMany.mock.calls[0][0].where).toEqual({
      id: 'c1',
      status: 'PENDING',
    });
  });
});

describe('webhook idempotency', () => {
  it('claims a new event and refuses a duplicate delivery', async () => {
    db.processedWebhookEvent.create.mockResolvedValueOnce({});
    expect(await claimWebhookEvent('evt_1', 'invoice.payment_succeeded')).toBe(
      true
    );
    // The repo's jest mock of @prisma/client takes (message, code); the real
    // class takes (message, { code, clientVersion }). Setting `code` after
    // construction works with both.
    const duplicate = new (Prisma.PrismaClientKnownRequestError as any)(
      'duplicate',
      'P2002'
    );
    duplicate.code = 'P2002';
    db.processedWebhookEvent.create.mockRejectedValueOnce(duplicate);
    expect(await claimWebhookEvent('evt_1', 'invoice.payment_succeeded')).toBe(
      false
    );
  });

  it('fails open on an unexpected database error (never drops a payment event)', async () => {
    db.processedWebhookEvent.create.mockRejectedValue(new Error('db down'));
    expect(await claimWebhookEvent('evt_2', 'x')).toBe(true);
  });

  it('releases a claim so a retry can run', async () => {
    db.processedWebhookEvent.deleteMany.mockResolvedValue({ count: 1 });
    await releaseWebhookEvent('evt_3');
    expect(db.processedWebhookEvent.deleteMany).toHaveBeenCalledWith({
      where: { id: 'evt_3' },
    });
  });
});
