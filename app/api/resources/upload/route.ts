import { SecurityMiddleware } from '@/lib/security/securityMiddleware';
import { auth } from '@clerk/nextjs/server';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Apply security middleware
    const securityResult = await SecurityMiddleware.apply(request, {
      requireAuth: true,
      requireCSRF: true,
      rateLimitType: 'fileUpload',
      validateInput: false, // We'll validate the file manually
    });

    if (!securityResult.success) {
      return securityResult.response!;
    }

    const { userId } = await auth();
    if (!userId) {
      return SecurityMiddleware.createErrorResponse(
        'Authentication required',
        401
      );
    }

    // Get user from database to check admin role
    const { prisma } = await import('@/app/db');
    const user = await prisma.user.findUnique({
      where: { clerkUserId: userId },
      select: { id: true, role: true },
    });

    if (!user) {
      return SecurityMiddleware.createErrorResponse('User not found', 404);
    }

    if (user.role !== 'ADMIN') {
      return SecurityMiddleware.createErrorResponse(
        'Insufficient permissions',
        403
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const resourceId = formData.get('resourceId') as string;

    if (!file) {
      return SecurityMiddleware.createErrorResponse('No file provided', 400);
    }

    // Validate file size (50MB max)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      return SecurityMiddleware.createErrorResponse(
        'File too large. Maximum size is 50MB.',
        400
      );
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'video/mp4',
      'video/avi',
      'video/mov',
      'video/wmv',
      'audio/mp3',
      'audio/wav',
      'audio/m4a',
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
    ];

    if (!allowedTypes.includes(file.type)) {
      return SecurityMiddleware.createErrorResponse(
        'File type not allowed',
        400
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = file.name.split('.').pop();
    const fileName = `${timestamp}-${randomString}.${fileExtension}`;
    const s3Key = `resources/${resourceId || 'temp'}/${fileName}`;

    // For now, we'll simulate file upload
    // In production, you would upload to AWS S3 or similar service
    const mockS3Url = `https://s3.amazonaws.com/fonosaas-bucket/${s3Key}`;

    // If resourceId is provided, save file info to database
    if (resourceId) {
      await prisma.resourceFile.create({
        data: {
          resourceId,
          name: file.name,
          s3Key,
          s3Url: mockS3Url,
          fileType: file.type,
          sizeInBytes: file.size,
          uploadedById: user.id,
        },
      });
    }

    return SecurityMiddleware.createSecureResponse({
      success: true,
      url: mockS3Url,
      s3Key,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      message: 'File uploaded successfully',
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return SecurityMiddleware.createErrorResponse('Failed to upload file', 500);
  }
}
