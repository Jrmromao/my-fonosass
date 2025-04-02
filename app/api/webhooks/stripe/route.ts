// // app/api/webhooks/stripe/route.ts
// import { NextResponse } from 'next/server';
// import { stripe } from '@/lib/stripe';
// import { prisma } from '@/app/db';
// // import { createClerkClient } from '@clerk/clerk-sdk-node';
// import type { Stripe } from 'stripe';
// import { clerkClient } from '@clerk/nextjs/server';
//
//
// // Rate limiting setup
// const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute window
// const MAX_REQUESTS_PER_WINDOW = 50;
// const requestTimestamps: number[] = [];
//
// // Helper function to update Clerk user metadata with subscription details
// async function updateClerkUserMetadata(
//     clerkUserId: string,
//     status: string,
//     tier: string,
//     subscriptionId?: string,
//     currentPeriodEnd?: number
// ) {
//     if (!clerkUserId) return;
//
//     try {
//         const clerk = await clerkClient();
//
//         const metadata = {
//             subscription: {
//                 status,
//                 tier,
//                 ...(subscriptionId && { subscriptionId }),
//                 ...(currentPeriodEnd && {
//                     currentPeriodEnd: new Date(currentPeriodEnd * 1000).toISOString()
//                 })
//             }
//         };
//
//
//         await clerk.users.updateUser(clerkUserId, { privateMetadata: metadata });
//         console.log(`Clerk metadata updated for user ${clerkUserId}`);
//     } catch (error) {
//         console.error(`Failed to update Clerk metadata for user ${clerkUserId}:`, error);
//     }
// }
//
// export async function POST(req: Request) {
//     // Basic rate limiting
//     const now = Date.now();
//     requestTimestamps.push(now);
//     while (requestTimestamps.length > 0 && requestTimestamps[0] < now - RATE_LIMIT_WINDOW) {
//         requestTimestamps.shift();
//     }
//
//     if (requestTimestamps.length > MAX_REQUESTS_PER_WINDOW) {
//         console.warn('Rate limit exceeded for Stripe webhook');
//         return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
//     }
//
//     // Verify webhook signature
//     const body = await req.text();
//     const sig = req.headers.get('stripe-signature') as string;
//     const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
//
//     if (!webhookSecret) {
//         console.error('Missing STRIPE_WEBHOOK_SECRET environment variable');
//         return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
//     }
//
//     let event: Stripe.Event;
//     try {
//         event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
//     } catch (error) {
//         console.error('Webhook signature verification failed:', error);
//         return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 });
//     }
//
//     console.log(`Processing Stripe event: ${event.type}`);
//
//     try {
//         switch (event.type) {
//             case 'checkout.session.completed': {
//                 const session = event.data.object as Stripe.Checkout.Session;
//
//                 // Make sure this is a subscription checkout
//                 if (session.mode !== 'subscription' || !session.subscription) {
//                     console.log('Not a subscription checkout, skipping');
//                     break;
//                 }
//
//                 // Get metadata from the session
//                 const clerkUserId = session.metadata?.clerkUserId;
//                 const userId = session.metadata?.userId;
//
//                 if (!clerkUserId || !userId) {
//                     console.error('Missing user IDs in checkout session metadata', session.id);
//                     return NextResponse.json({ error: 'Invalid metadata' }, { status: 400 });
//                 }
//
//                 console.log(`Checkout completed for user ${userId} (Clerk ID: ${clerkUserId})`);
//
//                 // Get subscription ID
//                 const subscriptionId = session.subscription as string;
//
//                 // IMPORTANT: Copy metadata from checkout session to the subscription
//                 // This ensures the metadata is available for future subscription events
//                 await stripe.subscriptions.update(subscriptionId, {
//                     metadata: {
//                         clerkUserId,
//                         userId
//                     }
//                 });
//
//                 console.log(`Metadata copied to subscription ${subscriptionId}`);
//
//                 // Fetch subscription details
//                 const subscription = await stripe.subscriptions.retrieve(subscriptionId);
//
//                 // Update Clerk user metadata
//                 await updateClerkUserMetadata(
//                     clerkUserId,
//                     'active',
//                     'PRO',
//                     subscriptionId,
//                     subscription.current_period_end
//                 );
//
//                 // Calculate period dates
//                 const periodStart = new Date(subscription.current_period_start * 1000);
//                 const periodEnd = new Date(subscription.current_period_end * 1000);
//
//                 // Store subscription in database
//                 await prisma.subscription.upsert({
//                     where: { userId },
//                     update: {
//                         tier: 'PRO',
//                         status: 'ACTIVE',
//                         paymentId: subscriptionId,
//                         currentPeriodStart: periodStart,
//                         currentPeriodEnd: periodEnd,
//                         updatedAt: new Date()
//                     },
//                     create: {
//                         userId,
//                         tier: 'PRO',
//                         status: 'ACTIVE',
//                         paymentId: subscriptionId,
//                         currentPeriodStart: periodStart,
//                         currentPeriodEnd: periodEnd
//                     },
//                 });
//
//                 console.log(`Subscription created/updated for user ${userId}`);
//                 break;
//             }
//
//             case 'invoice.payment_succeeded': {
//                 const invoice = event.data.object as Stripe.Invoice;
//                 const subscriptionId = invoice.subscription as string;
//
//                 if (!subscriptionId) {
//                     console.log('No subscription associated with this invoice');
//                     break;
//                 }
//
//                 // Fetch subscription to get metadata and period info
//                 const subscription = await stripe.subscriptions.retrieve(subscriptionId);
//                 const userId = subscription.metadata?.userId;
//                 const clerkUserId = subscription.metadata?.clerkUserId;
//
//                 if (!userId) {
//                     console.log('No userId in subscription metadata, skipping update');
//                     break;
//                 }
//
//                 // Update subscription period in database
//                 await prisma.subscription.updateMany({
//                     where: {
//                         userId,
//                         paymentId: subscriptionId
//                     },
//                     data: {
//                         status: 'ACTIVE',
//                         currentPeriodStart: new Date(subscription.current_period_start * 1000),
//                         currentPeriodEnd: new Date(subscription.current_period_end * 1000),
//                         updatedAt: new Date()
//                     }
//                 });
//
//                 // Update Clerk user metadata with new period end date
//                 if (clerkUserId) {
//                     await updateClerkUserMetadata(
//                         clerkUserId,
//                         'active',
//                         'PRO',
//                         subscriptionId,
//                         subscription.current_period_end
//                     );
//                 }
//
//                 console.log(`Subscription renewed for user ${userId}`);
//                 break;
//             }
//
//             case 'invoice.payment_failed': {
//                 const invoice = event.data.object as Stripe.Invoice;
//                 const subscriptionId = invoice.subscription as string;
//
//                 if (!subscriptionId) {
//                     console.log('No subscription associated with this invoice');
//                     break;
//                 }
//
//                 // Fetch subscription to get metadata
//                 const subscription = await stripe.subscriptions.retrieve(subscriptionId);
//                 const userId = subscription.metadata?.userId;
//                 const clerkUserId = subscription.metadata?.clerkUserId;
//
//                 if (!userId) {
//                     console.log('No userId in subscription metadata, skipping update');
//                     break;
//                 }
//
//                 // Mark subscription as past_due in database
//                 await prisma.subscription.updateMany({
//                     where: {
//                         userId,
//                         paymentId: subscriptionId
//                     },
//                     data: {
//                         status: 'PAST_DUE',
//                         updatedAt: new Date()
//                     }
//                 });
//
//                 // Update Clerk if we have the clerkUserId
//                 if (clerkUserId) {
//                     await updateClerkUserMetadata(
//                         clerkUserId,
//                         'past_due',
//                         'PRO',
//                         subscriptionId,
//                         subscription.current_period_end
//                     );
//                 }
//
//                 console.log(`Subscription marked as past due for user ${userId}`);
//                 break;
//             }
//
//             case 'customer.subscription.updated': {
//                 const subscription = event.data.object as Stripe.Subscription;
//                 const userId = subscription.metadata?.userId;
//                 const clerkUserId = subscription.metadata?.clerkUserId;
//
//                 if (!userId) {
//                     console.log('No userId in subscription metadata, skipping update');
//                     break;
//                 }
//
//                 // Map Stripe status to your status enum
//                 let status;
//                 switch (subscription.status) {
//                     case 'active':
//                     case 'trialing':
//                         status = 'ACTIVE';
//                         break;
//                     case 'past_due':
//                         status = 'PAST_DUE';
//                         break;
//                     default:
//                         status = 'INACTIVE';
//                 }
//
//                 // Update subscription in database
//                 await prisma.subscription.updateMany({
//                     where: {
//                         userId,
//                         paymentId: subscription.id
//                     },
//                     data: {
//                         // @ts-ignore
//                         status: status,
//                         currentPeriodStart: new Date(subscription.current_period_start * 1000),
//                         currentPeriodEnd: new Date(subscription.current_period_end * 1000),
//                         updatedAt: new Date()
//                     }
//                 });
//
//                 // Update Clerk if we have the clerkUserId
//                 if (clerkUserId) {
//                     await updateClerkUserMetadata(
//                         clerkUserId,
//                         subscription.status,
//                         status === 'ACTIVE' ? 'PRO' : 'FREE',
//                         subscription.id,
//                         subscription.current_period_end
//                     );
//                 }
//
//                 console.log(`Subscription updated for user ${userId} to status ${status}`);
//                 break;
//             }
//
//             case 'customer.subscription.deleted': {
//                 const subscription = event.data.object as Stripe.Subscription;
//                 const userId = subscription.metadata?.userId;
//                 const clerkUserId = subscription.metadata?.clerkUserId;
//
//                 if (!userId) {
//                     console.log('No userId in subscription metadata, skipping update');
//                     break;
//                 }
//
//                 // Update subscription in database
//                 await prisma.subscription.updateMany({
//                     where: {
//                         userId,
//                         paymentId: subscription.id
//                     },
//                     data: {
//                         status: 'INACTIVE',
//                         tier: 'FREE',
//                         updatedAt: new Date()
//                     }
//                 });
//
//                 // Update Clerk if we have the clerkUserId
//                 if (clerkUserId) {
//                     await updateClerkUserMetadata(
//                         clerkUserId,
//                         'inactive',
//                         'FREE'
//                     );
//                 }
//
//                 console.log(`Subscription canceled for user ${userId}`);
//                 break;
//             }
//
//             default:
//                 console.log(`Unhandled event type: ${event.type}`);
//         }
//
//         return NextResponse.json({ success: true });
//     } catch (error) {
//         console.error('Error processing webhook:', error);
//         return NextResponse.json({ error: 'Server error' }, { status: 500 });
//     }
// }


