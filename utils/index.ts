'use server';

import { prisma } from '@/app/db';
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

    return user.role === 'ADMIN' ? 'ADMIN' : 'USER';
  } catch (error) {
    console.error('Error getting user role:', error);
    return 'GUEST';
  }
}

// Get color name
