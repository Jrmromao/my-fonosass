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
      select: { id: true, status: true },
    });
    if (!activity) {
      return NextResponse.json(
        { error: 'Activity not found' },
        { status: 404 }
      );
    }

    // Visibility toggle only moves between PUBLISHED and DRAFT. It must never
    // be a way to publish something that hasn't passed review.
    const target: ActivityStatus = isPublic ? 'PUBLISHED' : 'DRAFT';
    if (
      isPublic &&
      activity.status !== 'PUBLISHED' &&
      activity.status !== 'DRAFT'
    ) {
      return NextResponse.json(
        {
          error:
            'Só é possível publicar atividades revisadas (status DRAFT ou PUBLISHED).',
        },
        { status: 409 }
      );
    }
    assertTransition(activity.status as ActivityStatus, target);

    await prisma.activity.update({
      where: { id },
      data: { isPublic, status: target },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    const { body, status } = errorResponse(error);
    return NextResponse.json(body, { status });
  }
}
