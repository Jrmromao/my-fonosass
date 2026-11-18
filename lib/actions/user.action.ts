'use server';

import { User, UserRole } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '@/app/db';
import { userSchema } from '@/lib/schema';
import { clerkClient } from '@clerk/nextjs/server';
import { requireAdmin } from '@/lib/activities/approval';
import { AuditAction, recordAudit } from '@/lib/audit/audit';

// Data Transfer Object (DTO) for User
export interface UserDto {
  id: string;
  clerkUserId: string;
  email: string;
  fullName: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
  activitiesCount?: number;
  hasSubscription?: boolean;
}

// Define a generic ActionResponse type
export type ActionResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

import crypto from 'crypto'; // Node.js built-in module for random generation

const clerk = await clerkClient();

// Server actions are public HTTP endpoints: every action in this file manages
// other users, so each one requires a real ADMIN session.
async function denyUnlessAdmin(): Promise<ActionResponse<never> | null> {
  try {
    await requireAdmin();
    return null;
  } catch {
    return { success: false, error: 'Forbidden' };
  }
}

/** Audit trail for user-management actions (ids only, no personal data). */
async function auditUserAction(
  action:
    | typeof AuditAction.USER_INSERT
    | typeof AuditAction.USER_INVITE
    | typeof AuditAction.USER_UPDATE
    | typeof AuditAction.USER_REMOVE,
  targetId?: string,
  metadata?: Record<string, string | number | boolean | null>
) {
  try {
    const { dbUserId } = await requireAdmin();
    await recordAudit({
      action,
      actorType: 'ADMIN',
      actorId: dbUserId,
      targetType: 'User',
      targetId,
      metadata,
    });
  } catch {
    // Already authorized above; the trail must never break the action.
  }
}

// Mapper function to convert User to UserDto
const mapUserToDto = (
  user: User & {
    createdActivities?: any[];
    subscriptions?: any;
  }
): UserDto => ({
  id: user.id,
  clerkUserId: user.clerkUserId,
  email: user.email,
  fullName: user.fullName,
  role: user.role,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
  activitiesCount: user.createdActivities?.length,
  hasSubscription: !!user.subscriptions,
});

// Remove a user by ID
export const remove = async (id: string): Promise<ActionResponse<UserDto>> => {
  const denied = await denyUnlessAdmin();
  if (denied) return denied;

  try {
    const deletedUser = await prisma.user.delete({
      where: { id },
      include: {
        createdActivities: true,
        subscriptions: true,
      },
    });
    await auditUserAction(AuditAction.USER_REMOVE, id);
    return {
      success: true,
      data: mapUserToDto(deletedUser),
    };
  } catch (error) {
    console.error('Error removing user:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to remove user',
    };
  }
};

// Find a user by ID
export const findById = async (
  id: string
): Promise<ActionResponse<UserDto>> => {
  const denied = await denyUnlessAdmin();
  if (denied) return denied;

  try {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        createdActivities: true,
        subscriptions: true,
      },
    });

    if (!user) {
      return {
        success: false,
        error: 'User not found',
      };
    }

    return {
      success: true,
      data: mapUserToDto(user),
    };
  } catch (error) {
    console.error('Error finding user:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to find user',
    };
  }
};

// Get all users
export const getAll = async (): Promise<ActionResponse<UserDto[]>> => {
  const denied = await denyUnlessAdmin();
  if (denied) return denied;

  try {
    const users = await prisma.user.findMany({
      include: {
        createdActivities: true,
        subscriptions: true,
      },
    });

    return {
      success: true,
      data: users.map(mapUserToDto),
    };
  } catch (error) {
    console.error('Error getting all users:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to retrieve users',
    };
  }
};

