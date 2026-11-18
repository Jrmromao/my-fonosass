import { beforeEach, describe, expect, it, jest } from '@jest/globals';

jest.mock('@/app/db', () => ({
  prisma: { activityDownloadStat: { upsert: jest.fn() } },
}));

import {
  monthBucket,
  recordAnonymousDownload,
} from '@/lib/stats/downloadStats';

const prisma = () => require('@/app/db').prisma;

describe('anonymous download stats', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('buckets by the first day of the month in UTC', () => {
    expect(monthBucket(new Date('2026-11-18T23:59:00Z')).toISOString()).toBe(
      '2026-11-01T00:00:00.000Z'
    );
  });

  it('increments a counter with no user data', async () => {
    await recordAnonymousDownload('act-1');
    const args = prisma().activityDownloadStat.upsert.mock.calls[0][0];
    expect(args.update).toEqual({ count: { increment: 1 } });
    expect(args.create).toMatchObject({ activityId: 'act-1', count: 1 });
    expect(Object.keys(args.create).sort()).toEqual([
      'activityId',
      'count',
      'month',
    ]);
  });

  it('never throws (a failed counter must not block the download)', async () => {
    prisma().activityDownloadStat.upsert.mockRejectedValue(
      new Error('db down')
    );
    await expect(recordAnonymousDownload('act-1')).resolves.toBeUndefined();
  });
});
