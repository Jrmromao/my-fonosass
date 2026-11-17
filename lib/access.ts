import { prisma } from '@/app/db';
import { FREE_PHONEME } from '@/lib/pricing';
import type { ActivityDifficulty, AgeRange } from '@prisma/client';

/**
 * Download access rules (single source of truth):
 * - Subscribers (active PRO subscription) and admins download everything published.
 * - Signed-in users without a subscription download only the free samples:
 *   FREE_SAMPLE_COUNT published activities of FREE_PHONEME.
 * - Visitors (no account) can only preview the free samples.
 */
import { FREE_SAMPLE_COUNT } from '@/lib/access-constants';

export { FREE_SAMPLE_COUNT };

export interface FreeSample {
  id: string;
  name: string;
  ageRange: AgeRange;
  difficulty: ActivityDifficulty;
  /** First image file of the activity (used for the public preview). */
  imageFileId: string;
}

/**
 * The free samples: the oldest published FREE_PHONEME activities that have an
 * image file. Automatic on purpose (no migration); if one is unpublished, the
 * next one takes its place.
 */
export async function getFreeSamples(): Promise<FreeSample[]> {
  const rows = await prisma.activity.findMany({
    where: {
      status: 'PUBLISHED',
      phoneme: FREE_PHONEME,
      files: { some: { fileType: { startsWith: 'image/' } } },
    },
    select: {
      id: true,
      name: true,
      ageRange: true,
      difficulty: true,
      files: {
        where: { fileType: { startsWith: 'image/' } },
        select: { id: true },
        orderBy: { createdAt: 'asc' },
        take: 1,
      },
    },
    orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
    take: FREE_SAMPLE_COUNT,
  });

  return rows
    .filter((r) => r.files.length > 0)
    .map((r) => ({
      id: r.id,
      name: r.name,
      ageRange: r.ageRange,
      difficulty: r.difficulty,
      imageFileId: r.files[0].id,
    }));
}

export async function isFreeSample(activityId: string): Promise<boolean> {
  const samples = await getFreeSamples();
  return samples.some((s) => s.id === activityId);
}

/** Active PRO subscription whose period has not ended. */
export async function hasActiveSubscription(
  dbUserId: string
): Promise<boolean> {
  const sub = await prisma.subscription.findUnique({
    where: { userId: dbUserId },
    select: { status: true, tier: true, currentPeriodEnd: true },
  });
  if (!sub || sub.status !== 'ACTIVE' || sub.tier !== 'PRO') return false;
  return !sub.currentPeriodEnd || sub.currentPeriodEnd > new Date();
}
