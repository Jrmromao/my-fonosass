// One color per library group, all from the brand palette (logo colors and
// the landing page). Literal class names so Tailwind can see them (this file
// must stay under components/: lib/ is not in tailwind.config.js content).
// See DESIGN_SYSTEM.md, "Library group colors".

import { PHONEME_GROUPS } from '@/lib/phonemes';

export type LibraryTone = 'sky' | 'sun' | 'coral' | 'cream' | 'violet';

export interface ToneClasses {
  /** Available tile: fill + ring. */
  tile: string;
  /** Count pill and group chip. */
  chip: string;
  /** Page header banner ("Lúdico refinado": a saturated rounded block). */
  band: string;
  /** Small dot next to the group title. */
  dot: string;
}

export const TONES: Record<LibraryTone, ToneClasses> = {
  sky: {
    tile: 'bg-sky-100 ring-sky-300',
    chip: 'bg-sky-200 text-violet-950',
    band: 'bg-sky-200',
    dot: 'bg-sky-400',
  },
  sun: {
    tile: 'bg-sun-100 ring-sun-300',
    chip: 'bg-sun-300 text-violet-950',
    band: 'bg-sun-300',
    dot: 'bg-sun-400',
  },
  coral: {
    tile: 'bg-coral-50 ring-coral-200',
    chip: 'bg-coral-100 text-coral-900',
    band: 'bg-coral-200',
    dot: 'bg-coral-500',
  },
  cream: {
    tile: 'bg-cream-100 ring-cream-300',
    chip: 'bg-cream-300 text-violet-950',
    band: 'bg-cream-300',
    dot: 'bg-cream-300',
  },
  violet: {
    tile: 'bg-violet-100 ring-violet-200',
    chip: 'bg-violet-200 text-violet-950',
    band: 'bg-violet-200',
    dot: 'bg-violet-400',
  },
};

/**
 * Group id (lib/phonemes.ts) -> tone.
 * "linguagem" = single Linguagem tile; "temas" = Outros (cores, animais…).
 */
export const GROUP_TONE: Record<string, LibraryTone> = {
  pares: 'sky',
  outros: 'sun',
  arquifonema: 'coral',
  encontro: 'cream',
  linguagem: 'violet',
  temas: 'cream',
};

export const toneFor = (groupId: string): ToneClasses =>
  TONES[GROUP_TONE[groupId] ?? 'sky'];

/** White card on the lavender page (dashboard sections and panels). */
export const CARD = 'rounded-3xl bg-white';

/** Tone of the group a phoneme code belongs to (sky for unknown codes). */
export function toneForPhoneme(code: string): ToneClasses {
  const group = PHONEME_GROUPS.find((g) =>
    g.entries.some((e) => e.code === code)
  );
  return toneFor(group?.id ?? (code ? 'pares' : 'linguagem'));
}
