import { prisma } from '@/app/db';
import {
  createCorrectionRequest,
  createCorrectionSchema,
  MAX_CORRECTION_REQUESTS_PER_DAY,
  toCorrectionRequestDto,
} from '@/lib/privacy/dataCorrectionRequests';
import { DPO_EMAIL } from '@/lib/privacy';
import { SecurityMiddleware } from '@/lib/security/securityMiddleware';
import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

/**
 * LGPD art. 18 III, data the user cannot fix themselves.
 *
 * Name and email are self-service and are NOT handled here:
 *   - name:  PUT /api/user/profile (updates Clerk, then the DB)
 *   - email: Clerk account settings (verifies the new address)
 * This endpoint stores free-text requests for the DPO/admin, who answers them
 * from the admin panel (/api/admin/correction-requests).
 */

const NO_STORE = { 'Cache-Control': 'private, no-store' };

async function currentDbUser() {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) return null;
  return prisma.user.findUnique({
    where: { clerkUserId },
    select: { id: true, email: true, fullName: true },
  });
}

export async function POST(request: NextRequest) {
  try {
    const securityResult = await SecurityMiddleware.apply(request, {
      requireAuth: true,
      requireCSRF: true,
      rateLimitType: 'general',
      validateInput: false,
    });
    if (!securityResult.success) return securityResult.response!;

    const user = await currentDbUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401, headers: NO_STORE }
      );
    }

    const parsed = createCorrectionSchema.safeParse(
      await request.json().catch(() => null)
    );
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Descreva a correção com pelo menos 10 caracteres.',
        },
        { status: 400, headers: NO_STORE }
      );
    }

    const result = await createCorrectionRequest({
      userId: user.id,
      description: parsed.data.description,
    });
    if (!result.ok) {
      return NextResponse.json(
        {
          success: false,
          error: `Limite de ${MAX_CORRECTION_REQUESTS_PER_DAY} solicitações por dia atingido.`,
        },
        { status: 429, headers: NO_STORE }
      );
    }

    // Never fails the request: the row is already saved and visible in the
    // admin panel even if the email (or the mail client itself) fails.
    try {
      const { EmailService } = await import('@/services/emailService');
      await EmailService.sendCorrectionRequestToDpo({
        dpoEmail: DPO_EMAIL,
        userEmail: user.email,
        userName: user.fullName,
        description: result.request.description,
        requestId: result.request.id,
      });
    } catch (error) {
      console.error('Correction request: DPO email failed:', error);
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Correction request submitted successfully',
        data: toCorrectionRequestDto(result.request),
      },
      { status: 201, headers: NO_STORE }
    );
  } catch (error) {
    console.error('Error creating correction request:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create correction request' },
      { status: 500, headers: NO_STORE }
    );
  }
}

/** The signed-in user's own correction requests, newest first. */
export async function GET() {
  try {
    const user = await currentDbUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401, headers: NO_STORE }
      );
    }

    const rows = await prisma.dataCorrectionRequest.findMany({
      where: { userId: user.id },
      orderBy: { requestedAt: 'desc' },
      take: 50,
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          userId: user.id,
          correctionRequests: rows.map(toCorrectionRequestDto),
        },
      },
      { headers: NO_STORE }
    );
  } catch (error) {
    console.error('Error retrieving correction requests:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve correction requests' },
      { status: 500, headers: NO_STORE }
    );
  }
}
