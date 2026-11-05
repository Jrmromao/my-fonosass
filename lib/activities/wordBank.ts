/**
 * Curated pt-BR word bank for speech-therapy activities.
 *
 * Why this exists: the AI can propose themed words, but it cannot be trusted to
 * know whether a word is *phonetically* right for a target phoneme — e.g. it
 * confuses R-forte (/r/, "rato", "carro") with R-fraco (/ɾ/, "cara", "porta"),
 * or /s/ ("sapo") with the /z/ sound that the letter "s" makes in "casa".
 *
 * Every entry here is vetted: the word genuinely contains the phoneme at the
 * recorded position. This lets us (a) hard-verify AI output against known-good
 * words and (b) fall back to the bank when the AI can't supply enough valid
 * words, so an activity is never shipped with phonetically wrong content.
 *
 * Phoneme keys use simple ASCII tokens (not IPA) to match how the rest of the
 * app passes `phoneme` around:
 *   'R'  -> R-forte / vibrante (rato, carro, rua)
 *   'r'  -> R-fraco / tepe     (cara, porta, amor)
 *   'L'  -> L lateral          (lua, bola, sol)
 *   'LH' -> lateral palatal    (palha, filho)
 *   'S'  -> /s/ surdo          (sapo, pasta)
 *   'Z'  -> /z/ sonoro         (zebra, casa)
 *   'CH' -> /ʃ/                (chuva, bicho)
 *   'J'  -> /ʒ/                (jato, gelo)
 *   'K'  -> /k/                (casa, quilo)
 *   'G'  -> /g/ (oclusivo)     (gato, fogo)
 */

export type Position = 'initial' | 'medial' | 'final';

/**
 * Semantic theme tags, so a sheet can require *phoneme ∧ position ∧ theme*
 * (e.g. "Mercado do S" = /S/-initial ∧ alimentos). A word may belong to
 * several themes. Tags are curated by hand alongside the phonetic vetting —
 * never inferred — so an absent tag means "not vetted for that theme", not
 * "definitely not that theme".
 */
export type Theme =
  | 'animais'
  | 'alimentos'
  | 'objetos'
  | 'natureza'
  | 'corpo'
  | 'roupas'
  | 'transporte'
  | 'casa'
  | 'brinquedos';

export interface BankWord {
  word: string;
  /** Position(s) where the target phoneme occurs in this word. */
  positions: Position[];
  /** Rough syllable count, used as an age/complexity proxy. */
  syllables: number;
  /** Semantic theme tag(s). Optional — only present where hand-curated. */
  themes?: Theme[];
}

export type PhonemeKey =
  | 'R'
  | 'r'
  | 'L'
  | 'LH'
  | 'S'
  | 'Z'
  | 'CH'
  | 'J'
  | 'K'
  | 'G';

