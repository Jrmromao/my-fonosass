import { prisma } from '@/app/db';
import HomeLanding, {
  type PhonemeCount,
  type SampleActivity,
} from '@/components/landing/HomeLanding';
import { type FreePreviewActivity } from '@/components/landing/FreePhonemeTile';
import { FREE_PHONEME } from '@/lib/pricing';
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
  samples: SampleActivity[];
  freePreview: FreePreviewActivity[];
  totalActivities: number;
}> {
  try {
    const published = {
      status: ActivityStatus.PUBLISHED,
      phoneme: { not: '' },
    };

    const [grouped, sampleRows, freeRows] = await Promise.all([
      prisma.activity.groupBy({
        by: ['phoneme'],
        where: published,
        _count: { _all: true },
        orderBy: { phoneme: 'asc' },
      }),
      prisma.activity.findMany({
        where: { ...published, phoneme: { in: ['R', 'S', 'L'] } },
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
      prisma.activity.findMany({
        where: { status: ActivityStatus.PUBLISHED, phoneme: FREE_PHONEME },
        select: {
          id: true,
          name: true,
          ageRange: true,
          difficulty: true,
          files: {
            where: { fileType: { startsWith: 'image/' } },
            select: { id: true },
            take: 1,
          },
        },
        orderBy: { createdAt: 'asc' },
        take: 20,
      }),
    ]);

    // Modal preview: two free-phoneme activities, preferring ones that have
    // an image file so the visitor sees the real sheet.
    const freePreview: FreePreviewActivity[] = [...freeRows]
      .sort((a, b) => b.files.length - a.files.length)
      .slice(0, 2)
      .map((a) => ({
        id: a.id,
        title: cleanTitle(a.name),
        ageLabel: AGE_LABELS[a.ageRange],
        difficultyLabel: DIFFICULTY_LABELS[a.difficulty],
        imageFileId: a.files[0]?.id ?? null,
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

    const phonemes = grouped.map((g) => ({
      phoneme: g.phoneme,
      count: g._count._all,
    }));

    return {
      phonemes,
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
    return { phonemes: [], samples: [], freePreview: [], totalActivities: 0 };
  }
}

export default async function Home() {
  const catalog = await getCatalog();
  return <HomeLanding {...catalog} />;
}
