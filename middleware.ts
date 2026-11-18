import {
  buildContentSecurityPolicy,
  buildReportOnlyContentSecurityPolicy,
  generateNonce,
} from '@/lib/security/csp';
import { isCrossSiteMutation } from '@/lib/security/origin';
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/data-rights(.*)',
  '/consent-dashboard(.*)',
]);

// Rendered per request, with a CSP nonce (see lib/security/csp.ts).
const isNonceArea = createRouteMatcher([
  '/dashboard(.*)',
  '/data-rights(.*)',
  '/consent-dashboard(.*)',
]);

const isPublicReviewRoute = createRouteMatcher([
  // Only the per-item review page is public — it is protected by a per-activity
  // approvalToken passed in the query string. The review *list* page stays
  // Clerk-protected so the full activity catalog isn't exposed anonymously.
  '/dashboard/exercises/review/(.+)',
]);

const isProtectedAPIRoute = createRouteMatcher([
  '/api/ai(.*)',
  '/api/user(.*)',
  '/api/user-data(.*)',
  '/api/cache(.*)',
  '/api/activities/generate',
  // Admin API. Each handler also enforces role === ADMIN; this is a second
  // layer. sync-activities is excluded because GitHub Actions calls it with
  // a Bearer API key instead of a Clerk session (checked in the handler).
  /^\/api\/admin\/(?!sync-activities)/,
]);

export default clerkMiddleware(async (auth, req) => {
  if (
    isCrossSiteMutation({
      method: req.method,
      pathname: req.nextUrl.pathname,
      origin: req.headers.get('origin'),
      host: req.headers.get('host'),
    })
  ) {
    return NextResponse.json(
      { error: 'Cross-site request refused' },
      { status: 403 }
    );
  }

  // Protect dashboard and profile routes (except public review pages)
  if (isProtectedRoute(req) && !isPublicReviewRoute(req)) {
    await auth.protect();
  }

  // Protect specific API routes
  if (isProtectedAPIRoute(req)) {
    await auth.protect();
  }

  // Signed-in areas get a per-request nonce (the routes render per request);
  // public pages stay prerendered and cached, so they get the static policy.
  if (isNonceArea(req)) {
    const nonce = generateNonce();
    const csp = buildContentSecurityPolicy(nonce);

    // On the REQUEST headers so Next.js stamps the nonce on its own scripts;
    // on the RESPONSE so the browser enforces it.
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set('x-nonce', nonce);
    requestHeaders.set('content-security-policy', csp);

    const response = NextResponse.next({
      request: { headers: requestHeaders },
    });
    response.headers.set('content-security-policy', csp);
    response.headers.set(
      'content-security-policy-report-only',
      buildReportOnlyContentSecurityPolicy(nonce)
    );
    return response;
  }

  const response = NextResponse.next();
  response.headers.set('content-security-policy', buildContentSecurityPolicy());
  response.headers.set(
    'content-security-policy-report-only',
    buildReportOnlyContentSecurityPolicy()
  );
  return response;
});

export const config = {
  // Match all paths except static files
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
