import { beforeEach, describe, expect, it, jest } from '@jest/globals';

jest.mock('@clerk/nextjs/server', () => ({ auth: jest.fn() }));
jest.mock('@/lib/security/securityMiddleware', () => ({
  SecurityMiddleware: { apply: jest.fn(async () => ({ success: true })) },
}));
const mockJar = {
  get: jest.fn(() => ({ value: 'assinante' })),
  set: jest.fn(),
  delete: jest.fn(),
};
jest.mock('next/headers', () => ({ cookies: async () => mockJar }));
jest.mock('@/app/db', () => ({
  prisma: { user: { findUnique: jest.fn() } },
}));

const m = () => ({
  auth: require('@clerk/nextjs/server').auth,
  prisma: require('@/app/db').prisma,
});
const route = () => require('@/app/api/admin/view-as/route');
const post = (mode: unknown) =>
  route().POST(
    new Request('http://localhost/api/admin/view-as', {
      method: 'POST',
      body: JSON.stringify({ mode }),
    }) as never
  );

describe('/api/admin/view-as', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    m().auth.mockResolvedValue({ userId: 'clerk-1' });
  });

  it('refuses non-admins (they cannot turn the mode on)', async () => {
    m().prisma.user.findUnique.mockResolvedValue({ id: 'u1', role: 'USER' });
    const res = await post('assinante');
    expect(res.status).toBe(403);
    expect(mockJar.set).not.toHaveBeenCalled();
  });

  it('reports no mode to non-admins even if the cookie is present', async () => {
    m().prisma.user.findUnique.mockResolvedValue({
      id: 'u1',
      role: 'USER',
      email: 'x',
    });
    const json = await (await route().GET()).json();
    expect(json.data.mode).toBeNull();
  });

  it('sets an httpOnly cookie for admins', async () => {
    m().prisma.user.findUnique.mockResolvedValue({ id: 'a1', role: 'ADMIN' });
    const res = await post('sem-assinatura');
    expect(res.status).toBe(200);
    expect(mockJar.set).toHaveBeenCalledWith(
      'almanaque_ver_como',
      'sem-assinatura',
      expect.objectContaining({ httpOnly: true, sameSite: 'lax', path: '/' })
    );
  });

  it('clears the cookie when leaving the mode', async () => {
    m().prisma.user.findUnique.mockResolvedValue({ id: 'a1', role: 'ADMIN' });
    expect((await post(null)).status).toBe(200);
    expect(mockJar.delete).toHaveBeenCalledWith('almanaque_ver_como');
  });

  it('rejects unknown modes (no way to request ADMIN or anything else)', async () => {
    m().prisma.user.findUnique.mockResolvedValue({ id: 'a1', role: 'ADMIN' });
    expect((await post('ADMIN')).status).toBe(400);
  });
});
