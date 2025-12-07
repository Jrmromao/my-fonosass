import { prisma } from '@/app/db';
import { QueryCache, withCaching } from '@/lib/performance/cacheManager';
import { SecurityMiddleware } from '@/lib/security/securityMiddleware';
import { auth } from '@clerk/nextjs/server';
import { NextRequest } from 'next/server';

// Cache resources for 5 minutes (300 seconds)
const RESOURCES_CACHE_TTL = 300;

export const GET = withCaching(
  async (request: NextRequest) => {
    try {
      const { userId } = await auth();

      // Parse query parameters
      const url = new URL(request.url);
      const search = url.searchParams.get('search') || '';
      const type = url.searchParams.get('type') || '';
      const category = url.searchParams.get('category') || '';
      const ageGroup = url.searchParams.get('ageGroup') || '';
      const isFree = url.searchParams.get('isFree');
      const isFeatured = url.searchParams.get('isFeatured');
      const limit = parseInt(url.searchParams.get('limit') || '0');
      const offset = parseInt(url.searchParams.get('offset') || '0');

      // Build where clause
      const where: any = {
        isPublished: true,
      };

      if (search) {
        where.OR = [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { tags: { has: search } },
        ];
      }

      if (type) {
        where.type = type;
      }

      if (category) {
        where.category = category;
      }

      if (ageGroup) {
        where.ageGroup = ageGroup;
      }

      if (isFree !== null) {
        where.isFree = isFree === 'true';
      }

      if (isFeatured !== null) {
        where.isFeatured = isFeatured === 'true';
      }

      // Use QueryCache to cache database queries
      const cacheKey = `resources:${JSON.stringify(where)}:${limit}:${offset}`;
      const resources = await QueryCache.get(
        cacheKey,
        async () => {
          return await prisma.resource.findMany({
            where,
            select: {
              id: true,
              title: true,
              description: true,
              type: true,
              category: true,
              ageGroup: true,
              duration: true,
              fileSize: true,
              downloadCount: true,
              viewCount: true,
              rating: true,
              tags: true,
              downloadUrl: true,
              viewUrl: true,
              thumbnailUrl: true,
              isFree: true,
              isFeatured: true,
              slug: true,
              createdAt: true,
              updatedAt: true,
              createdBy: {
                select: {
                  id: true,
                  fullName: true,
                },
              },
            },
            orderBy: [
              { isFeatured: 'desc' },
              { downloadCount: 'desc' },
              { createdAt: 'desc' },
            ],
            take: limit > 0 ? limit : undefined,
            skip: offset,
          });
        },
        RESOURCES_CACHE_TTL
      );

      // Get total count for pagination
      const totalCount = await prisma.resource.count({ where });

      return SecurityMiddleware.createSecureResponse({
        success: true,
        data: resources,
        pagination: {
          total: totalCount,
          limit: limit || totalCount,
          offset,
          hasMore: offset + (limit || totalCount) < totalCount,
        },
        cached: true,
      });
    } catch (error) {
      console.error('Error fetching resources:', error);
      return SecurityMiddleware.createErrorResponse(
        'Failed to fetch resources',
        500
      );
    }
  },
  {
    ttl: RESOURCES_CACHE_TTL,
    keyGenerator: (req) => {
      const url = new URL(req.url);
      return `resources:${url.searchParams.toString()}`;
    },
    skipCache: (req) => {
      const url = new URL(req.url);
      return url.searchParams.has('nocache') || url.searchParams.has('refresh');
    },
  }
);

export const POST = async (request: NextRequest) => {
  try {
    // Apply security middleware
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

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkUserId: userId },
      select: { id: true, role: true },
    });

    if (!user) {
      return SecurityMiddleware.createErrorResponse('User not found', 404);
    }

    // Check if user has permission to create resources
    if (user.role !== 'ADMIN') {
      console.log('User role:', user.role, 'User ID:', user.id);
      return SecurityMiddleware.createErrorResponse(
        'Insufficient permissions',
        403
      );
    }

    const body = await request.json();
    const {
      title,
      description,
      type,
      category,
      ageGroup,
      duration,
      fileSize,
      tags = [],
      downloadUrl,
      viewUrl,
      thumbnailUrl,
      isFree = true,
      isPublished = true,
      isFeatured = false,
    } = body;

    // Validate required fields
    if (!title || !description || !type || !category || !ageGroup) {
      return SecurityMiddleware.createErrorResponse(
        'Missing required fields: title, description, type, category, ageGroup',
        400
      );
    }

    // Create resource
    const resource = await prisma.resource.create({
      data: {
        title,
        description,
        type,
        category,
        ageGroup,
        duration,
        fileSize,
        tags,
        downloadUrl,
        viewUrl,
        thumbnailUrl,
        isFree,
        isPublished,
        isFeatured,
        createdById: user.id,
      },
      select: {
        id: true,
        title: true,
        description: true,
        type: true,
        category: true,
        ageGroup: true,
        duration: true,
        fileSize: true,
        downloadCount: true,
        viewCount: true,
        rating: true,
        tags: true,
        downloadUrl: true,
        viewUrl: true,
        thumbnailUrl: true,
        isFree: true,
        isFeatured: true,
        createdAt: true,
        updatedAt: true,
        createdBy: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
    });

    // Clear cache
    await QueryCache.clear();

    return SecurityMiddleware.createSecureResponse({
      success: true,
      data: resource,
      message: 'Resource created successfully',
    });
  } catch (error) {
    console.error('Error creating resource:', error);
    return SecurityMiddleware.createErrorResponse(
      'Failed to create resource',
      500
    );
  }
};
