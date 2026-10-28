import 'server-only';
import { prisma } from '@/app/db';
import { auth } from '@clerk/nextjs/server';

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
  if (user.role !== 'ADMIN')
    throw new AuthzError(403, 'Insufficient permissions');

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
