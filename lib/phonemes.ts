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
}

export interface PhonemeGroup {
  id: string;
  title: string;
  description: string;
  /** Render entries two by two (voiceless / voiced). */
  pairs?: boolean;
  entries: PhonemeEntry[];
}

const phoneme = (code: string, note?: string): PhonemeEntry => ({
  code,
  display: `/${code.toLowerCase()}/`,
  notation: true,
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
      phoneme('P'),
      phoneme('B'),
      phoneme('T'),
      phoneme('D'),
      phoneme('F'),
      phoneme('V'),
      phoneme('K'),
      phoneme('G'),
      phoneme('CH'),
      phoneme('J'),
      phoneme('S'),
      phoneme('Z'),
    ],
  },
  {
    id: 'outros',
    title: 'Nasais, laterais e vibrantes',
    description: 'Inclui o /r/ forte e o /r/ fraco.',
    entries: [
      phoneme('M'),
      phoneme('N'),
      phoneme('L'),
      phoneme('LH'),
      phoneme('R', 'forte e fraco'),
    ],
  },
  {
    id: 'posicoes',
    title: 'Arquifonema e encontro consonantal',
    description: '/r/ e /l/ no fim da sílaba e depois de outra consoante.',
    entries: [
      {
        code: 'ARQ',
        display: 'Arquifonema',
        notation: false,
        note: '/r/ e /l/, como em "porta" e "sol"',
      },
      {
        code: 'ENC',
        display: 'Encontro consonantal',
        notation: false,
        note: 'com /r/ e /l/, como em "prato" e "planta"',
      },
    ],
  },
];

/** Every phoneme code shown on the landing page, in display order. */
export const PHONEMES: string[] = PHONEME_GROUPS.flatMap((g) =>
  g.entries.map((e) => e.code)
);

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
