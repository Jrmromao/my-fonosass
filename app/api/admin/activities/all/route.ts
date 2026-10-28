import { prisma } from '@/app/db';
import { errorResponse, requireAdmin } from '@/lib/activities/approval';
import { Prisma } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const VALID_STATUSES = [
  'DRAFT',
  'PENDING_REVIEW',
  'PUBLISHED',
  'REJECTED',
] as const;

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const url = request.nextUrl;
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
    const limit = Math.min(50, parseInt(url.searchParams.get('limit') || '20'));
    const status = url.searchParams.get('status') || '';
    const search = url.searchParams.get('search') || '';

    const where: Prisma.ActivityWhereInput = {};
    if (status) {
      if (!VALID_STATUSES.includes(status as (typeof VALID_STATUSES)[number])) {
        return NextResponse.json(
          { error: `Status inválido. Use um de: ${VALID_STATUSES.join(', ')}` },
          { status: 400 }
        );
      }
      where.status = status as Prisma.EnumActivityStatusFilter['equals'];
    }
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
          files: {
            select: { id: true, s3Key: true, fileType: true, name: true },
            take: 1,
          },
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
    const { body, status } = errorResponse(error);
    return NextResponse.json(body, { status });
  }
}
