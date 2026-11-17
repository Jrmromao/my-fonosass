import { beforeEach, describe, expect, it, jest } from '@jest/globals';

const mockDeleteUser = jest.fn<(id: string) => Promise<unknown>>();

jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn(),
  clerkClient: jest.fn(async () => ({ users: { deleteUser: mockDeleteUser } })),
}));
jest.mock('@/lib/security/securityMiddleware', () => ({
  SecurityMiddleware: { apply: jest.fn() },
}));
jest.mock('@/lib/stripe', () => ({
  stripe: { subscriptions: { cancel: jest.fn() } },
}));
jest.mock('@/app/db', () => {
  const model = () => ({ deleteMany: jest.fn(), delete: jest.fn() });
  return {
    prisma: {
      user: { findUnique: jest.fn(), delete: jest.fn() },
      consentAuditLog: model(),
      consentRecord: model(),
      downloadHistory: model(),
      download: model(),
      downloadLimit: model(),
      resourceDownload: model(),
      resourceView: model(),
      resourceRating: model(),
      dataRetentionLog: model(),
      subscription: model(),
      $transaction: jest.fn(),
    },
  };
});

const m = () => ({
  auth: require('@clerk/nextjs/server').auth,
  security: require('@/lib/security/securityMiddleware').SecurityMiddleware,
  stripe: require('@/lib/stripe').stripe,
  prisma: require('@/app/db').prisma,
});

const call = async (body: unknown = { confirmDeletion: true }) => {
  const { POST } = await import('@/app/api/user-data/delete/route');
  return POST(
    new Request('http://localhost/api/user-data/delete', {
      method: 'POST',
      body: JSON.stringify(body),
    }) as never
  );
};

const user = (over: Record<string, unknown> = {}) => ({
  id: 'u1',
  role: 'USER',
  subscriptions: { paymentId: 'sub_1' },
  _count: { createdActivities: 0, reviewedActivities: 0, createdResources: 0 },
  ...over,
});

describe('POST /api/user-data/delete', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    m().security.apply.mockResolvedValue({ success: true });
    m().auth.mockResolvedValue({ userId: 'clerk-1' });
    m().prisma.user.findUnique.mockResolvedValue(user());
    m().prisma.$transaction.mockResolvedValue([]);
    m().stripe.subscriptions.cancel.mockResolvedValue({});
    mockDeleteUser.mockResolvedValue({});
  });

  it('returns the security response when CSRF fails', async () => {
    m().security.apply.mockResolvedValue({
      success: false,
      response: new Response('{}', { status: 403 }),
    });
    expect((await call()).status).toBe(403);
    expect(m().prisma.$transaction).not.toHaveBeenCalled();
  });

  it('returns 400 without explicit confirmation', async () => {
    expect((await call({ confirmDeletion: false })).status).toBe(400);
    expect(m().stripe.subscriptions.cancel).not.toHaveBeenCalled();
  });

  it('refuses admins and accounts with authored content', async () => {
    m().prisma.user.findUnique.mockResolvedValue(user({ role: 'ADMIN' }));
    const res = await call();
    expect(res.status).toBe(409);
    expect((await res.json()).error).toBe('ACCOUNT_HAS_CONTENT');
    expect(m().prisma.$transaction).not.toHaveBeenCalled();
  });

  it('deletes nothing when the Stripe cancellation fails', async () => {
    m().stripe.subscriptions.cancel.mockRejectedValue(
      Object.assign(new Error('boom'), { code: 'api_error' })
    );
    const res = await call();
    expect(res.status).toBe(502);
    expect(m().prisma.$transaction).not.toHaveBeenCalled();
    expect(mockDeleteUser).not.toHaveBeenCalled();
  });

  it('cancels billing, deletes the data, then the Clerk login', async () => {
    const res = await call();
    expect(res.status).toBe(200);
    expect(m().stripe.subscriptions.cancel).toHaveBeenCalledWith('sub_1');
    expect(m().prisma.$transaction).toHaveBeenCalled();
    expect(mockDeleteUser).toHaveBeenCalledWith('clerk-1');
  });

  it('continues when the Stripe subscription no longer exists', async () => {
    m().stripe.subscriptions.cancel.mockRejectedValue(
      Object.assign(new Error('gone'), { code: 'resource_missing' })
    );
    expect((await call()).status).toBe(200);
  });

  it('reports a login failure after the data is gone', async () => {
    mockDeleteUser.mockRejectedValue(new Error('clerk down'));
    const res = await call();
    expect(res.status).toBe(500);
    expect((await res.json()).error).toBe('LOGIN_DELETE_FAILED');
  });
});
