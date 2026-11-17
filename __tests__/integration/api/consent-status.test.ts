import { beforeEach, describe, expect, it, jest } from '@jest/globals';

jest.mock('@clerk/nextjs/server', () => ({ auth: jest.fn() }));
jest.mock('@/app/db', () => ({
  prisma: { user: { findUnique: jest.fn() } },
}));
jest.mock('@/lib/services/consentService', () => ({
  ConsentService: { getUserConsentStatus: jest.fn() },
}));

const m = () => ({
  auth: require('@clerk/nextjs/server').auth,
  prisma: require('@/app/db').prisma,
  service: require('@/lib/services/consentService').ConsentService,
});

const get = async () => {
  const { GET } = await import('@/app/api/consent/status/route');
  return GET({} as never);
};

describe('GET /api/consent/status', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 401 when not signed in', async () => {
    m().auth.mockResolvedValue({ userId: null });
    expect((await get()).status).toBe(401);
  });

  it('returns 404 when the user has no database row', async () => {
    m().auth.mockResolvedValue({ userId: 'clerk-1' });
    m().prisma.user.findUnique.mockResolvedValue(null);
    expect((await get()).status).toBe(404);
    expect(m().service.getUserConsentStatus).not.toHaveBeenCalled();
  });

  it('queries consents by the database user id, not the Clerk id', async () => {
    m().auth.mockResolvedValue({ userId: 'clerk-1' });
    m().prisma.user.findUnique.mockResolvedValue({ id: 'db-1' });
    m().service.getUserConsentStatus.mockResolvedValue([]);
    const res = await get();
    expect(res.status).toBe(200);
    expect(m().service.getUserConsentStatus).toHaveBeenCalledWith('db-1');
  });
});
