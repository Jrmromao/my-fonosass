import { rateLimiters } from '@/lib/security/rateLimiter';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const webVitalsSchema = z.object({
  name: z.string().min(1).max(32),
  value: z.number().finite(),
  id: z.string().min(1).max(128),
  delta: z.number().finite().optional(),
  navigationType: z.string().max(32).optional(),
  rating: z.enum(['good', 'needs-improvement', 'poor']).optional(),
  url: z.string().max(2048).optional(),
  timestamp: z.number().finite().optional(),
});

// Public beacon endpoint: validated, size-limited and rate limited. Metrics are
// currently discarded (no storage wired up); nothing from the payload is logged.
export async function POST(request: NextRequest) {
  const limit = await rateLimiters.general.checkAsync(request);
  if (!limit.success) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const length = Number(request.headers.get('content-length') ?? 0);
  if (length > 4096) {
    return NextResponse.json({ error: 'Payload too large' }, { status: 413 });
  }

  const parsed = webVitalsSchema.safeParse(
    await request.json().catch(() => null)
  );
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid Web Vitals data' },
      { status: 400 }
    );
  }

  return NextResponse.json({ success: true });
}

export async function GET() {
  return NextResponse.json({
    message: 'Web Vitals API endpoint',
    endpoints: {
      POST: 'Send Web Vitals data',
    },
  });
}
