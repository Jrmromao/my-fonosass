import { prisma } from '@/app/db';
import { CacheManager, QueryCache, withCaching } from '@/lib/performance/cacheManager';
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
        return SecurityMiddleware.createErrorResponse('Authentication required', 401);
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
                  currentPeriodEnd: true
                }
              }
            }
          });
        },
        PROFILE_CACHE_TTL
      );

      if (!user) {
        return SecurityMiddleware.createErrorResponse('User not found', 404);
      }

      // Cache additional user stats in memory
      const statsKey = `user:stats:${userId}`;
      let stats = CacheManager.get(statsKey);
      
      if (!stats) {
        stats = {
          downloadCount: await prisma.downloadHistory.count({
            where: { userId: user.id }
          }),
          lastActivity: (await prisma.downloadHistory.findFirst({
            where: { userId: user.id },
            orderBy: { downloadedAt: 'desc' },
            select: { downloadedAt: true }
          }))?.downloadedAt || null
        };
        
        // Cache stats for 5 minutes
        CacheManager.set(statsKey, stats, 300);
      }

      return SecurityMiddleware.createSecureResponse({
        success: true,
        data: {
          ...user,
          stats
        }
      });

    } catch (error) {
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
    }
  }
);

export const PUT = async (request: NextRequest) => {
  try {
    const { userId } = await auth();
    if (!userId) {
      return SecurityMiddleware.createErrorResponse('Authentication required', 401);
    }

    const body = await request.json();
    const { fullName, email } = body;

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { clerkUserId: userId },
      data: {
        fullName,
        email,
        updatedAt: new Date()
      }
    });

    // Invalidate related caches
    QueryCache.invalidate(`user:profile:${userId}`);
    CacheManager.delete(`user:stats:${updatedUser.id}`);
    CacheManager.delete(`user:profile:${userId}`);

    return SecurityMiddleware.createSecureResponse({
      success: true,
      message: 'Profile updated successfully',
      data: updatedUser
    });

  } catch (error) {
    return SecurityMiddleware.createErrorResponse(
      'Failed to update profile',
      500
    );
  }
};