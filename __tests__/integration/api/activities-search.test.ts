import { beforeEach, describe, expect, it, jest } from '@jest/globals';

jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn(),
}));

jest.mock('@/app/db', () => ({
  prisma: {
    activity: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
    downloadLimit: { findUnique: jest.fn() },
    downloadHistory: { count: jest.fn() },
    user: { findUnique: jest.fn() },
  },
}));

jest.mock('@aws-sdk/client-s3', () => ({
  S3Client: jest.fn().mockImplementation(() => ({})),
  GetObjectCommand: jest.fn(),
}));

jest.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: jest.fn().mockResolvedValue('https://s3.example.com/signed'),
}));

describe('Activities Search API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  it('should return 401 when not authenticated', async () => {
    const { auth } = require('@clerk/nextjs/server');
    auth.mockResolvedValue({ userId: null });

    const { GET } = await import('@/app/api/activities/search/route');
    const request = new Request('http://localhost:3000/api/activities/search');
    (request as any).nextUrl = new URL('http://localhost:3000/api/activities/search');
    const response = await GET(request as any);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  it('should return paginated activities with default params', async () => {
    const { auth } = require('@clerk/nextjs/server');
    const { prisma } = require('@/app/db');

    auth.mockResolvedValue({ userId: 'clerk-1' });
    prisma.activity.findMany.mockResolvedValue([
      { id: '1', name: 'Test Activity', phoneme: 'P', type: 'SPEECH', difficulty: 'BEGINNER', ageRange: 'CHILD', createdAt: new Date(), files: [] },
    ]);
    prisma.activity.count.mockResolvedValue(1);

    const { GET } = await import('@/app/api/activities/search/route');
    const url = new URL('http://localhost:3000/api/activities/search');
    const request = new Request(url.toString());
    (request as any).nextUrl = url;
    const response = await GET(request as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toHaveLength(1);
    expect(data.pagination.page).toBe(1);
    expect(data.pagination.total).toBe(1);
  });

  it('should filter by phoneme', async () => {
    const { auth } = require('@clerk/nextjs/server');
    const { prisma } = require('@/app/db');

    auth.mockResolvedValue({ userId: 'clerk-1' });
    prisma.activity.findMany.mockResolvedValue([]);
    prisma.activity.count.mockResolvedValue(0);

    const { GET } = await import('@/app/api/activities/search/route');
    const url = new URL('http://localhost:3000/api/activities/search?phoneme=R');
    const request = new Request(url.toString());
    (request as any).nextUrl = url;
    await GET(request as any);

    expect(prisma.activity.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ phoneme: 'R' }),
      })
    );
  });

  it('should filter by search term', async () => {
    const { auth } = require('@clerk/nextjs/server');
    const { prisma } = require('@/app/db');

    auth.mockResolvedValue({ userId: 'clerk-1' });
    prisma.activity.findMany.mockResolvedValue([]);
    prisma.activity.count.mockResolvedValue(0);

    const { GET } = await import('@/app/api/activities/search/route');
    const url = new URL('http://localhost:3000/api/activities/search?search=animais');
    const request = new Request(url.toString());
    (request as any).nextUrl = url;
    await GET(request as any);

    expect(prisma.activity.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: expect.arrayContaining([
            expect.objectContaining({ name: { contains: 'animais', mode: 'insensitive' } }),
          ]),
        }),
      })
    );
  });

  it('should respect pagination params', async () => {
    const { auth } = require('@clerk/nextjs/server');
    const { prisma } = require('@/app/db');

    auth.mockResolvedValue({ userId: 'clerk-1' });
    prisma.activity.findMany.mockResolvedValue([]);
    prisma.activity.count.mockResolvedValue(50);

    const { GET } = await import('@/app/api/activities/search/route');
    const url = new URL('http://localhost:3000/api/activities/search?page=3&limit=10');
    const request = new Request(url.toString());
    (request as any).nextUrl = url;
    const response = await GET(request as any);
    const data = await response.json();

    expect(prisma.activity.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 20, take: 10 })
    );
    expect(data.pagination.page).toBe(3);
    expect(data.pagination.totalPages).toBe(5);
  });
});

describe('Dashboard Stats API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  it('should return 401 when not authenticated', async () => {
    const { auth } = require('@clerk/nextjs/server');
    auth.mockResolvedValue({ userId: null });

    const { GET } = await import('@/app/api/dashboard/stats/route');
    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  it('should return stats for authenticated user', async () => {
    const { auth } = require('@clerk/nextjs/server');
    const { prisma } = require('@/app/db');

    auth.mockResolvedValue({ userId: 'clerk-1' });
    prisma.activity.count.mockResolvedValue(100);
    prisma.activity.findMany.mockResolvedValue([{ phoneme: 'P' }, { phoneme: 'R' }, { phoneme: 'S' }]);
    prisma.downloadHistory.count.mockResolvedValue(5);
    prisma.user.findUnique.mockResolvedValue({ id: 'user-1' });
    prisma.downloadLimit.findUnique.mockResolvedValue({ userId: 'user-1', downloads: 2, resetDate: new Date() });

    const { GET } = await import('@/app/api/dashboard/stats/route');
    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.total).toBe(100);
    expect(data.data.phonemes).toBe(3);
    expect(data.data.downloads).toBe(5);
    expect(data.data.remaining).toBe(1);
  });
});
