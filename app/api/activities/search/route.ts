import { prisma } from '@/app/db';
import { auth } from '@clerk/nextjs/server';
import { Prisma } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = request.nextUrl;
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
    const limit = Math.min(
      50,
      Math.max(1, parseInt(url.searchParams.get('limit') || '20'))
    );
    const search = url.searchParams.get('search')?.trim() || '';
    const phoneme = url.searchParams.get('phoneme') || '';
    const type = url.searchParams.get('type') || '';
    const difficulty = url.searchParams.get('difficulty') || '';
    const ageRange = url.searchParams.get('ageRange') || '';

    const where: Prisma.ActivityWhereInput = {
      isPublic: true,
      status: 'PUBLISHED',
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (phoneme) where.phoneme = phoneme;
    if (type) where.type = type as any;
    if (difficulty) where.difficulty = difficulty as any;
    if (ageRange) where.ageRange = ageRange as any;

    const [activities, total] = await Promise.all([
      prisma.activity.findMany({
        where,
        select: {
          id: true,
          name: true,
          description: true,
          phoneme: true,
          type: true,
          difficulty: true,
          ageRange: true,
          createdAt: true,
          files: { select: { id: true, fileType: true }, take: 1 },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.activity.count({ where }),
    ]);

    // Get available filter options (for the current filtered set minus that filter)
    const [phonemes, types, difficulties, ageRanges] = await Promise.all([
      prisma.activity.findMany({
        where: { isPublic: true, status: 'PUBLISHED' },
        select: { phoneme: true },
        distinct: ['phoneme'],
        orderBy: { phoneme: 'asc' },
      }),
      prisma.activity.findMany({
        where: { isPublic: true, status: 'PUBLISHED' },
        select: { type: true },
        distinct: ['type'],
      }),
      prisma.activity.findMany({
        where: { isPublic: true, status: 'PUBLISHED' },
        select: { difficulty: true },
        distinct: ['difficulty'],
      }),
      prisma.activity.findMany({
        where: { isPublic: true, status: 'PUBLISHED' },
        select: { ageRange: true },
        distinct: ['ageRange'],
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: activities,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      filters: {
        phonemes: phonemes.map((p) => p.phoneme).sort(),
        types: types.map((t) => t.type),
        difficulties: difficulties.map((d) => d.difficulty),
        ageRanges: ageRanges.map((a) => a.ageRange),
      },
    });
  } catch (error) {
    console.error('Activities search error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activities' },
      { status: 500 }
    );
  }
}
