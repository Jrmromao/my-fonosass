// // middleware.ts
// import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
// import { NextResponse } from 'next/server'
// import type { NextRequest } from 'next/server'
//
// const isPublicRoute = createRouteMatcher([
//     '/sign-in(.*)',
//     '/sign-up(.*)',
//     '/',
//     '/api/create-users',
//     '/api/subscription/callback',
//     '/api/webhooks/(.*)'
// ])
//
// export default clerkMiddleware(async (auth, req: NextRequest) => {
//
//
//
//     if (!isPublicRoute(req)) {
//         const { userId } = await auth()
//
//         if (!userId) {
//             // Get the sign-in URL with the current URL as the redirect URL
//             const signInUrl = new URL('/sign-in', req.url)
//             signInUrl.searchParams.set('redirect_url', req.url)
//             return NextResponse.redirect(signInUrl)
//         }
//     }
// })
//
// export const config = {
//     matcher: [
//         '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
//         '/(api|trpc)(.*)',
//     ],
// }

// middleware.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Define public routes that don't require authentication
const publicRoutes = [
    // Authentication routes
    '/sign-in(.*)',
    '/sign-up(.*)',

    // Landing page and marketing pages
    '/',
    '/about',
    '/features',
    '/pricing',
    '/contact',
    '/privacy',
    '/terms',

    // Public API endpoints
    '/api/create-users',
    '/api/subscription/callback',
    '/api/webhooks/(.*)',

    // Public assets and resources
    '/favicon.ico',
    '/robots.txt',
    '/sitemap.xml',

    // Marketing assets and resources
    '/assets/(.*)',
    '/images/(.*)'
]

// Create route matcher for public routes
const isPublicRoute = createRouteMatcher(publicRoutes)

export default clerkMiddleware(async (auth, req: NextRequest) => {
    // Allow public routes to bypass authentication
    if (isPublicRoute(req)) {
        return NextResponse.next()
    }

    // Check if the user is authenticated
    const { userId } = await auth()

    // If not authenticated and trying to access a protected route, redirect to sign-in
    if (!userId) {
        // Get the sign-in URL with the current URL as the redirect URL
        const signInUrl = new URL('/sign-in', req.url)
        signInUrl.searchParams.set('redirect_url', req.url)
        return NextResponse.redirect(signInUrl)
    }

    // User is authenticated, proceed to the requested route
    return NextResponse.next()
})

export const config = {
    matcher: [
        // Match all request paths except for the ones starting with:
        // - _next/static (static files)
        // - _next/image (image optimization files)
        // - favicon.ico (favicon file)
        '/((?!_next/static|_next/image|favicon.ico).*)',

        // Also apply this middleware to API routes
        '/api/(.*)',
    ],
}