export const WORD_BANK: Record<PhonemeKey, BankWord[]> = {
  // R-forte / vibrante múltipla — word-initial R, or "rr" between vowels.
  R: [
    { word: 'RATO', positions: ['initial'], syllables: 2, themes: ['animais'] },
    { word: 'RUA', positions: ['initial'], syllables: 2 },
    {
      word: 'ROSA',
      positions: ['initial'],
      syllables: 2,
      themes: ['natureza'],
    },
    { word: 'RODA', positions: ['initial'], syllables: 2 },
    { word: 'RIO', positions: ['initial'], syllables: 2, themes: ['natureza'] },
    {
      word: 'RAPOSA',
      positions: ['initial'],
      syllables: 3,
      themes: ['animais'],
    },
    { word: 'RABO', positions: ['initial'], syllables: 2, themes: ['corpo'] },
    {
      word: 'RAMO',
      positions: ['initial'],
      syllables: 2,
      themes: ['natureza'],
    },
    { word: 'ROUPA', positions: ['initial'], syllables: 2, themes: ['roupas'] },
    {
      word: 'CARRO',
      positions: ['medial'],
      syllables: 2,
      themes: ['transporte'],
    },
    { word: 'FERRO', positions: ['medial'], syllables: 2 },
    {
      word: 'TERRA',
      positions: ['medial'],
      syllables: 2,
      themes: ['natureza'],
    },
    { word: 'JARRO', positions: ['medial'], syllables: 2, themes: ['objetos'] },
    {
      word: 'SERROTE',
      positions: ['medial'],
      syllables: 3,
      themes: ['objetos'],
    },
    {
      word: 'CACHORRO',
      positions: ['medial'],
      syllables: 3,
      themes: ['animais'],
    },
  ],
  // R-fraco / tepe — single "r" between vowels or in coda.
  r: [
    { word: 'CARA', positions: ['medial'], syllables: 2 },
    { word: 'PARA', positions: ['medial'], syllables: 2 },
    { word: 'ARARA', positions: ['medial'], syllables: 3 },
    { word: 'AMOR', positions: ['final'], syllables: 2 },
    { word: 'MAR', positions: ['final'], syllables: 1 },
    { word: 'FLOR', positions: ['final'], syllables: 1 },
    { word: 'PORTA', positions: ['medial'], syllables: 2 },
    { word: 'CARTA', positions: ['medial'], syllables: 2 },
    { word: 'VERDE', positions: ['medial'], syllables: 2 },
    { word: 'PERA', positions: ['medial'], syllables: 2 },
    { word: 'TOURO', positions: ['medial'], syllables: 2 },
    { word: 'COLHER', positions: ['final'], syllables: 2 },
  ],
  L: [
    { word: 'LUA', positions: ['initial'], syllables: 2 },
    { word: 'LATA', positions: ['initial'], syllables: 2 },
    { word: 'LOBO', positions: ['initial'], syllables: 2 },
    { word: 'LIMAO', positions: ['initial'], syllables: 2 },
    { word: 'BOLA', positions: ['medial'], syllables: 2 },
    { word: 'PALA', positions: ['medial'], syllables: 2 },
    { word: 'GELO', positions: ['medial'], syllables: 2 },
    { word: 'FACA', positions: ['medial'], syllables: 2 },
    { word: 'SALA', positions: ['medial'], syllables: 2 },
    { word: 'CALOR', positions: ['medial'], syllables: 2 },
    { word: 'BALAO', positions: ['medial'], syllables: 2 },
    { word: 'LAPIS', positions: ['initial'], syllables: 2 },
  ],
  LH: [
    { word: 'PALHA', positions: ['medial'], syllables: 2 },
    { word: 'FILHO', positions: ['medial'], syllables: 2 },
    { word: 'TRABALHO', positions: ['medial'], syllables: 3 },
    { word: 'ORELHA', positions: ['medial'], syllables: 3 },
    { word: 'MOLHO', positions: ['medial'], syllables: 2 },
    { word: 'TOALHA', positions: ['medial'], syllables: 3 },
    { word: 'ABELHA', positions: ['medial'], syllables: 3 },
    { word: 'MILHO', positions: ['medial'], syllables: 2 },
    { word: 'JOELHO', positions: ['medial'], syllables: 3 },
    { word: 'FOLHA', positions: ['medial'], syllables: 2 },
  ],
  S: [
    { word: 'SAPO', positions: ['initial'], syllables: 2, themes: ['animais'] },
    { word: 'SOL', positions: ['initial'], syllables: 1, themes: ['natureza'] },
    { word: 'SACO', positions: ['initial'], syllables: 2, themes: ['objetos'] },
    { word: 'SINO', positions: ['initial'], syllables: 2, themes: ['objetos'] },
    // "Mercado do S" set — /S/-initial ∧ alimentos (doc Problem 6 table).
    {
      word: 'SUCO',
      positions: ['initial'],
      syllables: 2,
      themes: ['alimentos'],
    },
    {
      word: 'SAL',
      positions: ['initial'],
      syllables: 1,
      themes: ['alimentos'],
    },
    {
      word: 'SALSICHA',
      positions: ['initial'],
      syllables: 3,
      themes: ['alimentos'],
    },
    {
      word: 'SALADA',
      positions: ['initial'],
      syllables: 3,
      themes: ['alimentos'],
    },
    {
      word: 'SORVETE',
      positions: ['initial'],
      syllables: 3,
      themes: ['alimentos'],
    },
    {
      word: 'SALAME',
      positions: ['initial'],
      syllables: 3,
      themes: ['alimentos'],
    },
    { word: 'PASTA', positions: ['medial'], syllables: 2 },
    { word: 'FESTA', positions: ['medial'], syllables: 2 },
    { word: 'CESTA', positions: ['medial'], syllables: 2, themes: ['objetos'] },
    { word: 'LACO', positions: ['medial'], syllables: 2 },
    { word: 'PALHACO', positions: ['medial'], syllables: 3 },
    { word: 'CABECA', positions: ['medial'], syllables: 3, themes: ['corpo'] },
    { word: 'PRINCESA', positions: ['medial'], syllables: 3 },
  ],
  Z: [
    { word: 'ZEBRA', positions: ['initial'], syllables: 2 },
    { word: 'ZERO', positions: ['initial'], syllables: 2 },
    { word: 'ROSA', positions: ['medial'], syllables: 2 },
    { word: 'CASA', positions: ['medial'], syllables: 2 },
    { word: 'VASO', positions: ['medial'], syllables: 2 },
    { word: 'ASA', positions: ['medial'], syllables: 2 },
    { word: 'BLUSA', positions: ['medial'], syllables: 2 },
    { word: 'BUZINA', positions: ['medial'], syllables: 3 },
    { word: 'COZINHA', positions: ['medial'], syllables: 3 },
    { word: 'NATUREZA', positions: ['medial'], syllables: 4 },
  ],
  CH: [
    { word: 'CHUVA', positions: ['initial'], syllables: 2 },
    { word: 'CHAVE', positions: ['initial'], syllables: 2 },
    { word: 'CHAO', positions: ['initial'], syllables: 1 },
    { word: 'CHAPEU', positions: ['initial'], syllables: 2 },
    { word: 'BICHO', positions: ['medial'], syllables: 2 },
    { word: 'MACHADO', positions: ['medial'], syllables: 3 },
    { word: 'FECHADURA', positions: ['medial'], syllables: 4 },
    { word: 'CACHORRO', positions: ['medial'], syllables: 3 },
    { word: 'COCHICHO', positions: ['medial'], syllables: 3 },
    { word: 'FLECHA', positions: ['medial'], syllables: 2 },
  ],
  J: [
    { word: 'JATO', positions: ['initial'], syllables: 2 },
    { word: 'JACARE', positions: ['initial'], syllables: 3 },
    { word: 'JANELA', positions: ['initial'], syllables: 3 },
    { word: 'JOGO', positions: ['initial'], syllables: 2 },
    { word: 'GELO', positions: ['initial'], syllables: 2 },
    { word: 'GIRAFA', positions: ['initial'], syllables: 3 },
    { word: 'TIJOLO', positions: ['medial'], syllables: 3 },
    { word: 'TIGELA', positions: ['medial'], syllables: 3 },
    { word: 'LARANJA', positions: ['medial'], syllables: 3 },
    { word: 'CORUJA', positions: ['medial'], syllables: 3 },
  ],
  K: [
    { word: 'CASA', positions: ['initial'], syllables: 2 },
    { word: 'CAMA', positions: ['initial'], syllables: 2 },
    { word: 'COPO', positions: ['initial'], syllables: 2 },
    { word: 'CUBO', positions: ['initial'], syllables: 2 },
    { word: 'QUILO', positions: ['initial'], syllables: 2 },
    { word: 'QUEIJO', positions: ['initial'], syllables: 2 },
    { word: 'ESCOLA', positions: ['medial'], syllables: 3 },
    { word: 'MACACO', positions: ['medial'], syllables: 3 },
    { word: 'BONECA', positions: ['medial'], syllables: 3 },
    { word: 'FOGUETE', positions: ['medial'], syllables: 3 },
  ],
  G: [
    { word: 'GATO', positions: ['initial'], syllables: 2 },
    { word: 'GOLA', positions: ['initial'], syllables: 2 },
    { word: 'GULA', positions: ['initial'], syllables: 2 },
    { word: 'GAROTO', positions: ['initial'], syllables: 3 },
    { word: 'FOGO', positions: ['medial'], syllables: 2 },
    { word: 'BIGODE', positions: ['medial'], syllables: 3 },
    { word: 'FORMIGA', positions: ['medial'], syllables: 3 },
    { word: 'TARTARUGA', positions: ['medial'], syllables: 4 },
    { word: 'AGULHA', positions: ['medial'], syllables: 3 },
    { word: 'MANGUEIRA', positions: ['medial'], syllables: 3 },
  ],
};

