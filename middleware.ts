// import { NextResponse } from 'next/server';
// import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
// import type { NextRequest } from 'next/server';
//
// // Define custom session claims type
// interface CustomSessionClaims {
//     metadata: {
//         subscription?: {
//             status?: string;
//         };
//     };
// }
//
// // Define routes that require a paid subscription
// const PAID_ROUTES = createRouteMatcher([
//     '/app/premium(.*)',
//     '/app/exercises(.*)',
//     '/app/patients(.*)',
//     '/app/analytics(.*)',
// ]);
//
// // Public routes that don't require authentication
// const PUBLIC_ROUTES = createRouteMatcher([
//     '/',
//     '/api/webhooks/clerk(.*)',
//     '/api/webhooks/stripe(.*)',
//     '/sign-in(.*)',
//     '/sign-up(.*)',
//     '/pricing',
//     '/about',
//     '/contact',
// ]);
//
// export const middleware = clerkMiddleware(async (auth, req: NextRequest) => {
//     const authData = await auth();
//     const { userId, sessionClaims, redirectToSignIn } = authData;
//
//     const path = req.nextUrl.pathname;
//
//     if (PUBLIC_ROUTES(req)) {
//         return NextResponse.next();
//     }
//
//     if (!userId) {
//         return redirectToSignIn({ returnBackUrl: req.url });
//     }
//
//     if (!PAID_ROUTES(req)) {
//         return NextResponse.next();
//     }
//
//     try {
//         const claims = sessionClaims as unknown as CustomSessionClaims;
//         const subscriptionStatus = claims?.metadata?.subscription?.status;
//         const isActive = subscriptionStatus === 'active';
//
//         if (!isActive) {
//             return NextResponse.redirect(
//                 new URL('/settings/billing?required=premium', req.url)
//             );
//         }
//
//         return NextResponse.next();
//     } catch (error) {
//         console.error('Error in subscription middleware:', error);
//         return NextResponse.next();
//     }
// });
//
// export const config = {
//     matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
// };

import { NextResponse } from 'next/server';
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import type { NextRequest } from 'next/server';

// Define custom session claims type
interface CustomSessionClaims {
    metadata: {
        subscription?: {
            status?: string;
        };
    };
}

// Public routes that don't require authentication
const PUBLIC_ROUTES = createRouteMatcher([
    '/',
    '/api/(.*)', // Add this line to exclude all API routes from middleware
    '/api/webhooks/clerk(.*)',
    '/api/webhooks/stripe(.*)',
    '/sign-in(.*)',
    '/sign-up(.*)',
    '/pricing',
    '/about',
    '/contact',
    '/settings/billing(.*)'  // Keep billing page accessible
]);

export const middleware = clerkMiddleware(async (auth, req: NextRequest) => {
    const authData = await auth();
    const { userId, sessionClaims, redirectToSignIn } = authData;

    // Allow public routes
    if (PUBLIC_ROUTES(req)) {
        return NextResponse.next();
    }

    // Redirect to sign-in if not authenticated
    if (!userId) {
        return redirectToSignIn({ returnBackUrl: req.url });
    }

    // Check subscription status for ALL app routes
    try {
        const claims = sessionClaims as unknown as CustomSessionClaims;
        const subscriptionStatus = claims?.metadata?.subscription?.status;
        const isActive = subscriptionStatus === 'active';

        if (!isActive) {
            return NextResponse.redirect(
                new URL('/settings/billing?required=true', req.url)
            );
        }

        return NextResponse.next();
    } catch (error) {
        console.error('Error in subscription middleware:', error);
        return NextResponse.next();
    }
});

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};