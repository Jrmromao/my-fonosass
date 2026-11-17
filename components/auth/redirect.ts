const DEFAULT_AFTER_AUTH = '/dashboard';

// Where to send the user after signing in or up. Clerk's middleware adds
// `redirect_url` (often an absolute URL) when it bounces a protected page to
// /sign-in. Only same-origin targets are allowed, to prevent open redirects.
export function safeRedirectTarget(raw: string | null): string {
  if (!raw || typeof window === 'undefined') return DEFAULT_AFTER_AUTH;
  try {
    const url = new URL(raw, window.location.origin);
    if (url.origin !== window.location.origin) return DEFAULT_AFTER_AUTH;
    const path = `${url.pathname}${url.search}${url.hash}`;
    // Never loop back into the auth pages.
    if (/^\/(sign-in|sign-up|sso-callback)/.test(url.pathname)) {
      return DEFAULT_AFTER_AUTH;
    }
    return path || DEFAULT_AFTER_AUTH;
  } catch {
    return DEFAULT_AFTER_AUTH;
  }
}
