import { prisma } from '@/app/db';
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

    const [total, phonemes, pending, downloads] = await Promise.all([
      prisma.activity.count({ where: { status: 'PUBLISHED' } }),
      prisma.activity.findMany({
        where: { status: 'PUBLISHED' },
        select: { phoneme: true },
        distinct: ['phoneme'],
      }),
      prisma.activity.count({ where: { status: 'PENDING_REVIEW' } }),
      prisma.downloadHistory.count({
        where: { downloadedAt: { gte: startOfMonth } },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        total,
        phonemes: phonemes.length,
        pending,
        downloads,
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
