"use server"

import { prisma } from "@/db"
import { revalidatePath } from "next/cache"
import { currentUser } from "@clerk/nextjs/server"
import { z } from "zod"
import { UserRole } from "@prisma/client"
import {validateAuthentication} from "@/lib/actions/authValidation.action";
import {PracticeInput, practiceSchema} from "@/lib/schema";


// Practice creation schema


/**
 * Create a new practice
 */
export async function createPractice(data: PracticeInput): Promise<ActionResponse<any>> {
    try {
        // Get current user from Clerk
        const user = await currentUser();
        if (!user || !user.id) {
            return {
                success: false,
                error: "Unauthorized - You must be logged in to create a practice"
            };
        }

        // Validate input data
        const validationResult = practiceSchema.safeParse(data);
        if (!validationResult.success) {
            return {
                success: false,
                error: "Validation failed",
                data: validationResult.error.flatten().fieldErrors
            };
        }

        // Start a transaction to create practice and associate user
        const result = await prisma.$transaction(async (tx) => {
            // Create the practice
            const practice = await tx.practice.create({
                data: {
                    ...validationResult.data,
                }
            });

            // Get or create user in our database
            let dbUser = await tx.user.findUnique({
                where: { clerkUserId: user.id }
            });

            if (!dbUser) {
                // If user doesn't exist in our DB yet, create them
                dbUser = await tx.user.create({
                    data: {
                        clerkUserId: user.id,
                        email: user.emailAddresses[0]?.emailAddress || "",
                        fullName: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
                        role: UserRole.OWNER
                    }
                });
            }

            // Create practice membership with OWNER role
            await tx.practiceMember.create({
                data: {
                    userId: dbUser.id,
                    practiceId: practice.id,
                    role: UserRole.OWNER,
                    status: "ACTIVE"
                }
            });

            return practice;
        });

        revalidatePath('/dashboard/practice');

        return {
            success: true,
            data: result,
            message: "Practice created successfully",
            redirectUrl: `/dashboard/practice/${result.id}`
        };
    } catch (error: any) {
        console.error("Error creating practice:", error);
        return {
            success: false,
            error: error.message || "Failed to create practice"
        };
    }
}

/**
 * Get all practices the authenticated user belongs to
 */
export async function getUserPractices(): Promise<ActionResponse<any[]>> {
    try {
        const user = await currentUser();
        if (!user || !user.id) {
            return {
                success: false,
                error: "Unauthorized - You must be logged in to view practices"
            };
        }

        // Get the user's ID in our database
        const dbUser = await prisma.user.findUnique({
            where: { clerkUserId: user.id },
            select: { id: true }
        });

        if (!dbUser) {
            return {
                success: false,
                error: "User not found in database"
            };
        }

        // Get all practices the user is a member of
        const practiceMembers = await prisma.practiceMember.findMany({
            where: {
                userId: dbUser.id,
                status: "ACTIVE"
            },
            include: {
                practice: true
            },
            orderBy: {
                practice: {
                    name: 'asc'
                }
            }
        });

        const practices = practiceMembers.map(member => ({
            ...member.practice,
            role: member.role,
            // memberSince: member.createdAt.toISOString()
        }));

        return {
            success: true,
            data: practices
        };
    } catch (error: any) {
        console.error("Error fetching user practices:", error);
        return {
            success: false,
            error: error.message || "Failed to fetch practices"
        };
    }
}

/**
 * Get a practice by ID
 */
export async function getPracticeById(practiceId: string): Promise<ActionResponse<any>> {
    const auth = await validateAuthentication();

    if (!auth.success) {
        return {
            success: false,
            error: auth.error || "Authentication failed"
        };
    }

    try {
        // Check if user has access to this practice
        if (auth.practice.practiceId !== practiceId) {
            // Check if user is a member of the requested practice
            const practiceMember = await prisma.practiceMember.findFirst({
                where: {
                    practiceId,
                    userId: auth.user.id,
                    status: "ACTIVE"
                }
            });

            if (!practiceMember) {
                return {
                    success: false,
                    error: "You do not have access to this practice"
                };
            }
        }

        const practice = await prisma.practice.findUnique({
            where: {
                id: practiceId
            },
            include: {
                _count: {
                    select: {
                        members: true,
                        patients: true,
                        activities: true
                    }
                }
            }
        });

        if (!practice) {
            return {
                success: false,
                error: "Practice not found"
            };
        }

        return {
            success: true,
            data: {
                ...practice,
                createdAt: practice.createdAt.toISOString(),
                updatedAt: practice.updatedAt.toISOString()
            }
        };
    } catch (error: any) {
        console.error("Error fetching practice:", error);
        return {
            success: false,
            error: error.message || "Failed to fetch practice"
        };
    }
}

/**
 * Update a practice
 */
