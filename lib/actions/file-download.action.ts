'use server'

import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { auth } from "@clerk/nextjs/server";
import { prisma } from '@/app/db';
interface GetFileDownloadUrlParams {
    fileId: string;
    activityId?: string;
}

export async function getFileDownloadUrl({ fileId, activityId }: GetFileDownloadUrlParams) {
    try {

        console.log(fileId)
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
        const isCreator = file.activity.createdById === userId;
        const isPublic = file.activity.isPublic;

        if (!isCreator && !isPublic) {
            return { success: false, error: "You don't have permission to download this file" };
        }

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


        console.log(file.s3Key)

        const fileUrl = `companies/${file.s3Key}`
        // Create the command to get the object
        const command = new GetObjectCommand({
            Bucket: bucketName,
            Key: fileUrl,
            ResponseContentDisposition: contentDisposition,
        });
        // Generate a pre-signed URL that expires in 5 minutes (300 seconds)
        const signedUrl = await getSignedUrl(s3Client, command, {
            expiresIn: 300
        });

        // // Log the download attempt for analytics (optional)
        // await prisma.activityFileDownload.create({
        //     data: {
        //         activityFileId: file.id,
        //         userId,
        //     }
        // });

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