export const dynamic = 'force-dynamic';
import { prisma } from '@/app/db';
import {
  assertTransition,
  type ActivityStatus,
} from '@/lib/activities/approval';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Token-based reviewer rejection (magic link from Telegram / review page).
 * Same auth model as the approve route: the single-use `approvalToken` is the
 * credential. Rejecting marks the activity REJECTED, keeps it non-public, and
 * consumes the token.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const token = request.nextUrl.searchParams.get('token');
  const reviewUrl = new URL(
    `/dashboard/exercises/review/${id}`,
    request.nextUrl.origin
  );

  try {
    if (!token) {
      reviewUrl.searchParams.set('error', 'missing_token');
      return NextResponse.redirect(reviewUrl);
    }

    const activity = await prisma.activity.findUnique({
      where: { id },
      select: { id: true, status: true, approvalToken: true },
    });

    if (!activity) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    if (activity.status === 'REJECTED' && !activity.approvalToken) {
      reviewUrl.searchParams.set('rejected', '1');
      return NextResponse.redirect(reviewUrl);
    }

    if (!activity.approvalToken || activity.approvalToken !== token) {
      reviewUrl.searchParams.set('error', 'invalid_token');
      return NextResponse.redirect(reviewUrl);
    }

    assertTransition(activity.status as ActivityStatus, 'REJECTED');

    const result = await prisma.activity.updateMany({
      where: { id, approvalToken: token },
      data: {
        status: 'REJECTED',
        isPublic: false,
        approvalToken: null,
        reviewedAt: new Date(),
      },
    });

    if (result.count === 0) {
      reviewUrl.searchParams.set('already', '1');
      return NextResponse.redirect(reviewUrl);
    }

    reviewUrl.searchParams.set('rejected', '1');
    return NextResponse.redirect(reviewUrl);
  } catch (error) {
    console.error('[exercises/reject] error:', error);
    reviewUrl.searchParams.set('error', 'failed');
    return NextResponse.redirect(reviewUrl);
  }
}
