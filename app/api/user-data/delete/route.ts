import { prisma } from '@/app/db';
import { SecurityMiddleware } from '@/lib/security/securityMiddleware';
import { stripe } from '@/lib/stripe';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const bodySchema = z.object({ confirmDeletion: z.literal(true) });

const NO_STORE = { 'Cache-Control': 'private, no-store' };

/**
 * LGPD erasure: cancels the Stripe subscription, deletes the user's rows and
 * then the Clerk login. Accounts that authored content (admins) are refused:
 * deleting them would delete the library, so they go through the DPO.
 */
export async function POST(request: NextRequest) {
  try {
    const security = await SecurityMiddleware.apply(request, {
      requireAuth: true,
      requireCSRF: true,
      rateLimitType: 'general',
      validateInput: false,
    });
    if (!security.success) return security.response!;

    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = bodySchema.safeParse(await request.json().catch(() => null));
    if (!body.success) {
      return NextResponse.json(
        { error: 'Deletion confirmation required' },
        { status: 400, headers: NO_STORE }
      );
    }

    const user = await prisma.user.findUnique({
      where: { clerkUserId },
      select: {
        id: true,
        role: true,
        subscriptions: { select: { paymentId: true } },
        _count: {
          select: {
            createdActivities: true,
            reviewedActivities: true,
            createdResources: true,
          },
        },
      },
    });
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404, headers: NO_STORE }
      );
    }

    const authoredContent =
      user._count.createdActivities +
      user._count.reviewedActivities +
      user._count.createdResources;
    if (user.role === 'ADMIN' || authoredContent > 0) {
      return NextResponse.json(
        { error: 'ACCOUNT_HAS_CONTENT' },
        { status: 409, headers: NO_STORE }
      );
    }

    // Stop billing first: if this fails, nothing has been deleted yet.
    const subscriptionId = user.subscriptions?.paymentId;
    if (subscriptionId) {
      try {
        await stripe.subscriptions.cancel(subscriptionId);
      } catch (error) {
        const code = (error as { code?: string }).code;
        if (code !== 'resource_missing') {
          console.error('Stripe cancel failed during account deletion:', error);
          return NextResponse.json(
            { error: 'BILLING_CANCEL_FAILED' },
            { status: 502, headers: NO_STORE }
          );
        }
      }
    }

    await prisma.$transaction([
      prisma.consentAuditLog.deleteMany({
        where: { consentRecord: { userId: user.id } },
      }),
      prisma.consentRecord.deleteMany({ where: { userId: user.id } }),
      prisma.downloadHistory.deleteMany({ where: { userId: user.id } }),
      prisma.download.deleteMany({ where: { userId: user.id } }),
      prisma.downloadLimit.deleteMany({ where: { userId: user.id } }),
      prisma.resourceDownload.deleteMany({ where: { userId: user.id } }),
      prisma.resourceView.deleteMany({ where: { userId: user.id } }),
      prisma.resourceRating.deleteMany({ where: { userId: user.id } }),
      prisma.dataRetentionLog.deleteMany({ where: { userId: user.id } }),
      prisma.subscription.deleteMany({ where: { userId: user.id } }),
      prisma.user.delete({ where: { id: user.id } }),
    ]);

    // Last step: the login. Data is already gone if this fails.
    try {
      const clerk = await clerkClient();
      await clerk.users.deleteUser(clerkUserId);
    } catch (error) {
      console.error('Clerk user deletion failed after data deletion:', error);
      return NextResponse.json(
        { error: 'LOGIN_DELETE_FAILED' },
        { status: 500, headers: NO_STORE }
      );
    }

    return NextResponse.json({ success: true }, { headers: NO_STORE });
  } catch (error) {
    console.error('Error deleting account:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: NO_STORE }
    );
  }
}