import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/app/db';
import type { Stripe } from 'stripe';
import { clerkClient } from '@clerk/nextjs/server';

// Initialize Clerk client with secret key
const clerk = await  clerkClient();

// Rate limiting setup
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute window
const MAX_REQUESTS_PER_WINDOW = 50;
const requestTimestamps: number[] = [];

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
        const metadata = {
            subscription: {
                status,
                tier,
                ...(subscriptionId && { subscriptionId }),
                ...(currentPeriodEnd && {
                    currentPeriodEnd: new Date(currentPeriodEnd * 1000).toISOString()
                })
            }
        };

        await clerk.users.updateUser(clerkUserId, { privateMetadata: metadata });
        console.log(`Clerk metadata updated for user ${clerkUserId}`);
    } catch (error) {
        console.error(`Failed to update Clerk metadata for user ${clerkUserId}:`, error);
        throw error; // Re-throw to handle in the caller
    }
}

export async function POST(req: Request) {
    // Basic rate limiting
    const now = Date.now();
    requestTimestamps.push(now);
    while (requestTimestamps.length > 0 && requestTimestamps[0] < now - RATE_LIMIT_WINDOW) {
        requestTimestamps.shift();
    }

    if (requestTimestamps.length > MAX_REQUESTS_PER_WINDOW) {
        console.warn('Rate limit exceeded for Stripe webhook');
        return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    // Verify webhook signature
    const body = await req.text();
    const sig = req.headers.get('stripe-signature') as string;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
        console.error('Missing STRIPE_WEBHOOK_SECRET environment variable');
        return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    let event: Stripe.Event;
    try {
        event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    } catch (error) {
        console.error('Webhook signature verification failed:', error);
        return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 });
    }

    console.log(`Processing Stripe event: ${event.type}`);

    try {
        switch (event.type) {
            case 'checkout.session.completed':
            case 'invoice.payment_succeeded':
            case 'invoice.payment_failed':
            case 'customer.subscription.updated':
            case 'customer.subscription.deleted':
                // Your existing switch cases remain largely the same, but ensure you handle errors consistently

                // For example, in 'checkout.session.completed':
                const session = event.data.object as Stripe.Checkout.Session;

                if (session.mode !== 'subscription' || !session.subscription) {
                    console.log('Not a subscription checkout, skipping');
                    break;
                }

                const clerkUserId = session.metadata?.clerkUserId;
                const userId = session.metadata?.userId;

                if (!clerkUserId || !userId) {
                    console.error('Missing user IDs in checkout session metadata', session.id);
                    return NextResponse.json({ error: 'Invalid metadata' }, { status: 400 });
                }

                const subscriptionId = session.subscription as string;

                await stripe.subscriptions.update(subscriptionId, {
                    metadata: {
                        clerkUserId,
                        userId
                    }
                });

                const subscription = await stripe.subscriptions.retrieve(subscriptionId);

                await updateClerkUserMetadata(
                    clerkUserId,
                    'active',
                    'PRO',
                    subscriptionId,
                    subscription.current_period_end
                );

                const periodStart = new Date(subscription.current_period_start * 1000);
                const periodEnd = new Date(subscription.current_period_end * 1000);

                await prisma.subscription.upsert({
                    where: { userId },
                    update: {
                        tier: 'PRO',
                        status: 'ACTIVE',
                        paymentId: subscriptionId,
                        currentPeriodStart: periodStart,
                        currentPeriodEnd: periodEnd,
                        updatedAt: new Date()
                    },
                    create: {
                        userId,
                        tier: 'PRO',
                        status: 'ACTIVE',
                        paymentId: subscriptionId,
                        currentPeriodStart: periodStart,
                        currentPeriodEnd: periodEnd
                    },
                });

                console.log(`Subscription created/updated for user ${userId}`);
                break;

            default:
                console.log(`Unhandled event type: ${event.type}`);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error processing webhook:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}