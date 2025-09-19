'use server'

import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { auth } from "@clerk/nextjs/server";
import { prisma } from '@/app/db';
import { DownloadLimitService } from '@/services/downloadLimitService';
interface GetFileDownloadUrlParams {
    fileId: string;
    activityId?: string;
}

export async function getFileDownloadUrl({ fileId, activityId }: GetFileDownloadUrlParams) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return { success: false, error: "Unauthorized" };
        }

        const bucketName = process.env.AWS_S3_BUCKET_NAME;
        if (!bucketName) {
            console.error("AWS_S3_BUCKET_NAME environment variable is not set");
            return { success: false, error: "Server configuration error (bucket name missing)" };
        }

        // Find the file in the database
        const file = await prisma.activityFile.findUnique({
            where: { id: fileId },
            include: {
                activity: {
                    select: {
                        id: true,
                        createdById: true,
                        isPublic: true,
                    }
                }
            }
        });

        if (!file) {
            return { success: false, error: "File not found" };
        }

        // Check permission - user can download if:
        // const isCreator = file.activity.createdById === userId;
        // const isPublic = file.activity.isPublic;
        //
        // if (!isCreator && !isPublic) {
        //     return { success: false, error: "You don't have permission to download this file" };
        // }

        // Initialize S3 client
        const s3Client = new S3Client({
            region: process.env.AWS_REGION || 'us-east-1',
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
            },
        });

        // Set content disposition to force download with original filename
        const contentDisposition = `attachment; filename="${encodeURIComponent(file.name)}"`;

        // Create the command to get the object
        const command = new GetObjectCommand({
            Bucket: bucketName,
            Key: file.s3Key,
            ResponseContentDisposition: contentDisposition,
        });
        // Generate a pre-signed URL that expires in 5 minutes (300 seconds)
        const signedUrl = await getSignedUrl(s3Client, command, {
            expiresIn: 300
        });

        // Record download in our tracking system
        try {
            // Get user from database
            const user = await prisma.user.findUnique({
                where: { clerkUserId: userId }
            })

            if (user) {
                // Check if user is Pro
                const isPro = await DownloadLimitService.hasProAccess(user.id)
                
                if (!isPro) {
                    // Check download limits for free users
                    const limit = await DownloadLimitService.checkDownloadLimit(user.id)
                    
                    if (!limit.canDownload) {
                        return { 
                            success: false, 
                            error: 'Download limit reached. Upgrade to Pro for unlimited downloads.' 
                        }
                    }
                }

                // Record the download
                await DownloadLimitService.recordDownload(
                    user.id,
                    file.activity.id || activityId || 'unknown',
                    file.name,
                    file.sizeInBytes,
                    undefined, // IP not available in server action
                    undefined, // User agent not available in server action
                    isPro // Skip limit increment for Pro users
                )
            }
        } catch (downloadError) {
            console.error('Error recording download:', downloadError)
            // Don't fail the download if tracking fails
        }

        return {
            success: true,
            url: signedUrl,
            fileName: file.name,
            fileType: file.fileType,
            fileSizeInBytes: file.sizeInBytes
        };
    } catch (error) {
        console.error("Error generating presigned URL:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to generate download URL"
        };
    }
}