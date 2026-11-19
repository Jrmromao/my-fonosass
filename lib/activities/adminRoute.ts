import 'server-only';
import { errorResponse, requireAdmin } from '@/lib/activities/approval';
import { SecurityMiddleware } from '@/lib/security/securityMiddleware';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Shared plumbing for the admin routes that change an activity: CSRF + rate
// limit, admin check, id validation, and the { success, data, error } shape.

export const NO_STORE = { 'Cache-Control': 'private, no-store' };

const idSchema = z.string().min(1).max(64);

export const fail = (error: string, status: number) =>
  NextResponse.json({ success: false, error }, { status, headers: NO_STORE });

export const ok = <T>(data: T) =>
  NextResponse.json({ success: true, data }, { headers: NO_STORE });

/** Any thrown error as a { success: false, error } response. */
export function failFrom(error: unknown): NextResponse {
  const { body, status } = errorResponse(error);
  return fail(body.error, status);
}

export async function guardActivityChange(
  request: NextRequest,
  params: Promise<{ id: string }>
): Promise<{ response: NextResponse } | { id: string; adminId: string }> {
  const security = await SecurityMiddleware.apply(request, {
    requireAuth: true,
    requireCSRF: true,
    rateLimitType: 'general',
    validateInput: false,
  });
  if (!security.success) return { response: security.response! };

  const { dbUserId } = await requireAdmin();

  const parsed = idSchema.safeParse((await params).id);
  if (!parsed.success) {
    return { response: fail('Atividade não encontrada.', 404) };
  }
  return { id: parsed.data, adminId: dbUserId };
}
