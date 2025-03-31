import {NextResponse} from 'next/server';
import {clerkMiddleware, createRouteMatcher} from '@clerk/nextjs/server';
import type {NextRequest} from 'next/server';
import {createClerkClient} from '@clerk/clerk-sdk-node';

const clerk = createClerkClient({secretKey: process.env.CLERK_SECRET_KEY});

// Define custom session claims type
interface CustomSessionClaims {
    subscription?: {
        status?: string;
        tier?: string;
        subscriptionId?: string;
        currentPeriodEnd?: string;
    };
}

// Public routes that don't require authentication
const PUBLIC_ROUTES = createRouteMatcher([
    '/',
    '/api/webhooks/(.*)', // More specific to allow only webhook endpoints
    '/sign-in(.*)',
    '/sign-up(.*)',
    '/pricing',
    '/about',
    '/contact',
    '/settings/billing(.*)'  // Keep billing page accessible
]);

export const middleware = clerkMiddleware(async (auth, req: NextRequest) => {
    const authData = await auth();
    const {userId, sessionClaims, redirectToSignIn} = authData;
    const path = req.nextUrl.pathname;

    // Check if route is public
    if (PUBLIC_ROUTES(req)) {
        return NextResponse.next();
    }

    // Redirect to sign-in if not authenticated
    if (!userId) {
        return redirectToSignIn({returnBackUrl: req.url});
    }
    // API routes (except webhooks) should be accessible to authenticated users
    if (path.startsWith('/api/') && !path.startsWith('/api/webhooks/')) {
        return NextResponse.next();
    }

    // Check subscription status for protected routes
    try {
        const claims = sessionClaims as unknown as CustomSessionClaims;
        const user = await clerk.users.getUser(userId);
        const privateMetadata = user.privateMetadata as CustomSessionClaims;

        const subscription = privateMetadata?.subscription;

        const hasActiveSubscription =
            subscription?.status === 'active' &&
            (subscription?.tier === 'PRO' || subscription?.tier === 'pro');

        if (!hasActiveSubscription) {
            console.log(`Redirecting user ${userId} to billing: No active subscription`);
            return NextResponse.redirect(
                new URL('/settings/billing?required=true', req.url)
            );
        }

        // All checks passed, continue to protected route
        return NextResponse.next();
    } catch (error) {
        console.error('Error in subscription middleware:', error);
        // On error, still allow access but log the issue
        // You may want to change this behavior in production
        return NextResponse.next();
    }
});

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};