export const dynamic = "force-dynamic";
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
      orderBy: { createdAt: 'desc' },
      include: {
        files: {
          select: { id: true, s3Key: true, fileType: true, name: true },
        },
      },
    });

    return NextResponse.json({ success: true, activities });
  } catch (error) {
    console.error('Fetch all activities error:', error);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}
