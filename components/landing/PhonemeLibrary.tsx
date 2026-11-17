import {
  LEGACY_NOTES,
  MIN_ACTIVITIES_TO_SHOW_COUNT,
  PHONEME_GROUPS,
  type PhonemeEntry,
} from '@/lib/phonemes';
import { FREE_PHONEME } from '@/lib/pricing';
import Link from 'next/link';
import FreePhonemeTile, { type FreePreviewActivity } from './FreePhonemeTile';

export interface PhonemeCount {
  phoneme: string;
  count: number;
}

export interface TopicCount {
  id: string;
  label: string;
  count: number;
}

interface PhonemeLibraryProps {
  phonemes: PhonemeCount[];
  languageTopics: TopicCount[];
  freePreview: FreePreviewActivity[];
  totalActivities: number;
}

const countLabel = (n: number) =>
  `${n} ${n === 1 ? 'atividade' : 'atividades'}`;

export default function PhonemeLibrary({
  phonemes,
  languageTopics,
  freePreview,
  totalActivities,
}: PhonemeLibraryProps) {
  const counts = new Map(phonemes.map((p) => [p.phoneme, p.count]));

  // Phonemes in the DB that the taxonomy doesn't know yet still show up,
  // appended to the "outros" group, so nothing published is hidden.
  const known = new Set(
    PHONEME_GROUPS.flatMap((g) => g.entries.map((e) => e.code))
  );
  const extras: PhonemeEntry[] = phonemes
    .filter((p) => !known.has(p.phoneme) && p.count > 0)
    .map((p) => ({
      code: p.phoneme,
      display: `/${p.phoneme.toLowerCase()}/`,
      notation: true,
      note: LEGACY_NOTES[p.phoneme],
    }));
  const groups = PHONEME_GROUPS.map((g) =>
    g.id === 'outros' ? { ...g, entries: [...g.entries, ...extras] } : g
  );

  const freeAvailable = (counts.get(FREE_PHONEME) ?? 0) > 0;
  const hasComingSoon =
    groups.some((g) => g.entries.some((e) => !counts.get(e.code))) ||
    languageTopics.some((t) => t.count === 0);
  const freeLabel = `/${FREE_PHONEME.toLowerCase()}/`;

  const renderEntry = (entry: PhonemeEntry) => {
    const count = counts.get(entry.code) ?? 0;
    if (count > 0 && entry.code === FREE_PHONEME) {
      return (
        <FreePhonemeTile
          phoneme={entry.code}
          count={count}
          activities={freePreview}
        />
      );
    }
    return (
      <Tile
        label={entry.display}
        notation={entry.notation}
        note={entry.note}
        count={count}
      />
    );
  };

  return (
    <section
      id="biblioteca"
      className="border-t border-violet-200 bg-violet-50 py-20"
    >
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
          <h2 className="font-display text-3xl font-bold max-w-md leading-tight">
            {totalActivities >= MIN_ACTIVITIES_TO_SHOW_COUNT
              ? `${totalActivities} atividades prontas, organizadas por fonema.`
              : 'Organizada por fonema, com novas atividades toda semana.'}
          </h2>
          <p className="text-neutral-600 max-w-sm text-sm leading-relaxed">
            Atividades para pré-escolares, crianças em idade escolar e
            adolescentes, em três níveis de dificuldade.
          </p>
        </div>

        <div className="space-y-12">
          {groups.map((group) => (
            <div key={group.id}>
              <GroupHeading
                title={group.title}
                description={group.description}
              />
              {group.pairs ? (
                <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {chunkPairs(group.entries).map(([a, b]) => (
                    <li key={a.code} className="grid grid-cols-2 gap-1.5">
                      {renderEntry(a)}
                      {b && renderEntry(b)}
                    </li>
                  ))}
                </ul>
              ) : (
                <ul
                  className={`grid gap-2 ${columnsFor(group.entries.length)}`}
                >
                  {group.entries.map((entry) => (
                    <li key={entry.code}>{renderEntry(entry)}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}

          <div>
            <GroupHeading
              title="Linguagem"
              description="Vocabulário e categorias, independente do fonema."
            />
            <ul className={`grid gap-2 ${columnsFor(languageTopics.length)}`}>
              {languageTopics.map((topic) => (
                <li key={topic.id}>
                  <Tile
                    label={topic.label}
                    notation={false}
                    count={topic.count}
                  />
                </li>
              ))}
            </ul>
          </div>
        </div>

        {freeAvailable ? (
          <p className="mt-8 text-sm text-neutral-600">
            <span className="font-semibold text-neutral-900">
              Experimente grátis:
            </span>{' '}
            clique no{' '}
            <span className="font-mono font-semibold text-coral-800">
              {freeLabel}
            </span>{' '}
            para ver exemplos das atividades. Todas as atividades desse fonema
            são grátis com sua conta; os demais fazem parte da assinatura.
          </p>
        ) : (
          hasComingSoon && (
            <p className="mt-8 text-sm text-neutral-600">
              Os itens marcados como &ldquo;Em breve&rdquo; estão em produção e
              entram na biblioteca nas próximas semanas, sem custo extra para
              assinantes.
            </p>
          )
        )}
      </div>
    </section>
  );
}

function GroupHeading({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="mb-4 flex flex-col sm:flex-row sm:items-baseline sm:gap-3">
      <h3 className="font-display text-lg font-bold text-neutral-900">
        {title}
      </h3>
      <p className="text-sm text-neutral-600">{description}</p>
    </div>
  );
}

function Tile({
  label,
  notation,
  note,
  count,
}: {
  label: string;
  notation: boolean;
  note?: string;
  count: number;
}) {
  const labelClass = notation
    ? 'font-mono text-2xl font-semibold'
    : 'font-display text-lg font-bold leading-tight';

  if (count === 0) {
    return (
      <div
        aria-label={`${label}, em breve`}
        className="flex h-full flex-col items-start justify-between gap-3 rounded-md border border-neutral-200 bg-white p-4"
      >
        <span>
          <span className={`block ${labelClass} text-neutral-400`}>
            {label}
          </span>
          {note && (
            <span className="mt-1 block text-xs text-neutral-400">{note}</span>
          )}
        </span>
        <span className="text-xs text-neutral-400">Em breve</span>
      </div>
    );
  }

  return (
    <Link
      href="/sign-up"
      className="group flex h-full flex-col items-start justify-between gap-6 rounded-md border border-yellow-400 bg-yellow-100 p-4 transition-colors hover:border-neutral-900 hover:bg-neutral-900"
    >
      <span>
        <span
          className={`block ${labelClass} text-neutral-900 group-hover:text-white`}
        >
          {label}
        </span>
        {note && (
          <span className="mt-1 block text-xs text-neutral-600 group-hover:text-neutral-300">
            {note}
          </span>
        )}
      </span>
      <span className="text-xs text-neutral-600 group-hover:text-neutral-300">
        {countLabel(count)}
      </span>
    </Link>
  );
}

function chunkPairs<T>(items: T[]): [T, T | undefined][] {
  const out: [T, T | undefined][] = [];
  for (let i = 0; i < items.length; i += 2) out.push([items[i], items[i + 1]]);
  return out;
}

// Literal class names so Tailwind can see them. One row per group, no empty
// cells: the column count matches the number of entries (max 6).
const COLUMNS: Record<number, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-2 sm:grid-cols-4',
  5: 'grid-cols-3 sm:grid-cols-5',
  6: 'grid-cols-3 sm:grid-cols-6',
};

function columnsFor(count: number): string {
  return COLUMNS[Math.min(Math.max(count, 1), 6)];
}
