"use server";

import { prisma } from "@/app/db";
import PDFService from "@/services/PDFService";
import S3Service from "@/services/S3Service";
import { auth } from "@clerk/nextjs/server";
import { $Enums, ActivityDifficulty, AgeRange } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import ActivityType = $Enums.ActivityType;

const s3Service = S3Service.getInstance();
const pdfService = PDFService.getInstance();

// Validation schemas
const activitySchema = z.object({
    name: z.string().min(2, "Name is required"),
    description: z.string().min(10, "Description is required"),
    type: z.enum(["SPEECH", "LANGUAGE", "COGNITIVE", "MOTOR", "SOCIAL", "OTHER"]),
    difficulty: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"]),
    ageRange: z.enum(["TODDLER", "PRESCHOOL", "CHILD", "TEENAGER", "ADULT"]),
    isPublic: z.boolean().default(true),
    files: z.array(z.instanceof(File)).optional(),
    categoryIds: z.array(z.string()).optional(),
});

type ActivityFormData = z.infer<typeof activitySchema>;

type ActivityInput = {
    name: string;
    description: string;
    type: "SPEECH" | "LANGUAGE" | "COGNITIVE" | "MOTOR" | "SOCIAL" | "OTHER";
    difficulty: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT";
    ageRange: "TODDLER" | "PRESCHOOL" | "CHILD" | "TEENAGER" | "ADULT";
    isPublic: boolean;
    files: File[];
};


/**
 * Create a new activity
 */

import { fileUploadRateLimiter, validateFile, validateFileContentAsync } from "@/lib/security/fileValidation";
import { sanitizeHtml, sanitizeInput } from "@/lib/security/inputValidation";
import { Buffer } from "buffer";
import fs from "fs/promises";
import path from "path";

// Define ActivityType for type safety

export async function createActivity(formData: FormData) {

    try {
        // Get user authentication
        const { userId } = await auth();
        if (!userId) {
            return { success: false, error: "Unauthorized" };
        }

        console.log(formData);

        // Extract and sanitize data from FormData
        const name = sanitizeInput(formData.get("name") as string, 100);
        const description = sanitizeHtml(formData.get("description") as string);
        const type = (formData.get("type") as string) || "OTHER";
        const difficulty = (formData.get("difficulty") as string) || "BEGINNER";
        const ageRange = (formData.get("ageRange") as string) || "ADULT";
        const phoneme = sanitizeInput(formData.get("phoneme") as string, 50);

        // Validate required fields
        if (!name || name.length < 3) {
            return { success: false, error: "Nome deve ter pelo menos 3 caracteres" };
        }

        if (!description || description.length < 10) {
            return { success: false, error: "Descrição deve ter pelo menos 10 caracteres" };
        }

        // Create activity in database
        const activity = await prisma.activity.create({
            data: {
                name,
                description,
                phoneme,
                type: type as ActivityType,
                difficulty: difficulty as "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT",
                ageRange: ageRange as "TODDLER" | "PRESCHOOL" | "CHILD" | "TEENAGER" | "ADULT",
                createdBy: { connect: { clerkUserId: userId } },
                categories: {
                    connect: {
                        id: "216bd108-39d2-4f7e-a6fd-49b2a1b1f2e9",
                    },
                },
            },
        });

        // Extract files from FormData
        const fileEntries = Array.from(formData.entries())
            .filter(([key]) => key.startsWith("file-"))
            .map(([_, file]) => file);

        // Process files with security validation
        if (fileEntries.length > 0) {
            const user = await prisma.user.findUnique({
                where: { clerkUserId: userId },
                select: { id: true },
            });

            if (user) {
                // Check rate limiting
                const rateLimitCheck = fileUploadRateLimiter.canUpload(userId);
                if (!rateLimitCheck.allowed) {
                    return { success: false, error: rateLimitCheck.error };
                }

                // Load the app logo
                let logoBuffer: Buffer;
                try {
                    const logoPath = path.join(process.cwd(), "public", "logo.png"); // Adjust path as needed
                    logoBuffer = await fs.readFile(logoPath);
                } catch (error) {
                    console.error("Error loading logo:", error);
                    throw new Error("Failed to load watermark logo");
                }

                for (const file of fileEntries) {
                    if (!(file instanceof File)) continue;

                    // Validate file security
                    const fileValidation = validateFile(file as any);
                    if (!fileValidation.valid) {
                        console.error("File validation failed:", fileValidation.error);
                        return { success: false, error: fileValidation.error };
                    }

                    // Validate file content
                    const contentValidation = await validateFileContentAsync(file as any);
                    if (!contentValidation.valid) {
                        console.error("File content validation failed:", contentValidation.error);
                        return { success: false, error: contentValidation.error };
                    }

                    let s3Result: any;

                    try {
                        const buffer = Buffer.from(await file.arrayBuffer());
                        const safeFilename = fileValidation.sanitizedFilename || file.name;

                        if (file.type === "application/pdf") {
                            s3Result = await pdfService.watermarkAndUploadPDF(
                                buffer,
                                logoBuffer, // Pass the logo Buffer
                                "Fomosaas", // Keep original text watermark
                                `${activity.id}/${safeFilename}`,
                                {
                                    logoScale: 0.5, // 10% of original logo size
                                    tileSpacing: 150, // 150px between logos
                                    logoOpacity: 0.2, // Subtle transparency
                                    logoRotation: 30, // 30-degree rotation
                                }
                            );
                        } else {
                            s3Result = await s3Service.uploadFile(
                                `${activity.id}/${safeFilename}`,
                                buffer,
                                file.type
                            );
                        }

                        await prisma.activityFile.create({
                            data: {
                                activityId: activity.id,
                                name: safeFilename,
                                s3Key: `${activity.id}/${safeFilename}`,
                                s3Url: s3Result.Location || "",
                                fileType: file.type,
                                sizeInBytes: buffer.length,
                                uploadedById: user.id,
                            },
                        });
                    } catch (fileError) {
                        console.error("Error processing file:", fileError);
                        return { success: false, error: "Erro ao processar arquivo. Tente novamente." };
                    }
                }
            }
        }

        revalidatePath("/activities");
        revalidatePath("/dashboard/games");

        return { success: true, activity };
    } catch (error) {
        console.error("Error creating activity:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to create activity",
        };
    }
}
// Separate function for file uploads to avoid serialization issues
// async function uploadActivityFiles(activityId: string, files: File[], userId: string) {
//     if (!files || !Array.isArray(files) || files.length === 0) return;
//
//     try {
//         await Promise.all(
//             files.map(async (file) => {
//                 const buffer = Buffer.from(await file.arrayBuffer());
//                 const s3Result = await s3Service.uploadFile(
//                     "activities",
//                     `${activityId}/${file.name}`,
//                     buffer,
//                     file.type
//                 );
//
//                 const user = await prisma.user.findUnique({
//                     where: { clerkUserId: userId },
//                 });
//
//                 if (!user) throw new Error("User not found");
//
//                 await prisma.activityFile.create({
//                     data: {
//                         activityId: activityId,
//                         name: file.name,
//                         s3Key: `activities/${activityId}/${file.name}`,
//                         s3Url: s3Result.Location || "",
//                         fileType: file.type,
//                         sizeInBytes: buffer.length,
//                         uploadedById: user.id,
//                     },
//                 });
//             })
//         );
//     } catch (error) {
//         console.error("Error uploading files:", error);
//         throw error;
//     }
// }


