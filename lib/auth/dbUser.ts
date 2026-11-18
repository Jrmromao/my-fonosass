import { prisma } from '@/app/db';
import { clerkClient } from '@clerk/nextjs/server';
import { Prisma, type UserRole } from '@prisma/client';

export interface DbUser {
  id: string;
  role: UserRole;
  email: string;
}

/** Set on the Clerk user before an account is erased (user-data/delete). */
export const DELETION_FLAG = 'deletionRequestedAt';

/**
 * Database user for a Clerk user id, creating the row if it is missing.
 *
 * The row is normally created by the Clerk webhook (user.created). If the
 * webhook was down, the user would be locked out of everything, so the row is
 * created here instead. Security rules:
 * - `clerkUserId` must come from auth() (a verified session), never from
 *   request input; email and name are read from Clerk's API, not the client.
 * - role is always the default USER.
 * - never links to an existing row by email (that would be account takeover);
 *   an email collision fails closed.
 * - only a verified primary email is used.
 * - accounts flagged for deletion are never recreated (LGPD erasure).
 */
export async function getOrCreateDbUser(
  clerkUserId: string
): Promise<DbUser | null> {
  const select = { id: true, role: true, email: true } as const;
  const existing = await prisma.user.findUnique({
    where: { clerkUserId },
    select,
  });
  if (existing) return existing;

  let clerkUser;
  try {
    const clerk = await clerkClient();
    clerkUser = await clerk.users.getUser(clerkUserId);
  } catch (error) {
    console.error('getOrCreateDbUser: Clerk lookup failed', error);
    return null;
  }

  if (clerkUser.privateMetadata?.[DELETION_FLAG]) {
    console.warn('getOrCreateDbUser: refused, account is being deleted');
    return null;
  }

  const primary = clerkUser.emailAddresses.find(
    (e) => e.id === clerkUser.primaryEmailAddressId
  );
  if (!primary || primary.verification?.status !== 'verified') {
    console.warn('getOrCreateDbUser: refused, no verified primary email');
    return null;
  }

  const fullName =
    `${clerkUser.firstName ?? ''} ${clerkUser.lastName ?? ''}`.trim() || 'User';

  try {
    return await prisma.user.upsert({
      where: { clerkUserId },
      update: {},
      create: { clerkUserId, email: primary.emailAddress, fullName },
      select,
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      // A concurrent request may have created it: read again.
      const raced = await prisma.user.findUnique({
        where: { clerkUserId },
        select,
      });
      if (raced) return raced;
      // Otherwise the email belongs to another account: do not merge.
      console.error('getOrCreateDbUser: email already used by another row');
      return null;
    }
    throw error;
  }
}

/**
 * Database user id for a Clerk user id (creates the row if missing).
 *
 * Tables like ConsentRecord reference User.id (a cuid), not the Clerk id, so
 * routes must resolve it before reading or writing them.
 */
export async function getDbUserId(clerkUserId: string): Promise<string | null> {
  return (await getOrCreateDbUser(clerkUserId))?.id ?? null;
}
