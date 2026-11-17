import { beforeEach, describe, expect, it, jest } from '@jest/globals';

// Regression: the search API sent a signed URL to each activity's original
// file ("thumbnailUrl") to every signed-in user, bypassing the paywall.

jest.mock('@clerk/nextjs/server', () => ({ auth: jest.fn() }));

jest.mock('@/app/db', () => ({
  prisma: {
    activity: { findMany: jest.fn(), count: jest.fn() },
    user: { findUnique: jest.fn() },
    subscription: { findUnique: jest.fn() },
  },
}));

jest.mock('@aws-sdk/client-s3', () => ({
  S3Client: jest.fn().mockImplementation(() => ({})),
  GetObjectCommand: jest.fn(),
}));

jest.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: jest.fn(async () => 'https://s3.example.com/original-file'),
}));

const listed = [
  {
    id: 'act-paid',
    name: 'Paga',
    phoneme: 'P',
    files: [{ id: 'f1', s3Key: 'paid.pdf' }],
  },
  {
    id: 'act-free',
    name: 'Grátis',
    phoneme: 'S',
    files: [{ id: 'f2', s3Key: 'free.png' }],
  },
];

const search = async (subscription: unknown) => {
  const { auth } = require('@clerk/nextjs/server');
  const { prisma } = require('@/app/db');
  auth.mockResolvedValue({ userId: 'clerk-1' });
  prisma.user.findUnique.mockResolvedValue({ id: 'u1', role: 'USER' });
  prisma.subscription.findUnique.mockResolvedValue(subscription);
  prisma.activity.count.mockResolvedValue(2);
  // 1st findMany: free samples; 2nd: the listing; the rest: filter options.
  prisma.activity.findMany.mockImplementation(async (args: unknown) => {
    const a = args as { where?: { phoneme?: string }; take?: number };
    if (a.where?.phoneme === 'S' && a.take === 2) {
      return [
        {
          id: 'act-free',
          name: 'Grátis',
          ageRange: 'PRESCHOOL',
          difficulty: 'BEGINNER',
          files: [{ id: 'f2' }],
        },
      ];
    }
    if (a.take !== undefined) return listed;
    return [];
  });

  const { GET } = await import('@/app/api/activities/search/route');
  const url = new URL('http://localhost:3000/api/activities/search');
  const request = new Request(url.toString()) as unknown as { nextUrl: URL };
  request.nextUrl = url;
  const response = await GET(request as never);
  return response.json();
};

describe('Activities search access', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should not expose paid files to users without a subscription', async () => {
    const data = await search(null);
    const paid = data.data.find((a: { id: string }) => a.id === 'act-paid');
    const free = data.data.find((a: { id: string }) => a.id === 'act-free');

    expect(data.viewer.canDownloadAll).toBe(false);
    expect(paid).toMatchObject({ thumbnailUrl: null, canDownload: false });
    expect(free).toMatchObject({ isFreeSample: true, canDownload: true });
    expect(free.thumbnailUrl).toBeTruthy();
  });

  it('should expose files to subscribers', async () => {
    const data = await search({
      status: 'ACTIVE',
      tier: 'PRO',
      currentPeriodEnd: null,
    });
    expect(data.viewer.canDownloadAll).toBe(true);
    for (const a of data.data) expect(a.canDownload).toBe(true);
  });
});