// export async function updatePractice(
//     practiceId: string,
//     data: z.infer<typeof practiceSchema>
// ): Promise<ActionResponse<any>> {
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
//         // Check if user has admin access to this practice
//         const practiceMember = await prisma.practiceMember.findFirst({
//             where: {
//                 practiceId,
//                 userId: auth.user.id,
//                 status: "ACTIVE",
//                 role: {
//                     in: [ UserRole.OWNER]
//                     // in: [UserRole.ADMIN, UserRole.OWNER]
//                 }
//             }
//         });
//
//         if (!practiceMember) {
//             return {
//                 success: false,
//                 error: "You do not have permission to update this practice"
//             };
//         }
//
//         // Validate input data
//         const validationResult = practiceSchema.safeParse(data);
//         if (!validationResult.success) {
//             return {
//                 success: false,
//                 error: "Validation failed",
//                 data: validationResult.error.flatten().fieldErrors
//             };
//         }
//
//         const updatedPractice = await prisma.practice.update({
//             where: {
//                 id: practiceId
//             },
//             data: validationResult.data
//         });
//
//         revalidatePath(`/dashboard/practice/${practiceId}`);
//         revalidatePath('/dashboard/practice');
//
//         return {
//             success: true,
//             data: {
//                 ...updatedPractice,
//                 createdAt: updatedPractice.createdAt.toISOString(),
//                 updatedAt: updatedPractice.updatedAt.toISOString()
//             },
//             message: "Practice updated successfully"
//         };
//     } catch (error: any) {
//         console.error("Error updating practice:", error);
//         return {
//             success: false,
//             error: error.message || "Failed to update practice"
//         };
//     }
// }

/**
 * Delete a practice (soft delete by setting active to false)
 */
// export async function deletePractice(practiceId: string): Promise<ActionResponse<void>> {
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
//         // Check if user is the owner of this practice
//         const practiceMember = await prisma.practiceMember.findFirst({
//             where: {
//                 practiceId,
//                 userId: auth.user.id,
//                 status: "ACTIVE",
//                 role: UserRole.OWNER
//             }
//         });
//
//         if (!practiceMember) {
//             return {
//                 success: false,
//                 error: "Only the practice owner can delete a practice"
//             };
//         }
//
//         // Soft delete by setting active to false
//         await prisma.practice.update({
//             where: {
//                 id: practiceId
//             },
//             data: {
//                 active: false
//             }
//         });
//
//         revalidatePath('/dashboard/practice');
//
//         return {
//             success: true,
//             message: "Practice deleted successfully",
//             redirectUrl: "/dashboard/practice"
//         };
//     } catch (error: any) {
//         console.error("Error deleting practice:", error);
//         return {
//             success: false,
//             error: error.message || "Failed to delete practice"
//         };
//     }
// }

/**
 * Get all members of a practice
 */
// export async function getPracticeMembers(
//     practiceId: string,
//     options: {
//         search?: string;
//         role?: UserRole;
//         page?: number;
//         limit?: number;
//     } = {}
// ): Promise<ActionResponse<any[]>> {
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
//         // Check if user has access to this practice
//         if (auth.practice.practiceId !== practiceId) {
//             const practiceMember = await prisma.practiceMember.findFirst({
//                 where: {
//                     practiceId,
//                     userId: auth.user.id,
//                     status: "ACTIVE"
//                 }
//             });
//
//             if (!practiceMember) {
//                 return {
//                     success: false,
//                     error: "You do not have access to this practice"
//                 };
//             }
//         }
//
//         const {
//             search = "",
//             role,
//             page = 1,
//             limit = 10
//         } = options;
//
//         const where = {
//             practiceId,
//             status: "ACTIVE",
//             ...(role && { role }),
//             ...(search && {
//                 user: {
//                     OR: [
//                         {
//                             fullName: {
//                                 contains: search,
//                                 mode: 'insensitive'
//                             }
//                         },
//                         {
//                             email: {
//                                 contains: search,
//                                 mode: 'insensitive'
//                             }
//                         }
//                     ]
//                 }
//             })
//         };
//
//         const [members, total] = await Promise.all([
//             prisma.practiceMember.findMany({
//                 where,
//                 select: {
//                     id: true,
//                     role: true,
//                     status: true,
//                     createdAt: true,
//                     user: {
//                         select: {
//                             id: true,
//                             fullName: true,
//                             email: true,
//                             phone: true,
//                             _count: {
//                                 select: {
//                                     patients: true
//                                 }
//                             }
//                         }
//                     }
//                 },
//                 orderBy: [
//                     { role: 'asc' },
//                     { user: { fullName: 'asc' } }
//                 ],
//                 skip: (page - 1) * limit,
//                 take: limit
//             }),
//             prisma.practiceMember.count({ where })
//         ]);
//
//         const totalPages = Math.ceil(total / limit);
//         const hasMore = page < totalPages;
//         const hasPrev = page > 1;
//
//         return {
//             success: true,
//             data: members.map(member => ({
//                 id: member.id,
//                 userId: member.user.id,
//                 fullName: member.user.fullName,
//                 email: member.user.email,
//                 phone: member.user.phone,
//                 role: member.role,
//                 status: member.status,
//                 patientCount: member.user._count.patients,
//                 joinedAt: member.createdAt.toISOString()
//             })),
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
//         console.error("Error fetching practice members:", error);
//         return {
//             success: false,
//             error: error.message || "Failed to fetch practice members"
//         };
//     }
// }

