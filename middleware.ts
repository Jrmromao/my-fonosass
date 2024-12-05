// import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
//
// const isProtectedRoute = createRouteMatcher(['/dashboard', "/dashboard/games", "/dashboard/settings"])
//
// export default clerkMiddleware(async (auth, req) => {
//     const { userId, redirectToSignIn } = await auth()
//
//     if (!userId && isProtectedRoute(req)) {
//         // Add custom logic to run before redirecting
//
//         return redirectToSignIn()
//     }
// })
//
// export const config = {
//     matcher: [
//         // Skip Next.js internals and all static files, unless found in search params
//         '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
//         // Always run for API routes
//         '/(api|trpc)(.*)',
//     ],
// }
// middleware.ts
// import { authMiddleware } from "@clerk/nextjs/server"
// import { prisma } from "@/db"
//
// export default authMiddleware({
//     publicRoutes: ["/", "/signup", "/api/subscription/callback"],
//     async afterAuth(auth, req) {
//         if (!auth.userId) return
//
//         // Check subscription status
//         const subscription = await prisma.subscription.findUnique({
//             where: { userId: auth.userId }
//         })
//
//         // Redirect to billing page if subscription is past due
//         if (subscription?.status === "PAST_DUE") {
//             const billingUrl = new URL("/billing", req.url)
//             return Response.redirect(billingUrl)
//         }
//     }
// })
//
// // Export Clerk configs
// export const config = {
//     matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
// }
//
//
// import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
//
// const isPublicRoute = createRouteMatcher(['/sign-in(.*)', '/sign-up(.*)'])
//
// export default clerkMiddleware(async (auth, request) => {
//     if (!isPublicRoute(request)) {
//         await auth.protect()
//     }
// })
//
// export const config = {
//     matcher: [
//         // Skip Next.js internals and all static files, unless found in search params
//         '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
//         // Always run for API routes
//         '/(api|trpc)(.*)',
//     ],
// }
//
//


// middleware.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { currentUser } from "@clerk/nextjs/server"
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { prisma } from "@/db"

const isPublicRoute = createRouteMatcher([
    '/sign-in(.*)',
    '/sign-up(.*)',
    '/api/subscription/callback',
    '/api/webhooks/(.*)'
])

export default clerkMiddleware(async (auth, req: NextRequest) => {
    if (!isPublicRoute(req)) {
        await auth.protect()

        try {
            const user = await currentUser()

            if (user?.id) {
                const subscription = await prisma.subscription.findUnique({
                    where: { userId: user.id },
                    select: { status: true }
                })

                if (subscription?.status === "PAST_DUE") {
                    if (!req.url.includes('/billing') && !req.url.includes('/api')) {
                        return NextResponse.redirect(new URL('/billing', req.url))
                    }
                }
            }
        } catch (error) {
            console.error('Error checking subscription:', error)
        }
    }
})

export const config = {
    matcher: [
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        '/(api|trpc)(.*)',
    ],
}