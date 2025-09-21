import { prisma } from '@/app/db';
import { stripe } from '@/lib/stripe';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { userId: clerkUserId } = await auth();

        if (!clerkUserId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get user from database
        const user = await prisma.user.findUnique({
            where: { clerkUserId },
            include: {
                subscriptions: true
            }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Check if user has an active subscription
        if (!user.subscriptions || user.subscriptions.status !== 'ACTIVE') {
            return NextResponse.json({ 
                error: 'No active subscription found' 
            }, { status: 400 });
        }

        // Create Stripe customer portal session
        const portalSession = await stripe.billingPortal.sessions.create({
            customer: user.subscriptions.paymentId || '', // Use paymentId as customer ID
            return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
        });

        return NextResponse.json({ url: portalSession.url });
    } catch (error) {
        console.error('Error creating billing portal session:', error);
        return NextResponse.json({ 
            error: 'Internal server error' 
        }, { status: 500 });
    }
}
