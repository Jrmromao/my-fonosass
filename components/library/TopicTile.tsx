import ExampleWord from '@/components/landing/ExampleWord';
import type { ToneClasses } from '@/components/library/tones';
import Link from 'next/link';

// Library index tile ("Lúdico refinado"): example word large and centered
// with the target sound underlined, phoneme and count below. Filled with the
// group's color when it has activities; light grey ("em breve") otherwise.

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
  const status = available ? countLabel(count) : 'em breve';

  // "Lúdico refinado": the example word is the hero, centered; the phoneme
  // and the count sit underneath. Topics without an example word (Linguagem)
  // show their name large instead.
  const content = (
    <>
      {example ? (
        <ExampleWord
          word={example}
          className={`font-display text-3xl font-black ${ink}`}
          decorationClass={
            available ? 'decoration-coral-500' : 'decoration-neutral-300'
          }
        />
      ) : (
        <span className={`font-display text-2xl font-black ${ink}`}>
          {label}
        </span>
      )}
      <span
        className={`text-xs font-semibold ${
          available ? 'text-violet-950/80' : 'text-neutral-400'
        }`}
      >
        {example && (
          <>
            <span className={notation ? 'font-mono' : ''}>{label}</span>
            {note && notation && ` ${note}`}
            {' · '}
          </>
        )}
        {status}
      </span>
    </>
  );

  const base =
    'flex h-full min-h-[8rem] flex-col items-center justify-center gap-1.5 rounded-2xl p-4 text-center';

  if (!available) {
    return (
      <div
        aria-label={`${label}, em breve`}
        className={`${base} bg-neutral-50`}
      >
        {content}
      </div>
    );
  }
  return (
    <Link
      href={href}
      className={`${base} ${tone.tile} ring-2 transition-transform hover:-rotate-1 hover:scale-[1.03] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-950 motion-reduce:transition-none motion-reduce:hover:transform-none`}
    >
      {content}
    </Link>
  );
}
