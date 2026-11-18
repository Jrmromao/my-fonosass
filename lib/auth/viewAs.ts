import { hasActiveSubscription } from '@/lib/access';
import type { UserRole } from '@prisma/client';
import { cookies } from 'next/headers';

/**
 * "Ver como": lets an admin see the private area as a subscriber or as a
 * user without a subscription, for testing.
 *
 * Security:
 * - Downgrade only. It changes what the admin sees and can download, never
 *   the role in the database.
 * - Honored only when the database role is ADMIN; for anyone else the cookie
 *   is ignored (a user can't grant themselves "assinante").
 * - Admin API routes (requireAdmin) keep using the real role, so the admin
 *   can always leave the mode.
 */
export const VIEW_AS_COOKIE = 'almanaque_ver_como';
export const VIEW_AS_MODES = ['assinante', 'sem-assinatura'] as const;
export type ViewAsMode = (typeof VIEW_AS_MODES)[number];

export const VIEW_AS_LABELS: Record<ViewAsMode, string> = {
  assinante: 'Assinante',
  'sem-assinatura': 'Sem assinatura',
};

export function isViewAsMode(value: unknown): value is ViewAsMode {
  return VIEW_AS_MODES.includes(value as ViewAsMode);
}

/** The mode in the cookie, or null. Only meaningful for real admins. */
export async function readViewAsCookie(): Promise<ViewAsMode | null> {
  try {
    const value = (await cookies()).get(VIEW_AS_COOKIE)?.value;
    return isViewAsMode(value) ? value : null;
  } catch {
    // Outside a request (scripts, tests).
    return null;
  }
}

export interface EffectiveAccess {
  /** Admin powers in the user-facing area (false while viewing as). */
  isAdmin: boolean;
  /** Treated as an active subscriber. */
  subscribed: boolean;
  /** Active test mode (real admins only). */
  viewAs: ViewAsMode | null;
}

/**
 * Admin powers in the user-facing area (menu, admin-only UI), taking "Ver
 * como" into account. No subscription lookup, for cheap role checks.
 */
export async function getEffectiveIsAdmin(user: {
  role: UserRole;
}): Promise<boolean> {
  if (user.role !== 'ADMIN') return false;
  return (await readViewAsCookie()) === null;
}

/**
 * What a user can do in the user-facing area, taking "Ver como" into
 * account. Use this instead of reading `role` directly for access to
 * content; keep `requireAdmin` (real role) for admin operations.
 */
export async function getEffectiveAccess(user: {
  id: string;
  role: UserRole;
}): Promise<EffectiveAccess> {
  const realAdmin = user.role === 'ADMIN';
  const viewAs = realAdmin ? await readViewAsCookie() : null;

  if (viewAs === 'assinante') {
    return { isAdmin: false, subscribed: true, viewAs };
  }
  if (viewAs === 'sem-assinatura') {
    return { isAdmin: false, subscribed: false, viewAs };
  }
  return {
    isAdmin: realAdmin,
    subscribed: await hasActiveSubscription(user.id),
    viewAs: null,
  };
}
