import { prisma } from '@/app/db';
import {
  claimWebhookEvent,
  releaseWebhookEvent,
} from '@/lib/webhooks/idempotency';
import { stripe } from '@/lib/stripe';
import { clerkClient } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import type { Stripe } from 'stripe';

// Helper function to update Clerk user metadata with subscription details
async function updateClerkUserMetadata(
  clerkUserId: string,
  status: string,
  tier: string,
  subscriptionId?: string,
  currentPeriodEnd?: number
) {
  if (!clerkUserId) return;

  try {
    const clerk = await clerkClient();

    const metadata = {
      subscription: {
        status,
        tier,
        ...(subscriptionId && { subscriptionId }),
        ...(currentPeriodEnd && {
          currentPeriodEnd: new Date(currentPeriodEnd * 1000).toISOString(),
        }),
      },
    };

    await clerk.users.updateUser(clerkUserId, { privateMetadata: metadata });
  } catch (error) {
    console.error(
      `Failed to update Clerk metadata for user ${clerkUserId}:`,
      error
    );
  }
}

// ─── Subscription emails ─────────────────────────────────────

// Since API version 2025-03-31 (we use basil) the billing period lives on the
// subscription items, not on the subscription. Fall back to the old field.
type PeriodFields = {
  current_period_start?: number;
  current_period_end?: number;
};

function periodSeconds(
  subscription: Stripe.Subscription,
  edge: 'start' | 'end'
): number | undefined {
  const key = edge === 'start' ? 'current_period_start' : 'current_period_end';
  const item = subscription.items?.data?.[0] as PeriodFields | undefined;
  return (subscription as PeriodFields)[key] ?? item?.[key];
}

/** Period boundary as a Date; undefined (Prisma skips the field) if missing. */
function periodDate(
  subscription: Stripe.Subscription,
  edge: 'start' | 'end'
): Date | undefined {
  const seconds = periodSeconds(subscription, edge);
  return seconds ? new Date(seconds * 1000) : undefined;
}

function isCancelScheduled(sub: Partial<Stripe.Subscription>): boolean {
  return Boolean(sub.cancel_at_period_end || sub.cancel_at);
}

async function findEmailRecipient(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, fullName: true },
  });
}

/** Emails must never fail the webhook (Stripe would retry and re-run it). */
async function sendSubscriptionEmail(label: string, send: () => Promise<void>) {
  try {
    await send();
  } catch (error) {
    console.error(`${label} email failed:`, error);
  }
}

export async function POST(req: Request) {
  // Authenticity is enforced by the Stripe signature below. No in-memory
  // rate limit here: it counted forged requests too, so an attacker could
  // trigger 429s for genuine Stripe deliveries.
  // Verify webhook signature
  const body = await req.text();
  const sig = req.headers.get('stripe-signature') as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error('Missing STRIPE_WEBHOOK_SECRET environment variable');
    return NextResponse.json(
      { error: 'Server configuration error' },
      { status: 500 }
    );
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return NextResponse.json(
      { error: 'Invalid webhook signature' },
      { status: 401 }
    );
  }
  // Idempotency: Stripe delivers at least once and retries on failure.
  // Claim the event id first; a duplicate delivery is acknowledged without
  // repeating its side effects (emails, Clerk metadata, subscription writes).
  const claimed = await claimWebhookEvent(event.id, event.type);
  if (!claimed) {
    return NextResponse.json({ success: true, duplicate: true });
  }

  const response = await handleStripeEvent(event);
  // Failed: release the claim so Stripe's retry is processed.
  if (!response.ok) await releaseWebhookEvent(event.id);
  return response;
}

