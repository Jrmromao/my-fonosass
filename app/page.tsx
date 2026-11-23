import { prisma } from '@/app/db';
import HomeLanding, {
  type PhonemeCount,
  type SampleActivity,
  type TopicCount,
} from '@/components/landing/HomeLanding';
import { type FreePreviewActivity } from '@/components/landing/FreePhonemeTile';
import { getFreeSamples } from '@/lib/access';
import { TYPE_LABELS, label, phonemeLabel } from '@/lib/activityLabels';
import { LANGUAGE_TOPIC, OTHER_TOPICS, PHONEMES } from '@/lib/phonemes';
import { ActivityStatus } from '@prisma/client';

// Catalog numbers change at most a few times a week; refresh hourly.
export const revalidate = 3600;

// Activity names are stored as "Animais (Fonema /S/)"; the phoneme is shown
// separately on the card, so drop the suffix.
function cleanTitle(name: string): string {
  return name.replace(/\s*\(Fonema\s*\/[^/]*\/\)\s*$/i, '').trim();
}

function topicCount(
  topic: { id: string; label: string; types: string[] },
  typeCounts: Map<string, number>
): TopicCount {
  return {
    id: topic.id,
    label: topic.label,
    count: topic.types.reduce((sum, t) => sum + (typeCounts.get(t) ?? 0), 0),
  };
}

async function getCatalog(): Promise<{
  phonemes: PhonemeCount[];
  languageTopic: TopicCount;
  otherTopics: TopicCount[];
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

    // Non-phoneme topics are counted by activity type, not by phoneme.
    const typeCounts = new Map(typeGroups.map((t) => [t.type, t._count._all]));
    const languageTopic = topicCount(LANGUAGE_TOPIC, typeCounts);
    const otherTopics = OTHER_TOPICS.map((t) => topicCount(t, typeCounts));

    // Modal preview: the free samples (downloadable after creating an account).
    const freePreview: FreePreviewActivity[] = freeRows.map((a) => ({
      id: a.id,
      title: cleanTitle(a.name),
      phoneme: a.phoneme,
      subject: a.phoneme
        ? `Fonema ${phonemeLabel(a.phoneme)}`
        : label(TYPE_LABELS, a.type),
      imageFileId: a.imageFileId,
    }));

    // One sheet per phoneme, each with a different theme, so the hero shows
    // the breadth of the catalog rather than three copies.
    const usedTitles = new Set<string>();
    const sampleByPhoneme = new Map<string, (typeof sampleRows)[number]>();
    for (const row of sampleRows) {
      const title = cleanTitle(row.name);
      if (sampleByPhoneme.has(row.phoneme) || usedTitles.has(title)) {
        continue;
      }
      sampleByPhoneme.set(row.phoneme, row);
      usedTitles.add(title);
    }
    const picked = [...sampleByPhoneme.values()];
    // Small catalogs may not have three distinct phonemes; fill the remaining
    // slots with any other activity.
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
      languageTopic,
      otherTopics,
      freePreview,
      totalActivities: phonemes.reduce((sum, p) => sum + p.count, 0),
      samples: picked.map((a) => ({
        id: a.id,
        title: cleanTitle(a.name),
        phoneme: a.phoneme,
      })),
    };
  } catch (error) {
    // Landing must render even if the DB is unreachable (e.g. during build).
    console.error('[home] failed to load catalog', error);
    const empty = new Map<string, number>();
    return {
      phonemes: PHONEMES.map((phoneme) => ({ phoneme, count: 0 })),
      languageTopic: topicCount(LANGUAGE_TOPIC, empty),
      otherTopics: OTHER_TOPICS.map((t) => topicCount(t, empty)),
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
