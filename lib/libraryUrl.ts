// Library URL in pt-BR: /dashboard/biblioteca?categoria=fonema&fonema=r-forte
// &idade=pre-escolar&dificuldade=iniciante&busca=sapo&pagina=2
//
// The URL uses Portuguese keys and slugs; the app and the API keep the
// internal codes (Activity.phoneme, Prisma enums). Client-safe.

export interface LibraryFilters {
  search: string;
  /** Activity.phoneme code, e.g. "R_FORTE". */
  phoneme: string;
  /** ActivityType, e.g. "SPEECH". */
  type: string;
  /** ActivityDifficulty, e.g. "BEGINNER". */
  difficulty: string;
  /** AgeRange, e.g. "PRESCHOOL". */
  ageRange: string;
  page: number;
}

export const LIBRARY_PATH = '/dashboard/biblioteca';

const KEYS = {
  search: 'busca',
  phoneme: 'fonema',
  type: 'categoria',
  difficulty: 'dificuldade',
  ageRange: 'idade',
  page: 'pagina',
} as const;

// English keys used before; still read so old links keep working.
const LEGACY_KEYS = {
  search: 'search',
  phoneme: 'phoneme',
  type: 'type',
  difficulty: 'difficulty',
  ageRange: 'ageRange',
  page: 'page',
} as const;

const TYPE_SLUGS: Record<string, string> = {
  SPEECH: 'fonema',
  LANGUAGE: 'linguagem',
  ANIMALS: 'animais',
  COLOURS: 'cores',
  NUMBERS_AND_LETTERS: 'numeros',
  ALPHABET: 'alfabeto',
  GEOMETRIC_SHAPES: 'figuras-geometricas',
  MEANS_OF_TRANSPORT: 'transporte',
  MOTOR_SKILLS: 'motricidade-fina',
  CLOTHING: 'roupas',
  PROFESSIONS: 'profissoes',
  HUMAN_BODY: 'corpo-humano',
  COGNITIVE: 'cognicao',
  MOTOR: 'motricidade',
  SOCIAL: 'social',
  OTHER: 'outros',
};

const DIFFICULTY_SLUGS: Record<string, string> = {
  BEGINNER: 'iniciante',
  INTERMEDIATE: 'intermediario',
  ADVANCED: 'avancado',
  EXPERT: 'especialista',
};

const AGE_SLUGS: Record<string, string> = {
  TODDLER: 'primeira-infancia',
  PRESCHOOL: 'pre-escolar',
  CHILD: 'idade-escolar',
  TEENAGER: 'adolescente',
  ADULT: 'adulto',
};

// Phonemes whose slug isn't just the lowercase code.
const PHONEME_SLUGS: Record<string, string> = {
  R_FORTE: 'r-forte',
  R_FRACO: 'r-fraco',
  ARQ_S: 'arquifonema-s',
  ARQ_R: 'arquifonema-r',
  ENC_R: 'encontro-r',
  ENC_L: 'encontro-l',
};

const invert = (map: Record<string, string>) =>
  Object.fromEntries(Object.entries(map).map(([k, v]) => [v, k]));

const TYPE_CODES = invert(TYPE_SLUGS);
const DIFFICULTY_CODES = invert(DIFFICULTY_SLUGS);
const AGE_CODES = invert(AGE_SLUGS);
const PHONEME_CODES = invert(PHONEME_SLUGS);

export function phonemeSlug(code: string): string {
  return PHONEME_SLUGS[code] ?? code.toLowerCase();
}

function phonemeFromSlug(slug: string): string {
  return PHONEME_CODES[slug] ?? slug.toUpperCase();
}

/** Accepts a slug, or an internal code from an old English URL. */
const fromSlug = (
  value: string,
  codes: Record<string, string>,
  slugs: Record<string, string>
) => codes[value] ?? (slugs[value] ? value : '');

export function parseLibraryParams(params: URLSearchParams): {
  filters: LibraryFilters;
  /** True when the URL used old English keys and should be rewritten. */
  legacy: boolean;
} {
  let legacy = false;
  const read = (key: keyof typeof KEYS) => {
    const value = params.get(KEYS[key]);
    if (value !== null) return value;
    const old = params.get(LEGACY_KEYS[key]);
    if (old !== null) legacy = true;
    return old ?? '';
  };

  const rawPhoneme = read('phoneme');
  const filters: LibraryFilters = {
    search: read('search'),
    phoneme: rawPhoneme ? phonemeFromSlug(rawPhoneme) : '',
    type: fromSlug(read('type'), TYPE_CODES, TYPE_SLUGS),
    difficulty: fromSlug(
      read('difficulty'),
      DIFFICULTY_CODES,
      DIFFICULTY_SLUGS
    ),
    ageRange: fromSlug(read('ageRange'), AGE_CODES, AGE_SLUGS),
    page: Math.max(1, parseInt(read('page') || '1') || 1),
  };
  return { filters, legacy };
}

/** Query string for the given filters; empty values and page 1 are omitted. */
export function libraryQuery(filters: Partial<LibraryFilters>): string {
  const params = new URLSearchParams();
  if (filters.type) params.set(KEYS.type, TYPE_SLUGS[filters.type] ?? '');
  if (filters.phoneme) params.set(KEYS.phoneme, phonemeSlug(filters.phoneme));
  if (filters.ageRange)
    params.set(KEYS.ageRange, AGE_SLUGS[filters.ageRange] ?? '');
  if (filters.difficulty)
    params.set(KEYS.difficulty, DIFFICULTY_SLUGS[filters.difficulty] ?? '');
  if (filters.search) params.set(KEYS.search, filters.search);
  if (filters.page && filters.page > 1)
    params.set(KEYS.page, String(filters.page));
  [...params.keys()].forEach((k) => {
    if (!params.get(k)) params.delete(k);
  });
  return params.toString();
}

/** Full library URL, e.g. libraryHref({ phoneme: 'S' }). */
export function libraryHref(filters: Partial<LibraryFilters> = {}): string {
  const qs = libraryQuery(filters);
  return qs ? `${LIBRARY_PATH}?${qs}` : LIBRARY_PATH;
}
