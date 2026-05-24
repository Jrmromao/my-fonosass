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
    const { isPublic } = await request.json();

    await prisma.activity.update({
      where: { id },
      data: {
        isPublic,
        status: isPublic ? 'PUBLISHED' : 'DRAFT',
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Toggle visibility error:', error);
    return NextResponse.json({ error: 'Failed to toggle' }, { status: 500 });
  }
}
