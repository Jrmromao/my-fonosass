import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/data-rights(.*)',
  '/profile(.*)',
  '/settings(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  // Only protect non-API routes
  if (isProtectedRoute(req) && !req.nextUrl.pathname.startsWith('/api/')) {
    await auth.protect();
  }
});

export const config = {
  // Match all paths except static files, API routes, sitemap, and robots
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|api).*)',
  ],
};
