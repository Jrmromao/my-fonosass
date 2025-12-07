import { prisma } from '@/app/db';
import {
  CacheManager,
  QueryCache,
  withCaching,
} from '@/lib/performance/cacheManager';
import { SecurityMiddleware } from '@/lib/security/securityMiddleware';
import { auth } from '@clerk/nextjs/server';
import { NextRequest } from 'next/server';

// Cache user profile for 2 minutes (120 seconds)
const PROFILE_CACHE_TTL = 120;

export const GET = withCaching(
  async (request: NextRequest) => {
    try {
      const { userId } = await auth();
      if (!userId) {
        return SecurityMiddleware.createErrorResponse(
          'Authentication required',
          401
        );
      }

      // Use QueryCache for database queries
      const user = await QueryCache.get(
        `user:profile:${userId}`,
        async () => {
          return await prisma.user.findUnique({
            where: { clerkUserId: userId },
            select: {
              id: true,
              email: true,
              fullName: true,
              role: true,
              createdAt: true,
              updatedAt: true,
              subscriptions: {
                select: {
                  status: true,
                  tier: true,
                  currentPeriodEnd: true,
                },
              },
            },
          });
        },
        PROFILE_CACHE_TTL
      );

      if (!user) {
        return SecurityMiddleware.createErrorResponse('User not found', 404);
      }

      // Get user stats
      const stats = await prisma.downloadHistory.aggregate({
        where: { userId: user.id },
        _count: { id: true },
      });

      // Get unique activities downloaded
      const uniqueActivities = await prisma.downloadHistory.findMany({
        where: { userId: user.id },
        select: { activityId: true },
        distinct: ['activityId'],
      });

      // Get recent downloads count (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const recentDownloadsCount = await prisma.downloadHistory.count({
        where: {
          userId: user.id,
          downloadedAt: {
            gte: thirtyDaysAgo,
          },
        },
      });

      // Get recent downloads
      const recentDownloads = await prisma.downloadHistory.findMany({
        where: { userId: user.id },
        include: {
          activity: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { downloadedAt: 'desc' },
        take: 5,
      });

      // Get subscription data
      const subscription = user.subscriptions || {
        tier: 'FREE',
        status: 'INACTIVE',
        currentPeriodEnd: null,
      };

      // Get download limits
      const downloadLimit = await prisma.downloadLimit.findUnique({
        where: { userId: user.id },
      });

      const isPro = subscription.tier === 'PRO';
      const remainingDownloads = isPro
        ? Infinity
        : Math.max(0, 5 - (downloadLimit?.downloads || 0));

      return SecurityMiddleware.createSecureResponse({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            role: user.role,
            createdAt: user.createdAt.toISOString(),
          },
          subscription: {
            tier: subscription.tier,
            status: subscription.status,
            currentPeriodEnd: subscription.currentPeriodEnd?.toISOString(),
          },
          downloadLimits: {
            canDownload: remainingDownloads > 0,
            remaining: remainingDownloads,
            isPro,
          },
          stats: {
            totalDownloads: stats._count.id,
            uniqueActivities: uniqueActivities.length,
            recentDownloads: recentDownloadsCount,
          },
          recentDownloads: recentDownloads.map((download) => ({
            id: download.id,
            fileName: download.fileName,
            downloadedAt: download.downloadedAt.toISOString(),
            activity: download.activity,
          })),
        },
      });
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return SecurityMiddleware.createErrorResponse(
        'Failed to fetch user profile',
        500
      );
    }
  },
  {
    ttl: PROFILE_CACHE_TTL,
    keyGenerator: (req) => {
      const url = new URL(req.url);
      return `user:profile:${url.searchParams.get('userId') || 'current'}`;
    },
  }
);

export const PUT = async (request: NextRequest) => {
  try {
    // Apply security middleware with CSRF protection
    const securityResult = await SecurityMiddleware.apply(request, {
      requireAuth: true,
      requireCSRF: true,
      rateLimitType: 'general',
      validateInput: true,
    });

    if (!securityResult.success) {
      return securityResult.response!;
    }

    const { userId } = await auth();
    if (!userId) {
      return SecurityMiddleware.createErrorResponse(
        'Authentication required',
        401
      );
    }

    const body = await request.json();
    const { fullName, email } = body;

    // Validate input
    if (
      !fullName ||
      typeof fullName !== 'string' ||
      fullName.trim().length < 2 ||
      fullName.trim().length > 100
    ) {
      return SecurityMiddleware.createErrorResponse('Invalid fullName', 400);
    }

    if (
      !email ||
      typeof email !== 'string' ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      return SecurityMiddleware.createErrorResponse(
        'Invalid email format',
        400
      );
    }

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { clerkUserId: userId },
      data: {
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        updatedAt: true,
      },
    });

    // Invalidate caches after successful update
    await QueryCache.invalidate(`user:profile:${userId}`);
    await CacheManager.delete(`user:stats:${userId}`);
    await CacheManager.delete(`user:profile:${userId}`);

    return SecurityMiddleware.createSecureResponse({
      success: true,
      data: {
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          fullName: updatedUser.fullName,
          role: updatedUser.role,
          updatedAt: updatedUser.updatedAt.toISOString(),
        },
      },
      message: 'Profile updated successfully',
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    return SecurityMiddleware.createErrorResponse(
      'Failed to update profile',
      500
    );
  }
};
