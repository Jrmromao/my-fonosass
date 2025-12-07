import { prisma } from '@/app/db';
import { generateResourcePDF } from '@/lib/pdfGenerator';
import { SecurityMiddleware } from '@/lib/security/securityMiddleware';
import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

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

    // Get user info (optional for free downloads)
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

    // Check if resource exists and is published (support both ID and slug)
    const resource = await prisma.resource.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
        isPublished: true,
      },
      select: {
        id: true,
        title: true,
        description: true,
        content: true,
        category: true,
        ageGroup: true,
        tags: true,
        downloadCount: true,
        rating: true,
        createdAt: true,
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
        resourceId: resource.id,
        userId: user?.id,
        ipAddress,
        userAgent,
      },
    });

    // Update download count
    await prisma.resource.update({
      where: { id: resource.id },
      data: {
        downloadCount: {
          increment: 1,
        },
      },
    });

    try {
      // Generate PDF from resource content
      const pdfBuffer = await generateResourcePDF({
        title: resource.title,
        description: resource.description,
        content: resource.content || '',
        category: resource.category,
        ageGroup: resource.ageGroup,
        tags: resource.tags,
        downloadCount: resource.downloadCount,
        rating: resource.rating,
        createdAt: resource.createdAt.toISOString(),
      });

      // Return the generated PDF
      return new NextResponse(new Uint8Array(pdfBuffer), {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${resource.title.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '-')}.pdf"`,
          'Content-Length': pdfBuffer.length.toString(),
          'Cache-Control': 'no-cache',
        },
      });
    } catch (pdfError) {
      console.error('Error generating PDF:', pdfError);

      // Fallback: return error message
      return new NextResponse(
        `Error generating PDF: ${pdfError instanceof Error ? pdfError.message : 'Unknown error'}`,
        {
          status: 500,
          headers: {
            'Content-Type': 'text/plain',
          },
        }
      );
    }
  } catch (error) {
    console.error('Error serving PDF file:', error);
    return SecurityMiddleware.createErrorResponse(
      'Failed to serve PDF file',
      500
    );
  }
};