/** Business logic for one verified event. A non-2xx response makes Stripe retry. */
async function handleStripeEvent(event: Stripe.Event): Promise<NextResponse> {
  try {
    switch (event.type) {
      // Pix completes asynchronously: `completed` arrives when the mandate is
      // authorized (payment may still be pending); `async_payment_succeeded`
      // arrives when the money lands. Card payments are paid at `completed`.
      case 'checkout.session.async_payment_failed': {
        const session = event.data.object as Stripe.Checkout.Session;
        console.warn('Async checkout payment failed', session.id);
        // Nothing to undo: access is only granted once the session is paid.
        break;
      }

      case 'checkout.session.completed':
      case 'checkout.session.async_payment_succeeded': {
        const session = event.data.object as Stripe.Checkout.Session;
        // 'unpaid' = Pix still pending: record the subscription, no access yet.
        const paid = session.payment_status !== 'unpaid';

        // Make sure this is a subscription checkout
        if (session.mode !== 'subscription' || !session.subscription) {
          break;
        }

        // Get metadata from the session
        const clerkUserId = session.metadata?.clerkUserId;
        const userId = session.metadata?.userId;

        if (!clerkUserId || !userId) {
          console.error(
            'Missing user IDs in checkout session metadata',
            session.id
          );
          return NextResponse.json(
            { error: 'Invalid metadata' },
            { status: 400 }
          );
        }

        // Get subscription ID
        const subscriptionId = session.subscription as string;

        // IMPORTANT: Copy metadata from checkout session to the subscription
        // This ensures the metadata is available for future subscription events
        await stripe.subscriptions.update(subscriptionId, {
          metadata: {
            clerkUserId,
            userId,
          },
        });

        // Fetch subscription details
        const subscription = (await stripe.subscriptions.retrieve(
          subscriptionId
        )) as Stripe.Subscription;

        // Update Clerk user metadata
        await updateClerkUserMetadata(
          clerkUserId,
          paid ? 'active' : 'pending',
          'PRO',
          subscriptionId,
          periodSeconds(subscription, 'end')
        );

        // Calculate period dates
        const periodStart = periodDate(subscription, 'start');
        const periodEnd = periodDate(subscription, 'end');

        // Store subscription in database
        await prisma.subscription.upsert({
          where: { userId },
          update: {
            tier: 'PRO',
            status: paid ? 'ACTIVE' : 'INACTIVE',
            paymentId: subscriptionId,
            currentPeriodStart: periodStart,
            currentPeriodEnd: periodEnd,
            updatedAt: new Date(),
          },
          create: {
            userId,
            tier: 'PRO',
            status: paid ? 'ACTIVE' : 'INACTIVE',
            paymentId: subscriptionId,
            currentPeriodStart: periodStart,
            currentPeriodEnd: periodEnd,
          },
        });

        // Confirmation only once paid (Pix sends it on async_payment_succeeded).
        if (!paid) break;

        await sendSubscriptionEmail('Subscription confirmed', async () => {
          const user = await findEmailRecipient(userId);
          const price = subscription.items.data[0]?.price;
          if (!user || !price?.unit_amount || !periodEnd) return;
          const { EmailService } = await import('@/services/emailService');
          await EmailService.sendSubscriptionConfirmed(
            user.email,
            user.fullName,
            {
              amount: price.unit_amount / 100,
              interval: price.recurring?.interval === 'year' ? 'year' : 'month',
              renewsAt: periodEnd,
            }
          );
        });

        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = (invoice as any).subscription as string;

        if (!subscriptionId) {
          break;
        }

        // Fetch subscription to get metadata and period info
        const subscription = (await stripe.subscriptions.retrieve(
          subscriptionId
        )) as Stripe.Subscription;
        const userId = subscription.metadata?.userId;
        const clerkUserId = subscription.metadata?.clerkUserId;

        if (!userId) {
          break;
        }

        // Update subscription period in database
        await prisma.subscription.updateMany({
          where: {
            userId,
            paymentId: subscriptionId,
          },
          data: {
            status: 'ACTIVE',
            currentPeriodStart: periodDate(subscription, 'start'),
            currentPeriodEnd: periodDate(subscription, 'end'),
            updatedAt: new Date(),
          },
        });

        // Update Clerk if we have the clerkUserId
        if (clerkUserId) {
          await updateClerkUserMetadata(
            clerkUserId,
            'active',
            'PRO',
            subscriptionId,
            periodSeconds(subscription, 'end')
          );
        }

        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = (invoice as any).subscription as string;

        if (!subscriptionId) {
          break;
        }

        // Fetch subscription to get metadata
        const subscription = (await stripe.subscriptions.retrieve(
          subscriptionId
        )) as Stripe.Subscription;
        const userId = subscription.metadata?.userId;
        const clerkUserId = subscription.metadata?.clerkUserId;

        if (!userId) {
          break;
        }

        // Mark subscription as past_due in database
        await prisma.subscription.updateMany({
          where: {
            userId,
            paymentId: subscriptionId,
          },
          data: {
            status: 'PAST_DUE',
            updatedAt: new Date(),
          },
        });

        // Update Clerk if we have the clerkUserId
        if (clerkUserId) {
          await updateClerkUserMetadata(
            clerkUserId,
            'past_due',
            'PRO',
            subscriptionId,
            periodSeconds(subscription, 'end')
          );
        }

        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.userId;
        const clerkUserId = subscription.metadata?.clerkUserId;

        if (!userId) {
          break;
        }

        // Map Stripe status to your status enum
        let status;
        switch (subscription.status) {
          case 'active':
          case 'trialing':
            status = 'ACTIVE';
            break;
          case 'past_due':
            status = 'PAST_DUE';
            break;
          default:
            status = 'INACTIVE';
        }

        // Update subscription in database
        await prisma.subscription.updateMany({
          where: {
            userId,
            paymentId: subscription.id,
          },
          data: {
            status: status as any,
            currentPeriodStart: periodDate(subscription, 'start'),
            currentPeriodEnd: periodDate(subscription, 'end'),
            updatedAt: new Date(),
          },
        });

        // Update Clerk if we have the clerkUserId
        if (clerkUserId) {
          await updateClerkUserMetadata(
            clerkUserId,
            subscription.status,
            status === 'ACTIVE' ? 'PRO' : 'FREE',
            subscription.id,
            periodSeconds(subscription, 'end')
          );
        }

        // Customer just scheduled a cancellation (e.g. in the billing portal):
        // confirm it and tell them until when they keep access.
        const previous = (event.data.previous_attributes ??
          {}) as Partial<Stripe.Subscription>;
        const cancelFieldsChanged =
          'cancel_at_period_end' in previous || 'cancel_at' in previous;
        if (
          cancelFieldsChanged &&
          !isCancelScheduled(previous) &&
          isCancelScheduled(subscription)
        ) {
          await sendSubscriptionEmail('Subscription cancelled', async () => {
            const user = await findEmailRecipient(userId);
            if (!user) return;
            const accessUntil = subscription.cancel_at
              ? new Date(subscription.cancel_at * 1000)
              : (periodDate(subscription, 'end') ?? null);
            const { EmailService } = await import('@/services/emailService');
            await EmailService.sendSubscriptionCancelled(
              user.email,
              user.fullName,
              accessUntil
            );
          });
        }

        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.userId;
        const clerkUserId = subscription.metadata?.clerkUserId;

        if (!userId) {
          break;
        }

        // Update subscription in database
        await prisma.subscription.updateMany({
          where: {
            userId,
            paymentId: subscription.id,
          },
          data: {
            status: 'INACTIVE',
            tier: 'FREE',
            updatedAt: new Date(),
          },
        });

        // Update Clerk if we have the clerkUserId
        if (clerkUserId) {
          await updateClerkUserMetadata(clerkUserId, 'inactive', 'FREE');
        }

        // A scheduled cancellation was already emailed when it was scheduled.
        // Otherwise (cancelled immediately, or ended after failed payments)
        // tell the customer it has ended.
        if (!isCancelScheduled(subscription)) {
          await sendSubscriptionEmail('Subscription cancelled', async () => {
            const user = await findEmailRecipient(userId);
            if (!user) return;
            const { EmailService } = await import('@/services/emailService');
            await EmailService.sendSubscriptionCancelled(
              user.email,
              user.fullName,
              null
            );
          });
        }

        break;
      }

      default:
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
