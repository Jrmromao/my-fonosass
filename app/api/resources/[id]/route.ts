import { prisma } from '@/app/db';
import { QueryCache, withCaching } from '@/lib/performance/cacheManager';
import { SecurityMiddleware } from '@/lib/security/securityMiddleware';
import { auth } from '@clerk/nextjs/server';
import { NextRequest } from 'next/server';

// Cache individual resource for 10 minutes (600 seconds)
const RESOURCE_CACHE_TTL = 600;

export const GET = withCaching(
  async (
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
  ) => {
    try {
      const { id } = await params;

      if (!id) {
        return SecurityMiddleware.createErrorResponse(
          'Resource ID is required',
          400
        );
      }

      // Use QueryCache to cache database queries
      const resource = await QueryCache.get(
        `resource:${id}`,
        async () => {
          return await prisma.resource.findFirst({
            where: {
              OR: [{ id }, { slug: id }],
              isPublished: true,
            },
            select: {
              id: true,
              title: true,
              description: true,
              content: true,
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
              files: {
                select: {
                  id: true,
                  name: true,
                  fileType: true,
                  sizeInBytes: true,
                  s3Url: true,
                },
              },
              ratings: {
                select: {
                  id: true,
                  rating: true,
                  comment: true,
                  createdAt: true,
                  user: {
                    select: {
                      fullName: true,
                    },
                  },
                },
                orderBy: {
                  createdAt: 'desc',
                },
                take: 10,
              },
            },
          });
        },
        RESOURCE_CACHE_TTL
      );

      if (!resource) {
        return SecurityMiddleware.createErrorResponse(
          'Resource not found',
          404
        );
      }

      return SecurityMiddleware.createSecureResponse({
        success: true,
        data: resource,
        cached: true,
      });
    } catch (error) {
      console.error('Error fetching resource:', error);
      return SecurityMiddleware.createErrorResponse(
        'Failed to fetch resource',
        500
      );
    }
  },
  {
    ttl: RESOURCE_CACHE_TTL,
    keyGenerator: (req) => `resource:${req.url.split('/').pop()}`,
  }
);

export const PUT = async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
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

    const { id } = await params;

    if (!id) {
      return SecurityMiddleware.createErrorResponse(
        'Resource ID is required',
        400
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

    // Check if resource exists and user has permission to update
    const existingResource = await prisma.resource.findUnique({
      where: { id },
      select: { createdById: true },
    });

    if (!existingResource) {
      return SecurityMiddleware.createErrorResponse('Resource not found', 404);
    }

    if (user.role !== 'ADMIN' && existingResource.createdById !== user.id) {
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
      tags,
      downloadUrl,
      viewUrl,
      thumbnailUrl,
      isFree,
      isPublished,
      isFeatured,
    } = body;

    // Update resource
    const resource = await prisma.resource.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(type && { type }),
        ...(category && { category }),
        ...(ageGroup && { ageGroup }),
        ...(duration !== undefined && { duration }),
        ...(fileSize !== undefined && { fileSize }),
        ...(tags && { tags }),
        ...(downloadUrl && { downloadUrl }),
        ...(viewUrl && { viewUrl }),
        ...(thumbnailUrl !== undefined && { thumbnailUrl }),
        ...(isFree !== undefined && { isFree }),
        ...(isPublished !== undefined && { isPublished }),
        ...(isFeatured !== undefined && { isFeatured }),
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
      message: 'Resource updated successfully',
    });
  } catch (error) {
    console.error('Error updating resource:', error);
    return SecurityMiddleware.createErrorResponse(
      'Failed to update resource',
      500
    );
  }
};

export const DELETE = async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
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

    const { id } = await params;

    if (!id) {
      return SecurityMiddleware.createErrorResponse(
        'Resource ID is required',
        400
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

    // Check if resource exists and user has permission to delete
    const existingResource = await prisma.resource.findUnique({
      where: { id },
      select: { createdById: true },
    });

    if (!existingResource) {
      return SecurityMiddleware.createErrorResponse('Resource not found', 404);
    }

    if (user.role !== 'ADMIN' && existingResource.createdById !== user.id) {
      return SecurityMiddleware.createErrorResponse(
        'Insufficient permissions',
        403
      );
    }

    // Soft delete by setting isPublished to false
    await prisma.resource.update({
      where: { id },
      data: { isPublished: false },
    });

    // Clear cache
    await QueryCache.clear();

    return SecurityMiddleware.createSecureResponse({
      success: true,
      message: 'Resource deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting resource:', error);
    return SecurityMiddleware.createErrorResponse(
      'Failed to delete resource',
      500
    );
  }
};
