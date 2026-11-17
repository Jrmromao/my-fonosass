import { beforeEach, describe, expect, it, jest } from '@jest/globals';

jest.mock('@clerk/nextjs/server', () => ({ auth: jest.fn() }));
jest.mock('@/lib/security/securityMiddleware', () => ({
  SecurityMiddleware: { apply: jest.fn() },
}));
jest.mock('@/app/db', () => ({
  prisma: { user: { findUnique: jest.fn() } },
}));
jest.mock('@/lib/services/consentService', () => ({
  ConsentService: {
    getUserConsentStatus: jest.fn(),
    recordConsent: jest.fn(),
  },
}));

const m = () => ({
  auth: require('@clerk/nextjs/server').auth,
  security: require('@/lib/security/securityMiddleware').SecurityMiddleware,
  prisma: require('@/app/db').prisma,
  service: require('@/lib/services/consentService').ConsentService,
});

const put = async (body: unknown) => {
  const { PUT } = await import('@/app/api/consent/preferences/route');
  return PUT(
    new Request('http://localhost/api/consent/preferences', {
      method: 'PUT',
      body: JSON.stringify(body),
    }) as never
  );
};

describe('PUT /api/consent/preferences', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    m().security.apply.mockResolvedValue({ success: true });
    m().auth.mockResolvedValue({ userId: 'clerk-1' });
    m().prisma.user.findUnique.mockResolvedValue({ id: 'db-1' });
    m().service.getUserConsentStatus.mockResolvedValue([
      { consentType: 'ANALYTICS_TRACKING', granted: true },
    ]);
  });

  it('returns 400 for an invalid body', async () => {
    expect((await put({ marketingCommunications: 'yes' })).status).toBe(400);
    expect(m().service.recordConsent).not.toHaveBeenCalled();
  });

  it('returns 404 when the user has no database row', async () => {
    m().prisma.user.findUnique.mockResolvedValue(null);
    expect((await put({ marketingCommunications: true })).status).toBe(404);
  });

  it('saves marketing and keeps the other consents as they were', async () => {
    const res = await put({ marketingCommunications: true });
    expect(res.status).toBe(200);
    expect(m().service.recordConsent).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'db-1',
        preferences: expect.objectContaining({
          marketingCommunications: true,
          analyticsTracking: true,
          thirdPartySharing: false,
          dataProcessing: true,
        }),
      })
    );
  });
});
