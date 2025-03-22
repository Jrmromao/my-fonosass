"use server"

import { prisma } from "@/db"
import { revalidatePath } from "next/cache"
// import { currentUser, clerkClient } from "@clerk/nextjs/server"
import { z } from "zod"
import {validateAuthentication} from "@/lib/actions/authValidation.action";


import { createClerkClient } from '@clerk/backend'
import {UserRole} from "@prisma/client";


const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY })

// User creation schema
const createUserSchema = z.object({
    email: z.string().email("Invalid email address"),
    fullName: z.string().min(3, "Full name must be at least 3 characters"),
    phone: z.string().optional(),
    role: z.nativeEnum(UserRole).default(UserRole.THERAPIST),
    password: z.string().min(8, "Password must be at least 8 characters"),
    practiceId: z.string().uuid("Invalid practice ID")
});

type CreateUserInput = z.infer<typeof createUserSchema>;

/**
 * Create a new user in both Clerk and the application database
 */
export async function createUser(data: CreateUserInput): Promise<ActionResponse<any>> {
    // For user creation in a practice, we require admin authentication
    const auth = await validateAuthentication();
    //
    // if (!auth.success) {
    //     return {
    //         success: false,
    //         error: auth.error || "Authentication failed"
    //     };
    // }

    // Check if the authenticated user has admin privileges for the practice
    // if (auth.practice.role !== "ADMIN") {
    //     return {
    //         success: false,
    //         error: "Unauthorized - Only practice administrators can create new users"
    //     };
    // }

    try {
        // Validate input data
        const validation = createUserSchema.safeParse(data);
        if (!validation.success) {
            return {
                success: false,
                error: "Validation failed",
                data: validation.error.flatten().fieldErrors
            };
        }



        const { email, fullName, phone, password, role, practiceId } = validation.data;
        console.log(validation.data)
        // Parse full name to get first and last name for Clerk
        const nameParts = fullName.split(' ');
        const firstName = nameParts[0];
        const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

        // Step 1: Create the user in Clerk
        let clerkUser;
        try {
            clerkUser = await clerkClient.users.createUser({
                emailAddress: [email],
                firstName,
                lastName,
                password,
                skipPasswordChecks: true,
            });
        } catch (error: any) {
            console.error("Error creating user in Clerk:", error);
            return {
                success: false,
                error: error.message || "Failed to create user in authentication system"
            };
        }

        // Step 2: Create the user in your database
        try {
            // First, check if the practice exists
            const practice = await prisma.practice.findUnique({
                where: {
                    id: practiceId
                }
            });

            if (!practice) {
                // If practice doesn't exist, delete the user from Clerk to avoid orphaned users
                await clerkClient.users.deleteUser(clerkUser.id);

                return {
                    success: false,
                    error: "Practice not found"
                };
            }

            // Create the user first
            const user = await prisma.user.create({
                data: {
                    clerkUserId: clerkUser.id,
                    email,
                    fullName,
                    phone,
                    role
                }
            });

            // Then create the practice member relationship
            const practiceMember = await prisma.practiceMember.create({
                data: {
                    userId: user.id,
                    practiceId,
                    status: "ACTIVE"
                }
            });

            revalidatePath(`/dashboard/practice/users`);

            return {
                success: true,
                data: {
                    userId: user.id,
                    clerkUserId: clerkUser.id,
                    email,
                    fullName,
                    role,
                    practiceId,
                    practiceMemberId: practiceMember.id
                },
                message: "User created successfully and added to practice",
                redirectUrl: "/dashboard/practice/users"
            };
        } catch (error: any) {
            // If database creation fails, delete the user from Clerk to keep systems in sync
            await clerkClient.users.deleteUser(clerkUser.id);

            console.error("Error creating user in database:", error);
            return {
                success: false,
                error: error.message || "Failed to create user in database"
            };
        }
    } catch (error: any) {
        console.error("Error in user creation:", error);
        return {
            success: false,
            error: error.message || "Failed to create user"
        };
    }
}

/**
 * Get all users for the authenticated user's practice
 */
