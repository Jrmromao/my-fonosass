import { SecurityMiddleware } from '@/lib/security/securityMiddleware';
import { auth } from '@clerk/nextjs/server';
import { randomUUID } from 'crypto';
import { NextRequest } from 'next/server';

// MIME type -> extension we control (never trust the client file name).
const EXTENSIONS: Record<string, string> = {
  'application/pdf': 'pdf',
  'video/mp4': 'mp4',
  'video/avi': 'avi',
  'video/mov': 'mov',
  'video/wmv': 'wmv',
  'audio/mp3': 'mp3',
  'audio/wav': 'wav',
  'audio/m4a': 'm4a',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'image/webp': 'webp',
};

// Magic bytes for the types we can cheaply verify.
const SIGNATURES: Record<string, number[][]> = {
  'application/pdf': [[0x25, 0x50, 0x44, 0x46]],
  'image/jpeg': [[0xff, 0xd8, 0xff]],
  'image/png': [[0x89, 0x50, 0x4e, 0x47]],
  'image/gif': [[0x47, 0x49, 0x46, 0x38]],
  'image/webp': [[0x52, 0x49, 0x46, 0x46]],
};

const RESOURCE_ID = /^[A-Za-z0-9_-]{1,64}$/;

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
    const rawResourceId = formData.get('resourceId');
    const resourceId =
      typeof rawResourceId === 'string' && rawResourceId ? rawResourceId : '';
    if (resourceId && !RESOURCE_ID.test(resourceId)) {
      return SecurityMiddleware.createErrorResponse('Invalid resource id', 400);
    }

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
    // Verify the content matches the declared type (client MIME is untrusted).
    const signatures = SIGNATURES[file.type];
    if (signatures) {
      const head = new Uint8Array(await file.slice(0, 12).arrayBuffer());
      const matches = signatures.some((sig) =>
        sig.every((byte, i) => head[i] === byte)
      );
      if (!matches) {
        return SecurityMiddleware.createErrorResponse(
          'File content does not match its type',
          400
        );
      }
    }

    const fileName = `${Date.now()}-${randomUUID()}.${EXTENSIONS[file.type]}`;
    const s3Key = `resources/${resourceId || 'temp'}/${fileName}`;

    // For now, we'll simulate file upload
    // In production, you would upload to AWS S3 or similar service
    const mockS3Url = `https://s3.amazonaws.com/fonosaas-bucket/${s3Key}`;

    // If resourceId is provided, save file info to database
    if (resourceId) {
      await prisma.resourceFile.create({
        data: {
          resourceId,
          name: file.name.slice(0, 255),
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
