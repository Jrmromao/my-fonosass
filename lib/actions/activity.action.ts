"use server"

import { prisma } from "@/db"
import { revalidatePath } from "next/cache"
import { Prisma } from "@prisma/client"
import {validateAuthentication} from "@/lib/actions/authValidation.action";

interface CreateActivityParams {
    name: string
    description: string
    // type: ActivityType
    // difficulty: ActivityDifficulty
    // ageRange: AgeRange
    files?: File[]
    isPublic?: boolean
}

/**
 * Create a new activity
 */
export async function createActivity(params: CreateActivityParams): Promise<ActionResponse<any>> {
    const auth = await validateAuthentication()

    if (!auth.success) {
        return {
            success: false,
            error: auth.error || "Authentication failed"
        }
    }

    try {
        console.log(params)
        const {
            name,
            description,
            // type,
            // difficulty,
            // ageRange,
            files = [],
            isPublic = false
        } = params

        // save files in S3
        // create s3 bucket with the practice id as the name

        // const activity = await prisma.activity.create({
        //     data: {
        //         name: name,
        //         description: description,
        //         // type: type,
        //         // difficulty: difficulty,
        //         // ageRange: ageRange,
        //         isPublic: isPublic,
        //         createdById: auth.user.id,
        //         practiceId: auth.practice.practiceId,
        //     }
        // })

        if (files.length > 0) {
            // File upload logic here
        }

        revalidatePath('/dashboard/activities')

        return {
            success: true,
            data: {},
            message: "Activity created successfully",
            redirectUrl: `/dashboard/activities/`
        }

    } catch (error: any) {
        console.error("Error creating activity:", error)
        return {
            success: false,
            error: error.message || "Failed to create activity"
        }
    }
}

interface GetActivitiesParams {
    search?: string
    // type?: ActivityType
    // difficulty?: ActivityDifficulty
    // ageRange?: AgeRange
    createdById?: string
    page?: number
    limit?: number
}

/**
 * Get activities with optional filtering
 */
export async function getActivities(params: GetActivitiesParams = {}): Promise<ActionResponse<any[]>> {
    const auth = await validateAuthentication()

    if (!auth.success) {
        return {
            success: false,
            error: auth.error || "Authentication failed"
        }
    }

    try {
        const {
            search = "",
            // type,
            // difficulty,
            // ageRange,
            createdById,
            page = 1,
            limit = 20
        } = params

        const where: Prisma.ActivityWhereInput = {
            practiceId: auth.practice.practiceId,
            ...(search ? {
                OR: [
                    { name: { contains: search, mode: 'insensitive' } as Prisma.StringFilter<"Activity"> },
                    { description: { contains: search, mode: 'insensitive' } as Prisma.StringFilter<"Activity"> }
                ]
            } : {}),
            // ...(type && { type }),
            // ...(difficulty && { difficulty }),
            // ...(ageRange && { ageRange }),
            ...(createdById && { createdById })
        }

        const [activities, total] = await Promise.all([
            prisma.activity.findMany({
                where,
                include: {
                    createdBy: {
                        select: {
                            id: true,
                            // name: true,
                            // image: true
                        }
                    },
                    files: true,
                    categories: {
                        include: {
                            // category: true
                        }
                    },
                    _count: {
                        select: {
                            assignments: true,
                            progress: true
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                },
                skip: (page - 1) * limit,
                take: limit
            }),
            prisma.activity.count({ where })
        ])

        const totalPages = Math.ceil(total / limit)
        const hasMore = page < totalPages
        const hasPrev = page > 1

        return {
            success: true,
            data: activities,
            // pagination: {
            //     total,
            //     currentPage: page,
            //     totalPages,
            //     hasMore,
            //     hasPrev,
            //     limit
            // }
        }

    } catch (error: any) {
        console.error("Error fetching activities:", error)
        return {
            success: false,
            error: error.message || "Failed to fetch activities"
        }
    }
}

/**
 * Get activity by ID
 */
export async function getActivityById(activityId: string): Promise<ActionResponse<any>> {
    const auth = await validateAuthentication()

    if (!auth.success) {
        return {
            success: false,
            error: auth.error || "Authentication failed"
        }
    }

    try {
        const activity = await prisma.activity.findUnique({
            where: {
                id: activityId,
                practiceId: auth.practice.practiceId
            },
            include: {
                createdBy: {
                    select: {
                        id: true,
                        // name: true,
                        // image: true
                    }
                },
                files: true,
                categories: {
                    include: {
                        // category: true
                    }
                },
                _count: {
                    select: {
                        assignments: true,
                        progress: true
                    }
                }
            }
        })

        if (!activity) {
            return {
                success: false,
                error: "Activity not found"
            }
        }

        return {
            success: true,
            data: activity
        }

    } catch (error: any) {
        console.error("Error fetching activity:", error)
        return {
            success: false,
            error: error.message || "Failed to fetch activity"
        }
    }
}

/**
 * Update an existing activity
 */
export async function updateActivity(
    activityId: string,
    params: Partial<CreateActivityParams>
): Promise<ActionResponse<any>> {
    const auth = await validateAuthentication()

    if (!auth.success) {
        return {
            success: false,
            error: auth.error || "Authentication failed"
        }
    }

    try {
        // First check if activity exists and belongs to this practice
        const existingActivity = await prisma.activity.findUnique({
            where: {
                id: activityId,
                practiceId: auth.practice.practiceId
            }
        })

        if (!existingActivity) {
            return {
                success: false,
                error: "Activity not found or you don't have permission to edit it"
            }
        }

        const {
            name,
            description,
            // type,
            // difficulty,
            // ageRange,
            files = [],
            isPublic
        } = params

        const activity = await prisma.activity.update({
            where: {
                id: activityId
            },
            data: {
                ...(name && { name }),
                ...(description && { description }),
                // ...(type && { type }),
                // ...(difficulty && { difficulty }),
                // ...(ageRange && { ageRange }),
                ...(isPublic !== undefined && { isPublic })
            }
        })

        if (files.length > 0) {
            // File upload logic here
        }

        revalidatePath(`/dashboard/activities/${activityId}`)
        revalidatePath('/dashboard/activities')

        return {
            success: true,
            data: activity,
            message: "Activity updated successfully"
        }

    } catch (error: any) {
        console.error("Error updating activity:", error)
        return {
            success: false,
            error: error.message || "Failed to update activity"
        }
    }
}

/**
 * Delete an activity
 */
export async function deleteActivity(activityId: string): Promise<ActionResponse<void>> {
    const auth = await validateAuthentication()

    if (!auth.success) {
        return {
            success: false,
            error: auth.error || "Authentication failed"
        }
    }

    try {
        // First check if activity exists and belongs to this practice
        const existingActivity = await prisma.activity.findUnique({
            where: {
                id: activityId,
                practiceId: auth.practice.practiceId
            }
        })

        if (!existingActivity) {
            return {
                success: false,
                error: "Activity not found or you don't have permission to delete it"
            }
        }

        await prisma.activity.delete({
            where: {
                id: activityId
            }
        })

        revalidatePath('/dashboard/activities')

        return {
            success: true,
            message: "Activity deleted successfully",
            redirectUrl: "/dashboard/activities"
        }
    } catch (error: any) {
        console.error("Error deleting activity:", error)
        return {
            success: false,
            error: error.message || "Failed to delete activity"
        }
    }
}