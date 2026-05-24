import { prisma } from '@/app/db';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const activities = await prisma.activity.findMany({
      where: { status: 'PENDING_REVIEW' },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        description: true,
        phoneme: true,
        difficulty: true,
        ageRange: true,
        type: true,
        status: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ success: true, activities });
  } catch (error) {
    console.error('Fetch pending activities error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activities' },
      { status: 500 }
    );
  }
}
