import { AuditAction, recordAudit } from '@/lib/audit/audit';
import { rateLimiters } from '@/lib/security/rateLimiter';
import { NextRequest } from 'next/server';
import { z } from 'zod';

/**
 * Receives CSP violation reports from browsers (`report-uri`). Public by
 * necessity, so it is: size-capped, rate limited, validated, and stores only
 * what is needed to fix a policy (directive, blocked ORIGIN, page PATH, no
 * query string, no script samples) as a throttled audit event.
 */
const MAX_BYTES = 8 * 1024;

const reportSchema = z.object({
  'csp-report': z.object({
    'violated-directive': z.string().max(120).optional(),
    'effective-directive': z.string().max(120).optional(),
    'blocked-uri': z.string().max(2048).optional(),
    'document-uri': z.string().max(2048).optional(),
    disposition: z.string().max(20).optional(),
  }),
});

function originOf(value?: string): string {
  if (!value) return 'unknown';
  if (!/^[a-z][a-z0-9+.-]*:/i.test(value)) return value.slice(0, 40); // "inline", "eval"
  try {
    const u = new URL(value);
    return u.origin === 'null' ? u.protocol : u.origin;
  } catch {
    return 'invalid';
  }
}

function pathOf(value?: string): string {
  try {
    return value ? new URL(value).pathname.slice(0, 120) : 'unknown';
  } catch {
    return 'invalid';
  }
}

export async function POST(request: NextRequest) {
  const length = Number(request.headers.get('content-length') ?? 0);
  if (length > MAX_BYTES) return new Response(null, { status: 413 });

  const limit = await rateLimiters.general.checkAsync(request);
  if (!limit.success) return new Response(null, { status: 429 });

  let raw: unknown;
  try {
    raw = JSON.parse(await request.text());
  } catch {
    return new Response(null, { status: 400 });
  }
  const parsed = reportSchema.safeParse(raw);
  if (!parsed.success) return new Response(null, { status: 400 });

  const r = parsed.data['csp-report'];
  const directive = (r['effective-directive'] || r['violated-directive'] || '')
    .split(' ')[0]
    .slice(0, 60);

  // Throttled per client (the helper keys on IP for anonymous events), so a
  // looping page or a hostile client cannot fill the table.
  await recordAudit({
    action: AuditAction.CSP_VIOLATION,
    actorType: 'ANONYMOUS',
    request,
    throttleMs: 60 * 60 * 1000,
    metadata: {
      directive: directive || 'unknown',
      blocked: originOf(r['blocked-uri']),
      page: pathOf(r['document-uri']),
      disposition: r.disposition ?? 'unknown',
    },
  });

  return new Response(null, { status: 204 });
}
