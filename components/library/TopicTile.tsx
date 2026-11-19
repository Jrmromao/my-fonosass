import ExampleWord from '@/components/landing/ExampleWord';
import type { ToneClasses } from '@/components/library/tones';
import Link from 'next/link';

// Library index tile: phoneme at the top, example word large with the target
// sound underlined, count pill in the corner. Filled with the group's color
// when it has activities; white and dashed ("Em breve") when it doesn't.

interface TopicTileProps {
  href: string;
  label: string;
  notation: boolean;
  note?: string;
  example?: string;
  count: number;
  tone: ToneClasses;
}

const countLabel = (n: number) =>
  `${n} ${n === 1 ? 'atividade' : 'atividades'}`;

export function TopicTile({
  href,
  label,
  notation,
  note,
  example,
  count,
  tone,
}: TopicTileProps) {
  const available = count > 0;
  const ink = available ? 'text-violet-950' : 'text-neutral-400';

  const content = (
    <>
      <span className="flex w-full min-w-0 items-start justify-between gap-2">
        <span
          className={`${
            notation
              ? 'font-mono text-sm font-semibold'
              : 'font-display text-base font-bold leading-tight'
          } ${ink}`}
        >
          {label}
          {note && notation && (
            <span
              className={`ml-1.5 font-sans text-xs font-normal ${
                available ? 'text-neutral-600' : 'text-neutral-400'
              }`}
            >
              {note}
            </span>
          )}
        </span>
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
            available
              ? 'bg-white/90 text-violet-950 shadow-sm'
              : 'text-neutral-400'
          }`}
        >
          {available ? countLabel(count) : 'Em breve'}
        </span>
      </span>
      {example ? (
        <ExampleWord
          word={example}
          className={`font-display text-2xl font-bold ${ink}`}
          decorationClass={
            available ? 'decoration-coral-500' : 'decoration-neutral-300'
          }
        />
      ) : note && !notation ? (
        <span
          className={`text-xs ${available ? 'text-neutral-600' : 'text-neutral-400'}`}
        >
          {note}
        </span>
      ) : null}
    </>
  );

  const base =
    'flex h-full min-h-[7rem] flex-col justify-between gap-4 rounded-xl p-4';

  if (!available) {
    return (
      <div
        aria-label={`${label}, em breve`}
        className={`${base} border border-dashed border-neutral-300 bg-white/60`}
      >
        {content}
      </div>
    );
  }
  return (
    <Link
      href={href}
      className={`${base} ${tone.tile} ring-1 transition-all hover:-translate-y-0.5 hover:shadow-md hover:ring-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-950`}
    >
      {content}
    </Link>
  );
}
