// What an activity is about, as chosen in "Nova atividade". Client-safe.
// "Fonema" activities need a phoneme; every other category has none and is
// identified by its ActivityType.

export interface ActivityCategory {
  id: string;
  label: string;
  /** Activity.type stored for this category (Prisma ActivityType). */
  type: string;
  requiresPhoneme: boolean;
}

export const ACTIVITY_CATEGORIES: ActivityCategory[] = [
  { id: 'fonema', label: 'Fonema', type: 'SPEECH', requiresPhoneme: true },
  {
    id: 'linguagem',
    label: 'Linguagem',
    type: 'LANGUAGE',
    requiresPhoneme: false,
  },
  { id: 'animais', label: 'Animais', type: 'ANIMALS', requiresPhoneme: false },
  { id: 'cores', label: 'Cores', type: 'COLOURS', requiresPhoneme: false },
  {
    id: 'numeros',
    label: 'Números',
    type: 'NUMBERS_AND_LETTERS',
    requiresPhoneme: false,
  },
  {
    id: 'formas',
    label: 'Figuras geométricas',
    type: 'GEOMETRIC_SHAPES',
    requiresPhoneme: false,
  },
  {
    id: 'alfabeto',
    label: 'Alfabeto',
    type: 'ALPHABET',
    requiresPhoneme: false,
  },
  {
    id: 'transporte',
    label: 'Transporte',
    type: 'MEANS_OF_TRANSPORT',
    requiresPhoneme: false,
  },
  {
    id: 'motricidade',
    label: 'Motricidade fina',
    type: 'MOTOR_SKILLS',
    requiresPhoneme: false,
  },
];

export function findCategory(id: string | null | undefined) {
  return ACTIVITY_CATEGORIES.find((c) => c.id === id);
}
