import { TopicTile } from '@/components/library/TopicTile';
import { phonemeTopic } from '@/lib/libraryTopics';
import { toneFor } from '@/components/library/tones';
import { LIBRARY_PATH } from '@/lib/libraryUrl';
import {
  LANGUAGE_TOPICS,
  LEGACY_NOTES,
  PHONEME_GROUPS,
  type PhonemeEntry,
} from '@/lib/phonemes';

// The library index: one white card per group (pares, nasais, arquifonema,
// encontro, linguagem), each with its own color. Pure presentation: counts
// come from the page (/api/library/counts), so it can also be previewed.

export interface LibraryTopicGroupsProps {
  /** Published activities per Activity.phoneme code. */
  phonemeCounts: Record<string, number>;
  /** Published activities per ActivityType. */
  typeCounts: Record<string, number>;
}

// Literal class names so Tailwind can see them.
const COLUMNS: Record<number, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-2 sm:grid-cols-3',
  4: 'grid-cols-2 sm:grid-cols-4',
  5: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5',
  6: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6',
};
const columnsFor = (n: number) => COLUMNS[Math.min(Math.max(n, 1), 6)];

export function LibraryTopicGroups({
  phonemeCounts,
  typeCounts,
}: LibraryTopicGroupsProps) {
  // Codes in the DB that the taxonomy doesn't know yet go in "outros".
  const known = new Set(
    PHONEME_GROUPS.flatMap((g) => g.entries.map((e) => e.code))
  );
  const extras: PhonemeEntry[] = Object.keys(phonemeCounts)
    .filter((code) => !known.has(code) && phonemeCounts[code] > 0)
    .map((code) => ({
      code,
      display: `/${code.toLowerCase()}/`,
      notation: true,
      note: LEGACY_NOTES[code],
    }));
  const groups = PHONEME_GROUPS.map((g) =>
    g.id === 'outros' ? { ...g, entries: [...g.entries, ...extras] } : g
  );

  const language = LANGUAGE_TOPICS.map((t) => ({
    ...t,
    count: t.types.reduce((sum, type) => sum + (typeCounts[type] ?? 0), 0),
  }));

  return (
    <div className="space-y-5">
      {groups.map((group) => {
        const tone = toneFor(group.id);
        const tile = (entry: PhonemeEntry) => (
          <TopicTile
            href={`${LIBRARY_PATH}/${phonemeTopic(entry).slug}`}
            label={entry.display}
            notation={entry.notation}
            note={entry.note}
            example={entry.example}
            count={phonemeCounts[entry.code] ?? 0}
            tone={tone}
          />
        );
        const ready = group.entries.filter(
          (e) => (phonemeCounts[e.code] ?? 0) > 0
        ).length;
        return (
          <GroupCard
            key={group.id}
            title={group.title}
            description={group.description}
            ready={ready}
            total={group.entries.length}
            chip={tone.chip}
            dot={tone.dot}
          >
            {group.pairs ? (
              <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {pairs(group.entries).map(([a, b]) => (
                  <li key={a.code} className="grid grid-cols-2 gap-2">
                    {tile(a)}
                    {b && tile(b)}
                  </li>
                ))}
              </ul>
            ) : (
              <ul className={`grid gap-3 ${columnsFor(group.entries.length)}`}>
                {group.entries.map((entry) => (
                  <li key={entry.code}>{tile(entry)}</li>
                ))}
              </ul>
            )}
          </GroupCard>
        );
      })}

      <GroupCard
        title="Linguagem"
        description="Vocabulário e categorias, independente do fonema."
        ready={language.filter((t) => t.count > 0).length}
        total={language.length}
        chip={toneFor('linguagem').chip}
        dot={toneFor('linguagem').dot}
      >
        <ul className={`grid gap-3 ${columnsFor(language.length)}`}>
          {language.map((topic) => (
            <li key={topic.id}>
              <TopicTile
                href={`${LIBRARY_PATH}/${topic.id}`}
                label={topic.label}
                notation={false}
                count={topic.count}
                tone={toneFor('linguagem')}
              />
            </li>
          ))}
        </ul>
      </GroupCard>
    </div>
  );
}

function GroupCard({
  title,
  description,
  ready,
  total,
  chip,
  dot,
  children,
}: {
  title: string;
  description: string;
  ready: number;
  total: number;
  chip: string;
  dot: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-violet-200/60 sm:p-6">
      <div className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className={`h-2.5 w-2.5 rounded-full ${dot}`} aria-hidden />
        <h2 className="font-display text-lg font-bold text-violet-950">
          {title}
        </h2>
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${chip}`}
        >
          {ready} de {total} com atividades
        </span>
        <p className="w-full text-sm text-neutral-600 sm:w-auto">
          {description}
        </p>
      </div>
      {children}
    </section>
  );
}

function pairs<T>(items: T[]): [T, T | undefined][] {
  const out: [T, T | undefined][] = [];
  for (let i = 0; i < items.length; i += 2) out.push([items[i], items[i + 1]]);
  return out;
}
