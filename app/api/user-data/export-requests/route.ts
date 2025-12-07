import { prisma } from '@/app/db';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// In-memory store for export requests (in production, use a database)
const exportRequests = new Map<string, any>();

export async function POST(request: Request) {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkUserId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Parse request body
    const { format = 'json', reason = 'User requested data export' } =
      await request.json();

    // Generate unique request ID
    const requestId = `export-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Create export request record
    const exportRequest = {
      id: requestId,
      userId: user.id,
      clerkUserId: user.clerkUserId,
      email: user.email,
      format: format,
      reason: reason,
      status: 'PENDING',
      requestedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
      downloadUrl: null,
      downloadCount: 0,
      maxDownloads: 3,
    };

    // Store the request
    exportRequests.set(requestId, exportRequest);

    // Log the request

    // TODO: In a production environment, you would:
    // 1. Store in database
    // 2. Queue background job to generate export
    // 3. Send email notification
    // 4. Implement rate limiting

    return NextResponse.json({
      success: true,
      message: 'Export request submitted successfully',
      data: {
        requestId: exportRequest.id,
        status: exportRequest.status,
        format: exportRequest.format,
        requestedAt: exportRequest.requestedAt,
        estimatedProcessingTime: '5-10 minutes',
        expiresAt: exportRequest.expiresAt,
      },
    });
  } catch (error) {
    console.error('Error creating export request:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Failed to create export request',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkUserId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get user's export requests
    const userRequests = Array.from(exportRequests.values())
      .filter((request) => request.userId === user.id)
      .sort(
        (a, b) =>
          new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime()
      );

    return NextResponse.json({
      success: true,
      data: {
        userId: user.id,
        exportRequests: userRequests,
        totalRequests: userRequests.length,
      },
    });
  } catch (error) {
    console.error('Error retrieving export requests:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Failed to retrieve export requests',
      },
      { status: 500 }
    );
  }
}
