import { prisma } from '@/app/db';
import { auth } from '@clerk/nextjs/server';
import { Prisma } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = request.nextUrl;
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
    const limit = Math.min(50, parseInt(url.searchParams.get('limit') || '20'));
    const status = url.searchParams.get('status') || '';
    const search = url.searchParams.get('search') || '';

    const where: Prisma.ActivityWhereInput = {};
    if (status) where.status = status as any;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { phoneme: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [activities, total] = await Promise.all([
      prisma.activity.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          files: { select: { id: true, s3Key: true, fileType: true, name: true }, take: 1 },
        },
      }),
      prisma.activity.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      activities,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Fetch all activities error:', error);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}
