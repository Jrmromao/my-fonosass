'use server';

import { auth, currentUser } from '@clerk/nextjs/server';
import {colorNames} from "@/components/ballons/constants";

type UserRole = 'ADMIN' | 'USER' | 'GUEST';

/**
 * Server Action to get the current user's role
 */
export async function getCurrentUserRole(): Promise<UserRole> {
    try {
        // Check if user is authenticated
        const { userId } = await auth();
        if (!userId) return 'GUEST';

        // Get the full user object
        const user = await currentUser();
        if (!user) return 'GUEST';

        // Get role from public metadata (stored during user creation or by admin)
        const metadata = user.privateMetadata;


        console.log(metadata)
        if (metadata && 'role' in metadata) {
            return metadata.role as UserRole;
        }

        return 'USER';
    } catch (error) {
        console.error('Error getting user role:', error);
        return 'GUEST';
    }
}

// Get color name