// Insert a new user
export const insert = async (
  userData: z.infer<typeof userSchema>
): Promise<ActionResponse<any>> => {
  const denied = await denyUnlessAdmin();
  if (denied) return denied;

  try {
    // Validate input using Zod schema
    const validatedData = userSchema.parse(userData);

    // Create an invitation instead of directly creating a user
    const invitation = await clerk.invitations.createInvitation({
      emailAddress: validatedData.email,
      redirectUrl: `https://9670-2a06-5900-4049-a000-ed6d-2b62-1333-6b46.ngrok-free.app/onboarding`,
      publicMetadata: {
        role: validatedData.role || 'USER',
        fullName: validatedData.fullName || '',
        invitedAt: new Date().toISOString(),
      },
    });

    await auditUserAction(AuditAction.USER_INVITE, undefined, {
      role: validatedData.role || 'USER',
    });
    return {
      success: true,
      data: {
        email: validatedData.email,
      },
    };
  } catch (error: unknown) {
    console.error('Error creating invitation:', JSON.stringify(error, null, 2));

    // Type guard for Clerk-specific errors
    if (typeof error === 'object' && error !== null) {
      if ('status' in error && error.status === 422 && 'clerkError' in error) {
        const clerkError = error as { errors?: { message?: string }[] };
        return {
          success: false,
          error: `Clerk Error: ${clerkError.errors?.[0]?.message || 'Invalid request'}`,
        };
      }

      // Type guard for standard Error
      if (error instanceof Error) {
        return {
          success: false,
          error: error.message,
        };
      }
    }

    // Fallback for unknown error types
    return {
      success: false,
      error: 'Failed to create invitation',
    };
  }
};

export const invite = async (
  userData: z.infer<typeof userSchema>
): Promise<ActionResponse<UserDto>> => {
  const denied = await denyUnlessAdmin();
  if (denied) return denied;

  try {
    // Validate input using Zod schema
    const validatedData = userSchema.parse(userData);

    // Generate a random password
    const randomPassword = generateRandomPassword();

    const invitation = await clerk.invitations.createInvitation({
      emailAddress: validatedData.email,
      redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/onboarding`,
      publicMetadata: {
        role: validatedData.role || 'USER',
      },
    });

    // Create user in your database
    const newUser = await prisma.user.findUnique({
      where: { clerkUserId: invitation.id },
      include: {
        createdActivities: true,
        subscriptions: true,
      },
    });

    // Send invitation email via Clerk Invitations API
    // await clerkClient.invitations.createInvitation({
    //     emailAddress: validatedData.email,
    //     redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/onboarding`,
    //     publicMetadata: {
    //         role: validatedData.role || 'USER',
    //     },
    //     // inviterUserId: process.env.CLERK_ADMIN_USER_ID, // Uncomment if needed
    // });

    await auditUserAction(AuditAction.USER_INSERT, undefined, {
      role: validatedData.role || 'USER',
    });
    return {
      success: true,
    };
  } catch (error: unknown) {
    console.error('Error inserting user:', JSON.stringify(error, null, 2));

    // Type guard for Clerk-specific errors
    if (typeof error === 'object' && error !== null) {
      if ('status' in error && error.status === 422 && 'clerkError' in error) {
        const clerkError = error as { errors?: { message?: string }[] };
        return {
          success: false,
          error: `Clerk Error: ${clerkError.errors?.[0]?.message || 'Invalid request'}`,
        };
      }

      // Type guard for standard Error
      if (error instanceof Error) {
        return {
          success: false,
          error: error.message,
        };
      }
    }

    // Fallback for unknown error types
    return {
      success: false,
      error: 'Failed to create user',
    };
  }
};

// Update a user
export const update = async (
  id: string,
  userData: Partial<z.infer<typeof userSchema>>
): Promise<ActionResponse<UserDto>> => {
  const denied = await denyUnlessAdmin();
  if (denied) return denied;

  try {
    const updatedUser = await prisma.user.update({
      where: { id },
      data: userData,
      include: {
        createdActivities: true,
        subscriptions: true,
      },
    });

    // Field NAMES only (never values); `role` changes are the sensitive ones.
    await auditUserAction(AuditAction.USER_UPDATE, id, {
      fields: Object.keys(userData).slice(0, 8).join(','),
      roleChanged: 'role' in userData,
    });
    return {
      success: true,
      data: mapUserToDto(updatedUser),
    };
  } catch (error) {
    console.error('Error updating user:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update user',
    };
  }
};

function generateRandomPassword(length = 16) {
  return crypto
    .randomBytes(length)
    .toString('base64')
    .slice(0, length)
    .replace(/[^a-zA-Z0-9!@#$%^&*]/g, 'x'); // Replace special chars with 'x' if needed
}
