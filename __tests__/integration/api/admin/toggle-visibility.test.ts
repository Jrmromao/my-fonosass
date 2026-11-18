import { beforeEach, describe, expect, it, jest } from '@jest/globals';

jest.mock('@clerk/nextjs/server', () => ({ auth: jest.fn() }));
// next/cache needs the Next.js runtime; only check that pages are refreshed.
jest.mock('@/lib/cache/publicPages', () => ({
  refreshPublicCatalogPages: jest.fn(),
}));
jest.mock('@/app/db', () => ({
  prisma: {
    user: { findUnique: jest.fn() },
    activity: { findUnique: jest.fn(), update: jest.fn() },
  },
}));

const m = () => ({
  auth: require('@clerk/nextjs/server').auth,
  prisma: require('@/app/db').prisma,
});

const toggle = async (isPublic: boolean) => {
  const { POST } = await import(
    '@/app/api/admin/activities/[id]/toggle-visibility/route'
  );
  return POST(
    new Request('http://localhost/x', {
      method: 'POST',
      body: JSON.stringify({ isPublic }),
    }) as never,
    { params: Promise.resolve({ id: 'a1' }) }
  );
};

const activity = (status: string, reviewedAt: Date | null) =>
  m().prisma.activity.findUnique.mockResolvedValue({
    id: 'a1',
    status,
    reviewedAt,
  });

describe('POST /api/admin/activities/[id]/toggle-visibility', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    m().auth.mockResolvedValue({ userId: 'clerk-admin' });
    m().prisma.user.findUnique.mockResolvedValue({ id: 'u1', role: 'ADMIN' });
  });

  it('shows again an approved activity that was hidden (DRAFT -> PUBLISHED)', async () => {
    activity('DRAFT', new Date('2026-11-01'));
    const res = await toggle(true);
    expect(res.status).toBe(200);
    expect(m().prisma.activity.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ isPublic: true, status: 'PUBLISHED' }),
      })
    );
    expect(
      require('@/lib/cache/publicPages').refreshPublicCatalogPages
    ).toHaveBeenCalledTimes(1);
  });

  it('refuses to publish a draft that was never approved', async () => {
    activity('DRAFT', null);
    const res = await toggle(true);
    expect(res.status).toBe(409);
    expect(m().prisma.activity.update).not.toHaveBeenCalled();
  });

  it('refuses to publish an activity still in review', async () => {
    activity('PENDING_REVIEW', null);
    expect((await toggle(true)).status).toBe(409);
    expect(m().prisma.activity.update).not.toHaveBeenCalled();
  });

  it('hides a published activity and records it as reviewed if needed', async () => {
    activity('PUBLISHED', null);
    const res = await toggle(false);
    expect(res.status).toBe(200);
    const data = m().prisma.activity.update.mock.calls[0][0].data;
    expect(data).toMatchObject({ isPublic: false, status: 'DRAFT' });
    expect(data.reviewedAt).toBeInstanceOf(Date);
  });

  it('can hide and show again a legacy published activity', async () => {
    activity('PUBLISHED', null);
    await toggle(false);
    const reviewedAt =
      m().prisma.activity.update.mock.calls[0][0].data.reviewedAt;
    activity('DRAFT', reviewedAt);
    expect((await toggle(true)).status).toBe(200);
  });

  it('refuses non-admins', async () => {
    m().prisma.user.findUnique.mockResolvedValue({ id: 'u2', role: 'USER' });
    activity('DRAFT', new Date());
    expect((await toggle(true)).status).toBe(403);
  });
});
