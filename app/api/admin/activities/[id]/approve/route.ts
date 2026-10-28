export const dynamic = 'force-dynamic';
import { prisma } from '@/app/db';
import {
  assertTransition,
  errorResponse,
  requireAdmin,
  type ActivityStatus,
} from '@/lib/activities/approval';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { dbUserId } = await requireAdmin();

    const { id } = await params;

    const activity = await prisma.activity.findUnique({
      where: { id },
      select: { id: true, status: true },
    });
    if (!activity) {
      return NextResponse.json(
        { error: 'Activity not found' },
        { status: 404 }
      );
    }

    assertTransition(activity.status as ActivityStatus, 'PUBLISHED');

    await prisma.activity.update({
      where: { id },
      data: {
        status: 'PUBLISHED',
        isPublic: true,
        approvalToken: null,
        reviewedById: dbUserId,
        reviewedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    const { body, status } = errorResponse(error);
    return NextResponse.json(body, { status });
  }
}
