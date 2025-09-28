import { prisma } from '@/app/db';
import { SecurityMiddleware } from '@/lib/security/securityMiddleware';
import { auth } from '@clerk/nextjs/server';
import { NextRequest } from 'next/server';

export const POST = async (
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
      select: { id: true },
    });

    if (!user) {
      return SecurityMiddleware.createErrorResponse('User not found', 404);
    }

    const body = await request.json();
    const { rating, comment } = body;

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return SecurityMiddleware.createErrorResponse(
        'Rating must be between 1 and 5',
        400
      );
    }

    // Check if resource exists and is published
    const resource = await prisma.resource.findUnique({
      where: {
        id,
        isPublished: true,
      },
      select: { id: true, title: true },
    });

    if (!resource) {
      return SecurityMiddleware.createErrorResponse('Resource not found', 404);
    }

    // Upsert rating (create or update)
    const resourceRating = await prisma.resourceRating.upsert({
      where: {
        resourceId_userId: {
          resourceId: id,
          userId: user.id,
        },
      },
      update: {
        rating,
        comment: comment || null,
      },
      create: {
        resourceId: id,
        userId: user.id,
        rating,
        comment: comment || null,
      },
    });

    // Recalculate average rating
    const avgRating = await prisma.resourceRating.aggregate({
      where: { resourceId: id },
      _avg: { rating: true },
    });

    // Update resource with new average rating
    await prisma.resource.update({
      where: { id },
      data: {
        rating: avgRating._avg.rating || 0,
      },
    });

    return SecurityMiddleware.createSecureResponse({
      success: true,
      data: resourceRating,
      message: 'Rating submitted successfully',
    });
  } catch (error) {
    console.error('Error submitting rating:', error);
    return SecurityMiddleware.createErrorResponse(
      'Failed to submit rating',
      500
    );
  }
};

export const GET = async (
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

    // Get user info (optional)
    const { userId } = await auth();
    let user = null;

    if (userId) {
      user = await prisma.user.findUnique({
        where: { clerkUserId: userId },
        select: { id: true },
      });
    }

    // Get ratings for the resource
    const ratings = await prisma.resourceRating.findMany({
      where: { resourceId: id },
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
      take: 50,
    });

    // Get user's rating if authenticated
    let userRating = null;
    if (user) {
      userRating = await prisma.resourceRating.findUnique({
        where: {
          resourceId_userId: {
            resourceId: id,
            userId: user.id,
          },
        },
        select: {
          id: true,
          rating: true,
          comment: true,
          createdAt: true,
        },
      });
    }

    // Get rating statistics
    const ratingStats = await prisma.resourceRating.groupBy({
      by: ['rating'],
      where: { resourceId: id },
      _count: { rating: true },
    });

    const stats = ratingStats.reduce(
      (acc, stat) => {
        acc[stat.rating] = stat._count.rating;
        return acc;
      },
      {} as Record<number, number>
    );

    return SecurityMiddleware.createSecureResponse({
      success: true,
      data: {
        ratings,
        userRating,
        stats,
        totalRatings: ratings.length,
      },
    });
  } catch (error) {
    console.error('Error fetching ratings:', error);
    return SecurityMiddleware.createErrorResponse(
      'Failed to fetch ratings',
      500
    );
  }
};
