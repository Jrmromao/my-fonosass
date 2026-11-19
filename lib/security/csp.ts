/**
 * Content-Security-Policy, set in middleware.ts. Edge-runtime safe (Web
 * Crypto only). Two modes, chosen per route:
 *
 *  - NONCE (signed-in areas: /dashboard, /data-rights, /consent-dashboard):
 *    a fresh nonce per request plus the host allowlist, with NO
 *    'unsafe-inline'. Inline scripts run only with the nonce (Next.js adds it
 *    to its own); injected inline script and inline event handlers are
 *    blocked. Not 'strict-dynamic': Clerk's loader tag is rendered by the
 *    root layout, which is static and cannot carry the nonce, so Clerk's
 *    script must be allowed by host. These routes are rendered per request
 *    (`dynamic = 'force-dynamic'`), which a nonce needs.
 *
 *  - STATIC (public marketing pages): the pages are prerendered and cached
 *    by the CDN, so their HTML cannot carry a per-request nonce. They keep
 *    'unsafe-inline' plus the host allowlist. They render no user input, and
 *    HTML from markdown/CMS is sanitized (lib/security/sanitizeHtml.ts).
 *
 * Host lists mirror what production served before, so no third party loses
 * access.
 */

/** Where browsers send CSP violation reports (app/api/csp-report). */
export const CSP_REPORT_PATH = '/api/csp-report';

const CLERK_HOSTS = [
  'https://clerk.accounts.dev',
  'https://*.clerk.accounts.dev',
  'https://clerk.almanaquedafala.com.br',
  'https://*.clerk.com',
];

export function generateNonce(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return btoa(String.fromCharCode(...bytes));
}

/** Pass a nonce for NONCE mode; omit it for STATIC mode. */
export function buildContentSecurityPolicy(
  nonce?: string,
  isDev = process.env.NODE_ENV !== 'production'
): string {
  const directives: Record<string, string[]> = {
    'default-src': ["'self'"],
    'script-src': [
      "'self'",
      // Next.js dev (React refresh / HMR) needs eval; production does not.
      ...(isDev ? ["'unsafe-eval'"] : []),
      // NONCE mode: nonce only, no 'unsafe-inline'.
      // STATIC mode: required, the cached pages carry inline scripts.
      ...(nonce ? [`'nonce-${nonce}'`] : ["'unsafe-inline'"]),
      ...CLERK_HOSTS,
      'https://www.googletagmanager.com',
      'https://va.vercel-scripts.com',
      'https://challenges.cloudflare.com',
    ],
    'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
    'img-src': ["'self'", 'data:', 'blob:', 'https:'],
    'font-src': ["'self'", 'data:', 'https://fonts.gstatic.com'],
    'media-src': ["'self'", 'blob:', 'data:'],
    'connect-src': ["'self'", 'https:', 'wss:', ...CLERK_HOSTS],
    'frame-src': [
      "'self'",
      ...CLERK_HOSTS,
      'https://challenges.cloudflare.com',
    ],
    'worker-src': ["'self'", 'blob:'],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
    'frame-ancestors': ["'none'"],
    'report-uri': [CSP_REPORT_PATH],
  };

  const policy = Object.entries(directives)
    .map(([name, values]) => `${name} ${values.join(' ')}`)
    .join('; ');

  return isDev ? policy : `${policy}; upgrade-insecure-requests`;
}

/**
 * Stricter policy shipped in REPORT-ONLY mode next to the enforced one:
 * `connect-src`, `img-src`, `frame-src` and `font-src` list exact hosts
 * instead of "any https:". Nothing is blocked; violations arrive at
 * /api/csp-report (stored as `security.csp_violation` audit events). After a
 * few weeks with no legitimate violations, move these lists into the enforced
 * policy above. The hosts were measured by loading every public and
 * signed-in page; S3 covers presigned library previews.
 */
export function buildReportOnlyContentSecurityPolicy(nonce?: string): string {
  const enforced = buildContentSecurityPolicy(nonce).split('; ');
  // `upgrade-insecure-requests` is ignored (and warned about) in report-only.
  const keep = enforced.filter(
    (d) =>
      !/^(connect-src|img-src|frame-src|font-src|media-src) /.test(d) &&
      d !== 'upgrade-insecure-requests'
  );
  const analytics = [
    'https://*.google-analytics.com',
    'https://*.analytics.google.com',
    'https://*.googletagmanager.com',
  ];
  const strict = [
    `connect-src 'self' ${[...CLERK_HOSTS, 'https://clerk-telemetry.com', 'https://*.clerk-telemetry.com', ...analytics, 'https://*.ingest.de.sentry.io'].join(' ')}`,
    `img-src 'self' data: blob: https://img.clerk.com https://images.clerk.dev https://www.gravatar.com https://*.amazonaws.com ${analytics.join(' ')}`,
    `frame-src 'self' ${[...CLERK_HOSTS, 'https://challenges.cloudflare.com'].join(' ')}`,
    "font-src 'self' data:",
    "media-src 'self' blob: data: https://*.amazonaws.com",
  ];
  return [...keep, ...strict].join('; ');
}
