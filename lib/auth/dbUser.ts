import { prisma } from '@/app/db';

/**
 * Database user id for a Clerk user id.
 *
 * Tables like ConsentRecord reference User.id (a cuid), not the Clerk id, so
 * routes must resolve it before reading or writing them.
 */
export async function getDbUserId(clerkUserId: string): Promise<string | null> {
  const user = await prisma.user.findUnique({
    where: { clerkUserId },
    select: { id: true },
  });
  return user?.id ?? null;
}
