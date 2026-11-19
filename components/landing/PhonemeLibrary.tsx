import {
  LEGACY_NOTES,
  MIN_ACTIVITIES_TO_SHOW_COUNT,
  PHONEME_GROUPS,
  type PhonemeEntry,
} from '@/lib/phonemes';
import Link from 'next/link';
import ExampleWord from './ExampleWord';
import { freeOfferText } from '@/lib/freeOffer';
import FreePhonemeTile, {
  FreeSamplesButton,
  type FreePreviewActivity,
} from './FreePhonemeTile';

// Library card colors: light blue fill and border
// for available entries, coral underline on the target sound. "Em breve"
// entries are white with grey text. See DESIGN_SYSTEM.md.
const CARD_CLASS = 'border-2 border-sky-300 bg-sky-100';
const UNDERLINE_CLASS = 'decoration-coral-500';

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

  // The free offer exists only when there are free samples to show.
  const freeAvailable = freePreview.length > 0;
  const hasComingSoon =
    groups.some((g) => g.entries.some((e) => !counts.get(e.code))) ||
    languageTopics.some((t) => t.count === 0);
  // Tiles of the phonemes in this month's free list are highlighted.
  const freePhonemes = new Set(
    freePreview.map((a) => a.phoneme).filter(Boolean)
  );

  const renderEntry = (entry: PhonemeEntry) => {
    const count = counts.get(entry.code) ?? 0;
    if (freeAvailable && freePhonemes.has(entry.code)) {
      return (
        <FreePhonemeTile
          phoneme={entry.code}
          count={count}
          activities={freePreview}
          example={entry.example}
        />
      );
    }
    return (
      <Tile
        label={entry.display}
        notation={entry.notation}
        note={entry.note}
        example={entry.example}
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
              : 'Organizada por fonema, com atividades novas todo mês.'}
          </h2>
          <p className="text-neutral-600 max-w-sm text-sm leading-relaxed">
            Cada fonema com uma palavra de exemplo. Escolha, baixe e imprima
            para usar na sessão.
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
            {freeOfferText(freePreview)} para quem cria uma conta.{' '}
            <FreeSamplesButton
              activities={freePreview}
              className="font-semibold text-coral-800 underline underline-offset-4"
            >
              Ver as atividades
            </FreeSamplesButton>
            . As demais fazem parte da assinatura.
          </p>
        ) : (
          hasComingSoon && (
            <p className="mt-8 text-sm text-neutral-600">
              Os itens marcados como &ldquo;Em breve&rdquo; estão em produção e
              entram na biblioteca nos próximos meses, sem custo extra para
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
      <h3 className="font-display text-lg font-bold">{title}</h3>
      <p className="text-sm text-neutral-600">{description}</p>
    </div>
  );
}

// Library card: phoneme small at the top, example word large with the
// target sound underlined, count or "Em breve" in the corner.
function Tile({
  label,
  notation,
  note,
  example,
  count,
}: {
  label: string;
  notation: boolean;
  note?: string;
  example?: string;
  count: number;
}) {
  const available = count > 0;
  const head = (
    <span className="flex w-full min-w-0 flex-wrap items-baseline justify-between gap-x-2 gap-y-1">
      <span
        className={`${notation ? 'font-mono text-base font-semibold' : 'font-display text-base font-bold leading-tight'} ${
          available
            ? 'text-neutral-900 group-hover:text-white'
            : 'text-neutral-400'
        }`}
      >
        {label}
        {note && notation && (
          <span
            className={`ml-1.5 font-sans text-xs font-normal ${
              available
                ? 'text-neutral-600 group-hover:text-neutral-300'
                : 'text-neutral-400'
            }`}
          >
            {note}
          </span>
        )}
      </span>
      <span
        className={`shrink-0 text-xs ${
          available
            ? 'text-neutral-600 group-hover:text-neutral-300'
            : 'text-neutral-400'
        }`}
      >
        {available ? countLabel(count) : 'Em breve'}
      </span>
    </span>
  );

  const body = example ? (
    <ExampleWord
      word={example}
      className={`font-display text-2xl font-bold ${
        available
          ? 'text-neutral-900 group-hover:text-white'
          : 'text-neutral-400'
      }`}
      decorationClass={available ? UNDERLINE_CLASS : 'decoration-neutral-300'}
    />
  ) : // No example word (e.g. Linguagem topics): the note, if any, fills in.
  note && !notation ? (
    <span
      className={`text-xs ${available ? 'text-neutral-600 group-hover:text-neutral-300' : 'text-neutral-400'}`}
    >
      {note}
    </span>
  ) : null;

  const base = 'flex h-full flex-col justify-between gap-5 rounded-lg p-4';

  if (!available) {
    return (
      <div
        aria-label={`${label}, em breve`}
        className={`${base} border border-neutral-200 bg-white`}
      >
        {head}
        {body}
      </div>
    );
  }

  return (
    <Link
      href="/sign-up"
      className={`group ${base} ${CARD_CLASS} transition-colors hover:border-neutral-900 hover:bg-neutral-900`}
    >
      {head}
      {body}
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
  3: 'grid-cols-2 sm:grid-cols-3',
  4: 'grid-cols-2 sm:grid-cols-4',
  5: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5',
  6: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6',
};

function columnsFor(count: number): string {
  return COLUMNS[Math.min(Math.max(count, 1), 6)];
}