/** Accent-insensitive uppercase normalization for comparison. */
function normalize(word: string): string {
  return word
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .trim();
}

export function isPhonemeKey(phoneme: string): phoneme is PhonemeKey {
  return phoneme in WORD_BANK;
}

/** Max syllable count considered appropriate for an age. */
function maxSyllablesForAge(age: number): number {
  if (age <= 4) return 2;
  if (age <= 6) return 3;
  if (age <= 9) return 4;
  return 6;
}

/**
 * Is this word in the curated bank for the given phoneme? This is the
 * authoritative, vetted check — true means the word genuinely carries the
 * phoneme. Returns false for unknown phoneme keys (caller should fall back to
 * the heuristic in validateContent for phonemes not yet in the bank).
 */
export function isVettedWord(word: string, phoneme: string): boolean {
  if (!isPhonemeKey(phoneme)) return false;
  const target = normalize(word);
  return WORD_BANK[phoneme].some((e) => normalize(e.word) === target);
}

/**
 * Lenient pt-BR grapheme → phoneme map. Used ONLY as a last resort for
 * phonemes that have no curated bank. It is intentionally approximate (e.g. it
 * cannot tell /s/ "casa"→/z/ apart), which is exactly why curated phonemes must
 * NOT use it. Kept here so there is a single definition of "carries phoneme".
 */