// /**
//  * Change a practice member's role
//  */
// export async function updatePracticeMemberRole(
//     memberId: string,
//     role: UserRole
// ): Promise<ActionResponse<any>> {
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
//         // Get the practice member to update
//         const memberToUpdate = await prisma.practiceMember.findUnique({
//             where: {
//                 id: memberId
//             },
//             select: {
//                 practiceId: true,
//                 role: true,
//                 userId: true
//             }
//         });
//
//         if (!memberToUpdate) {
//             return {
//                 success: false,
//                 error: "Practice member not found"
//             };
//         }
//
//         // Check if authenticated user has permission (must be admin or owner)
//         const authMember = await prisma.practiceMember.findFirst({
//             where: {
//                 practiceId: memberToUpdate.practiceId,
//                 userId: auth.user.id,
//                 status: "ACTIVE",
//                 role: {
//                     in: [UserRole.ADMIN, UserRole.OWNER]
//                 }
//             }
//         });
//
//         if (!authMember) {
//             return {
//                 success: false,
//                 error: "You do not have permission to change member roles"
//             };
//         }
//
//         // Check if trying to remove the last owner
//         if (memberToUpdate.role === UserRole.OWNER && role !== UserRole.OWNER) {
//             const ownersCount = await prisma.practiceMember.count({
//                 where: {
//                     practiceId: memberToUpdate.practiceId,
//                     role: UserRole.OWNER,
//                     status: "ACTIVE"
//                 }
//             });
//
//             if (ownersCount <= 1) {
//                 return {
//                     success: false,
//                     error: "Cannot remove the last owner from the practice"
//                 };
//             }
//         }
//
//         // Update the role
//         const updatedMember = await prisma.practiceMember.update({
//             where: {
//                 id: memberId
//             },
//             data: {
//                 role
//             },
//             include: {
//                 user: {
//                     select: {
//                         fullName: true
//                     }
//                 }
//             }
//         });
//
//         revalidatePath(`/dashboard/practice/${memberToUpdate.practiceId}/members`);
//
//         return {
//             success: true,
//             data: updatedMember,
//             message: `${updatedMember.user.fullName}'s role updated to ${role}`
//         };
//     } catch (error: any) {
//         console.error("Error updating practice member role:", error);
//         return {
//             success: false,
//             error: error.message || "Failed to update practice member role"
//         };
//     }
// }
//
// /**
//  * Remove a member from a practice
//  */
// export async function removePracticeMember(
//     memberId: string
// ): Promise<ActionResponse<void>> {
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
//         // Get the practice member to remove
//         const memberToRemove = await prisma.practiceMember.findUnique({
//             where: {
//                 id: memberId
//             },
//             select: {
//                 practiceId: true,
//                 role: true,
//                 userId: true
//             }
//         });
//
//         if (!memberToRemove) {
//             return {
//                 success: false,
//                 error: "Practice member not found"
//             };
//         }
//
//         // Check if authenticated user has permission (must be admin or owner)
//         const authMember = await prisma.practiceMember.findFirst({
//             where: {
//                 practiceId: memberToRemove.practiceId,
//                 userId: auth.user.id,
//                 status: "ACTIVE",
//                 role: {
//                     in: [UserRole.ADMIN, UserRole.OWNER]
//                 }
//             }
//         });
//
//         if (!authMember) {
//             return {
//                 success: false,
//                 error: "You do not have permission to remove members"
//             };
//         }
//
//         // Check if trying to remove the last owner
//         if (memberToRemove.role === UserRole.OWNER) {
//             const ownersCount = await prisma.practiceMember.count({
//                 where: {
//                     practiceId: memberToRemove.practiceId,
//                     role: UserRole.OWNER,
//                     status: "ACTIVE"
//                 }
//             });
//
//             if (ownersCount <= 1) {
//                 return {
//                     success: false,
//                     error: "Cannot remove the last owner from the practice"
//                 };
//             }
//         }
//
//         // Prevent self-removal
//         if (memberToRemove.userId === auth.user.id) {
//             return {
//                 success: false,
//                 error: "You cannot remove yourself from the practice"
//             };
//         }
//
//         // Soft delete by setting status to INACTIVE
//         await prisma.practiceMember.update({
//             where: {
//                 id: memberId
//             },
//             data: {
//                 status: "INACTIVE"
//             }
//         });
//
//         revalidatePath(`/dashboard/practice/${memberToRemove.practiceId}/members`);
//
//         return {
//             success: true,
//             message: "Member removed from practice successfully"
//         };
//     } catch (error: any) {
//         console.error("Error removing practice member:", error);
//         return {
//             success: false,
//             error: error.message || "Failed to remove practice member"
//         };
//     }
// }