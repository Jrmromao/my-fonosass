export const dynamic = 'force-dynamic';
import { prisma } from '@/app/db';
import { errorResponse, requireAdmin } from '@/lib/activities/approval';
import { NextRequest, NextResponse } from 'next/server';

const NO_STORE = { 'Cache-Control': 'private, no-store' };

/** Activities that can be free samples (published, with an image). */
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const search = (request.nextUrl.searchParams.get('busca') ?? '')
      .trim()
      .slice(0, 100);

    const activities = await prisma.activity.findMany({
      where: {
        status: 'PUBLISHED',
        isPublic: true,
        files: { some: { fileType: { startsWith: 'image/' } } },
        ...(search
          ? { name: { contains: search, mode: 'insensitive' as const } }
          : {}),
      },
      select: {
        id: true,
        name: true,
        phoneme: true,
        type: true,
      },
      orderBy: { name: 'asc' },
      take: 50,
    });

    return NextResponse.json(
      { success: true, data: activities },
      { headers: NO_STORE }
    );
  } catch (error) {
    const { body, status } = errorResponse(error);
    return NextResponse.json(body, { status, headers: NO_STORE });
  }
}
