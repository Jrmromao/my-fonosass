"use server"

import {prisma} from "@/db"
import {revalidatePath} from "next/cache"
// import {ActivityDifficulty, ActivityType, AgeRange, Prisma} from "@prisma/client"
import {currentUser} from "@clerk/nextjs/server";
import {Prisma} from "@prisma/client";

interface CreateActivityParams {
    name: string
    description: string
    // type: ActivityType
    // difficulty: ActivityDifficulty
    // ageRange: AgeRange
    files?: File[]
    isPublic?: boolean
}

export async function createActivity(params: CreateActivityParams) {
    try {
        const user = await currentUser()
        if (!user) {
            return { success: false, error: "Unauthorized" }
        }

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
        //         createdById: user?.id!,
        //         practiceId: 'e7e86a2c-f382-4bcf-adb1-6279f737044d',
        //
        //     }
        // })

        if (files.length > 0) {
            // File upload logic here
        }

        revalidatePath('/activities')

        return {
            success: true,
            data: {}
        }

    } catch (error) {
        console.error("Error creating activity:", error)
        return {
            success: false,
            error: "Failed to create activity"
        }
    }
}

interface GetActivitiesParams {
    search?: string
    // type?: ActivityType
    // difficulty?: ActivityDifficulty
    // ageRange?: AgeRange
    createdById?: string
}

export async function getActivities(params: GetActivitiesParams = {}) {
    try {
        const {
            search = "",
            // type,
            // difficulty,
            // ageRange,
            createdById
        } = params

        // const where: Prisma.ActivityWhereInput = {
        //     ...(search ? {
        //         OR: [
        //             { name: { contains: search, mode: 'insensitive' } },
        //             { description: { contains: search, mode: 'insensitive' } }
        //         ]
        //     } : {}),
        //     // ...(type && { type }),
        //     // ...(difficulty && { difficulty }),
        //     // ...(ageRange && { ageRange }),
        //     ...(createdById && { createdById })
        // }

        const activities = await prisma.activity.findMany({
            // where,
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
            }
        })

        return {
            success: true,
            data: activities
        }

    } catch (error) {
        console.error("Error fetching activities:", error)
        return {
            success: false,
            error: "Failed to fetch activities"
        }
    }
}