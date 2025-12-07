import { prisma } from '@/app/db';

export interface UsageData {
  isPro: boolean;
  downloadsUsed: number;
  downloadsRemaining: number;
  downloadsLimit: number;
  canDownload: boolean;
  resetDate: Date;
}

export interface DownloadResult {
  success: boolean;
  downloadId?: string;
  remainingDownloads?: number;
  error?: string;
}

export interface UsageStats {
  totalDownloads: number;
  downloadsThisMonth: number;
  mostDownloadedExercise: string;
  downloadsByDay: Record<string, number>;
  isPro: boolean;
  limit: number;
  remaining: number;
}

export class UsageTracker {
  private static readonly FREE_TIER_LIMIT = 5;
  private static readonly PRO_TIER_LIMIT = 999999;

  /**
   * Get user usage data
   */
  static async getUserUsage(userId: string): Promise<UsageData> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        subscriptions: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const isPro =
      user.subscriptions?.status === 'ACTIVE' &&
      user.subscriptions?.tier === 'PRO';
    const limit = isPro
      ? UsageTracker.PRO_TIER_LIMIT
      : UsageTracker.FREE_TIER_LIMIT;

    // Count downloads from the beginning of current month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const downloadsUsed = await prisma.download.count({
      where: {
        userId,
        downloadedAt: {
          gte: startOfMonth,
        },
      },
    });

    const downloadsRemaining = isPro
      ? UsageTracker.PRO_TIER_LIMIT
      : Math.max(0, limit - downloadsUsed);
    const canDownload = isPro || downloadsUsed < limit;

    // Calculate reset date (first day of next month)
    const resetDate = new Date();
    resetDate.setMonth(resetDate.getMonth() + 1, 1);
    resetDate.setHours(0, 0, 0, 0);

    return {
      isPro,
      downloadsUsed,
      downloadsRemaining,
      downloadsLimit: limit,
      canDownload,
      resetDate,
    };
  }

  /**
   * Check if user can download
   */
  static async canDownload(userId: string): Promise<boolean> {
    const usage = await UsageTracker.getUserUsage(userId);
    return usage.canDownload;
  }

  /**
   * Record a download
   */
  static async recordDownload(
    userId: string,
    exerciseId: string
  ): Promise<DownloadResult> {
    try {
      // Check if user can download
      const canDownload = await UsageTracker.canDownload(userId);

      if (!canDownload) {
        return {
          success: false,
          error: 'Download limit reached',
          remainingDownloads: 0,
        };
      }

      // Record the download
      const download = await prisma.download.create({
        data: {
          userId,
          exerciseId,
          downloadedAt: new Date(),
        },
      });

      // Get updated usage
      const usage = await UsageTracker.getUserUsage(userId);

      return {
        success: true,
        downloadId: download.id,
        remainingDownloads: usage.downloadsRemaining,
      };
    } catch (error) {
      console.error('Error recording download:', error);
      return {
        success: false,
        error: 'Failed to record download',
      };
    }
  }

  /**
   * Get usage statistics
   */
  static async getUsageStats(userId: string): Promise<UsageStats> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        subscriptions: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const isPro =
      user.subscriptions?.status === 'ACTIVE' &&
      user.subscriptions?.tier === 'PRO';
    const limit = isPro
      ? UsageTracker.PRO_TIER_LIMIT
      : UsageTracker.FREE_TIER_LIMIT;

    // Get all downloads for the user
    const downloads = await prisma.download.findMany({
      where: { userId },
      orderBy: { downloadedAt: 'desc' },
    });

    // Calculate statistics
    const totalDownloads = downloads.length;

    // Downloads this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const downloadsThisMonth = downloads.filter(
      (d) => d.downloadedAt >= startOfMonth
    ).length;

    // Most downloaded exercise
    const exerciseCounts = downloads.reduce(
      (acc, download) => {
        acc[download.exerciseId] = (acc[download.exerciseId] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const mostDownloadedExercise =
      Object.entries(exerciseCounts).sort(([, a], [, b]) => b - a)[0]?.[0] ||
      'N/A';

    // Downloads by day
    const downloadsByDay = downloads.reduce(
      (acc, download) => {
        const day = download.downloadedAt.toISOString().split('T')[0];
        acc[day] = (acc[day] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const remaining = isPro
      ? UsageTracker.PRO_TIER_LIMIT
      : Math.max(0, limit - downloadsThisMonth);

    return {
      totalDownloads,
      downloadsThisMonth,
      mostDownloadedExercise,
      downloadsByDay,
      isPro,
      limit,
      remaining,
    };
  }

  /**
   * Reset usage for free tier users (monthly reset)
   */
  static async resetUsage(
    userId: string
  ): Promise<{ success: boolean; deletedCount?: number; error?: string }> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          subscriptions: true,
        },
      });

      if (!user) {
        throw new Error('User not found');
      }

      const isPro =
        user.subscriptions?.status === 'ACTIVE' &&
        user.subscriptions?.tier === 'PRO';

      if (isPro) {
        return {
          success: false,
          error: 'Pro users do not need usage reset',
        };
      }

      // Delete all downloads older than current month
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const result = await prisma.download.deleteMany({
        where: {
          userId,
          downloadedAt: {
            lt: startOfMonth,
          },
        },
      });

      return {
        success: true,
        deletedCount: result.count,
      };
    } catch (error) {
      console.error('Error resetting usage:', error);
      return {
        success: false,
        error: 'Failed to reset usage',
      };
    }
  }
}
