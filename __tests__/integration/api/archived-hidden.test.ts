import { beforeEach, describe, expect, it, jest } from '@jest/globals';

// An ARCHIVED activity must disappear from every public surface, while
// admins can still download it.

type Row = {
  id: string;
  status: string;
  isPublic: boolean;
  phoneme: string;
  type: string;
  name: string;
};
const PUB: Row = {
  id: 'ckpub0000000000000000000',
  status: 'PUBLISHED',
  isPublic: true,
  phoneme: 'P',
  type: 'ANIMALS',
  name: 'Publicada',
};
const ARC: Row = {
  id: 'ckarc0000000000000000000',
  status: 'ARCHIVED',
  isPublic: false,
  phoneme: 'P',
  type: 'ANIMALS',
  name: 'Arquivada',
};
// Even if isPublic were left true by mistake, status alone must hide it.
const ARC_PUBLIC_FLAG: Row = {
  ...ARC,
  id: 'ckarc2000000000000000000',
  isPublic: true,
};
const TABLE = [PUB, ARC, ARC_PUBLIC_FLAG];

/** Minimal where-matcher: scalar equality, in, notIn; relations ignored. */
const matches = (row: Row, where: Record<string, unknown> = {}): boolean =>
  Object.entries(where).every(([key, cond]) => {
    if (key === 'files' || key === 'OR') return true;
    const value = (row as Record<string, unknown>)[key];
    if (cond && typeof cond === 'object') {
      const c = cond as { in?: unknown[]; notIn?: unknown[] };
      if (c.in) return c.in.includes(value);
      if (c.notIn) return !c.notIn.includes(value);
      return true;
    }
    return value === cond;
  });

const select = (where?: Record<string, unknown>) =>
  TABLE.filter((r) => matches(r, where));

jest.mock('@clerk/nextjs/server', () => ({ auth: jest.fn() }));
jest.mock('@/app/db', () => ({
  prisma: {
    user: { findUnique: jest.fn() },
    subscription: { findUnique: jest.fn() },
    freeSampleSelection: { findMany: jest.fn() },
    activity: {
      findMany: jest.fn(),
      count: jest.fn(),
      groupBy: jest.fn(),
    },
    activityFile: { findUnique: jest.fn(), findMany: jest.fn() },
    downloadHistory: { create: jest.fn() },
  },
}));
jest.mock('@/lib/stats/downloadStats', () => ({
  monthBucket: () => new Date(Date.UTC(2026, 10, 1)),
  recordAnonymousDownload: jest.fn(),
}));
jest.mock('@/lib/auth/dbUser', () => ({
  getOrCreateDbUser: jest.fn(async () => ({ id: 'u1', role: 'USER' })),
}));
jest.mock('@/lib/auth/viewAs', () => ({
  getEffectiveAccess: jest.fn(),
}));
jest.mock('@/lib/files/preview', () => ({
  PREVIEW_WIDTHS: [480, 960],
  canPreview: () => true,
  getPreview: jest.fn(async () => Buffer.from('x')),
}));
jest.mock('@aws-sdk/client-s3', () => ({
  S3Client: jest.fn().mockImplementation(() => ({})),
  GetObjectCommand: jest.fn(),
}));
jest.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: jest.fn(async () => 'https://s3.example.com/signed'),
}));

const m = () => ({
  auth: require('@clerk/nextjs/server').auth,
  prisma: require('@/app/db').prisma,
  access: require('@/lib/auth/viewAs').getEffectiveAccess,
});

beforeEach(() => {
  jest.clearAllMocks();
  const { auth, prisma, access } = m();
  auth.mockResolvedValue({ userId: 'clerk-1' });
  prisma.user.findUnique.mockResolvedValue({ id: 'u1', role: 'USER' });
  access.mockResolvedValue({ isAdmin: false, subscribed: true });
  prisma.freeSampleSelection.findMany.mockResolvedValue([]);
  prisma.activity.findMany.mockImplementation((async (args: {
    where?: Record<string, unknown>;
  }) =>
    select(args.where).map((r) => ({
      ...r,
      files: [{ id: `${r.id}-img`, fileType: 'image/png', s3Key: 'k' }],
    }))) as never);
  prisma.activity.count.mockImplementation(
    (async (args: { where?: Record<string, unknown> }) =>
      select(args.where).length) as never
  );
  prisma.activity.groupBy.mockImplementation((async (args: {
    by: string[];
    where?: Record<string, unknown>;
  }) =>
    select(args.where).map((r) => ({
      [args.by[0]]: (r as Record<string, unknown>)[args.by[0]],
      _count: { _all: 1 },
    }))) as never);
});

