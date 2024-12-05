// lib/services/s3.service.ts
import {
    S3Client,
    CreateBucketCommand,
    PutBucketCorsCommand,
    PutBucketPolicyCommand,
    HeadBucketCommand
} from "@aws-sdk/client-s3"

export class S3Service {
    private s3Client: S3Client
    private region: string

    constructor() {
        this.region = process.env.AWS_REGION || 'us-east-1'
        this.s3Client = new S3Client({
            region: this.region,
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
            }
        })
    }

    private getBucketName(practiceId: string): string {
        // Convert practice ID to valid bucket name (lowercase, no special chars)
        return `practice-${practiceId.toLowerCase()}`
    }

    async createBucketForPractice(practiceId: string) {
        try {
            const bucketName = this.getBucketName(practiceId)

            // Check if bucket already exists
            try {
                await this.s3Client.send(new HeadBucketCommand({ Bucket: bucketName }))
                return {
                    success: true,
                    message: "Bucket already exists",
                    bucketName
                }
            } catch (error) {
                // Bucket doesn't exist, proceed with creation
            }

            // Create bucket
            await this.s3Client.send(new CreateBucketCommand({
                Bucket: bucketName,
                CreateBucketConfiguration: {
                    LocationConstraint: 'us-west-1'
                }
            }))

            // Set CORS policy
            await this.s3Client.send(new PutBucketCorsCommand({
                Bucket: bucketName,
                CORSConfiguration: {
                    CORSRules: [
                        {
                            AllowedHeaders: ["*"],
                            AllowedMethods: ["GET", "PUT", "POST", "DELETE", "HEAD"],
                            AllowedOrigins: [process.env.NEXT_PUBLIC_APP_URL!],
                            ExposeHeaders: ["ETag"],
                            MaxAgeSeconds: 3000
                        }
                    ]
                }
            }))

            // Set bucket policy for public read access
            const bucketPolicy = {
                Version: "2012-10-17",
                Statement: [
                    {
                        Sid: "PublicReadGetObject",
                        Effect: "Allow",
                        Principal: "*",
                        Action: ["s3:GetObject"],
                        Resource: [`arn:aws:s3:::${bucketName}/*`]
                    }
                ]
            }

            await this.s3Client.send(new PutBucketPolicyCommand({
                Bucket: bucketName,
                Policy: JSON.stringify(bucketPolicy)
            }))

            return {
                success: true,
                message: "Bucket created successfully",
                bucketName
            }

        } catch (error) {
            console.error("Error creating S3 bucket:", error)
            return {
                success: false,
                error: "Failed to create S3 bucket",
                details: error
            }
        }
    }

    // Helper method to check if a bucket exists
    async bucketExists(practiceId: string): Promise<boolean> {
        try {
            const bucketName = this.getBucketName(practiceId)
            await this.s3Client.send(new HeadBucketCommand({ Bucket: bucketName }))
            return true
        } catch (error) {
            return false
        }
    }

    // Get bucket name for a practice
    getBucketNameForPractice(practiceId: string): string {
        return this.getBucketName(practiceId)
    }
}