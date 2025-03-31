// // app/api/stripe/create-checkout/route.ts
// import { NextResponse } from 'next/server';
// import { auth } from '@clerk/nextjs/server';
// import { stripe } from '@/lib/stripe';
// import { prisma } from '@/app/db';
// import { createClerkClient } from '@clerk/clerk-sdk-node';
//
// // Define your price ID
// const PREMIUM_PRICE_ID = process.env.STRIPE_ANNUAL_PRICE_ID;
//
// export async function POST(req: Request) {
//     try {
//         const { userId } = await auth();
//         if (!userId) {
//             return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//         }
//
//         // Get user from database
//         const user = await prisma.user.findUnique({
//             where: { clerkUserId: userId },
//         });
//
//         if (!user) {
//             return NextResponse.json({ error: 'User not found' }, { status: 404 });
//         }
//
//         // Create checkout session
//         const session = await stripe.checkout.sessions.create({
//             line_items: [
//                 {
//                     price: PREMIUM_PRICE_ID,
//                     quantity: 1,
//                 },
//             ],
//             mode: 'subscription',
//             success_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing?success=true`,
//             cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing?canceled=true`,
//             metadata: {
//                 userId: user.id,
//                 tier: "TierType.BASIC", // Using BASIC as your paid tier
//             },
//             customer_email: user.email, // Pre-fill customer email
//         });
//
//
//         const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
//         await clerk.users.updateUser(userId, {
//             privateMetadata: {
//                 subscription: { status: 'active' },
//             },
//         })
//
//         return NextResponse.json({ url: session.url });
//     } catch (error) {
//         console.error('Error creating checkout session:', error);
//         return NextResponse.json(
//             { error: 'Error creating checkout session' },
//             { status: 500 }
//         );
//     }
// }

// app/api/stripe/create-checkout/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/app/db';

export async function POST(req: Request) {
    try {

        console.log("IN POST CREATE CHECKOUT")
        // Get price ID from environment variables
        const priceId = process.env.STRIPE_MONTHLY_PRICE_ID;

        if (!priceId) {
            console.error('Missing STRIPE_MONTHLY_PRICE_ID environment variable');
            return NextResponse.json(
                { error: 'Server configuration error' },
                { status: 500 }
            );
        }
        // Get authenticated user from Clerk

        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get user from your database
        const user = await prisma.user.findUnique({
            where: { clerkUserId: userId },
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Create the checkout session
        const session = await stripe.checkout.sessions.create({
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing?canceled=true`,
            metadata: {
                clerkUserId: userId,       // Clerk user ID
                userId: user.id,           // Your database user ID
            },
            customer_email: user.email,  // Pre-fill customer email
        });

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