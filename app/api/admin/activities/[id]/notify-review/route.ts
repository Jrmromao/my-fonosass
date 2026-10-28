export const dynamic = 'force-dynamic';
import { prisma } from '@/app/db';
import {
  assertTransition,
  errorResponse,
  requireAdmin,
  type ActivityStatus,
} from '@/lib/activities/approval';
import { TelegramService } from '@/services/telegramService';
import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();

    const { id } = await params;

    const activity = await prisma.activity.findUnique({ where: { id } });
    if (!activity) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    assertTransition(activity.status as ActivityStatus, 'PENDING_REVIEW');

    const approvalToken = nanoid(32);
    await prisma.activity.update({
      where: { id },
      data: { status: 'PENDING_REVIEW', isPublic: false, approvalToken },
    });

    // Send the notification. If it fails, roll the status/token back so the
    // activity isn't stuck "pending" with a reviewer link that was never sent.
    const sent = await TelegramService.sendExerciseForReview({
      id: activity.id,
      name: activity.name,
      phoneme: activity.phoneme,
      difficulty: activity.difficulty,
      ageRange: activity.ageRange,
      approvalToken,
    });

    if (sent === false) {
      await prisma.activity.update({
        where: { id },
        data: {
          status: activity.status,
          isPublic: activity.isPublic,
          approvalToken: activity.approvalToken,
        },
      });
      return NextResponse.json(
        { error: 'Falha ao enviar notificação de revisão' },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const { body, status } = errorResponse(error);
    return NextResponse.json(body, { status });
  }
}
