const mockRecordAudit = jest.fn();
const mockRequireAdmin = jest.fn();
const mockGuardAdminActor = jest.fn();
const mockRateCheck = jest.fn();

jest.mock('@/lib/audit/audit', () => ({
  AuditAction: {
    WAITING_LIST_READ: 'admin.waiting_list.read',
    CSP_VIOLATION: 'security.csp_violation',
    CORRECTION_RESOLVE: 'admin.correction_request.resolve',
    ADMIN_DENIED: 'security.admin_denied',
    AUDIT_READ: 'admin.audit.read',
  },
  recordAudit: (...a: unknown[]) => mockRecordAudit(...a),
}));
jest.mock('@/lib/security/rateLimiter', () => ({
  rateLimiters: {
    general: { checkAsync: (...a: unknown[]) => mockRateCheck(...a) },
  },
}));
jest.mock('@/lib/activities/approval', () => {
  class AuthzError extends Error {
    status: number;
    constructor(status: number, message: string) {
      super(message);
      this.status = status;
    }
  }
  return {
    AuthzError,
    requireAdmin: (...a: unknown[]) => mockRequireAdmin(...a),
    guardAdminActor: (...a: unknown[]) => mockGuardAdminActor(...a),
    errorResponse: (e: any) =>
      e instanceof AuthzError
        ? { body: { error: e.message }, status: e.status }
        : { body: { error: 'Erro interno' }, status: 500 },
  };
});
jest.mock('@/lib/waiting-list-utils', () => ({
  waitingListManager: {
    getAllEntries: jest.fn().mockResolvedValue([{ email: 'a@b.com' }]),
    getEntriesForDate: jest.fn().mockResolvedValue([]),
    getStatistics: jest.fn().mockResolvedValue({}),
    exportAsCSV: jest.fn().mockResolvedValue(''),
  },
}));
jest.mock('@/app/db', () => ({
  prisma: {
    user: { findUnique: jest.fn() },
    dataCorrectionRequest: { findUnique: jest.fn() },
  },
}));
jest.mock('@/lib/privacy/dataCorrectionRequests', () => ({
  resolveCorrectionSchema: {
    safeParse: (v: any) =>
      v && ['RESOLVED', 'REJECTED'].includes(v.status) && v.resolutionNote
        ? { success: true, data: v }
        : { success: false },
  },
  resolveCorrectionRequest: jest.fn(),
}));

import { POST as cspReport } from '@/app/api/csp-report/route';
import { GET as waitingList } from '@/app/api/admin/waiting-list/route';
import { POST as resolveCorrection } from '@/app/api/admin/correction-requests/[id]/route';
import { resolveCorrectionRequest } from '@/lib/privacy/dataCorrectionRequests';
import { AuthzError } from '@/lib/activities/approval';
import { NextResponse } from 'next/server';

// The shared next/server jest mock only provides NextResponse, so requests
// are plain objects with the members the routes use.
const req = (url: string, init: any = {}) => ({
  url,
  method: init.method ?? 'GET',
  headers: new Headers(init.headers ?? {}),
  text: async () => init.body ?? '',
  json: async () => JSON.parse(init.body ?? 'null'),
});

