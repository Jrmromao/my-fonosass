import { prisma } from '@/app/db';
import type { LibraryCountsResponse } from '@/lib/activityLibrary';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Published activities per phoneme and per type, for the library index
// (/dashboard/biblioteca). Same for every user, so it is cheap to cache.

const PUBLISHED = { isPublic: true, status: 'PUBLISHED' } as const;

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json<LibraryCountsResponse>(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const [byPhoneme, byType, total] = await Promise.all([
      prisma.activity.groupBy({
        by: ['phoneme'],
        where: PUBLISHED,
        _count: { _all: true },
      }),
      prisma.activity.groupBy({
        by: ['type'],
        where: PUBLISHED,
        _count: { _all: true },
      }),
      prisma.activity.count({ where: PUBLISHED }),
    ]);

    return NextResponse.json<LibraryCountsResponse>(
      {
        success: true,
        data: {
          total,
          // Activities without a phoneme (e.g. Cores) are counted by type.
          phonemes: Object.fromEntries(
            byPhoneme
              .filter((c) => c.phoneme.trim() !== '')
              .map((c) => [c.phoneme, c._count._all])
          ),
          types: Object.fromEntries(byType.map((c) => [c.type, c._count._all])),
        },
      },
      { headers: { 'Cache-Control': 'private, max-age=60' } }
    );
  } catch (error) {
    console.error('[library-counts] failed', error);
    return NextResponse.json<LibraryCountsResponse>(
      { success: false, error: 'Failed to load counts' },
      { status: 500 }
    );
  }
}