/**
 * Get activities with filtering and pagination
 */
export async function getActivities({
                                        page = 1,
                                        limit = 10,
                                        type,
                                        difficulty,
                                        ageRange,
                                        categoryId,
                                        searchTerm,
                                    }: {
    page?: number;
    limit?: number;
    type?: string;
    difficulty?: string;
    ageRange?: string;
    categoryId?: string;
    searchTerm?: string;
}) {
    try {
        // Build filter conditions
        const where: any = { isPublic: true };

        if (type) where.type = type;
        if (difficulty) where.difficulty = difficulty;
        if (ageRange) where.ageRange = ageRange;
        if (searchTerm) {
            where.OR = [
                { name: { contains: searchTerm, mode: 'insensitive' } },
                { description: { contains: searchTerm, mode: 'insensitive' } },
            ];
        }
        if (categoryId) {
            where.categories = { some: { id: categoryId } };
        }

        // Count total for pagination
        const total = await prisma.activity.count({ where });

        // Fetch activities with pagination
        const activities = await prisma.activity.findMany({
            where,
            include: {
                files: { take: 1 }, // Just get first file for thumbnail
                categories: true,
                createdBy: { select: { fullName: true } },
            },
            take: limit,
            skip: (page - 1) * limit,
            orderBy: { createdAt: 'desc' },
        });

        return {
            success: true,
            activities,
            pagination: {
                total,
                pages: Math.ceil(total / limit),
                page,
                limit
            }
        };
    } catch (error) {
        console.error("Error fetching activities:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to fetch activities"
        };
    }
}

/**
 * Update an existing activity
 */
