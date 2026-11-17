import { prisma } from '@/app/db';
import { auth } from '@clerk/nextjs/server';
import { notFound, redirect } from 'next/navigation';

/**
 * Server-side guard for admin-only pages. Uses the database role (the same
 * source as the admin API routes). Non-admins get a 404 so the page's
 * existence is not revealed.
 */
export async function requireAdminPage(): Promise<void> {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const user = await prisma.user.findUnique({
    where: { clerkUserId: userId },
    select: { role: true },
  });
  if (user?.role !== 'ADMIN') notFound();
}

/** True when the signed-in user is an admin (database role). */
export async function isAdmin(): Promise<boolean> {
  const { userId } = await auth();
  if (!userId) return false;
  const user = await prisma.user.findUnique({
    where: { clerkUserId: userId },
    select: { role: true },
  });
  return user?.role === 'ADMIN';
}
