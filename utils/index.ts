'use server';

import { prisma } from '@/app/db';
import { getEffectiveIsAdmin } from '@/lib/auth/viewAs';
import { auth } from '@clerk/nextjs/server';

type UserRole = 'ADMIN' | 'USER' | 'GUEST';

/**
 * Server Action to get the current user's role.
 * Reads the database role, the same source the admin API routes check, so the
 * menu never shows admin items that the server would then refuse.
 */
export async function getCurrentUserRole(): Promise<UserRole> {
  try {
    const { userId } = await auth();
    if (!userId) return 'GUEST';

    const user = await prisma.user.findUnique({
      where: { clerkUserId: userId },
      select: { role: true },
    });
    if (!user) return 'GUEST';

    // Menu role: an admin testing with "Ver como" sees the user menu.
    return (await getEffectiveIsAdmin(user)) ? 'ADMIN' : 'USER';
  } catch (error) {
    console.error('Error getting user role:', error);
    return 'GUEST';
  }
}

// Get color name
