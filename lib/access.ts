import { prisma } from '@/app/db';
import { monthBucket } from '@/lib/stats/downloadStats';
import type { ActivityType } from '@prisma/client';
import { cache } from 'react';

/**
 * Download access rules (single source of truth):
 * - Subscribers (active PRO subscription) and admins download everything published.
 * - Signed-in users without a subscription download only this month's free
 *   samples: FREE_SAMPLE_COUNT activities of FREE_DEFAULT_PHONEME (/s/), or
 *   the activities an admin chose for that month.
 * - Visitors (no account) can only preview the free samples.
 *
 * The same free samples are used for downloads, the library badge, the
 * landing page and the auth pages, so the "grátis" promise always matches.
 */
import {
  FREE_DEFAULT_PHONEME,
  FREE_SAMPLE_COUNT,
} from '@/lib/access-constants';

export { FREE_DEFAULT_PHONEME, FREE_SAMPLE_COUNT };

export interface FreeSample {
  id: string;
  name: string;
  phoneme: string;
  type: ActivityType;
  /** First image file of the activity (used for the public preview). */
  imageFileId: string;
}

export type FreeSampleSource = 'manual' | 'default';

/** A free sample must be published and have an image (for the preview). */
const ELIGIBLE = {
  status: 'PUBLISHED',
  isPublic: true,
  files: { some: { fileType: { startsWith: 'image/' } } },
} as const;

/**
 * The default free samples (every month without an admin choice): the oldest
 * eligible FREE_DEFAULT_PHONEME activities. Fixed on purpose, so the "/s/
 * grátis" promise is the same for everyone, whenever they sign up.
 */
async function defaultSampleIds(exclude: string[] = []): Promise<string[]> {
  const rows = await prisma.activity.findMany({
    where: {
      ...ELIGIBLE,
      phoneme: FREE_DEFAULT_PHONEME,
      ...(exclude.length ? { id: { notIn: exclude } } : {}),
    },
    select: { id: true },
    orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
    take: FREE_SAMPLE_COUNT,
  });
  return rows.map((r) => r.id);
}

async function loadSamples(ids: string[]): Promise<FreeSample[]> {
  if (ids.length === 0) return [];
  const rows = await prisma.activity.findMany({
    where: { id: { in: ids }, ...ELIGIBLE },
    select: {
      id: true,
      name: true,
      phoneme: true,
      type: true,
      files: {
        where: { fileType: { startsWith: 'image/' } },
        select: { id: true },
        orderBy: { createdAt: 'asc' },
        take: 1,
      },
    },
  });
  const byId = new Map(rows.map((r) => [r.id, r]));
  return ids
    .map((id) => byId.get(id))
    .filter((r): r is NonNullable<typeof r> => !!r && r.files.length > 0)
    .map((r) => ({
      id: r.id,
      name: r.name,
      phoneme: r.phoneme,
      type: r.type,
      imageFileId: r.files[0].id,
    }));
}

/**
 * Free samples of a month: the admin's choice for that month if there is
 * one, otherwise the default (/s/). A chosen activity that stopped being
 * eligible (unpublished, image removed) is replaced from the default, so
 * there are always FREE_SAMPLE_COUNT when the library has enough.
 */
export async function getFreeSamplesForMonth(month: Date): Promise<{
  month: Date;
  source: FreeSampleSource;
  samples: FreeSample[];
}> {
  const bucket = monthBucket(month);
  const chosen = await prisma.freeSampleSelection.findMany({
    where: { month: bucket },
    orderBy: { position: 'asc' },
    select: { activityId: true },
  });

  if (chosen.length === 0) {
    return {
      month: bucket,
      source: 'default',
      samples: await loadSamples(await defaultSampleIds()),
    };
  }

  const picked = await loadSamples(chosen.map((c) => c.activityId));
  if (picked.length < FREE_SAMPLE_COUNT) {
    const fill = await defaultSampleIds(picked.map((p) => p.id));
    picked.push(
      ...(await loadSamples(fill.slice(0, FREE_SAMPLE_COUNT - picked.length)))
    );
  }
  return { month: bucket, source: 'manual', samples: picked };
}

/** This month's free samples (deduplicated per request). */
export const getFreeSamples = cache(
  async (): Promise<FreeSample[]> =>
    (await getFreeSamplesForMonth(new Date())).samples
);

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
