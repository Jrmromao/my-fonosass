export const dynamic = 'force-dynamic';
import { errorResponse, requireAdmin } from '@/lib/activities/approval';
import { getOrCreateDbUser } from '@/lib/auth/dbUser';
import {
  VIEW_AS_COOKIE,
  VIEW_AS_MODES,
  readViewAsCookie,
} from '@/lib/auth/viewAs';
import { SecurityMiddleware } from '@/lib/security/securityMiddleware';
import { auth } from '@clerk/nextjs/server';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const NO_STORE = { 'Cache-Control': 'private, no-store' };
const bodySchema = z.object({ mode: z.enum(VIEW_AS_MODES).nullable() });

/** Current "Ver como" mode. Always null for non-admins (cookie ignored). */
export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401, headers: NO_STORE }
    );
  }
  const user = await getOrCreateDbUser(userId);
  const mode = user?.role === 'ADMIN' ? await readViewAsCookie() : null;
  return NextResponse.json(
    { success: true, data: { mode } },
    { headers: NO_STORE }
  );
}

/**
 * Set or clear the mode. Real admin role required (requireAdmin reads the
 * database, not the mode), so an admin can always leave it.
 */
export async function POST(request: NextRequest) {
  try {
    const security = await SecurityMiddleware.apply(request, {
      requireAuth: true,
      requireCSRF: true,
      rateLimitType: 'general',
      validateInput: false,
    });
    if (!security.success) return security.response!;
    await requireAdmin();

    const body = bodySchema.safeParse(await request.json().catch(() => null));
    if (!body.success) {
      return NextResponse.json(
        { success: false, error: 'Modo inválido' },
        { status: 400, headers: NO_STORE }
      );
    }

    const jar = await cookies();
    if (body.data.mode) {
      jar.set(VIEW_AS_COOKIE, body.data.mode, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 8 * 60 * 60, // a working day; it never outlives a test session
      });
    } else {
      jar.delete(VIEW_AS_COOKIE);
    }
    return NextResponse.json(
      { success: true, data: { mode: body.data.mode } },
      { headers: NO_STORE }
    );
  } catch (error) {
    const { body, status } = errorResponse(error);
    return NextResponse.json(body, { status, headers: NO_STORE });
  }
}
