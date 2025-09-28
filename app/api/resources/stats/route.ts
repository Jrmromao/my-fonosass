import { prisma } from '@/app/db';
import { QueryCache, withCaching } from '@/lib/performance/cacheManager';
import { SecurityMiddleware } from '@/lib/security/securityMiddleware';
import { NextRequest } from 'next/server';

// Cache stats for 10 minutes (600 seconds)
const STATS_CACHE_TTL = 600;

export const GET = withCaching(
  async (request: NextRequest) => {
    try {
      // Use QueryCache to cache database queries
      const stats = await QueryCache.get(
        'resources:stats',
        async () => {
          // Get total resources count
          const totalResources = await prisma.resource.count({
            where: { isPublished: true },
          });

          // Get total downloads count
          const totalDownloads = await prisma.resourceDownload.count();

          // Get total views count
          const totalViews = await prisma.resourceView.count();

          // Get categories count
          const categories = await prisma.resource.groupBy({
            by: ['category'],
            where: { isPublished: true },
            _count: { category: true },
          });

          // Get types count
          const types = await prisma.resource.groupBy({
            by: ['type'],
            where: { isPublished: true },
            _count: { type: true },
          });

          // Get free resources count
          const freeResources = await prisma.resource.count({
            where: { isPublished: true, isFree: true },
          });

          // Get featured resources count
          const featuredResources = await prisma.resource.count({
            where: { isPublished: true, isFeatured: true },
          });

          // Get average rating
          const avgRating = await prisma.resource.aggregate({
            where: { isPublished: true },
            _avg: { rating: true },
          });

          // Get recent resources (last 30 days)
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

          const recentResources = await prisma.resource.count({
            where: {
              isPublished: true,
              createdAt: { gte: thirtyDaysAgo },
            },
          });

          // Get top categories
          const topCategories = await prisma.resource.groupBy({
            by: ['category'],
            where: { isPublished: true },
            _count: { category: true },
            orderBy: { _count: { category: 'desc' } },
            take: 5,
          });

          // Get top types
          const topTypes = await prisma.resource.groupBy({
            by: ['type'],
            where: { isPublished: true },
            _count: { type: true },
            orderBy: { _count: { type: 'desc' } },
            take: 5,
          });

          return {
            totalResources,
            totalDownloads,
            totalViews,
            freeResources,
            featuredResources,
            recentResources,
            averageRating: avgRating._avg.rating || 0,
            categories: categories.reduce(
              (acc, cat) => {
                acc[cat.category] = cat._count.category;
                return acc;
              },
              {} as Record<string, number>
            ),
            types: types.reduce(
              (acc, type) => {
                acc[type.type] = type._count.type;
                return acc;
              },
              {} as Record<string, number>
            ),
            topCategories: topCategories.map((cat) => ({
              name: cat.category,
              count: cat._count.category,
            })),
            topTypes: topTypes.map((type) => ({
              name: type.type,
              count: type._count.type,
            })),
          };
        },
        STATS_CACHE_TTL
      );

      return SecurityMiddleware.createSecureResponse({
        success: true,
        data: stats,
        cached: true,
      });
    } catch (error) {
      console.error('Error fetching resource stats:', error);
      return SecurityMiddleware.createErrorResponse(
        'Failed to fetch resource stats',
        500
      );
    }
  },
  {
    ttl: STATS_CACHE_TTL,
    keyGenerator: () => 'resources:stats',
  }
);