beforeEach(() => {
  jest.clearAllMocks();
  mockRecordAudit.mockResolvedValue(true);
  mockRateCheck.mockResolvedValue({ success: true });
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

describe('POST /api/csp-report', () => {
  const valid = {
    'csp-report': {
      'violated-directive': 'img-src',
      'effective-directive': 'img-src',
      'blocked-uri': 'https://cdn.example.com/a/b.png?token=SECRET',
      'document-uri': 'https://www.site.com/dashboard?email=x@y.com',
      disposition: 'report',
    },
  };

  it('stores only the blocked origin and the page path (no query strings)', async () => {
    const res = await cspReport(
      req('http://x/api/csp-report', {
        method: 'POST',
        body: JSON.stringify(valid),
      })
    );
    expect(res.status).toBe(204);
    const call = mockRecordAudit.mock.calls[0][0];
    expect(call.metadata).toEqual({
      directive: 'img-src',
      blocked: 'https://cdn.example.com',
      page: '/dashboard',
      disposition: 'report',
    });
    expect(JSON.stringify(call)).not.toMatch(/SECRET|x@y\.com/);
    expect(call.throttleMs).toBeGreaterThan(0);
  });

  it('rejects oversize, malformed and invalid payloads without storing anything', async () => {
    const big = await cspReport(
      req('http://x', {
        method: 'POST',
        body: '{}',
        headers: { 'content-length': '999999' },
      })
    );
    expect(big.status).toBe(413);
    const bad = await cspReport(
      req('http://x', { method: 'POST', body: 'not json' })
    );
    expect(bad.status).toBe(400);
    const wrong = await cspReport(
      req('http://x', { method: 'POST', body: JSON.stringify({ foo: 1 }) })
    );
    expect(wrong.status).toBe(400);
    expect(mockRecordAudit).not.toHaveBeenCalled();
  });

  it('is rate limited', async () => {
    mockRateCheck.mockResolvedValue({ success: false });
    const res = await cspReport(
      req('http://x', { method: 'POST', body: JSON.stringify(valid) })
    );
    expect(res.status).toBe(429);
    expect(mockRecordAudit).not.toHaveBeenCalled();
  });
});

describe('GET /api/admin/waiting-list', () => {
  const call = () =>
    waitingList(req('http://localhost/api/admin/waiting-list') as any);

  it('refuses a non-admin before touching any data', async () => {
    mockGuardAdminActor.mockResolvedValue({
      response: NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      ),
    });
    const res = await call();
    expect(res.status).toBe(403);
    expect(mockRecordAudit).not.toHaveBeenCalled();
  });

  it('serves the list and records who read it', async () => {
    mockGuardAdminActor.mockResolvedValue({ dbUserId: 'admin1' });
    const res = await call();
    expect(res.status).toBe(200);
    expect(mockRecordAudit.mock.calls[0][0]).toMatchObject({
      action: 'admin.waiting_list.read',
      actorType: 'ADMIN',
      actorId: 'admin1',
    });
  });

  it('fails closed: no audit trail, no personal data (503)', async () => {
    mockGuardAdminActor.mockResolvedValue({ dbUserId: 'admin1' });
    mockRecordAudit.mockResolvedValue(false);
    const res = await call();
    expect(res.status).toBe(503);
    expect(JSON.stringify(await res.json())).not.toContain('a@b.com');
  });
});

describe('POST /api/admin/correction-requests/[id]', () => {
  const id = 'cmwleybc3000494hetzau1zc9';
  const call = (body: unknown) =>
    resolveCorrection(
      req('http://x', { method: 'POST', body: JSON.stringify(body) }) as any,
      { params: Promise.resolve({ id }) }
    );

  it('returns 403 for a non-admin and 401 when signed out', async () => {
    mockRequireAdmin.mockRejectedValue(
      new AuthzError(403, 'Insufficient permissions')
    );
    expect(
      (await call({ status: 'RESOLVED', resolutionNote: 'ok' })).status
    ).toBe(403);
    mockRequireAdmin.mockRejectedValue(new AuthzError(401, 'Unauthorized'));
    expect(
      (await call({ status: 'RESOLVED', resolutionNote: 'ok' })).status
    ).toBe(401);
    expect(resolveCorrectionRequest).not.toHaveBeenCalled();
  });

  it('requires a result and a note for the user', async () => {
    mockRequireAdmin.mockResolvedValue({ dbUserId: 'a1', userId: 'c1' });
    expect(
      (await call({ status: 'RESOLVED', resolutionNote: '' })).status
    ).toBe(400);
  });

  it('refuses to answer twice (409) and leaves no audit entry', async () => {
    mockRequireAdmin.mockResolvedValue({ dbUserId: 'a1', userId: 'c1' });
    (resolveCorrectionRequest as jest.Mock).mockResolvedValue(null);
    const res = await call({ status: 'RESOLVED', resolutionNote: 'ok' });
    expect(res.status).toBe(409);
    expect(mockRecordAudit).not.toHaveBeenCalled();
  });
});
