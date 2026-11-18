import { beforeEach, describe, expect, it, jest } from '@jest/globals';

jest.mock('@/app/db', () => ({
  prisma: {
    freeSampleSelection: { findMany: jest.fn() },
    activity: { findMany: jest.fn() },
  },
}));

import { FREE_DEFAULT_PHONEME, getFreeSamplesForMonth } from '@/lib/access';
import { freeOfferText, sharedPhonemeLabel } from '@/lib/freeOffer';

const prisma = () => require('@/app/db').prisma;
const NOV = new Date('2026-11-18T10:00:00Z');

const row = (id: string, files: { id: string }[] = [{ id: `${id}-img` }]) => ({
  id,
  name: id,
  phoneme: 'S',
  type: 'SPEECH',
  ageRange: 'PRESCHOOL',
  difficulty: 'BEGINNER',
  files,
});

/**
 * Default query (phoneme S, take 2) returns `defaults` minus excluded ids;
 * detail query returns rows for the ids asked (`noImage` ones without files).
 */
const mockLibrary = (defaults: string[], noImage: string[] = []) =>
  prisma().activity.findMany.mockImplementation(async (args: any) => {
    if (args?.where?.id?.in) {
      return args.where.id.in.map((id: string) =>
        row(id, noImage.includes(id) ? [] : undefined)
      );
    }
    const excluded: string[] = args?.where?.id?.notIn ?? [];
    return defaults
      .filter((id) => !excluded.includes(id))
      .slice(0, args?.take ?? 99)
      .map((id) => ({ id }));
  });

describe('getFreeSamplesForMonth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('defaults to the 2 oldest published /s/ activities with an image', async () => {
    prisma().freeSampleSelection.findMany.mockResolvedValue([]);
    mockLibrary(['s1', 's2', 's3']);
    const r = await getFreeSamplesForMonth(NOV);
    expect(r.source).toBe('default');
    expect(r.samples.map((s) => s.id)).toEqual(['s1', 's2']);
    const where = prisma().activity.findMany.mock.calls[0][0].where;
    expect(where).toMatchObject({
      phoneme: FREE_DEFAULT_PHONEME,
      status: 'PUBLISHED',
    });
    expect(r.month.toISOString()).toBe('2026-11-01T00:00:00.000Z');
  });

  it('uses the admin choice for that month, in the chosen order', async () => {
    prisma().freeSampleSelection.findMany.mockResolvedValue([
      { activityId: 'x2' },
      { activityId: 'x1' },
    ]);
    mockLibrary(['s1', 's2']);
    const r = await getFreeSamplesForMonth(NOV);
    expect(r.source).toBe('manual');
    expect(r.samples.map((s) => s.id)).toEqual(['x2', 'x1']);
  });

  it('fills a chosen activity that lost its image from the /s/ default', async () => {
    prisma().freeSampleSelection.findMany.mockResolvedValue([
      { activityId: 'x1' },
      { activityId: 'gone' },
    ]);
    mockLibrary(['s1', 's2'], ['gone']);
    const r = await getFreeSamplesForMonth(NOV);
    expect(r.samples.map((s) => s.id)).toEqual(['x1', 's1']);
  });

  it('returns what exists while the library has fewer than 2', async () => {
    prisma().freeSampleSelection.findMany.mockResolvedValue([]);
    mockLibrary(['s1']);
    expect((await getFreeSamplesForMonth(NOV)).samples).toHaveLength(1);
  });
});

describe('free offer wording', () => {
  it('names the phoneme when all free activities share it', () => {
    const items = [{ phoneme: 'S' }, { phoneme: 'S' }];
    expect(sharedPhonemeLabel(items)).toBe('/s/');
    expect(freeOfferText(items)).toBe('2 atividades do fonema /s/ grátis');
  });

  it('stays generic for a mixed choice', () => {
    const items = [{ phoneme: 'S' }, { phoneme: '' }];
    expect(sharedPhonemeLabel(items)).toBeNull();
    expect(freeOfferText(items)).toBe('2 atividades grátis');
    expect(freeOfferText([{ phoneme: 'S' }])).toBe(
      'uma atividade do fonema /s/ grátis'
    );
  });
});
