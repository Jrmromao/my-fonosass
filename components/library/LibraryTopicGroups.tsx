import { TopicTile } from '@/components/library/TopicTile';
import { phonemeTopic } from '@/lib/libraryTopics';
import { toneFor } from '@/components/library/tones';
import { LIBRARY_PATH } from '@/lib/libraryUrl';
import {
  LANGUAGE_TOPIC,
  LEGACY_NOTES,
  OTHER_TOPICS,
  PHONEME_GROUPS,
  type LanguageTopic,
  type PhonemeEntry,
} from '@/lib/phonemes';

// The library index: one white card per group (pares, nasais, arquifonema,
// encontro, linguagem, outros/temas), each with its own color. Pure
// presentation: counts come from the page (/api/library/counts).

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

  const withCount = (t: LanguageTopic) => ({
    ...t,
    count: t.types.reduce((sum, type) => sum + (typeCounts[type] ?? 0), 0),
  });
  const language = withCount(LANGUAGE_TOPIC);
  const other = OTHER_TOPICS.map(withCount);

  return (
    <div className="space-y-4">
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
        description="Vocabulário, compreensão e expressão, independente do fonema."
        ready={language.count > 0 ? 1 : 0}
        total={1}
        chip={toneFor('linguagem').chip}
      >
        <ul className={`grid gap-3 ${columnsFor(1)}`}>
          <li>
            <TopicTile
              href={`${LIBRARY_PATH}/${language.id}`}
              label={language.label}
              notation={false}
              count={language.count}
              tone={toneFor('linguagem')}
            />
          </li>
        </ul>
      </GroupCard>

      <GroupCard
        title="Outros"
        description="Temas de vocabulário e categorias, independente do fonema."
        ready={other.filter((t) => t.count > 0).length}
        total={other.length}
        chip={toneFor('temas').chip}
      >
        <ul className={`grid gap-3 ${columnsFor(other.length)}`}>
          {other.map((topic) => (
            <li key={topic.id}>
              <TopicTile
                href={`${LIBRARY_PATH}/${topic.id}`}
                label={topic.label}
                notation={false}
                count={topic.count}
                tone={toneFor('temas')}
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
  children,
}: {
  title: string;
  description: string;
  ready: number;
  total: number;
  chip: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl bg-white p-6">
      <div className="mb-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className={`rounded-full px-3 py-1 text-xs font-bold ${chip}`}>
            {ready} de {total}
            <span className="sr-only"> com atividades</span>
          </span>
          <h2 className="font-display text-xl font-black text-violet-950">
            {title}
          </h2>
        </div>
        <p className="mt-1 text-sm text-neutral-600">{description}</p>
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
