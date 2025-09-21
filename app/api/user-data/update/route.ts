import { prisma } from '@/app/db';
import { SecurityMiddleware } from '@/lib/security/securityMiddleware';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';

interface CorrectionRequest {
  id: string;
  field: string;
  currentValue?: string;
  requestedValue: string;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  requestedAt: string;
}

// Validation schema for user data updates
const userUpdateSchema = z.object({
  fullName: z.string().min(2).max(100).optional(),
  email: z.string().email().optional(),
  // Add other fields as they become available
});

// Validation schema for data correction requests
const correctionRequestSchema = z.object({
  field: z.string().min(1),
  currentValue: z.string().optional(),
  requestedValue: z.string().min(1),
  reason: z.string().min(10).max(500),
  supportingDocuments: z.array(z.string()).optional(),
});

export async function PUT(request: Request) {
  try {
    // Apply security middleware with CSRF protection
    const securityResult = await SecurityMiddleware.apply(request as any, {
      requireAuth: true,
      requireCSRF: true,
      rateLimitType: 'general',
      validateInput: true,
    });

    if (!securityResult.success) {
      return securityResult.response!;
    }

    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkUserId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = userUpdateSchema.parse(body);

    // Check if email is being changed
    if (validatedData.email && validatedData.email !== user.email) {
      // Check if new email already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: validatedData.email },
      });

      if (existingUser) {
        return NextResponse.json(
          {
            error: 'Email already exists',
            message:
              'This email address is already registered to another account',
          },
          { status: 400 }
        );
      }
    }

    // Update user data
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        ...validatedData,
        updatedAt: new Date(),
      },
    });

    // Create change history log
    const changeLog = {
      userId: user.id,
      clerkUserId: user.clerkUserId,
      changes: Object.keys(validatedData).map((key) => ({
        field: key,
        oldValue: user[key as keyof typeof user],
        newValue: validatedData[key as keyof typeof validatedData],
        changedAt: new Date().toISOString(),
      })),
      changedAt: new Date().toISOString(),
    };

    // Log the changes for audit purposes
    console.log('User data updated:', changeLog);

    return NextResponse.json({
      success: true,
      message: 'User data successfully updated',
      data: {
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          fullName: updatedUser.fullName,
          role: updatedUser.role,
          updatedAt: updatedUser.updatedAt,
        },
        changeLog: changeLog,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation error',
          message: 'Invalid data provided',
          details: error.errors,
        },
        { status: 400 }
      );
    }

    console.error('Error updating user data:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Failed to update user data',
      },
      { status: 500 }
    );
  }
}

// POST endpoint for data correction requests
export async function POST(request: Request) {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkUserId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Parse and validate correction request
    const body = await request.json();
    const validatedData = correctionRequestSchema.parse(body);

    // Create correction request record
    const correctionRequest = {
      id: `correction-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId: user.id,
      clerkUserId: user.clerkUserId,
      field: validatedData.field,
      currentValue: validatedData.currentValue,
      requestedValue: validatedData.requestedValue,
      reason: validatedData.reason,
      supportingDocuments: validatedData.supportingDocuments || [],
      status: 'PENDING',
      requestedAt: new Date().toISOString(),
      // In a real implementation, this would be stored in a database
    };

    // Log the correction request
    console.log('Data correction request submitted:', correctionRequest);

    // TODO: In a production environment, you would:
    // 1. Store the correction request in a database
    // 2. Send notification to admin team
    // 3. Send confirmation email to user
    // 4. Implement approval workflow

    return NextResponse.json({
      success: true,
      message: 'Data correction request submitted successfully',
      data: {
        requestId: correctionRequest.id,
        status: correctionRequest.status,
        submittedAt: correctionRequest.requestedAt,
        estimatedProcessingTime: '2-5 business days',
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation error',
          message: 'Invalid correction request data',
          details: error.errors,
        },
        { status: 400 }
      );
    }

    console.error('Error submitting correction request:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Failed to submit correction request',
      },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve user's correction request history
export async function GET() {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkUserId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // TODO: In a production environment, retrieve from database
    // For now, return empty array
    const correctionHistory: CorrectionRequest[] = [];

    return NextResponse.json({
      success: true,
      data: {
        userId: user.id,
        correctionRequests: correctionHistory,
        message: 'No correction requests found',
      },
    });
  } catch (error) {
    console.error('Error retrieving correction history:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Failed to retrieve correction history',
      },
      { status: 500 }
    );
  }
}
