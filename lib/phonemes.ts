import type { ActivityType } from '@prisma/client';

// Library taxonomy, defined with Eliane Mota (fonoaudióloga).
// Phoneme codes must match Activity.phoneme in the DB (uppercase).
// Entries without published activities render as "Em breve".

export interface PhonemeEntry {
  /** Value stored in Activity.phoneme. */
  code: string;
  /** What the tile shows. Phonemes use /x/ notation (rendered in mono). */
  display: string;
  /** Whether `display` is phoneme notation (mono) or a category name. */
  notation: boolean;
  /** Optional clarification under the label. */
  note?: string;
  /**
   * Example word shown on the library card. The target sound goes in
   * square brackets and is underlined on screen, e.g. "[p]ato", "pa[lh]aço".
   * Words to be confirmed by Eliane.
   */
  example?: string;
}

export interface PhonemeGroup {
  id: string;
  title: string;
  description: string;
  /** Render entries two by two (voiceless / voiced). */
  pairs?: boolean;
  entries: PhonemeEntry[];
}

const phoneme = (
  code: string,
  example?: string,
  note?: string
): PhonemeEntry => ({
  code,
  display: `/${code.toLowerCase()}/`,
  notation: true,
  example,
  note,
});

export const PHONEME_GROUPS: PhonemeGroup[] = [
  {
    id: 'pares',
    title: 'Pares surdo e sonoro',
    description:
      'Fonemas produzidos no mesmo ponto, com e sem vibração das pregas vocais.',
    pairs: true,
    entries: [
      phoneme('P', '[p]ato'),
      phoneme('B', '[b]ola'),
      phoneme('T', '[t]atu'),
      phoneme('D', '[d]ado'),
      phoneme('F', '[f]aca'),
      phoneme('V', '[v]aca'),
      phoneme('K', '[c]asa'),
      phoneme('G', '[g]ato'),
      phoneme('CH', '[ch]ave'),
      phoneme('J', '[j]anela'),
      phoneme('S', '[s]apo'),
      phoneme('Z', '[z]ebra'),
    ],
  },
  {
    id: 'outros',
    title: 'Nasais, laterais e vibrantes',
    description: 'O R forte e o r fraco têm blocos separados.',
    entries: [
      phoneme('M', '[m]acaco'),
      phoneme('N', '[n]avio'),
      phoneme('L', '[l]ua'),
      phoneme('LH', 'pa[lh]aço'),
      // R split per Eliane: R forte (rato, carro) and r fraco (arara, barata).
      // Uppercase/lowercase follows clinical convention.
      {
        code: 'R_FORTE',
        display: '/R/',
        notation: true,
        note: 'forte',
        example: '[r]ato',
      },
      {
        code: 'R_FRACO',
        display: '/r/',
        notation: true,
        note: 'fraco',
        example: 'a[r]ara',
      },
    ],
  },
  {
    id: 'arquifonema',
    title: 'Arquifonema',
    description: '/S/ e /R/ no fim da sílaba.',
    entries: [
      // Split per Eliane: /S/ (pasta) and /R/ (porta). Uppercase between
      // slashes is the clinical notation for arquifonema.
      {
        code: 'ARQ_S',
        display: 'Arquifonema /S/',
        notation: false,
        note: 'como em "pasta" e "lápis"',
        example: 'pa[s]ta',
      },
      {
        code: 'ARQ_R',
        display: 'Arquifonema /R/',
        notation: false,
        note: 'como em "porta" e "mar"',
        example: 'po[r]ta',
      },
    ],
  },
  {
    id: 'encontro',
    title: 'Encontro consonantal',
    description: '/r/ e /l/ depois de outra consoante, na mesma sílaba.',
    entries: [
      {
        code: 'ENC_R',
        display: 'Encontro com /r/',
        notation: false,
        note: 'como em "prato" e "bruxa"',
        example: '[pr]ato',
      },
      {
        code: 'ENC_L',
        display: 'Encontro com /l/',
        notation: false,
        note: 'como em "planta" e "bloco"',
        example: '[pl]anta',
      },
    ],
  },
];

/** Every phoneme code shown on the landing page, in display order. */
export const PHONEMES: string[] = PHONEME_GROUPS.flatMap((g) =>
  g.entries.map((e) => e.code)
);

/**
 * Codes still in the DB that the taxonomy replaced. Shown as extra tiles with
 * this note until each activity is reclassified (e.g. 'R' -> R_FORTE/R_FRACO).
 */
export const LEGACY_NOTES: Record<string, string> = {
  R: 'forte e fraco',
};

export interface LanguageTopic {
  id: string;
  label: string;
  /** Activity types counted for this topic. Empty = not in the catalog yet. */
  types: ActivityType[];
}

// "Linguagem" is a separate topic from phonology (vocabulary and categories).
export const LANGUAGE_TOPICS: LanguageTopic[] = [
  { id: 'cores', label: 'Cores', types: ['COLOURS'] },
  { id: 'animais', label: 'Animais', types: ['ANIMALS'] },
  { id: 'alimentos', label: 'Alimentos', types: [] },
  { id: 'numeros', label: 'Números', types: ['NUMBERS_AND_LETTERS'] },
];

// Below this many published activities the landing headline talks about the
// catalog in general instead of quoting a small number.
export const MIN_ACTIVITIES_TO_SHOW_COUNT = 50;

/** Example word ("[p]ato") for a phoneme code, if the taxonomy has one. */
export function exampleWordFor(code: string): string | undefined {
  for (const group of PHONEME_GROUPS) {
    const entry = group.entries.find((e) => e.code === code);
    if (entry) return entry.example;
  }
  return undefined;
}
