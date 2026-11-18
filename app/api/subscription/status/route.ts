import { prisma } from '@/app/db';
import { getEffectiveAccess } from '@/lib/auth/viewAs';
import { getOrCreateDbUser } from '@/lib/auth/dbUser';
import { stripe } from '@/lib/stripe';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const NO_STORE = { 'Cache-Control': 'private, no-store' };

/**
 * Signed-in user's own subscription, for the Assinatura page.
 * `cancelAtPeriodEnd` comes from Stripe (not stored in our DB); if Stripe is
 * unreachable it falls back to false and the page still renders.
 */
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401, headers: NO_STORE }
      );
    }

    const user = await getOrCreateDbUser(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404, headers: NO_STORE }
      );
    }

    const [subscription, access] = await Promise.all([
      prisma.subscription.findUnique({
        where: { userId: user.id },
        select: { status: true, currentPeriodEnd: true, paymentId: true },
      }),
      getEffectiveAccess(user),
    ]);
    const active = access.subscribed;

    let cancelAtPeriodEnd = false;
    if (active && subscription?.paymentId) {
      try {
        const remote = await stripe.subscriptions.retrieve(
          subscription.paymentId
        );
        cancelAtPeriodEnd = !!remote.cancel_at_period_end;
      } catch (error) {
        console.error('Stripe subscription lookup failed:', error);
      }
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          subscribed: active,
          isAdmin: access.isAdmin,
          viewAs: access.viewAs,
          status: subscription?.status ?? null,
          currentPeriodEnd: subscription?.currentPeriodEnd ?? null,
          cancelAtPeriodEnd,
          canManage: !!subscription?.paymentId,
        },
      },
      { headers: NO_STORE }
    );
  } catch (error) {
    console.error('Subscription status error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch subscription' },
      { status: 500, headers: NO_STORE }
    );
  }
}