const GRAPHEMES: Record<string, string[]> = {
  R: ['R', 'RR'],
  L: ['L'],
  S: ['S', 'SS', 'C', 'Ç'],
  Z: ['Z', 'S'],
  T: ['T'],
  D: ['D'],
  P: ['P'],
  B: ['B'],
  F: ['F'],
  V: ['V'],
  M: ['M'],
  N: ['N'],
  K: ['C', 'QU', 'K'],
  G: ['G', 'GU'],
  J: ['J', 'G'],
  X: ['X', 'CH'],
  CH: ['CH', 'X'],
  LH: ['LH'],
  NH: ['NH'],
};

/**
 * THE single source of truth for "does this word carry the target phoneme?".
 *
 * Clinical decision = (B) phoneme-sound (see docs/activity-coherence-fix.md):
 * for a phoneme that HAS a curated bank, the bank is authoritative and the
 * lenient grapheme heuristic is never consulted — so a word like ROSA (letter
 * S present, but sound /z/) does NOT count as carrying /S/. The heuristic is
 * only a fallback for non-curated phonemes.
 *
 * Both scoring (validateContent) and distractor selection (getDistractors) must
 * route through this function; using two different definitions is the root
 * cause of the "distractor that is also a correct answer" bug (Problem 1).
 */
export function carriesPhoneme(word: string, phoneme: string): boolean {
  // (B) Curated phoneme → the vetted bank decides, full stop. A word that is
  // not vetted for this phoneme does not carry it, even if its spelling
  // contains the grapheme (ROSA/CASA for /S/).
  if (isPhonemeKey(phoneme)) {
    return isVettedWord(word, phoneme);
  }
  // Non-curated phoneme → lenient grapheme fallback.
  const w = normalize(word);
  const candidates = GRAPHEMES[normalize(phoneme)] ?? [normalize(phoneme)];
  return candidates.some((g) => w.includes(normalize(g)));
}

/**
 * Pull curated words for a phoneme, filtered by age-appropriate syllable
 * count (and optionally by position and/or theme), shuffled. Used to backfill
 * when the AI didn't supply enough valid words, guaranteeing the activity still
 * has phonetically correct content.
 */
export function getBankWords(
  phoneme: string,
  opts: {
    age: number;
    limit?: number;
    exclude?: string[];
    position?: Position;
    theme?: Theme;
  } = { age: 8 }
): string[] {
  if (!isPhonemeKey(phoneme)) return [];
  const maxSyll = maxSyllablesForAge(opts.age);
  const excluded = new Set((opts.exclude ?? []).map(normalize));

  const pool = WORD_BANK[phoneme]
    .filter((e) => e.syllables <= maxSyll && !excluded.has(normalize(e.word)))
    .filter((e) => !opts.position || e.positions.includes(opts.position))
    .filter((e) => !opts.theme || (e.themes?.includes(opts.theme) ?? false))
    .map((e) => e.word);

  // Fisher–Yates shuffle (deterministic enough; order variety per sheet).
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  return opts.limit ? pool.slice(0, opts.limit) : pool;
}

/** Curated distractor words that do NOT carry the given phoneme. */
export function getDistractors(
  phoneme: string,
  opts: {
    age: number;
    limit: number;
    exclude?: string[];
    position?: Position;
    theme?: Theme;
  }
): string[] {
  const maxSyll = maxSyllablesForAge(opts.age);
  const excluded = new Set((opts.exclude ?? []).map(normalize));

  const pool: string[] = [];
  for (const key of Object.keys(WORD_BANK) as PhonemeKey[]) {
    if (key === phoneme) continue;
    for (const entry of WORD_BANK[key]) {
      if (entry.syllables > maxSyll) continue;
      const n = normalize(entry.word);
      if (excluded.has(n)) continue;
      // Single source of truth: exclude anything that would score as carrying
      // the target phoneme under the SAME check used to grade answers. This is
      // the Problem-1 fix — previously this used isVettedWord while answers
      // were scored with the lenient grapheme heuristic, so e.g. ROSA could be
      // both a distractor and a "correct" /S/ answer.
      if (carriesPhoneme(entry.word, phoneme)) continue;
      if (!pool.includes(entry.word)) pool.push(entry.word);
    }
  }

  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  return pool.slice(0, opts.limit);
}

/**
 * How many vetted words exist for a (phoneme, position?, theme?) cell. The
 * generator / coherence gate use this to REFUSE an under-filled themed request
 * rather than pad it with off-theme or off-position words (Problem 6).
 */
export function cellDepth(
  phoneme: string,
  filter: { position?: Position; theme?: Theme } = {}
): number {
  if (!isPhonemeKey(phoneme)) return 0;
  return WORD_BANK[phoneme].filter(
    (e) =>
      (!filter.position || e.positions.includes(filter.position)) &&
      (!filter.theme || (e.themes?.includes(filter.theme) ?? false))
  ).length;
}
