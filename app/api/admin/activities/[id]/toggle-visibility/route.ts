export const dynamic = 'force-dynamic';
import { prisma } from '@/app/db';
import {
  assertTransition,
  errorResponse,
  requireAdmin,
  type ActivityStatus,
} from '@/lib/activities/approval';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const bodySchema = z.object({ isPublic: z.boolean() });

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();

    const { id } = await params;

    let isPublic: boolean;
    try {
      ({ isPublic } = bodySchema.parse(await request.json()));
    } catch {
      return NextResponse.json(
        { error: 'Campo "isPublic" (boolean) é obrigatório' },
        { status: 400 }
      );
    }

    const activity = await prisma.activity.findUnique({
      where: { id },
      select: { id: true, status: true, reviewedAt: true },
    });
    if (!activity) {
      return NextResponse.json(
        { error: 'Atividade não encontrada.' },
        { status: 404 }
      );
    }

    const status = activity.status as ActivityStatus;
    const target: ActivityStatus = isPublic ? 'PUBLISHED' : 'DRAFT';

    if (isPublic) {
      // Visibility may only bring back something that already passed review:
      // a PUBLISHED activity, or a DRAFT that was approved and then hidden
      // (reviewedAt is set on approval). New content must go through
      // approve, never through this toggle.
      const wasApproved = status === 'DRAFT' && activity.reviewedAt !== null;
      if (status !== 'PUBLISHED' && !wasApproved) {
        return NextResponse.json(
          {
            error:
              'Esta atividade ainda não foi aprovada. Use "Aprovar" para publicá-la.',
          },
          { status: 409 }
        );
      }
    } else {
      // Hiding: PUBLISHED -> DRAFT (or a no-op when already DRAFT).
      assertTransition(status, target);
    }

    await prisma.activity.update({
      where: { id },
      data: {
        isPublic,
        status: target,
        // Hiding something that was live: keep proof it passed review, so it
        // can be shown again. Older published rows predate reviewedAt.
        ...(!isPublic && status === 'PUBLISHED' && activity.reviewedAt === null
          ? { reviewedAt: new Date() }
          : {}),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    const { body, status } = errorResponse(error);
    return NextResponse.json(body, { status });
  }
}
