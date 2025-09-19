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


// Enhanced rate limiting with different limits for different endpoints
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

const rateLimits = {
  // General API rate limit
  general: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100,
  },
  // Stricter limit for auth endpoints
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 20,
  },
  // Very strict for user creation
  userCreation: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 5,
  }
};

const checkRateLimit = (identifier: string, type: keyof typeof rateLimits) => {
  const limit = rateLimits[type];
  const now = Date.now();
  const key = `${identifier}:${type}`;
  const current = rateLimitMap.get(key) || { count: 0, resetTime: now + limit.windowMs };
  
  if (current.resetTime < now) {
    current.count = 0;
    current.resetTime = now + limit.windowMs;
  }
  
  if (current.count >= limit.maxRequests) {
    return { success: false, remaining: 0, resetTime: current.resetTime };
  }
  
  current.count++;
  rateLimitMap.set(key, current);
  return { success: true, remaining: limit.maxRequests - current.count, resetTime: current.resetTime };
};

export default clerkMiddleware(async (auth, req: NextRequest) => {
    const path = req.nextUrl.pathname;
    const identifier = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'anonymous';
    
    // Determine rate limit type based on endpoint
    let rateLimitType: keyof typeof rateLimits = 'general';
    if (path.includes('/api/create-users') || path.includes('/api/onboarding')) {
      rateLimitType = 'userCreation';
    } else if (path.includes('/sign-in') || path.includes('/sign-up') || path.includes('/api/auth')) {
      rateLimitType = 'auth';
    }
    
    // Rate limiting check
    const rateLimitResult = checkRateLimit(identifier, rateLimitType);
    
    if (!rateLimitResult.success) {
      const resetTime = new Date(rateLimitResult.resetTime).toISOString();
      return NextResponse.json({ 
        error: 'Too many requests', 
        retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000),
        resetTime 
      }, { 
        status: 429,
        headers: {
          'Retry-After': Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString(),
          'X-RateLimit-Limit': rateLimits[rateLimitType].maxRequests.toString(),
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
          'X-RateLimit-Reset': resetTime
        }
      });
    }

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