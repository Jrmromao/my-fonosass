// // import { NextResponse } from 'next/server';
// // import { stripe } from '@/lib/stripe';
// // import { prisma } from '@/app/db';
// // import { createClerkClient } from '@clerk/clerk-sdk-node';
// // import type { Stripe } from 'stripe';
// //
// // export async function POST(req: Request) {
// //     const body = await req.text();
// //     const sig = req.headers.get('stripe-signature') as string;
// //     const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
// //
// //     if (!webhookSecret) {
// //         return NextResponse.json(
// //             { error: 'Webhook secret not configured' },
// //             { status: 500 }
// //         );
// //     }
// //
// //     let event: Stripe.Event;
// //
// //     try {
// //         event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
// //     } catch (error) {
// //         console.error('Webhook signature verification failed:', error);
// //         return NextResponse.json(
// //             { error: 'Webhook signature verification failed' },
// //             { status: 400 }
// //         );
// //     }
// //
// //     // Handle specific Stripe events
// //     switch (event.type) {
// //         case 'checkout.session.completed': {
// //             const session = event.data.object as Stripe.Checkout.Session;
// //
// //             // Access metadata safely with optional chaining
// //             const clerkUserId = session?.metadata?.clerkUserId;
// //             const prismaUserId = session?.metadata?.userId;
// //
// //             if (!clerkUserId || !prismaUserId) {
// //                 console.error('Missing user IDs in metadata', session.metadata);
// //                 return NextResponse.json({ error: 'Invalid metadata' }, { status: 400 });
// //             }
// //
// //             try {
// //                 // Update Clerk metadata
// //                 const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
// //                 await clerk.users.updateUser(clerkUserId, {
// //                     privateMetadata: {
// //                         subscription: { status: 'active' },
// //                     },
// //                 });
// //
// //                 // Update Prisma subscription record
// //                 await prisma.subscription.upsert({
// //                     where: { userId: prismaUserId },
// //                     update: {
// //                         tier: 'PRO', // Match your TierType enum
// //                         status: 'ACTIVE', // Match your SubStatus enum
// //                         paymentId: session.subscription?.toString() || session.id,
// //                         currentPeriodStart: new Date(),
// //                         currentPeriodEnd: session.expires_at ? new Date(session.expires_at * 1000) : undefined
// //                     },
// //                     create: {
// //                         userId: prismaUserId,
// //                         tier: 'PRO', // Match your TierType enum
// //                         status: 'ACTIVE', // Match your SubStatus enum
// //                         paymentId: session.subscription?.toString() || session.id,
// //                         currentPeriodStart: new Date(),
// //                         currentPeriodEnd: session.expires_at ? new Date(session.expires_at * 1000) : undefined
// //                     },
// //                 });
// //             } catch (error) {
// //                 console.error('Error updating user subscription status:', error);
// //                 return NextResponse.json({ error: 'Failed to update subscription status' }, { status: 500 });
// //             }
// //
// //             break;
// //         }
// //
// //         case 'customer.subscription.deleted': {
// //             const subscription = event.data.object as Stripe.Subscription;
// //
// //             // Access metadata safely with optional chaining
// //             const clerkUserId = subscription?.metadata?.clerkUserId;
// //             const prismaUserId = subscription?.metadata?.userId;
// //
// //             if (!clerkUserId || !prismaUserId) {
// //                 console.error('Missing user IDs in metadata', subscription.metadata);
// //                 return NextResponse.json({ error: 'Invalid metadata' }, { status: 400 });
// //             }
// //
// //             try {
// //                 // Update Clerk metadata
// //                 const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
// //                 await clerk.users.updateUser(clerkUserId, {
// //                     privateMetadata: {
// //                         subscription: { status: 'inactive' },
// //                     },
// //                 });
// //
// //                 // Update Prisma subscription record
// //                 await prisma.subscription.update({
// //                     where: { userId: prismaUserId },
// //                     data: {
// //                         tier: 'FREE', // Match your TierType enum
// //                         status: 'INACTIVE', // Match your SubStatus enum
// //                         currentPeriodEnd: new Date(), // End the subscription now
// //                     },
// //                 });
// //             } catch (error) {
// //                 console.error('Error updating user subscription status:', error);
// //                 return NextResponse.json({ error: 'Failed to update subscription status' }, { status: 500 });
// //             }
// //
// //             break;
// //         }
// //
// //         default:
// //             console.log(`Unhandled event type: ${event.type}`);
// //     }
// //
// //     return NextResponse.json({ received: true });
// // }
//
//
// import { NextResponse } from 'next/server';
// import { stripe } from '@/lib/stripe';
// import { prisma } from '@/app/db';
// import { createClerkClient } from '@clerk/clerk-sdk-node';
// import type { Stripe } from 'stripe';
//
// export async function POST(req: Request) {
//     const body = await req.text();
//     const sig = req.headers.get('stripe-signature') as string;
//     const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
//
//     if (!webhookSecret) {
//         return NextResponse.json(
//             { error: 'Webhook secret not configured' },
//             { status: 500 }
//         );
//     }
//
//     let event: Stripe.Event;
//
//     try {
//         event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
//     } catch (error) {
//         console.error('Webhook signature verification failed:', error);
//         return NextResponse.json(
//             { error: 'Webhook signature verification failed' },
//             { status: 400 }
//         );
//     }
//
//     // Handle specific Stripe events
//     switch (event.type) {
//         case 'checkout.session.completed': {
//             const session = event.data.object as Stripe.Checkout.Session;
//
//             // Access metadata safely with optional chaining
//             const clerkUserId = session?.metadata?.clerkUserId;
//             const prismaUserId = session?.metadata?.userId;
//
//             if (!clerkUserId || !prismaUserId) {
//                 console.error('Missing user IDs in metadata', session.metadata);
//                 return NextResponse.json({ error: 'Invalid metadata' }, { status: 400 });
//             }
//
//             try {
//                 const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
//
//                 // Update Clerk user privateMetadata
//                 await clerk.users.updateUser(clerkUserId, {
//                     privateMetadata: {
//                         subscription: { status: 'active' },
//                     },
//                 });
//
//                 // Update all active sessions for this user
//                 const sessions = await clerk.sessions.getSessionList({
//                     userId: clerkUserId,
//                     status: 'active',
//                 });
//
//                 for (const userSession of sessions) {
//                     await clerk.sessions.updateSession(userSession.id, {
//                         metadata: {
//                             subscription: { status: 'active' },
//                         },
//                     });
//                 }
//
//                 // Update Prisma subscription record
//                 await prisma.subscription.upsert({
//                     where: { userId: prismaUserId },
//                     update: {
//                         tier: 'PRO', // Match your TierType enum
//                         status: 'ACTIVE', // Match your SubStatus enum
//                         paymentId: session.subscription?.toString() || session.id,
//                         currentPeriodStart: new Date(),
//                         currentPeriodEnd: session.expires_at ? new Date(session.expires_at * 1000) : undefined
//                     },
//                     create: {
//                         userId: prismaUserId,
//                         tier: 'PRO', // Match your TierType enum
//                         status: 'ACTIVE', // Match your SubStatus enum
//                         paymentId: session.subscription?.toString() || session.id,
//                         currentPeriodStart: new Date(),
//                         currentPeriodEnd: session.expires_at ? new Date(session.expires_at * 1000) : undefined
//                     },
//                 });
//             } catch (error) {
//                 console.error('Error updating user subscription status:', error);
//                 return NextResponse.json({ error: 'Failed to update subscription status' }, { status: 500 });
//             }
//
//             break;
//         }
//
//         case 'customer.subscription.deleted': {
//             const subscription = event.data.object as Stripe.Subscription;
//
//             // Access metadata safely with optional chaining
//             const clerkUserId = subscription?.metadata?.clerkUserId;
//             const prismaUserId = subscription?.metadata?.userId;
//
//             if (!clerkUserId || !prismaUserId) {
//                 console.error('Missing user IDs in metadata', subscription.metadata);
//                 return NextResponse.json({ error: 'Invalid metadata' }, { status: 400 });
//             }
//
//             try {
//                 const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
//
//                 // Update Clerk user privateMetadata
//                 await clerk.users.updateUser(clerkUserId, {
//                     privateMetadata: {
//                         subscription: { status: 'inactive' },
//                     },
//                 });
//
//                 // Update all active sessions for this user
//                 const sessions = await clerk.sessions.getSessionList({
//                     userId: clerkUserId,
//                     status: 'active',
//                 });
//
//                 for (const userSession of sessions) {
//                     await clerk.sessions.updateSession(userSession.id, {
//                         metadata: {
//                             subscription: { status: 'inactive' },
//                         },
//                     });
//                 }
//
//                 // Update Prisma subscription record
//                 await prisma.subscription.update({
//                     where: { userId: prismaUserId },
//                     data: {
//                         tier: 'FREE', // Match your TierType enum
//                         status: 'INACTIVE', // Match your SubStatus enum
//                         currentPeriodEnd: new Date(), // End the subscription now
//                     },
//                 });
//             } catch (error) {
//                 console.error('Error updating user subscription status:', error);
//                 return NextResponse.json({ error: 'Failed to update subscription status' }, { status: 500 });
//             }
//
//             break;
//         }
//
//         // You should also handle these important events
//         case 'invoice.payment_succeeded': {
//             const invoice = event.data.object as Stripe.Invoice;
//             if (invoice.subscription) {
//                 const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
//
//                 // Get user IDs from subscription metadata
//                 const clerkUserId = subscription?.metadata?.clerkUserId;
//                 const prismaUserId = subscription?.metadata?.userId;
//
//                 if (clerkUserId && prismaUserId) {
//                     // Update subscription period end date in your database
//                     await prisma.subscription.update({
//                         where: { userId: prismaUserId },
//                         data: {
//                             currentPeriodStart: new Date(subscription.current_period_start * 1000),
//                             currentPeriodEnd: new Date(subscription.current_period_end * 1000),
//                         },
//                     });
//                 }
//             }
//             break;
//         }
//
//         case 'invoice.payment_failed': {
//             // Handle failed payments - you might want to notify the user
//             const invoice = event.data.object as Stripe.Invoice;
//             if (invoice.subscription) {
//                 console.log(`Payment failed for subscription: ${invoice.subscription}`);
//                 // You could send an email to the user here
//             }
//             break;
//         }
//
//         default:
//             console.log(`Unhandled event type: ${event.type}`);
//     }
//
//     return NextResponse.json({ received: true });
// }

