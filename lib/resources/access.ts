import 'server-only';
import { prisma } from '@/app/db';
import { getEffectiveAccess } from '@/lib/auth/viewAs';
import { auth } from '@clerk/nextjs/server';

export interface ResourceViewer {
  /** Internal user id, or null for anonymous visitors. */
  userId: string | null;
  /** Active subscriber or admin (respecting "Ver como"). */
  canAccessPremium: boolean;
  /** Admin in the user-facing area (false while using "Ver como"). */
  isAdmin: boolean;
}

/**
 * Resolve who is asking and whether they may use non-free resources.
 * Signing in alone is NOT enough: premium needs an active subscription or an
 * admin role (same rule as lib/files/download.ts).
 */
export async function getResourceViewer(): Promise<ResourceViewer> {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId)
    return { userId: null, canAccessPremium: false, isAdmin: false };

  const user = await prisma.user.findUnique({
    where: { clerkUserId },
    select: { id: true, role: true },
  });
  if (!user) return { userId: null, canAccessPremium: false, isAdmin: false };

  const access = await getEffectiveAccess(user);
  return {
    userId: user.id,
    canAccessPremium: access.isAdmin || access.subscribed,
    isAdmin: access.isAdmin,
  };
}

/**
 * Signed-in requests must never read or populate the shared, URL-keyed
 * response cache (withCaching): their payload can differ per user (admins see
 * premium fields). Clerk keeps the session in the `__session` cookie.
 */
export function hasSessionCookie(req: {
  cookies: { has(name: string): boolean };
}): boolean {
  return req.cookies.has('__session');
}
