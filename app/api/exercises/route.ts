import { prisma } from '@/app/db';
import { QueryCache, withCaching } from '@/lib/performance/cacheManager';
import { SecurityMiddleware } from '@/lib/security/securityMiddleware';
import { auth } from '@clerk/nextjs/server';
import { NextRequest } from 'next/server';

// Cache exercises for 5 minutes (300 seconds)
const EXERCISES_CACHE_TTL = 300;

export const GET = withCaching(
  async (request: NextRequest) => {
    try {
      const { userId } = await auth();
      if (!userId) {
        return SecurityMiddleware.createErrorResponse('Authentication required', 401);
      }

      // Use QueryCache to cache database queries
      const exercises = await QueryCache.get(
        `exercises:${userId}`,
        async () => {
          return await prisma.activity.findMany({
            where: {
              isPublic: true
            },
            select: {
              id: true,
              name: true,
              description: true,
              type: true,
              difficulty: true,
              ageRange: true,
              isPublic: true,
              createdAt: true,
              categories: {
                select: {
                  name: true
                }
              }
            },
            orderBy: {
              createdAt: 'desc'
            }
          });
        },
        EXERCISES_CACHE_TTL
      );

      return SecurityMiddleware.createSecureResponse({
        success: true,
        data: exercises,
        count: exercises.length,
        cached: true
      });

    } catch (error) {
      return SecurityMiddleware.createErrorResponse(
        'Failed to fetch exercises',
        500
      );
    }
  },
  {
    ttl: EXERCISES_CACHE_TTL,
    keyGenerator: (req) => `exercises:${req.url}`,
    skipCache: (req) => {
      // Skip cache for requests with specific query parameters
      const url = new URL(req.url);
      return url.searchParams.has('nocache') || url.searchParams.has('refresh');
    }
  }
);