import { prisma } from '@/app/db';
import { TelegramService } from '@/services/telegramService';
import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const activity = await prisma.activity.findUnique({ where: { id } });
    if (!activity) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const approvalToken = nanoid(32);
    await prisma.activity.update({
      where: { id },
      data: { status: 'PENDING_REVIEW', approvalToken },
    });

    await TelegramService.sendExerciseForReview({
      id: activity.id,
      name: activity.name,
      phoneme: activity.phoneme,
      difficulty: activity.difficulty,
      ageRange: activity.ageRange,
      approvalToken,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Notify review error:', error);
    return NextResponse.json({ error: 'Failed to notify' }, { status: 500 });
  }
}
