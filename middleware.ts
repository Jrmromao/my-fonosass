import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/data-rights(.*)',
  '/profile(.*)',
  '/settings(.*)',
]);

const isPublicReviewRoute = createRouteMatcher([
  '/dashboard/exercises/review(.*)',
]);

const isProtectedAPIRoute = createRouteMatcher([
  '/api/ai(.*)',
  '/api/user(.*)',
  '/api/download-limit(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  // Protect dashboard and profile routes (except public review pages)
  if (isProtectedRoute(req) && !isPublicReviewRoute(req)) {
    await auth.protect();
  }

  // Protect specific API routes
  if (isProtectedAPIRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  // Match all paths except static files
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
