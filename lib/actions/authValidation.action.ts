"use server"

import { currentUser } from "@clerk/nextjs/server"

type AuthResult = {
    success: boolean;
    user: any | null;
    practice: any | null;
    error: string | null;
}

/**
 * Base authentication validation action
 * Validates if the user is logged in and returns the user's practice information
 *
 * @returns Object containing success status, user data, practice data, and error message if applicable
 */
export async function validateAuthentication(): Promise<AuthResult> {
    try {
        // Get current user from Clerk
        const user = await currentUser()
        if (!user || !user.id) {
            return {
                success: false,
                error: "Unauthorized - You must be logged in to access this resource",
                user: null,
                practice: null
            }
        }

        // Get user's practice information
        // const userPractice = await prisma.practiceMember.findFirst({
        //     where: {
        //         userId: user.id,
        //         status: 'ACTIVE'
        //     },
        //     select: {
        //         id: true,
        //         practiceId: true,
        //         role: true,
        //         practice: {
        //             select: {
        //                 id: true,
        //                 name: true
        //             }
        //         }
        //     }
        // })
        //
        // if (!userPractice) {
        //     return {
        //         success: false,
        //         error: "No active practice found for user",
        //         user,
        //         practice: null
        //     }
        // }

        // Return success with user and practice data
        return {
            success: true,
            user,
            practice: {},
            error: null
        }
    } catch (error: any) {
        console.error('Authentication validation error:', error)
        return {
            success: false,
            error: `Authentication error: ${error.message || "Unknown error"}`,
            user: null,
            practice: null
        }
    }
}

type ErrorResult = { success: false; error: string }

/**
 * Helper function to wrap other server actions with authentication validation
 *
 * @param callback Function to execute if authentication is successful
 * @returns Result of the callback function or authentication error
 */
export async function withAuth<T>(
    callback: (user: any, practice: any) => Promise<T>
): Promise<T | ErrorResult> {
    const auth = await validateAuthentication()

    if (!auth.success) {
        return {
            success: false,
            error: auth.error || "Authentication failed"
        }
    }

    return callback(auth.user, auth.practice)
}

/**
 * Helper function to wrap other server actions with authentication validation
 * that accept parameters
 *
 * @param callback Function to execute if authentication is successful
 * @returns Async function that accepts parameters and returns the result of the callback
 */
export async function withAuthParams<P extends any[], R>(
    callback: (user: any, practice: any, ...params: P) => Promise<R>,
    ...params: P
): Promise<R | ErrorResult> {
    const auth = await validateAuthentication()

    if (!auth.success) {
        return {
            success: false,
            error: auth.error || "Authentication failed"
        }
    }

    return callback(auth.user, auth.practice, ...params)
}