describe('archived activities are hidden', () => {
  it('search returns only published activities', async () => {
    const { GET } = await import('@/app/api/activities/search/route');
    const url = new URL('http://localhost/api/activities/search');
    const req = Object.assign(new Request(url), { nextUrl: url });
    const res = await GET(req as never);
    const body = await res.json();
    const list = body.data?.activities ?? body.data ?? body.activities;
    expect(list.map((a: { id: string }) => a.id)).toEqual([PUB.id]);
  });

  it('library counts only count published activities', async () => {
    const { GET } = await import('@/app/api/library/counts/route');
    const res = await GET();
    const body = await res.json();
    expect(body.data.total).toBe(1);
    expect(body.data.phonemes).toEqual({ P: 1 });
  });

  it('preview route answers 404 for an archived activity', async () => {
    const { prisma } = m();
    prisma.activityFile.findMany.mockImplementation((async (args: {
      where: { activityId: string; activity: Record<string, unknown> };
    }) => {
      const row = TABLE.find((r) => r.id === args.where.activityId);
      return row && matches(row, args.where.activity)
        ? [{ id: 'f1', s3Key: 'k', fileType: 'image/png' }]
        : [];
    }) as never);
    const { GET } = await import('@/app/api/activities/[id]/preview/route');
    const call = (id: string) => {
      const url = new URL('http://localhost/x');
      return GET(Object.assign(new Request(url), { nextUrl: url }) as never, {
        params: Promise.resolve({ id }),
      });
    };
    const pub = await call(PUB.id);
    const arc = await call(ARC.id);
    const arcFlagged = await call(ARC_PUBLIC_FLAG.id);
    expect(pub.status).toBe(200);
    expect(arc.status).toBe(404);
    expect(arcFlagged.status).toBe(404);
  });

  it('a subscriber gets "not found" when downloading an archived file', async () => {
    const { prisma } = m();
    prisma.activityFile.findUnique.mockResolvedValue({
      name: 'a.pdf',
      s3Key: 'archive/a.pdf',
      fileType: 'application/pdf',
      sizeInBytes: 10,
      activityId: ARC.id,
      activity: { status: 'ARCHIVED' },
    } as never);
    const { resolveFileDownload } = await import('@/lib/files/download');
    const res = await resolveFileDownload({ fileId: 'f1' });
    expect(res).toMatchObject({ success: false, reason: 'not_found' });
    expect(prisma.downloadHistory.create).not.toHaveBeenCalled();
  });

  it('an admin can still download an archived file', async () => {
    const { prisma, access } = m();
    process.env.AWS_S3_BUCKET_NAME = 'fonosapp';
    access.mockResolvedValue({ isAdmin: true, subscribed: false });
    prisma.activityFile.findUnique.mockResolvedValue({
      name: 'a.pdf',
      s3Key: 'archive/a.pdf',
      fileType: 'application/pdf',
      sizeInBytes: 10,
      activityId: ARC.id,
      activity: { status: 'ARCHIVED' },
    } as never);
    const { resolveFileDownload } = await import('@/lib/files/download');
    const res = await resolveFileDownload({ fileId: 'f1' });
    expect(res).toMatchObject({ success: true });
  });

  it('free samples skip an archived activity, even the admin choice', async () => {
    const { prisma } = m();
    // The admin chose only the archived one.
    prisma.freeSampleSelection.findMany.mockResolvedValue([
      { activityId: ARC.id },
      { activityId: ARC_PUBLIC_FLAG.id },
    ] as never);
    const { getFreeSamplesForMonth } = await import('@/lib/access');
    const { samples } = await getFreeSamplesForMonth(new Date());
    const ids = samples.map((s) => s.id);
    expect(ids).not.toContain(ARC.id);
    expect(ids).not.toContain(ARC_PUBLIC_FLAG.id);
  });
});
