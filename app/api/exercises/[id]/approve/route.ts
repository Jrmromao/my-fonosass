export const dynamic = 'force-dynamic';
import { prisma } from '@/app/db';
import { refreshPublicCatalogPages } from '@/lib/cache/publicPages';
import {
  assertTransition,
  type ActivityStatus,
} from '@/lib/activities/approval';
import { AuditAction, recordAudit } from '@/lib/audit/audit';
import { safeEqual } from '@/lib/security/safeCompare';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Token-based reviewer approval (confirmed with a POST from the review page).
 *
 * This endpoint is intentionally NOT Clerk-protected: the reviewer is
 * authenticated solely by possession of the single-use `approvalToken` that
 * was generated when the activity entered review. We verify the token with a
 * constant-time-ish exact match, enforce the state transition, and clear the
 * token so the link can't be replayed.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  // The token travels in the POST body (never the URL) and the action only
  // runs on an explicit POST, so link prefetchers/scanners cannot trigger it.
  const form = await request.formData().catch(() => null);
  const rawToken = form?.get('token');
  const token = typeof rawToken === 'string' ? rawToken : null;
  const reviewUrl = new URL(
    `/dashboard/exercises/review/${id}`,
    request.nextUrl.origin
  );

  try {
    if (!token) {
      reviewUrl.searchParams.set('error', 'missing_token');
      return NextResponse.redirect(reviewUrl, 303);
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
      return NextResponse.redirect(reviewUrl, 303);
    }

    // Token must be present and match exactly.
    if (!activity.approvalToken || !safeEqual(activity.approvalToken, token)) {
      // Someone is guessing/replaying review tokens: throttled trail entry.
      await recordAudit({
        action: AuditAction.APPROVAL_TOKEN_INVALID,
        actorType: 'ANONYMOUS',
        targetType: 'Activity',
        targetId: id,
        request,
        metadata: { kind: 'approve' },
        throttleMs: 5 * 60 * 1000,
      });
      reviewUrl.searchParams.set('error', 'invalid_token');
      return NextResponse.redirect(reviewUrl, 303);
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
      return NextResponse.redirect(reviewUrl, 303);
    }

    refreshPublicCatalogPages();
    reviewUrl.searchParams.set('approved', '1');
    return NextResponse.redirect(reviewUrl, 303);
  } catch (error) {
    console.error('[exercises/approve] error:', error);
    reviewUrl.searchParams.set('error', 'failed');
    return NextResponse.redirect(reviewUrl, 303);
  }
}

/**
 * GET never changes state. Old links (emails/Telegram messages already sent)
 * land on the review page, where the reviewer confirms with a button (POST).
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const reviewUrl = new URL(
    `/dashboard/exercises/review/${encodeURIComponent(id)}`,
    request.nextUrl.origin
  );
  const token = request.nextUrl.searchParams.get('token');
  if (token) reviewUrl.searchParams.set('token', token);
  return NextResponse.redirect(reviewUrl, 303);
}
