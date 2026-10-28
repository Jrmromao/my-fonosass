export const dynamic = 'force-dynamic';
import { prisma } from '@/app/db';
import { errorResponse, requireAdmin } from '@/lib/activities/approval';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await requireAdmin();

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
        files: { select: { id: true, s3Key: true, fileType: true }, take: 1 },
      },
    });

    return NextResponse.json({ success: true, activities });
  } catch (error) {
    const { body, status } = errorResponse(error);
    return NextResponse.json(body, { status });
  }
}
