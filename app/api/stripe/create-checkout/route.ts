import { prisma } from '@/app/db';
import { getOrCreateDbUser } from '@/lib/auth/dbUser';
import { stripe } from '@/lib/stripe';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { z } from 'zod';

// Pix Automático mandate options are accepted by the API on our pinned version
// (verified) but are newer than the installed SDK's types (stripe 18.5).
// Remove when the SDK is upgraded.
type PixMandateOptions = {
  mandate_options: {
    amount: number;
    payment_schedule:
      | 'weekly'
      | 'monthly'
      | 'quarterly'
      | 'halfyearly'
      | 'yearly';
  };
};
type CheckoutParams = Stripe.Checkout.SessionCreateParams & {
  payment_method_options?: Stripe.Checkout.SessionCreateParams.PaymentMethodOptions & {
    pix?: PixMandateOptions;
  };
};

const bodySchema = z
  .object({ interval: z.enum(['monthly', 'yearly']).default('monthly') })
  .default({ interval: 'monthly' });

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Body is optional (older callers send none): defaults to monthly.
    let json: unknown = undefined;
    try {
      const raw = typeof req.text === 'function' ? await req.text() : '';
      json = raw ? JSON.parse(raw) : undefined;
    } catch {
      return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
    }
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid interval' }, { status: 400 });
    }

    const priceId =
      parsed.data.interval === 'yearly'
        ? process.env.STRIPE_ANNUAL_PRICE_ID
        : process.env.STRIPE_MONTHLY_PRICE_ID;
    if (!priceId) {
      console.error(`Missing Stripe price ID for ${parsed.data.interval}`);
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Get user from your database
    // Creates the row if the Clerk webhook missed this account.
    const user = await getOrCreateDbUser(userId);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Pix subscriptions use Pix Automático: the customer authorizes a mandate
    // in their bank app for this amount and schedule, then renewals are
    // charged automatically. The mandate must match the price, so read it.
    const price = await stripe.prices.retrieve(priceId);
    if (!price.unit_amount || price.currency !== 'brl') {
      console.error(`Price ${priceId} must be a fixed BRL amount for Pix`);
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Create the checkout session
    const params: CheckoutParams = {
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      // Explicit list (valid on the pinned API version). Pix confirms
      // asynchronously: access is granted by the webhook only once paid.
      payment_method_types: ['card', 'pix'],
      payment_method_options: {
        pix: {
          mandate_options: {
            amount: price.unit_amount,
            payment_schedule:
              parsed.data.interval === 'yearly' ? 'yearly' : 'monthly',
          },
        },
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/profile?tab=assinatura&checkout=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/profile?tab=assinatura&checkout=canceled`,
      metadata: {
        clerkUserId: userId, // Clerk user ID
        userId: user.id, // Your database user ID
      },
      customer_email: user.email, // Pre-fill customer email
    };
    const session = await stripe.checkout.sessions.create(
      params as Stripe.Checkout.SessionCreateParams
    );

    // Return the URL for the client to redirect to
    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Error creating checkout session' },
      { status: 500 }
    );
  }
}
