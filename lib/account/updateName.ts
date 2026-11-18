import 'server-only';
import { prisma } from '@/app/db';
import { clerkClient } from '@clerk/nextjs/server';
import { z } from 'zod';

export const fullNameSchema = z.string().trim().min(2).max(100);

/**
 * Self-service name correction (LGPD art. 18 III).
 *
 * Clerk is the source of truth: the Clerk webhook (user.updated) rewrites
 * User.fullName from Clerk's first/last name, so a DB-only edit would be
 * reverted on the next sync. Write Clerk first, then the DB so the change is
 * visible immediately.
 */
export async function updateOwnName(clerkUserId: string, fullName: string) {
  const name = fullNameSchema.parse(fullName);
  const [firstName, ...rest] = name.split(/\s+/);
  const lastName = rest.join(' ');

  const clerk = await clerkClient();
  await clerk.users.updateUser(clerkUserId, { firstName, lastName });

  return prisma.user.update({
    where: { clerkUserId },
    data: { fullName: [firstName, lastName].filter(Boolean).join(' ') },
    select: {
      id: true,
      email: true,
      fullName: true,
      role: true,
      updatedAt: true,
    },
  });
}

/**
 * Email is never written by our API: changing it must go through Clerk's
 * account settings, which verify ownership of the new address. The webhook
 * then syncs the new primary email into the DB.
 */
export const EMAIL_CHANGE_VIA_CLERK =
  'Para alterar o email, use "Gerenciar conta": o novo endereço precisa ser verificado.';

export function isEmailChange(requested: unknown, current: string): boolean {
  return (
    typeof requested === 'string' &&
    requested.trim() !== '' &&
    requested.trim().toLowerCase() !== current.toLowerCase()
  );
}