import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/app/db';
import { createClerkClient } from '@clerk/clerk-sdk-node';
import type { Stripe } from 'stripe';


const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

export async function POST(req: Request) {

    const body = await req.text();
    const sig = req.headers.get('stripe-signature') as string;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
        return NextResponse.json(
            { error: 'Webhook secret not configured' },
            { status: 500 }
        );
    }

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    } catch (error) {
        console.error('Webhook signature verification failed:', error);
        return NextResponse.json(
            { error: 'Webhook signature verification failed' },
            { status: 400 }
        );
    }

    // Handle specific Stripe events
    switch (event.type) {
        case 'checkout.session.completed': {
            const session = event.data.object as Stripe.Checkout.Session;

            // Access metadata safely with optional chaining
            const clerkUserId = session?.metadata?.clerkUserId;
            const prismaUserId = session?.metadata?.userId;

            if (!clerkUserId || !prismaUserId) {
                console.error('Missing user IDs in metadata', session.metadata);
                return NextResponse.json({ error: 'Invalid metadata' }, { status: 400 });
            }

            try {
                // Update Clerk user metadata
                await clerk.users.updateUserMetadata(clerkUserId, {
                    publicMetadata: {
                        subscription: { status: 'active' }
                    }
                });

                // Update Prisma subscription record
                await prisma.subscription.upsert({
                    where: { userId: prismaUserId },
                    update: {
                        tier: 'PRO', // Match your TierType enum
                        status: 'ACTIVE', // Match your SubStatus enum
                        paymentId: session.subscription?.toString() || session.id,
                        currentPeriodStart: new Date(),
                        currentPeriodEnd: session.expires_at ? new Date(session.expires_at * 1000) : undefined
                    },
                    create: {
                        userId: prismaUserId,
                        tier: 'PRO', // Match your TierType enum
                        status: 'ACTIVE', // Match your SubStatus enum
                        paymentId: session.subscription?.toString() || session.id,
                        currentPeriodStart: new Date(),
                        currentPeriodEnd: session.expires_at ? new Date(session.expires_at * 1000) : undefined
                    },
                });
            } catch (error) {
                console.error('Error updating user subscription status:', error);
                return NextResponse.json({ error: 'Failed to update subscription status' }, { status: 500 });
            }

            break;
        }

        case 'customer.subscription.deleted': {
            const subscription = event.data.object as Stripe.Subscription;

            // Access metadata safely with optional chaining
            const clerkUserId = subscription?.metadata?.clerkUserId;
            const prismaUserId = subscription?.metadata?.userId;

            if (!clerkUserId || !prismaUserId) {
                console.error('Missing user IDs in metadata', subscription.metadata);
                return NextResponse.json({ error: 'Invalid metadata' }, { status: 400 });
            }

            try {
                // Update Clerk user metadata
                await clerk.users.updateUserMetadata(clerkUserId, {
                    publicMetadata: {
                        subscription: { status: 'inactive' }
                    }
                });

                // Update Prisma subscription record
                await prisma.subscription.update({
                    where: { userId: prismaUserId },
                    data: {
                        tier: 'FREE', // Match your TierType enum
                        status: 'INACTIVE', // Match your SubStatus enum
                        currentPeriodEnd: new Date(), // End the subscription now
                    },
                });
            } catch (error) {
                console.error('Error updating user subscription status:', error);
                return NextResponse.json({ error: 'Failed to update subscription status' }, { status: 500 });
            }

            break;
        }

        // Handle invoice payment succeeded
        case 'invoice.payment_succeeded': {
            const invoice = event.data.object as Stripe.Invoice;
            if (invoice.subscription) {
                const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);

                // Get user IDs from subscription metadata
                const clerkUserId = subscription?.metadata?.clerkUserId;
                const prismaUserId = subscription?.metadata?.userId;

                if (clerkUserId && prismaUserId) {
                    // Update subscription period end date in your database
                    await prisma.subscription.update({
                        where: { userId: prismaUserId },
                        data: {
                            currentPeriodStart: new Date(subscription.current_period_start * 1000),
                            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
                        },
                    });
                }
            }
            break;
        }

        // Handle invoice payment failed
        case 'invoice.payment_failed': {
            const invoice = event.data.object as Stripe.Invoice;
            if (invoice.subscription) {
                console.log(`Payment failed for subscription: ${invoice.subscription}`);
                // Here you could update the status or send a notification
            }
            break;
        }

        default:
            console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
}