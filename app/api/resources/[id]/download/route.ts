import { prisma } from '@/app/db';
import { SecurityMiddleware } from '@/lib/security/securityMiddleware';
import { auth } from '@clerk/nextjs/server';
import { NextRequest } from 'next/server';

export const POST = async (
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

    // Get user info (optional for downloads)
    const { userId } = await auth();
    let user = null;

    if (userId) {
      user = await prisma.user.findUnique({
        where: { clerkUserId: userId },
        select: { id: true },
      });
    }

    // Get client info
    const ipAddress =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Check if resource exists and is published
    const resource = await prisma.resource.findUnique({
      where: {
        id,
        isPublished: true,
      },
      select: {
        id: true,
        title: true,
        downloadUrl: true,
        isFree: true,
      },
    });

    if (!resource) {
      return SecurityMiddleware.createErrorResponse('Resource not found', 404);
    }

    // Check if user has permission to download (if not free)
    if (!resource.isFree && !user) {
      return SecurityMiddleware.createErrorResponse(
        'Authentication required for premium resources',
        401
      );
    }

    // Record the download
    await prisma.resourceDownload.create({
      data: {
        resourceId: id,
        userId: user?.id,
        ipAddress,
        userAgent,
      },
    });

    // Update download count
    await prisma.resource.update({
      where: { id },
      data: {
        downloadCount: {
          increment: 1,
        },
      },
    });

    return SecurityMiddleware.createSecureResponse({
      success: true,
      data: {
        downloadUrl: resource.downloadUrl,
        title: resource.title,
      },
      message: 'Download recorded successfully',
    });
  } catch (error) {
    console.error('Error recording download:', error);
    return SecurityMiddleware.createErrorResponse(
      'Failed to record download',
      500
    );
  }
};
