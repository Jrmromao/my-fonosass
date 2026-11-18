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
 * Token-based reviewer rejection (magic link from Telegram / review page).
 * Same auth model as the approve route: the single-use `approvalToken` is the
 * credential. Rejecting marks the activity REJECTED, keeps it non-public, and
 * consumes the token.
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

    if (activity.status === 'REJECTED' && !activity.approvalToken) {
      reviewUrl.searchParams.set('rejected', '1');
      return NextResponse.redirect(reviewUrl, 303);
    }

    if (!activity.approvalToken || !safeEqual(activity.approvalToken, token)) {
      // Someone is guessing/replaying review tokens: throttled trail entry.
      await recordAudit({
        action: AuditAction.APPROVAL_TOKEN_INVALID,
        actorType: 'ANONYMOUS',
        targetType: 'Activity',
        targetId: id,
        request,
        metadata: { kind: 'reject' },
        throttleMs: 5 * 60 * 1000,
      });
      reviewUrl.searchParams.set('error', 'invalid_token');
      return NextResponse.redirect(reviewUrl, 303);
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
      return NextResponse.redirect(reviewUrl, 303);
    }

    refreshPublicCatalogPages();
    reviewUrl.searchParams.set('rejected', '1');
    return NextResponse.redirect(reviewUrl, 303);
  } catch (error) {
    console.error('[exercises/reject] error:', error);
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
