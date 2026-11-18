import { beforeEach, describe, expect, it, jest } from '@jest/globals';

const mockCookie = { value: undefined as string | undefined };
jest.mock('next/headers', () => ({
  cookies: async () => ({
    get: () => (mockCookie.value ? { value: mockCookie.value } : undefined),
  }),
}));
jest.mock('@/lib/access', () => ({
  hasActiveSubscription: jest.fn(async () => false),
}));

import { getEffectiveAccess, getEffectiveIsAdmin } from '@/lib/auth/viewAs';

const admin = { id: 'a1', role: 'ADMIN' as const };
const user = { id: 'u1', role: 'USER' as const };

describe('Ver como', () => {
  beforeEach(() => {
    mockCookie.value = undefined;
  });

  it('admins keep full access without the cookie', async () => {
    expect(await getEffectiveAccess(admin)).toMatchObject({
      isAdmin: true,
      viewAs: null,
    });
    expect(await getEffectiveIsAdmin(admin)).toBe(true);
  });

  it('"assinante" = subscriber, not admin', async () => {
    mockCookie.value = 'assinante';
    expect(await getEffectiveAccess(admin)).toEqual({
      isAdmin: false,
      subscribed: true,
      viewAs: 'assinante',
    });
    expect(await getEffectiveIsAdmin(admin)).toBe(false);
  });

  it('"sem-assinatura" = no subscription, not admin', async () => {
    mockCookie.value = 'sem-assinatura';
    expect(await getEffectiveAccess(admin)).toEqual({
      isAdmin: false,
      subscribed: false,
      viewAs: 'sem-assinatura',
    });
  });

  it('is ignored for non-admins: a user cannot grant themselves a subscription', async () => {
    mockCookie.value = 'assinante';
    expect(await getEffectiveAccess(user)).toEqual({
      isAdmin: false,
      subscribed: false,
      viewAs: null,
    });
  });

  it('ignores unknown cookie values', async () => {
    mockCookie.value = 'ADMIN';
    expect(await getEffectiveAccess(admin)).toMatchObject({
      isAdmin: true,
      viewAs: null,
    });
  });
});
