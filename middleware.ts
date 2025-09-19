import { NextResponse } from 'next/server';
import { clerkMiddleware, createRouteMatcher, clerkClient } from '@clerk/nextjs/server';
import type { NextRequest } from 'next/server';
import {Role} from "@/utils/constants";

// Define custom session claims type

interface UserMetadata {
    role: string;
    onboarded: boolean;
    subscription?: {
        iat: number;
        status?: string;
        tier?: string;
        subscriptionId?: string;
        currentPeriodEnd?: string;
    };
}

// Public routes that don't require authentication
const PUBLIC_ROUTES = createRouteMatcher([
    '/',
    '/api/webhooks/(.*)',
    '/api/waiting-list(.*)',
    '/sign-in(.*)',
    '/sign-up(.*)',
    '/pricing',
    '/about',
    '/contact',
    '/settings/billing(.*)',
    '/onboarding(.*)',
    '/api/onboarding(.*)',
]);


// Rate limiting
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

const rateLimit = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100,
  check: (identifier: string) => {
    const now = Date.now();
    const current = rateLimitMap.get(identifier) || { count: 0, resetTime: now + rateLimit.windowMs };
    
    if (current.resetTime < now) {
      current.count = 0;
      current.resetTime = now + rateLimit.windowMs;
    }
    
    if (current.count >= rateLimit.maxRequests) {
      return { success: false };
    }
    
    current.count++;
    rateLimitMap.set(identifier, current);
    return { success: true };
  }
};

export default clerkMiddleware(async (auth, req: NextRequest) => {
    // Rate limiting check
    const identifier = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'anonymous';
    const rateLimitResult = rateLimit.check(identifier);
    
    if (!rateLimitResult.success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }
    const path = req.nextUrl.pathname;

    // Check if route is public
    if (PUBLIC_ROUTES(req)) {
        return NextResponse.next();
    }

    // Authenticate the request
    const { userId, sessionClaims, redirectToSignIn } = await auth();
    const clerkUser = await clerkClient()

    // Redirect to sign-in if not authenticated
    if (!userId) {
        return redirectToSignIn({ returnBackUrl: req.url });
    }

    // API routes (except webhooks) should be accessible to authenticated users
    if (path.startsWith('/api/') && !path.startsWith('/api/webhooks/')) {
        return NextResponse.next();
    }

    // Check subscription status for protected routes
    try {

        const user = await clerkUser.users.getUser(userId);

        if (!user) {
            throw new Error("Failed to retrieve user data");
        }

        const metadata = user?.privateMetadata as unknown as UserMetadata;

        // Check if user is an admin or has an active subscription
        const isAdmin = metadata?.role ===  Role.ADMIN;
        const hasActiveSubscription =
            metadata?.subscription?.status ===  'active' &&
            ['PRO', 'pro'].includes(metadata?.subscription?.tier || '');

        // Check if user needs to complete onboarding
        // if (!metadata?.onboarded && !path.startsWith('/onboarding')) {
        //     console.log(`Redirecting user ${userId} to onboarding: Not completed`);
        //     return NextResponse.redirect(new URL('/onboarding', req.url));
        // }

        // If user is neither admin nor has active subscription, redirect to billing
        if (!isAdmin && !hasActiveSubscription) {
            console.log(`Redirecting user ${userId} to billing: No active subscription`);
            return NextResponse.redirect(new URL('/settings/billing?required=true', req.url));
        }

        // All checks passed, continue to protected route
        return NextResponse.next();
    } catch (error) {
        console.error('Error in subscription middleware:', error);
        // Log the error but don't expose details to the client
        return NextResponse.redirect(new URL('/error?code=middleware_error', req.url));
    }
});

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};