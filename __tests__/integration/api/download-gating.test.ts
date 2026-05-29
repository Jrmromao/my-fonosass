import { beforeEach, describe, expect, it, jest } from '@jest/globals';

jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn(),
}));

jest.mock('@/app/db', () => ({
  prisma: {
    user: { findUnique: jest.fn() },
    activityFile: { findUnique: jest.fn() },
    downloadLimit: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    downloadHistory: { create: jest.fn() },
  },
}));

jest.mock('@aws-sdk/client-s3', () => ({
  S3Client: jest.fn().mockImplementation(() => ({})),
  GetObjectCommand: jest.fn(),
}));

jest.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: jest.fn().mockResolvedValue('https://s3.example.com/signed-url'),
}));

describe('Download Gating', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    process.env.AWS_S3_BUCKET_NAME = 'fonosapp';
    process.env.AWS_REGION = 'eu-west-1';
    process.env.AWS_ACCESS_KEY_ID = 'test';
    process.env.AWS_SECRET_ACCESS_KEY = 'test';
  });

  describe('Free user download limits', () => {
    it.skip('should allow download when under limit (requires server action context)', async () => {
      const { auth } = require('@clerk/nextjs/server');
      const { prisma } = require('@/app/db');

      auth.mockResolvedValue({ userId: 'clerk-1' });
      // First call: find user by clerkUserId, second call: hasProAccess by id
      prisma.user.findUnique
        .mockResolvedValueOnce({ id: 'user-1' })
        .mockResolvedValueOnce({ id: 'user-1', subscriptions: null });
      prisma.downloadLimit.findUnique.mockResolvedValue({
        userId: 'user-1',
        downloads: 1,
        resetDate: new Date(),
      });
      prisma.activityFile.findUnique.mockResolvedValue({
        id: 'file-1',
        s3Key: 'activities/p/test.png',
        name: 'test.png',
        fileType: 'image/png',
        sizeInBytes: 1000,
        activityId: 'act-1',
        activity: { id: 'act-1', createdById: 'user-1', isPublic: true },
      });
      prisma.downloadHistory.create.mockResolvedValue({});
      prisma.downloadLimit.update.mockResolvedValue({});

      const { getFileDownloadUrl } = await import('@/lib/actions/file-download.action');
      const result = await getFileDownloadUrl({ fileId: 'file-1' });

      expect(result.success).toBe(true);
      expect(result.url).toBeDefined();
    });

    it('should block download when limit reached', async () => {
      const { auth } = require('@clerk/nextjs/server');
      const { prisma } = require('@/app/db');

      auth.mockResolvedValue({ userId: 'clerk-1' });
      prisma.user.findUnique
        .mockResolvedValueOnce({ id: 'user-1' })
        .mockResolvedValueOnce({ id: 'user-1', subscriptions: null });
      prisma.downloadLimit.findUnique.mockResolvedValue({
        userId: 'user-1',
        downloads: 3,
        resetDate: new Date(),
      });

      const { getFileDownloadUrl } = await import('@/lib/actions/file-download.action');
      const result = await getFileDownloadUrl({ fileId: 'file-1' });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Limite');
      expect((result as any).limitReached).toBe(true);
    });

    it('should return 401 when not authenticated', async () => {
      const { auth } = require('@clerk/nextjs/server');
      auth.mockResolvedValue({ userId: null });

      const { getFileDownloadUrl } = await import('@/lib/actions/file-download.action');
      const result = await getFileDownloadUrl({ fileId: 'file-1' });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Unauthorized');
    });
  });

  describe('Pro user downloads', () => {
    it('should allow unlimited downloads for pro users', async () => {
      const { auth } = require('@clerk/nextjs/server');
      const { prisma } = require('@/app/db');

      auth.mockResolvedValue({ userId: 'clerk-1' });
      prisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        subscriptions: { status: 'ACTIVE', tier: 'PRO' },
      });
      prisma.activityFile.findUnique.mockResolvedValue({
        id: 'file-1',
        s3Key: 'activities/p/test.png',
        name: 'test.png',
        fileType: 'image/png',
        sizeInBytes: 1000,
        activityId: 'act-1',
        activity: { id: 'act-1', createdById: 'user-1', isPublic: true },
      });

      const { getFileDownloadUrl } = await import('@/lib/actions/file-download.action');
      const result = await getFileDownloadUrl({ fileId: 'file-1' });

      expect(result.success).toBe(true);
      expect(result.url).toBeDefined();
    });
  });
});

describe('DownloadLimitService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return canDownload true when under limit', async () => {
    const { prisma } = require('@/app/db');
    prisma.downloadLimit.findUnique.mockResolvedValue({
      userId: 'user-1',
      downloads: 2,
      resetDate: new Date(),
    });

    const { DownloadLimitService } = await import('@/services/downloadLimitService');
    const result = await DownloadLimitService.checkDownloadLimit('user-1');

    expect(result.canDownload).toBe(true);
    expect(result.remaining).toBe(1);
  });

  it('should return canDownload false when at limit', async () => {
    const { prisma } = require('@/app/db');
    prisma.downloadLimit.findUnique.mockResolvedValue({
      userId: 'user-1',
      downloads: 3,
      resetDate: new Date(),
    });

    const { DownloadLimitService } = await import('@/services/downloadLimitService');
    const result = await DownloadLimitService.checkDownloadLimit('user-1');

    expect(result.canDownload).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it('should reset downloads after 30 days', async () => {
    const { prisma } = require('@/app/db');
    const oldDate = new Date();
    oldDate.setDate(oldDate.getDate() - 31);

    prisma.downloadLimit.findUnique.mockResolvedValue({
      userId: 'user-1',
      downloads: 3,
      resetDate: oldDate,
    });
    prisma.downloadLimit.update.mockResolvedValue({});

    const { DownloadLimitService } = await import('@/services/downloadLimitService');
    const result = await DownloadLimitService.checkDownloadLimit('user-1');

    expect(result.canDownload).toBe(true);
    expect(result.remaining).toBe(3);
  });

  it('should identify pro users correctly', async () => {
    const { prisma } = require('@/app/db');
    prisma.user.findUnique.mockResolvedValue({
      id: 'user-1',
      subscriptions: { status: 'ACTIVE', tier: 'PRO' },
    });

    const { DownloadLimitService } = await import('@/services/downloadLimitService');
    const result = await DownloadLimitService.hasProAccess('user-1');

    expect(result).toBe(true);
  });

  it('should return false for free users', async () => {
    const { prisma } = require('@/app/db');
    prisma.user.findUnique.mockResolvedValue({
      id: 'user-1',
      subscriptions: null,
    });

    const { DownloadLimitService } = await import('@/services/downloadLimitService');
    const result = await DownloadLimitService.hasProAccess('user-1');

    expect(result).toBe(false);
  });
});
