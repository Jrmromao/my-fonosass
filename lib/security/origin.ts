const MUTATING = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

/**
 * CSRF defense in depth for cookie-authenticated API calls: a browser always
 * sends `Origin` on cross-site state-changing requests, so a mutating /api
 * request whose Origin is not this site is refused. Requests without an
 * Origin (webhooks, GitHub Actions, curl) are not browsers and are
 * authenticated by their own secret, so they pass.
 */
export function isCrossSiteMutation(input: {
  method: string;
  pathname: string;
  origin: string | null;
  host: string | null;
}): boolean {
  if (!MUTATING.has(input.method) || !input.pathname.startsWith('/api/')) {
    return false;
  }
  if (!input.origin) return false;
  try {
    return new URL(input.origin).host !== input.host;
  } catch {
    return true; // malformed Origin
  }
}