// export async function getPracticeUsers(options: {
//     search?: string;
//     role?: string;
//     page?: number;
//     limit?: number;
// } = {}): Promise<ActionResponse<any[]>> {
//     const auth = await validateAuthentication();
//
//     if (!auth.success) {
//         return {
//             success: false,
//             error: auth.error || "Authentication failed"
//         };
//     }
//
//     try {
//         const {
//             search = "",
//             role,
//             page = 1,
//             limit = 10
//         } = options;
//
//         // Get all users in this practice
//         const practiceMembersQuery = {
//             practiceId: auth.practice.practiceId,
//             status: "ACTIVE",
//             ...(role && { role }),
//         };
//
//         // Get the user IDs in this practice
//         // const practiceMembers = await prisma.practiceMember.findMany({
//         //     where: practiceMembersQuery,
//         //     select: {
//         //         userId: true,
//         //         role: true
//         //     }
//         // });
//
//         // const userIds = practiceMembers.map(member => member.userId);
//
//         // // Now query the users with those IDs
//         // const whereCondition = {
//         //     id: { in: userIds },
//         //     ...(search && {
//         //         OR: [
//         //             {
//         //                 fullName: {
//         //                     contains: search,
//         //                     mode: 'insensitive'
//         //                 }
//         //             },
//         //             {
//         //                 email: {
//         //                     contains: search,
//         //                     mode: 'insensitive'
//         //                 }
//         //             },
//         //             {
//         //                 phone: {
//         //                     contains: search,
//         //                     mode: 'insensitive'
//         //                 }
//         //             }
//         //         ]
//         //     })
//         // };
//         //
//         // const [users, total] = await Promise.all([
//         //     prisma.user.findMany({
//         //         where: whereCondition,
//         //         select: {
//         //             id: true,
//         //             clerkUserId: true,
//         //             email: true,
//         //             fullName: true,
//         //             phone: true,
//         //             role: true,
//         //             createdAt: true,
//         //             _count: {
//         //                 select: {
//         //                     patients: true
//         //                 }
//         //             },
//         //             practices: {
//         //                 where: {
//         //                     practiceId: auth.practice.practiceId
//         //                 },
//         //                 select: {
//         //                     role: true,
//         //                     status: true
//         //                 }
//         //             }
//         //         },
//         //         orderBy: [
//         //             { role: 'asc' },
//         //             { fullName: 'asc' }
//         //         ],
//         //         skip: (page - 1) * limit,
//         //         take: limit
//         //     }),
//         //     prisma.user.count({ where: whereCondition })
//         // ]);
//
//         const totalPages = Math.ceil(total / limit);
//         const hasMore = page < totalPages;
//         const hasPrev = page > 1;
//
//         // Transform the data for the frontend
//         const transformedUsers = users.map(user => ({
//             id: user.id,
//             clerkUserId: user.clerkUserId,
//             email: user.email,
//             fullName: user.fullName,
//             phone: user.phone,
//             role: user.role,
//             practiceRole: user.practices[0]?.role,
//             status: user.practices[0]?.status,
//             patientCount: user._count.patients,
//             createdAt: user.createdAt.toISOString()
//         }));
//
//         return {
//             success: true,
//             data: transformedUsers,
//             pagination: {
//                 total,
//                 currentPage: page,
//                 totalPages,
//                 hasMore,
//                 hasPrev,
//                 limit
//             }
//         };
//     } catch (error: any) {
//         console.error("Error fetching practice users:", error);
//         return {
//             success: false,
//             error: error.message || "Failed to fetch practice users"
//         };
//     }
// }

/**
 * Get user by ID
 */
export async function getUserById(userId: string): Promise<ActionResponse<any>> {
    const auth = await validateAuthentication();

    if (!auth.success) {
        return {
            success: false,
            error: auth.error || "Authentication failed"
        };
    }

    try {
        // First check if the user is part of the same practice
        const practiceMember = await prisma.practiceMember.findFirst({
            where: {
                userId,
                practiceId: auth.practice.practiceId,
            }
        });

        if (!practiceMember) {
            return {
                success: false,
                error: "User not found in this practice"
            };
        }

        const user = await prisma.user.findUnique({
            where: {
                id: userId
            },
            select: {
                id: true,
                clerkUserId: true,
                email: true,
                fullName: true,
                phone: true,
                role: true,
                createdAt: true,
                updatedAt: true,
                practices: {
                    where: {
                        practiceId: auth.practice.practiceId
                    },
                    select: {
                        id: true,
                        role: true,
                        status: true,
                        practice: {
                            select: {
                                id: true,
                                name: true
                            }
                        }
                    }
                },
                _count: {
                    select: {
                        patients: true,
                        progressNotes: true,
                        createdActivities: true
                    }
                }
            }
        });

        if (!user) {
            return {
                success: false,
                error: "User not found"
            };
        }

        return {
            success: true,
            data: {
                ...user,
                createdAt: user.createdAt.toISOString(),
                updatedAt: user.updatedAt.toISOString(),
                practiceMember: user.practices[0] || null
            }
        };
    } catch (error: any) {
        console.error("Error fetching user:", error);
        return {
            success: false,
            error: error.message || "Failed to fetch user"
        };
    }
}

/**
 * Update a user's details in both Clerk and the application database
 */
