import { prisma } from '@/app/db';
import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

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
      return NextResponse.json(
        { error: 'Activity not found' },
        { status: 404 }
      );
    }

    await prisma.activity.update({
      where: { id },
      data: { status: 'PUBLISHED', isPublic: true, approvalToken: null },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Approve error:', error);
    return NextResponse.json({ error: 'Failed to approve' }, { status: 500 });
  }
}
