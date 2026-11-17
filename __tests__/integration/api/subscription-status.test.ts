import { beforeEach, describe, expect, it, jest } from '@jest/globals';

jest.mock('@clerk/nextjs/server', () => ({ auth: jest.fn() }));
jest.mock('@/app/db', () => ({
  prisma: {
    user: { findUnique: jest.fn() },
    subscription: { findUnique: jest.fn() },
  },
}));
jest.mock('@/lib/stripe', () => ({
  stripe: { subscriptions: { retrieve: jest.fn() } },
}));

const m = () => ({
  auth: require('@clerk/nextjs/server').auth,
  prisma: require('@/app/db').prisma,
  stripe: require('@/lib/stripe').stripe,
});

const get = async () => {
  const { GET } = await import('@/app/api/subscription/status/route');
  return GET();
};

describe('GET /api/subscription/status', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 401 when not signed in', async () => {
    m().auth.mockResolvedValue({ userId: null });
    const res = await get();
    expect(res.status).toBe(401);
  });

  it('returns 404 when the user is not in the database', async () => {
    m().auth.mockResolvedValue({ userId: 'c1' });
    m().prisma.user.findUnique.mockResolvedValue(null);
    const res = await get();
    expect(res.status).toBe(404);
  });

  it('reports no subscription for a free user', async () => {
    m().auth.mockResolvedValue({ userId: 'c1' });
    m().prisma.user.findUnique.mockResolvedValue({ id: 'u1', role: 'USER' });
    m().prisma.subscription.findUnique.mockResolvedValue(null);
    const res = await get();
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.data.subscribed).toBe(false);
    expect(json.data.canManage).toBe(false);
    expect(m().stripe.subscriptions.retrieve).not.toHaveBeenCalled();
  });

  it('returns renewal date and cancel flag for a subscriber', async () => {
    const end = new Date('2027-01-10T00:00:00.000Z');
    m().auth.mockResolvedValue({ userId: 'c1' });
    m().prisma.user.findUnique.mockResolvedValue({ id: 'u1', role: 'USER' });
    m().prisma.subscription.findUnique.mockResolvedValue({
      status: 'ACTIVE',
      tier: 'PRO',
      currentPeriodEnd: end,
      paymentId: 'sub_1',
    });
    m().stripe.subscriptions.retrieve.mockResolvedValue({
      cancel_at_period_end: true,
    });
    const res = await get();
    const json = await res.json();
    expect(json.data.subscribed).toBe(true);
    expect(json.data.cancelAtPeriodEnd).toBe(true);
    expect(json.data.currentPeriodEnd).toBe(end.toISOString());
    expect(res.headers.get('Cache-Control')).toBe('private, no-store');
  });
});