// export async function updateUser(userId: string, data: {
//     fullName?: string;
//     email?: string;
//     phone?: string;
//     role?: "ADMIN" | "THERAPIST" | "STAFF";
// }): Promise<ActionResponse<any>> {
//     const auth = await validateAuthentication();
//
//     if (!auth.success) {
//         return {
//             success: false,
//             error: auth.error || "Authentication failed"
//         };
//     }
//
//     // Only admins can update user roles
//     const isAdminUpdate = data.role !== undefined;
//     if (isAdminUpdate && auth.practice.role !== "ADMIN") {
//         return {
//             success: false,
//             error: "Unauthorized - Only practice administrators can update user roles"
//         };
//     }
//
//     try {
//         // First check if the user is part of the same practice
//         const practiceMember = await prisma.practiceMember.findFirst({
//             where: {
//                 userId,
//                 practiceId: auth.practice.practiceId
//             },
//             include: {
//                 user: {
//                     select: {
//                         clerkUserId: true
//                     }
//                 }
//             }
//         });
//
//         if (!practiceMember) {
//             return {
//                 success: false,
//                 error: "User not found in this practice"
//             };
//         }
//
//         // Update in Clerk if name or email changed
//         if (data.fullName || data.email) {
//             try {
//                 const params: any = {};
//
//                 if (data.fullName) {
//                     const nameParts = data.fullName.split(' ');
//                     params.firstName = nameParts[0];
//                     params.lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
//                 }
//
//                 if (data.email) {
//                     params.emailAddress = [data.email];
//                 }
//
//                 await clerkClient.users.updateUser(practiceMember.user.clerkUserId, params);
//             } catch (error: any) {
//                 console.error("Error updating user in Clerk:", error);
//                 return {
//                     success: false,
//                     error: error.message || "Failed to update user in authentication system"
//                 };
//             }
//         }
//
//         // Update in database
//         const updatedUser = await prisma.user.update({
//             where: {
//                 id: userId
//             },
//             data: {
//                 ...(data.fullName && { fullName: data.fullName }),
//                 ...(data.email && { email: data.email }),
//                 ...(data.phone && { phone: data.phone }),
//                 ...(data.role && { role: data.role })
//             }
//         });
//
//         // If role is being updated, also update practice member role
//         if (data.role) {
//             await prisma.practiceMember.update({
//                 where: {
//                     id: practiceMember.id
//                 },
//                 data: {
//                     role: data.role
//                 }
//             });
//         }
//
//         revalidatePath(`/dashboard/practice/users`);
//         revalidatePath(`/dashboard/practice/users/${userId}`);
//
//         return {
//             success: true,
//             data: {
//                 ...updatedUser,
//                 createdAt: updatedUser.createdAt.toISOString(),
//                 updatedAt: updatedUser.updatedAt.toISOString()
//             },
//             message: "User updated successfully"
//         };
//     } catch (error: any) {
//         console.error("Error updating user:", error);
//         return {
//             success: false,
//             error: error.message || "Failed to update user"
//         };
//     }
// }

/**
 * Remove a user from a practice
 */
// export async function removeUserFromPractice(userId: string): Promise<ActionResponse<void>> {
//     const auth = await validateAuthentication();
//
//     if (!auth.success) {
//         return {
//             success: false,
//             error: auth.error || "Authentication failed"
//         };
//     }
//
//     // Only admins can remove users
//     if (auth.practice.role !== "ADMIN") {
//         return {
//             success: false,
//             error: "Unauthorized - Only practice administrators can remove users"
//         };
//     }
//
//     try {
//         // Find the practice member
//         const practiceMember = await prisma.practiceMember.findFirst({
//             where: {
//                 userId,
//                 practiceId: auth.practice.practiceId
//             },
//             include: {
//                 user: {
//                     select: {
//                         role: true
//                     }
//                 }
//             }
//         });
//
//         if (!practiceMember) {
//             return {
//                 success: false,
//                 error: "User not found in this practice"
//             };
//         }
//
//         // Prevent removing the last admin
//         if (practiceMember.role === "ADMIN") {
//             const adminCount = await prisma.practiceMember.count({
//                 where: {
//                     practiceId: auth.practice.practiceId,
//                     role: "ADMIN",
//                     status: "ACTIVE"
//                 }
//             });
//
//             if (adminCount <= 1) {
//                 return {
//                     success: false,
//                     error: "Cannot remove the last administrator from this practice"
//                 };
//             }
//         }
//
//         // Update the practice member status to INACTIVE
//         await prisma.practiceMember.update({
//             where: {
//                 id: practiceMember.id
//             },
//             data: {
//                 status: "INACTIVE"
//             }
//         });
//
//         revalidatePath(`/dashboard/practice/users`);
//
//         return {
//             success: true,
//             message: "User removed from practice successfully"
//         };
//     } catch (error: any) {
//         console.error("Error removing user from practice:", error);
//         return {
//             success: false,
//             error: error.message || "Failed to remove user from practice"
//         };
//     }
// }