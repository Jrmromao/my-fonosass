// pt-BR labels for the activity enums. Never show the raw enum values
// (SPEECH, BEGINNER, PRESCHOOL…) to users. Client-safe (no Prisma import).

export const TYPE_LABELS: Record<string, string> = {
  ANIMALS: 'Animais',
  COLOURS: 'Cores',
  MEANS_OF_TRANSPORT: 'Transporte',
  CLOTHING: 'Roupas',
  LANGUAGE: 'Linguagem',
  PROFESSIONS: 'Profissões',
  GEOMETRIC_SHAPES: 'Formas geométricas',
  NUMBERS_AND_LETTERS: 'Números',
  ALPHABET: 'Alfabeto',
  MOTOR_SKILLS: 'Motricidade fina',
  HUMAN_BODY: 'Corpo humano',
  OTHER: 'Outros',
  // SPEECH is the "Fonema" category in Nova atividade (lib/activityCategories).
  SPEECH: 'Fonema',
  COGNITIVE: 'Cognição',
  MOTOR: 'Motricidade',
  SOCIAL: 'Social',
};

export const DIFFICULTY_LABELS: Record<string, string> = {
  BEGINNER: 'Iniciante',
  INTERMEDIATE: 'Intermediário',
  ADVANCED: 'Avançado',
  EXPERT: 'Especialista',
};

export const AGE_LABELS: Record<string, string> = {
  TODDLER: 'Primeira infância',
  PRESCHOOL: 'Pré-escolar',
  CHILD: 'Idade escolar',
  TEENAGER: 'Adolescente',
  ADULT: 'Adulto',
};

const PHONEME_DISPLAY: Record<string, string> = {
  R_FORTE: '/R/ forte',
  R_FRACO: '/r/ fraco',
  ARQ_S: 'Arquifonema /S/',
  ARQ_R: 'Arquifonema /R/',
  ENC_R: 'Encontro consonantal /r/',
  ENC_L: 'Encontro consonantal /l/',
};

/** "S" -> "/s/", "R_FORTE" -> "/R/ forte". */
export function phonemeLabel(code: string): string {
  if (!code) return '';
  return PHONEME_DISPLAY[code] ?? `/${code.toLowerCase()}/`;
}

export const label = (map: Record<string, string>, value?: string | null) =>
  (value && map[value]) || value || '';

/**
 * What an activity is about: its phoneme ("/s/", "/R/ forte") or, for
 * categories without one (Linguagem, Cores...), the category name.
 */
export function subjectLabel(phoneme: string | null | undefined, type: string) {
  return phoneme ? phonemeLabel(phoneme) : label(TYPE_LABELS, type);
}
