import { UsageTracker } from '@/lib/billing/usage-tracker';
import { beforeEach, describe, expect, it } from '@jest/globals';

describe('UsageTracker', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserUsage', () => {
    it('should return usage data for free tier user', async () => {
      // Arrange
      const mockUser = {
        id: 'user-1',
        subscriptions: null, // Free tier
      };

      const mockDownloads = [
        { id: '1', createdAt: new Date('2024-01-01') },
        { id: '2', createdAt: new Date('2024-01-02') },
        { id: '3', createdAt: new Date('2024-01-03') },
      ];

      const { prisma } = require('@/app/db');
      prisma.user.findUnique.mockResolvedValue(mockUser);
      prisma.download.count.mockResolvedValue(mockDownloads.length);

      // Act
      const usage = await UsageTracker.getUserUsage('user-1');

      // Assert
      expect(usage).toEqual({
        isPro: false,
        downloadsUsed: 3,
        downloadsRemaining: 2, // 5 - 3
        downloadsLimit: 5,
        canDownload: true,
        resetDate: expect.any(Date),
      });
    });

    it('should return usage data for pro tier user', async () => {
      // Arrange
      const mockUser = {
        id: 'user-1',
        subscriptions: {
          status: 'ACTIVE',
          tier: 'PRO',
        },
      };

      const { prisma } = require('@/app/db');
      prisma.user.findUnique.mockResolvedValue(mockUser);
      prisma.download.count.mockResolvedValue(50);

      // Act
      const usage = await UsageTracker.getUserUsage('user-1');

      // Assert
      expect(usage).toEqual({
        isPro: true,
        downloadsUsed: 50,
        downloadsRemaining: 999999, // Unlimited
        downloadsLimit: 999999,
        canDownload: true,
        resetDate: expect.any(Date),
      });
    });

    it('should handle user not found', async () => {
      // Arrange
      const { prisma } = require('@/app/db');
      prisma.user.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(
        UsageTracker.getUserUsage('nonexistent-user')
      ).rejects.toThrow('User not found');
    });
  });

  describe('canDownload', () => {
    it('should allow download for free tier user under limit', async () => {
      // Arrange
      const mockUser = {
        id: 'user-1',
        subscriptions: null,
      };

      const { prisma } = require('@/app/db');
      prisma.user.findUnique.mockResolvedValue(mockUser);
      prisma.download.count.mockResolvedValue(3);

      // Act
      const canDownload = await UsageTracker.canDownload('user-1');

      // Assert
      expect(canDownload).toBe(true);
    });

    it('should deny download for free tier user at limit', async () => {
      // Arrange
      const mockUser = {
        id: 'user-1',
        subscriptions: null,
      };

      const { prisma } = require('@/app/db');
      prisma.user.findUnique.mockResolvedValue(mockUser);
      prisma.download.count.mockResolvedValue(5);

      // Act
      const canDownload = await UsageTracker.canDownload('user-1');

      // Assert
      expect(canDownload).toBe(false);
    });

    it('should always allow download for pro tier user', async () => {
      // Arrange
      const mockUser = {
        id: 'user-1',
        subscriptions: {
          status: 'ACTIVE',
          tier: 'PRO',
        },
      };

      const { prisma } = require('@/app/db');
      prisma.user.findUnique.mockResolvedValue(mockUser);
      prisma.download.count.mockResolvedValue(1000);

      // Act
      const canDownload = await UsageTracker.canDownload('user-1');

      // Assert
      expect(canDownload).toBe(true);
    });
  });

  describe('recordDownload', () => {
    it('should record download for valid user', async () => {
      // Arrange
      const mockUser = {
        id: 'user-1',
        subscriptions: null,
      };

      const { prisma } = require('@/app/db');

      // Mock canDownload check (first call)
      prisma.user.findUnique.mockResolvedValueOnce(mockUser);
      prisma.download.count.mockResolvedValueOnce(2);

      // Mock recordDownload call
      prisma.download.create.mockResolvedValue({ id: 'download-1' });

      // Mock getUserUsage call (after recording download)
      prisma.user.findUnique.mockResolvedValueOnce(mockUser);
      prisma.download.count.mockResolvedValueOnce(3); // After recording, count becomes 3

      // Act
      const result = await UsageTracker.recordDownload('user-1', 'exercise-1');

      // Assert
      expect(result).toEqual({
        success: true,
        downloadId: 'download-1',
        remainingDownloads: 2, // 5 - 3 = 2
      });
      expect(prisma.download.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-1',
          exerciseId: 'exercise-1',
          downloadedAt: expect.any(Date),
        },
      });
    });

    it('should reject download when user is at limit', async () => {
      // Arrange
      const mockUser = {
        id: 'user-1',
        subscriptions: null,
      };

      const { prisma } = require('@/app/db');
      prisma.user.findUnique.mockResolvedValue(mockUser);
      prisma.download.count.mockResolvedValue(5);

      // Act
      const result = await UsageTracker.recordDownload('user-1', 'exercise-1');

      // Assert
      expect(result).toEqual({
        success: false,
        error: 'Download limit reached',
        remainingDownloads: 0,
      });
      expect(prisma.download.create).not.toHaveBeenCalled();
    });

    it('should handle database errors gracefully', async () => {
      // Arrange
      const mockUser = {
        id: 'user-1',
        subscriptions: null,
      };

      const { prisma } = require('@/app/db');
      prisma.user.findUnique.mockResolvedValue(mockUser);
      prisma.download.count.mockResolvedValue(2);
      prisma.download.create.mockRejectedValue(new Error('Database error'));

      // Act
      const result = await UsageTracker.recordDownload('user-1', 'exercise-1');

      // Assert
      expect(result).toEqual({
        success: false,
        error: 'Failed to record download',
      });
    });
  });

  describe('getUsageStats', () => {
    it('should return usage statistics for user', async () => {
      // Arrange
      const mockUser = {
        id: 'user-1',
        subscriptions: null,
      };

      // Create dates for this month
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const mockDownloads = [
        { id: '1', downloadedAt: startOfMonth, exerciseId: 'ex-1' },
        {
          id: '2',
          downloadedAt: new Date(startOfMonth.getTime() + 24 * 60 * 60 * 1000),
          exerciseId: 'ex-2',
        },
        {
          id: '3',
          downloadedAt: new Date(
            startOfMonth.getTime() + 2 * 24 * 60 * 60 * 1000
          ),
          exerciseId: 'ex-1',
        },
      ];

      const { prisma } = require('@/app/db');
      prisma.user.findUnique.mockResolvedValue(mockUser);
      prisma.download.findMany.mockResolvedValue(mockDownloads);

      // Act
      const stats = await UsageTracker.getUsageStats('user-1');

      // Assert
      expect(stats).toEqual({
        totalDownloads: 3,
        downloadsThisMonth: 3,
        mostDownloadedExercise: 'ex-1',
        downloadsByDay: expect.any(Object),
        isPro: false,
        limit: 5,
        remaining: 2,
      });
    });
  });

  describe('resetUsage', () => {
    it('should reset usage for free tier user', async () => {
      // Arrange
      const mockUser = {
        id: 'user-1',
        subscriptions: null,
      };

      const { prisma } = require('@/app/db');
      prisma.user.findUnique.mockResolvedValue(mockUser);
      prisma.download.deleteMany.mockResolvedValue({ count: 5 });

      // Act
      const result = await UsageTracker.resetUsage('user-1');

      // Assert
      expect(result).toEqual({
        success: true,
        deletedCount: 5,
      });
      expect(prisma.download.deleteMany).toHaveBeenCalledWith({
        where: {
          userId: 'user-1',
          downloadedAt: {
            lt: expect.any(Date),
          },
        },
      });
    });

    it('should not reset usage for pro tier user', async () => {
      // Arrange
      const mockUser = {
        id: 'user-1',
        subscriptions: {
          status: 'ACTIVE',
          tier: 'PRO',
        },
      };

      const { prisma } = require('@/app/db');
      prisma.user.findUnique.mockResolvedValue(mockUser);

      // Act
      const result = await UsageTracker.resetUsage('user-1');

      // Assert
      expect(result).toEqual({
        success: false,
        error: 'Pro users do not need usage reset',
      });
      expect(prisma.download.deleteMany).not.toHaveBeenCalled();
    });
  });
});