// export async function updateActivity(id: string, formData: ActivityFormData) {
//     try {
//         // Validate user authentication
//         const { userId } = await auth();
//         if (!userId) {
//             throw new Error("Unauthorized");
//         }
//
//         // Check if activity exists and user has permission
//         const activity = await prisma.activity.findUnique({
//             where: { id },
//             include: { createdBy: true },
//         });
//
//         if (!activity) {
//             throw new Error("Activity not found");
//         }
//
//         if (activity.createdBy.clerkUserId !== userId) {
//             throw new Error("You don't have permission to update this activity");
//         }
//
//         // Validate form data
//         const validatedData = activitySchema.parse(formData);
//
//         // Update activity
//         const updatedActivity = await prisma.activity.update({
//             where: { id },
//             data: {
//                 name: validatedData.name,
//                 description: validatedData.description,
//                 // type: validatedData.type,
//                 // difficulty: validatedData.difficulty,
//                 // ageRange: validatedData.ageRange,
//                 isPublic: validatedData.isPublic,
//                 categories: validatedData.categoryIds
//                     ? {
//                         set: [], // Clear existing categories
//                         connect: validatedData.categoryIds.map((id) => ({ id })),
//                     }
//                     : undefined,
//             },
//         });
//
//         // Upload new files if any
//         if (validatedData.files && validatedData.files.length > 0) {
//             await Promise.all(
//                 validatedData.files.map(async (file) => {
//                     const buffer = Buffer.from(await file.arrayBuffer());
//                     const s3Result = await s3Service.uploadFile(
//                         "activities",
//                         `${activity.id}/${file.name}`,
//                         buffer,
//                         file.type
//                     );
//
//                     // Create file record in database
//                     await prisma.activityFile.create({
//                         data: {
//                             activityId: activity.id,
//                             name: file.name,
//                             s3Key: `activities/${activity.id}/${file.name}`,
//                             s3Url: s3Result.Location || "",
//                             fileType: file.type,
//                             sizeInBytes: buffer.length,
//                             uploadedById: (
//                                 await prisma.user.findUnique({
//                                     where: { clerkUserId: userId },
//                                 })
//                             )?.id as string,
//                         },
//                     });
//                 })
//             );
//         }
//
//         revalidatePath(`/activities/${id}`);
//         revalidatePath("/activities");
//
//         return { success: true, activity: updatedActivity };
//     } catch (error) {
//         console.error("Error updating activity:", error);
//         return {
//             success: false,
//             error: error instanceof Error ? error.message : "Failed to update activity"
//         };
//     }
// }

/**
 * Delete an activity
 */
export async function deleteActivity(id: string) {
    try {
        // Validate user authentication
        const { userId } = await auth();
        if (!userId) {
            throw new Error("Unauthorized");
        }

        // Check if activity exists and user has permission
        const activity = await prisma.activity.findUnique({
            where: { id },
            include: { createdBy: true, files: true },
        });

        if (!activity) {
            throw new Error("Activity not found");
        }

        if (activity.createdBy.clerkUserId !== userId) {
            throw new Error("You don't have permission to delete this activity");
        }

        // Delete associated files from S3
        if (activity.files.length > 0) {
            await Promise.all(
                activity.files.map(async (file) => {
                    // Extract the file key from the S3Url or use the s3Key directly
                    await s3Service.deleteFile("activities", `${activity.id}/${file.name}`);
                })
            );
        }

        // Delete the activity and its associated files from the database
        // Prisma will automatically delete associated files due to the relation
        await prisma.activity.delete({
            where: { id },
        });

        revalidatePath("/activities");
        return { success: true };
    } catch (error) {
        console.error("Error deleting activity:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to delete activity"
        };
    }
}

/**
 * Delete an activity file
 */
export async function deleteActivityFile(activityId: string, fileId: string) {
    try {
        // Validate user authentication
        const { userId } = await auth();
        if (!userId) {
            throw new Error("Unauthorized");
        }

        // Check if activity and file exist
        const file = await prisma.activityFile.findUnique({
            where: { id: fileId },
            include: { activity: { include: { createdBy: true } } },
        });

        if (!file || file.activityId !== activityId) {
            throw new Error("File not found");
        }

        if (file.activity.createdBy.clerkUserId !== userId) {
            throw new Error("You don't have permission to delete this file");
        }

        // Delete file from S3
        await s3Service.deleteFile("activities", `${activityId}/${file.name}`);

        // Delete file record from database
        await prisma.activityFile.delete({
            where: { id: fileId },
        });

        revalidatePath(`/activities/${activityId}`);
        return { success: true };
    } catch (error) {
        console.error("Error deleting activity file:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to delete file"
        };
    }
}



export interface GetActivitiesByPhonemeParams {
    phoneme?: string
    type?:  keyof typeof ActivityType
    includePrivate?: boolean
    limit?: number
    cursor?: string
    categoryIds?: string[]
    types?: ActivityType[]
    difficulties?: ActivityDifficulty[]
    ageRanges?: AgeRange[]
}

