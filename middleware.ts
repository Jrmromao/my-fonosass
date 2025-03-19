// middleware.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { prisma } from "@/db"

const isPublicRoute = createRouteMatcher([
    '/sign-in(.*)',
    '/sign-up(.*)',
    '/',
    '/api/subscription/callback',
    '/api/webhooks/(.*)'
])

export default clerkMiddleware(async (auth, req: NextRequest) => {
    if (!isPublicRoute(req)) {
        const { userId } = await auth()

        if (!userId) {
            // Get the sign-in URL with the current URL as the redirect URL
            const signInUrl = new URL('/sign-in', req.url)
            signInUrl.searchParams.set('redirect_url', req.url)
            return NextResponse.redirect(signInUrl)
        }

        // try {
        //     const subscription = await prisma.subscription.findUnique({
        //         where: { userId },
        //         select: { status: true }
        //     })
        //
        //     if (subscription?.status === "PAST_DUE") {
        //         if (!req.url.includes('/billing') && !req.url.includes('/api')) {
        //             return NextResponse.redirect(new URL('/billing', req.url))
        //         }
        //     }
        // } catch (error) {
        //     console.error('Error checking subscription:', error)
        // }
    }
})

export const config = {
    matcher: [
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        '/(api|trpc)(.*)',
    ],
}