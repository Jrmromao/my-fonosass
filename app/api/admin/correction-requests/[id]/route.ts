import { prisma } from '@/app/db';
import { requireAdmin, errorResponse } from '@/lib/activities/approval';
import { AuditAction, recordAudit } from '@/lib/audit/audit';
import {
  resolveCorrectionRequest,
  resolveCorrectionSchema,
} from '@/lib/privacy/dataCorrectionRequests';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const NO_STORE = { 'Cache-Control': 'private, no-store' };
const idSchema = z.string().cuid();

/** Answer a correction request (final: RESOLVED or REJECTED with a note). */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { dbUserId } = await requireAdmin();

    const { id } = await params;
    if (!idSchema.safeParse(id).success) {
      return NextResponse.json(
        { error: 'Request not found' },
        { status: 404, headers: NO_STORE }
      );
    }

    const parsed = resolveCorrectionSchema.safeParse(
      await request.json().catch(() => null)
    );
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Informe o resultado e uma resposta para o usuário.' },
        { status: 400, headers: NO_STORE }
      );
    }

    const resolved = await resolveCorrectionRequest({
      id,
      adminDbUserId: dbUserId,
      status: parsed.data.status,
      resolutionNote: parsed.data.resolutionNote,
    });
    if (!resolved) {
      return NextResponse.json(
        { error: 'Request not found or already answered' },
        { status: 409, headers: NO_STORE }
      );
    }

    await recordAudit({
      action: AuditAction.CORRECTION_RESOLVE,
      actorType: 'ADMIN',
      actorId: dbUserId,
      targetType: 'DataCorrectionRequest',
      targetId: resolved.id,
      request,
      metadata: { outcome: parsed.data.status },
    });

    const owner = await prisma.user.findUnique({
      where: { id: resolved.userId },
      select: { email: true, fullName: true },
    });
    if (owner) {
      // Lazy import: emailService builds a Resend client at module load,
      // which needs RESEND_API_KEY (same pattern as the Clerk webhook).
      // The answer is already saved; a mail failure must not undo it.
      try {
        const { EmailService } = await import('@/services/emailService');
        await EmailService.sendCorrectionRequestAnswered({
          userEmail: owner.email,
          userName: owner.fullName,
          status: parsed.data.status,
          resolutionNote: parsed.data.resolutionNote,
        });
      } catch (error) {
        console.error('Correction request: user email failed:', error);
      }
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          id: resolved.id,
          status: resolved.status,
          resolvedAt: resolved.resolvedAt?.toISOString() ?? null,
        },
      },
      { headers: NO_STORE }
    );
  } catch (error) {
    const { body, status } = errorResponse(error);
    return NextResponse.json(body, { status, headers: NO_STORE });
  }
}