export async function getActivitiesByPhoneme({
                                                 phoneme,
                                                 includePrivate = false,
                                                 limit = 10,
                                                 cursor,
                                                 categoryIds = [],
                                                 types = [],
                                                 difficulties = [],
                                                 ageRanges = [],
                                             }: GetActivitiesByPhonemeParams) {
    try {
        const { userId } = await auth()

        if (!phoneme) {
            return {
                items: [],
                nextCursor: null,
            }
        }

        // Build where conditions
        const where: any = {
            phoneme,
            // If includePrivate is true and user is authenticated, include their private activities
            // Otherwise only include public activities
            OR: [
                { isPublic: true },
                ...(includePrivate && userId ? [{ createdById: userId, isPublic: false }] : []),
            ],
        }

        // Add optional filters
        if (categoryIds.length > 0) {
            where.categories = {
                some: {
                    categoryId: {
                        in: categoryIds,
                    },
                },
            }
        }

        if (types.length > 0) {
            where.type = {
                in: types,
            }
        }

        if (difficulties.length > 0) {
            where.difficulty = {
                in: difficulties,
            }
        }

        if (ageRanges.length > 0) {
            where.ageRange = {
                in: ageRanges,
            }
        }

        // If cursor is provided, fetch items after that cursor
        if (cursor) {
            where.id = {
                gt: cursor,
            }
        }

        // Query activities
        const items = await prisma.activity.findMany({
            where,
            take: limit + 1, // Fetch one more to determine if there are more items
            orderBy: {
                createdAt: 'desc',
            },
            include: {
                files: true,
            },
        })

        // Check if there are more items
        let nextCursor: string | null = null
        if (items.length > limit) {
            const nextItem = items.pop()
            nextCursor = nextItem?.id ?? null
        }

        return {
            items,
            nextCursor,
        }
    } catch (error) {
        console.error("Failed to fetch activities by phoneme:", error)
        throw new Error("Failed to fetch activities by phoneme")
    }
}


export async function getActivitiesByType({
                                                 type,
                                                 includePrivate = false,
                                                 limit = 10,
                                                 cursor,
                                                 categoryIds = [],
                                                 types = [],
                                                 difficulties = [],
                                                 ageRanges = [],
                                             }: GetActivitiesByPhonemeParams) {
    try {
        const { userId } = await auth()

        if (!type) {
            return {
                items: [],
                nextCursor: null,
            }
        }

        // Build where conditions
        const where: any = {
            type: type as ActivityType,
            // If includePrivate is true and user is authenticated, include their private activities
            // Otherwise only include public activities
            OR: [
                { isPublic: true },
                ...(includePrivate && userId ? [{ createdById: userId, isPublic: false }] : []),
            ],
        }

        // Add optional filters
        if (categoryIds.length > 0) {
            where.categories = {
                some: {
                    categoryId: {
                        in: categoryIds,
                    },
                },
            }
        }

        if (types.length > 0) {
            where.type = {
                in: types,
            }
        }

        if (difficulties.length > 0) {
            where.difficulty = {
                in: difficulties,
            }
        }

        if (ageRanges.length > 0) {
            where.ageRange = {
                in: ageRanges,
            }
        }

        // If cursor is provided, fetch items after that cursor
        if (cursor) {
            where.id = {
                gt: cursor,
            }
        }

        // Query activities
        const items = await prisma.activity.findMany({
            where,
            take: limit + 1, // Fetch one more to determine if there are more items
            orderBy: {
                createdAt: 'desc',
            },
            include: {
                files: true,
            },
        })

        // Check if there are more items
        let nextCursor: string | null = null
        if (items.length > limit) {
            const nextItem = items.pop()
            nextCursor = nextItem?.id ?? null
        }

        return {
            items,
            nextCursor,
        }
    } catch (error) {
        console.error("Failed to fetch activities by type:", error)
        throw new Error("Failed to fetch activities by type")
    }
}



// get activities by type
// export async function getActivitiesByType(type: string) {
//     try {
//
//         console.log(type)
//
//         const activities = await prisma.activity.findMany({
//             where: { type: type as ActivityType },
//             include: {
//                 files: true,
//             },
//         })
//
//         return activities
//     } catch (error) {
//         console.error("Failed to fetch activities by type:", error)
//         throw new Error("Failed to fetch activities by type")
//     }
// }

/**
 * Get activity categories
 */
export async function getActivityCategories() {
    try {
        const categories = await prisma.activityCategory.findMany({
            orderBy: { name: 'asc' },
        });

        return { success: true, categories };
    } catch (error) {
        console.error("Error fetching categories:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to fetch categories"
        };
    }
}