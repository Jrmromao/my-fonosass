import { prisma } from '@/app/db';
import { DELETION_FLAG } from '@/lib/auth/dbUser';
import { SecurityMiddleware } from '@/lib/security/securityMiddleware';
import { stripe } from '@/lib/stripe';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const bodySchema = z.object({ confirmDeletion: z.literal(true) });

const NO_STORE = { 'Cache-Control': 'private, no-store' };

/**
 * LGPD erasure: flags the Clerk user, cancels the Stripe subscription,
 * deletes the user's rows (keeping only anonymous counters and an anonymous
 * deletion record) and then the Clerk login. Accounts that authored content (admins) are refused:
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

    const clerk = await clerkClient();

    // 1. Flag the Clerk user before touching data, so nothing can recreate
    //    the row while (or after) it is erased: neither getOrCreateDbUser nor
    //    the webhook's user.updated, which this very call triggers.
    try {
      await clerk.users.updateUserMetadata(clerkUserId, {
        privateMetadata: { [DELETION_FLAG]: new Date().toISOString() },
      });
    } catch (error) {
      console.error('Could not flag Clerk user for deletion:', error);
      return NextResponse.json(
        { error: 'DELETION_FLAG_FAILED' },
        { status: 502, headers: NO_STORE }
      );
    }
    const unflag = async () => {
      try {
        await clerk.users.updateUserMetadata(clerkUserId, {
          privateMetadata: { [DELETION_FLAG]: null },
        });
      } catch (error) {
        console.error('Could not clear the deletion flag:', error);
      }
    };

    // 2. Stop billing: if this fails, nothing has been deleted yet.
    const subscriptionId = user.subscriptions?.paymentId;
    if (subscriptionId) {
      try {
        await stripe.subscriptions.cancel(subscriptionId);
      } catch (error) {
        const code = (error as { code?: string }).code;
        if (code !== 'resource_missing') {
          console.error('Stripe cancel failed during account deletion:', error);
          await unflag();
          return NextResponse.json(
            { error: 'BILLING_CANCEL_FAILED' },
            { status: 502, headers: NO_STORE }
          );
        }
      }
    }

    // 3. Erase every row tied to the user, in one transaction.
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
      // Anonymous proof of the deletion (no id, email or name).
      prisma.accountDeletion.create({
        data: { hadSubscription: !!subscriptionId },
      }),
    ]);
    // Anonymous monthly download counters (ActivityDownloadStat) are kept:
    // they never referenced the user.

    // 4. Last step: the login. Data is already gone if this fails; the flag
    //    stops it from being recreated until support finishes the deletion.
    try {
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
