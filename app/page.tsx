import { prisma } from '@/app/db';
import HomeLanding, {
  type PhonemeCount,
  type SampleActivity,
  type TopicCount,
} from '@/components/landing/HomeLanding';
import { type FreePreviewActivity } from '@/components/landing/FreePhonemeTile';
import { getFreeSamples } from '@/lib/access';
import { TYPE_LABELS, label, phonemeLabel } from '@/lib/activityLabels';
import { LANGUAGE_TOPICS, PHONEMES } from '@/lib/phonemes';
import { ActivityDifficulty, ActivityStatus, AgeRange } from '@prisma/client';

// Catalog numbers change at most a few times a week; refresh hourly.
export const revalidate = 3600;

const AGE_LABELS: Record<AgeRange, string> = {
  TODDLER: 'Primeira infância',
  PRESCHOOL: 'Pré-escolar',
  CHILD: 'Idade escolar',
  TEENAGER: 'Adolescente',
  ADULT: 'Adulto',
};

const DIFFICULTY_LABELS: Record<ActivityDifficulty, string> = {
  BEGINNER: 'Iniciante',
  INTERMEDIATE: 'Intermediário',
  ADVANCED: 'Avançado',
  EXPERT: 'Especialista',
};

// Activity names are stored as "Animais (Fonema /S/)"; the phoneme is shown
// separately on the card, so drop the suffix.
function cleanTitle(name: string): string {
  return name.replace(/\s*\(Fonema\s*\/[^/]*\/\)\s*$/i, '').trim();
}

async function getCatalog(): Promise<{
  phonemes: PhonemeCount[];
  languageTopics: TopicCount[];
  samples: SampleActivity[];
  freePreview: FreePreviewActivity[];
  totalActivities: number;
}> {
  try {
    const published = {
      status: ActivityStatus.PUBLISHED,
      phoneme: { not: '' },
    };

    const [grouped, sampleRows, freeRows, typeGroups] = await Promise.all([
      prisma.activity.groupBy({
        by: ['phoneme'],
        where: published,
        _count: { _all: true },
        orderBy: { phoneme: 'asc' },
      }),
      prisma.activity.findMany({
        where: published,
        select: {
          id: true,
          name: true,
          phoneme: true,
          ageRange: true,
          difficulty: true,
        },
        orderBy: { createdAt: 'asc' },
        take: 30,
      }),
      // This month's free samples, the same the download rules allow
      // (lib/access.ts). Refreshed when an admin changes them.
      getFreeSamples(),
      prisma.activity.groupBy({
        by: ['type'],
        where: { status: ActivityStatus.PUBLISHED },
        _count: { _all: true },
      }),
    ]);

    // "Linguagem" topics are counted by activity type, not by phoneme.
    const typeCounts = new Map(typeGroups.map((t) => [t.type, t._count._all]));
    const languageTopics: TopicCount[] = LANGUAGE_TOPICS.map((topic) => ({
      id: topic.id,
      label: topic.label,
      count: topic.types.reduce((sum, t) => sum + (typeCounts.get(t) ?? 0), 0),
    }));

    // Modal preview: the free samples (downloadable after creating an account).
    const freePreview: FreePreviewActivity[] = freeRows.map((a) => ({
      id: a.id,
      title: cleanTitle(a.name),
      phoneme: a.phoneme,
      subject: a.phoneme
        ? `Fonema ${phonemeLabel(a.phoneme)}`
        : label(TYPE_LABELS, a.type),
      ageLabel: AGE_LABELS[a.ageRange],
      difficultyLabel: DIFFICULTY_LABELS[a.difficulty],
      imageFileId: a.imageFileId,
    }));

    // One sheet per phoneme, each from a different age range and theme, so
    // the hero shows the breadth of the catalog rather than three copies.
    const usedAges = new Set<AgeRange>();
    const usedTitles = new Set<string>();
    const sampleByPhoneme = new Map<string, (typeof sampleRows)[number]>();
    for (const row of sampleRows) {
      const title = cleanTitle(row.name);
      if (
        sampleByPhoneme.has(row.phoneme) ||
        usedAges.has(row.ageRange) ||
        usedTitles.has(title)
      ) {
        continue;
      }
      sampleByPhoneme.set(row.phoneme, row);
      usedAges.add(row.ageRange);
      usedTitles.add(title);
    }
    const picked = [...sampleByPhoneme.values()];
    // Small catalogs (e.g. production today) may not have three distinct age
    // ranges; fill the remaining slots with any other activity.
    for (const row of sampleRows) {
      if (picked.length >= 3) break;
      if (!picked.includes(row)) picked.push(row);
    }

    // Always list the full phoneme set (empty ones become "Em breve"), plus
    // any extra phoneme that exists in the DB but not in the canonical list.
    const counts = new Map(grouped.map((g) => [g.phoneme, g._count._all]));
    const known = new Set<string>(PHONEMES);
    const phonemes: PhonemeCount[] = [
      ...PHONEMES.map((phoneme) => ({
        phoneme,
        count: counts.get(phoneme) ?? 0,
      })),
      ...grouped
        .filter((g) => !known.has(g.phoneme))
        .map((g) => ({ phoneme: g.phoneme, count: g._count._all })),
    ];

    return {
      phonemes,
      languageTopics,
      freePreview,
      totalActivities: phonemes.reduce((sum, p) => sum + p.count, 0),
      samples: picked.map((a) => ({
        id: a.id,
        title: cleanTitle(a.name),
        phoneme: a.phoneme,
        ageLabel: AGE_LABELS[a.ageRange],
        difficultyLabel: DIFFICULTY_LABELS[a.difficulty],
      })),
    };
  } catch (error) {
    // Landing must render even if the DB is unreachable (e.g. during build).
    console.error('[home] failed to load catalog', error);
    return {
      phonemes: PHONEMES.map((phoneme) => ({ phoneme, count: 0 })),
      languageTopics: LANGUAGE_TOPICS.map((t) => ({
        id: t.id,
        label: t.label,
        count: 0,
      })),
      samples: [],
      freePreview: [],
      totalActivities: 0,
    };
  }
}

export default async function Home() {
  const catalog = await getCatalog();
  return <HomeLanding {...catalog} />;
}
