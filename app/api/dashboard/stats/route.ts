import { prisma } from '@/app/db';
import { hasActiveSubscription } from '@/lib/access';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const user = await prisma.user.findUnique({
      where: { clerkUserId: userId },
      select: { id: true },
    });

    const [total, phonemes, pending, downloads, subscribed] = await Promise.all(
      [
        prisma.activity.count({ where: { status: 'PUBLISHED' } }),
        prisma.activity.findMany({
          where: { status: 'PUBLISHED' },
          select: { phoneme: true },
          distinct: ['phoneme'],
        }),
        prisma.activity.count({ where: { status: 'PENDING_REVIEW' } }),
        // The signed-in user's own downloads this month (was: everyone's).
        user
          ? prisma.downloadHistory.count({
              where: { userId: user.id, downloadedAt: { gte: startOfMonth } },
            })
          : Promise.resolve(0),
        user ? hasActiveSubscription(user.id) : Promise.resolve(false),
      ]
    );

    return NextResponse.json({
      success: true,
      data: {
        total,
        phonemes: phonemes.length,
        pending,
        downloads,
        subscribed,
      },
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
