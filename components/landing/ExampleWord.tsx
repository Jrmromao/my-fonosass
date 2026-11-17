// Renders an example word with the target sound underlined.
// Input uses square brackets around the target: "[p]ato", "pa[lh]aço".
// Server-safe (no hooks), so client components can use it too.

interface ExampleWordProps {
  word: string;
  className?: string;
  /** Underline color class, e.g. 'decoration-amber-500'. */
  decorationClass?: string;
}

export default function ExampleWord({
  word,
  className = '',
  decorationClass = 'decoration-amber-500',
}: ExampleWordProps) {
  const parts = word.split(/(\[[^\]]+\])/).filter(Boolean);
  const plain = word.replace(/[[\]]/g, '');

  return (
    <span className={className} aria-label={plain}>
      {parts.map((part, i) =>
        part.startsWith('[') ? (
          <span
            key={i}
            aria-hidden
            className={`underline decoration-[3px] underline-offset-[5px] ${decorationClass}`}
          >
            {part.slice(1, -1)}
          </span>
        ) : (
          <span key={i} aria-hidden>
            {part}
          </span>
        )
      )}
    </span>
  );
}
