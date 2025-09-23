import { prisma } from '@/app/db';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkUserId: userId },
      include: {
        subscriptions: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user is pro
    const isPro =
      user.subscriptions?.status === 'ACTIVE' &&
      user.subscriptions?.tier === 'PRO';
    const limit = isPro ? 999999 : 5;

    // Count downloads from the beginning of current month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const used = await prisma.download.count({
      where: {
        userId: user.id,
        downloadedAt: {
          gte: startOfMonth,
        },
      },
    });

    const remaining = isPro ? 999999 : Math.max(0, limit - used);

    return NextResponse.json({
      success: true,
      data: {
        isPro,
        remaining,
        limit,
        used,
      },
    });
  } catch (error) {
    console.error('Error fetching download limit:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
