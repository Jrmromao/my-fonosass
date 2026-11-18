import type { NextRequest } from 'next/server';

/**
 * Best-effort client IP. On Vercel, `x-vercel-forwarded-for` / `x-real-ip` are
 * set by the platform edge and cannot be spoofed by the client, so they take
 * precedence over the client-appendable `x-forwarded-for`.
 * The value is length-capped and restricted to IP characters before use as a
 * rate-limit key or stored for audit.
 */
export function getClientIp(request: Pick<NextRequest, 'headers'>): string {
  const h = request.headers;
  const raw =
    h.get('x-vercel-forwarded-for') ||
    h.get('x-real-ip') ||
    h.get('x-forwarded-for')?.split(',')[0] ||
    '';
  const ip = raw.trim().slice(0, 45);
  return /^[0-9a-fA-F:.]+$/.test(ip) ? ip : 'unknown';
}
