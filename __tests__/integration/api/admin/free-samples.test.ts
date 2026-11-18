import { beforeEach, describe, expect, it, jest } from '@jest/globals';

jest.mock('@clerk/nextjs/server', () => ({ auth: jest.fn() }));
jest.mock('next/cache', () => ({ revalidatePath: jest.fn() }));
jest.mock('@/lib/security/securityMiddleware', () => ({
  SecurityMiddleware: { apply: jest.fn(async () => ({ success: true })) },
}));
jest.mock('@/app/db', () => ({
  prisma: {
    user: { findUnique: jest.fn() },
    activity: { count: jest.fn(), findMany: jest.fn(async () => []) },
    freeSampleSelection: {
      findMany: jest.fn(async () => []),
      deleteMany: jest.fn(),
      createMany: jest.fn(),
    },
    $transaction: jest.fn(async () => []),
  },
}));

const m = () => ({
  auth: require('@clerk/nextjs/server').auth,
  prisma: require('@/app/db').prisma,
  revalidatePath: require('next/cache').revalidatePath,
});

const nextMonth = () => {
  const d = new Date();
  const n = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1));
  return `${n.getUTCFullYear()}-${String(n.getUTCMonth() + 1).padStart(2, '0')}`;
};

const req = (method: string, body?: unknown, qs = '') => {
  const url = new URL(`http://localhost/api/admin/free-samples${qs}`);
  const r = new Request(url, {
    method,
    body: body ? JSON.stringify(body) : undefined,
  }) as unknown as { nextUrl: URL };
  r.nextUrl = url;
  return r as never;
};

const route = () => require('@/app/api/admin/free-samples/route');

describe('/api/admin/free-samples', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    m().auth.mockResolvedValue({ userId: 'clerk-admin' });
    m().prisma.user.findUnique.mockResolvedValue({
      id: 'admin-1',
      role: 'ADMIN',
    });
    m().prisma.activity.count.mockResolvedValue(2);
  });

  it('refuses non-admins', async () => {
    m().prisma.user.findUnique.mockResolvedValue({ id: 'u1', role: 'USER' });
    const res = await route().PUT(
      req('PUT', { month: nextMonth(), activityIds: ['a', 'b'] })
    );
    expect(res.status).toBe(403);
    expect(m().prisma.$transaction).not.toHaveBeenCalled();
  });

  it('saves exactly 2 distinct eligible activities and refreshes the pages', async () => {
    const res = await route().PUT(
      req('PUT', { month: nextMonth(), activityIds: ['a', 'b'] })
    );
    expect(res.status).toBe(200);
    expect(m().prisma.freeSampleSelection.createMany).toHaveBeenCalledWith({
      data: [
        expect.objectContaining({
          activityId: 'a',
          position: 0,
          createdById: 'admin-1',
        }),
        expect.objectContaining({ activityId: 'b', position: 1 }),
      ],
    });
    expect(m().revalidatePath).toHaveBeenCalledWith('/');
  });

  it.each([[['a']], [['a', 'a']], [['a', 'b', 'c']]])(
    'rejects %j (needs 2 different activities)',
    async (ids) => {
      const res = await route().PUT(
        req('PUT', { month: nextMonth(), activityIds: ids })
      );
      expect(res.status).toBe(400);
      expect(m().prisma.$transaction).not.toHaveBeenCalled();
    }
  );

  it('rejects activities that are not published or have no image', async () => {
    m().prisma.activity.count.mockResolvedValue(1);
    const res = await route().PUT(
      req('PUT', { month: nextMonth(), activityIds: ['a', 'b'] })
    );
    expect(res.status).toBe(400);
    expect(m().prisma.$transaction).not.toHaveBeenCalled();
  });

  it('refuses to change a past month', async () => {
    const res = await route().PUT(
      req('PUT', { month: '2020-01', activityIds: ['a', 'b'] })
    );
    expect(res.status).toBe(400);
  });

  it('goes back to the /s/ default', async () => {
    const res = await route().DELETE(
      req('DELETE', undefined, `?mes=${nextMonth()}`)
    );
    expect(res.status).toBe(200);
    expect(m().prisma.freeSampleSelection.deleteMany).toHaveBeenCalled();
    expect((await res.json()).data.source).toBe('default');
  });
});
