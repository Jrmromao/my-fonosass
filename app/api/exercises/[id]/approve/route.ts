export const dynamic = 'force-dynamic';
import { prisma } from '@/app/db';
import {
  assertTransition,
  type ActivityStatus,
} from '@/lib/activities/approval';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Token-based reviewer approval (magic link from Telegram / review page).
 *
 * This endpoint is intentionally NOT Clerk-protected: the reviewer is
 * authenticated solely by possession of the single-use `approvalToken` that
 * was generated when the activity entered review. We verify the token with a
 * constant-time-ish exact match, enforce the state transition, and clear the
 * token so the link can't be replayed.
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

    // Idempotent: if already published and the token was consumed, treat a
    // repeat click as success rather than an error.
    if (activity.status === 'PUBLISHED' && !activity.approvalToken) {
      reviewUrl.searchParams.set('already', '1');
      return NextResponse.redirect(reviewUrl);
    }

    // Token must be present and match exactly.
    if (!activity.approvalToken || activity.approvalToken !== token) {
      reviewUrl.searchParams.set('error', 'invalid_token');
      return NextResponse.redirect(reviewUrl);
    }

    assertTransition(activity.status as ActivityStatus, 'PUBLISHED');

    // Atomic + replay-safe: only update if the token still matches (consumes it).
    const result = await prisma.activity.updateMany({
      where: { id, approvalToken: token },
      data: {
        status: 'PUBLISHED',
        isPublic: true,
        approvalToken: null,
        reviewedAt: new Date(),
      },
    });

    if (result.count === 0) {
      // Someone else consumed the token between read and write.
      reviewUrl.searchParams.set('already', '1');
      return NextResponse.redirect(reviewUrl);
    }

    reviewUrl.searchParams.set('approved', '1');
    return NextResponse.redirect(reviewUrl);
  } catch (error) {
    console.error('[exercises/approve] error:', error);
    reviewUrl.searchParams.set('error', 'failed');
    return NextResponse.redirect(reviewUrl);
  }
}
