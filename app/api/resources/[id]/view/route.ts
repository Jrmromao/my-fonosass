import { prisma } from '@/app/db';
import { SecurityMiddleware } from '@/lib/security/securityMiddleware';
import { getResourceViewer } from '@/lib/resources/access';
import { getClientIp } from '@/lib/security/clientIp';
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

    const viewer = await getResourceViewer();
    const user = viewer.userId ? { id: viewer.userId } : null;

    const ipAddress = getClientIp(request);
    const userAgent =
      request.headers.get('user-agent')?.slice(0, 255) || 'unknown';

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

    // Record the view
    await prisma.resourceView.create({
      data: {
        resourceId: id,
        userId: user?.id,
        ipAddress,
        userAgent,
      },
    });

    // Update view count
    await prisma.resource.update({
      where: { id },
      data: {
        viewCount: {
          increment: 1,
        },
      },
    });

    return SecurityMiddleware.createSecureResponse({
      success: true,
      message: 'View recorded successfully',
    });
  } catch (error) {
    console.error('Error recording view:', error);
    return SecurityMiddleware.createErrorResponse('Failed to record view', 500);
  }
};
