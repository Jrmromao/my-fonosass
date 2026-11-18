import 'server-only';
import { prisma } from '@/app/db';
import { auth } from '@clerk/nextjs/server';
import { AuditAction, recordAudit } from '@/lib/audit/audit';
import { NextResponse } from 'next/server';

/**
 * Shared authorization + state-machine rules for the activity approval
 * workflow. Centralizing this avoids the per-route drift that previously let
 * any authenticated user approve/reject activities and allowed out-of-order
 * state transitions.
 */

export type ActivityStatus =
  | 'DRAFT'
  | 'PENDING_REVIEW'
  | 'PUBLISHED'
  | 'REJECTED';

export class AuthzError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = 'AuthzError';
  }
}

/**
 * Require the caller to be an authenticated ADMIN. Throws AuthzError(401/403)
 * otherwise. Returns the internal user id for audit use.
 */
export async function requireAdmin(): Promise<{
  userId: string;
  dbUserId: string;
}> {
  const { userId } = await auth();
  if (!userId) throw new AuthzError(401, 'Unauthorized');

  const user = await prisma.user.findUnique({
    where: { clerkUserId: userId },
    select: { id: true, role: true },
  });
  if (!user) throw new AuthzError(403, 'User not found');
  if (user.role !== 'ADMIN') {
    // A signed-in non-admin hit an admin endpoint: worth a trail entry
    // (throttled so it can't be used to flood the table).
    await recordAudit({
      action: AuditAction.ADMIN_DENIED,
      actorType: 'USER',
      actorId: user.id,
      throttleMs: 10 * 60 * 1000,
    });
    throw new AuthzError(403, 'Insufficient permissions');
  }

  return { userId, dbUserId: user.id };
}

/**
 * Allowed status transitions. A transition not listed here is rejected so the
 * workflow can't skip review or re-run terminal actions.
 */
const ALLOWED_TRANSITIONS: Record<ActivityStatus, ActivityStatus[]> = {
  DRAFT: ['PENDING_REVIEW', 'REJECTED'],
  PENDING_REVIEW: ['PUBLISHED', 'REJECTED', 'PENDING_REVIEW'], // re-review allowed
  PUBLISHED: ['DRAFT', 'REJECTED'], // can unpublish or retire
  REJECTED: ['PENDING_REVIEW'], // can be re-submitted for review
};

export function canTransition(
  from: ActivityStatus,
  to: ActivityStatus
): boolean {
  if (from === to) return true; // idempotent no-op is allowed
  return ALLOWED_TRANSITIONS[from]?.includes(to) ?? false;
}

export function assertTransition(
  from: ActivityStatus,
  to: ActivityStatus
): void {
  if (!canTransition(from, to)) {
    throw new AuthzError(409, `Transição inválida: ${from} → ${to}`);
  }
}

/** Build a JSON error response body + status from any thrown error. */
export function errorResponse(error: unknown): {
  body: { error: string };
  status: number;
} {
  if (error instanceof AuthzError) {
    return { body: { error: error.message }, status: error.status };
  }
  console.error('[approval] unexpected error:', error);
  return { body: { error: 'Erro interno' }, status: 500 };
}

/**
 * Route-handler convenience: returns a 401/403 NextResponse when the caller is
 * not an ADMIN, or null when access is granted.
 *
 *   const denied = await guardAdmin();
 *   if (denied) return denied;
 */
export async function guardAdmin(): Promise<NextResponse | null> {
  const result = await guardAdminActor();
  return 'response' in result ? result.response : null;
}

/** Same check, but also hands back the admin's id for the audit trail. */
export async function guardAdminActor(): Promise<
  { response: NextResponse } | { dbUserId: string }
> {
  try {
    const { dbUserId } = await requireAdmin();
    return { dbUserId };
  } catch (error) {
    const { body, status } = errorResponse(error);
    return {
      response: NextResponse.json(body, {
        status,
        headers: { 'Cache-Control': 'private, no-store' },
      }),
    };
  }
}
