import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

// Only essential public routes
const publicRoutes = [
    '/',
    '/sign-in(.*)',
    '/sign-up(.*)',
    '/api/webhooks/(.*)'
]

const isPublicRoute = createRouteMatcher(publicRoutes)

export default clerkMiddleware(async (auth, req) => {
    if (isPublicRoute(req)) {
        return NextResponse.next()
    }

    // Get auth state
    const { userId } = await auth();

    // Redirect unauthenticated users to sign-in
    if (!userId) {
        const signInUrl = new URL('/sign-in', req.url)
        signInUrl.searchParams.set('redirect_url', req.url)
        return NextResponse.redirect(signInUrl)
    }

    return NextResponse.next()
})

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']
}