import { prisma } from '@/app/db';

/** First day of the month (UTC) for `date`: the bucket of the counters. */
export function monthBucket(date: Date = new Date()): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

/**
 * +1 on the anonymous monthly counter of an activity. No user data is stored,
 * so it stays after account deletion (LGPD Art. 12). Never throws: a failed
 * counter must not block the download.
 */
export async function recordAnonymousDownload(activityId: string) {
  const month = monthBucket();
  try {
    await prisma.activityDownloadStat.upsert({
      where: { activityId_month: { activityId, month } },
      update: { count: { increment: 1 } },
      create: { activityId, month, count: 1 },
    });
  } catch (error) {
    console.error('recordAnonymousDownload failed:', error);
  }
}
