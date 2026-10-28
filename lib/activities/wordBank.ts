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

export interface BankWord {
  word: string;
  /** Position(s) where the target phoneme occurs in this word. */
  positions: Position[];
  /** Rough syllable count, used as an age/complexity proxy. */
  syllables: number;
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
    { word: 'RATO', positions: ['initial'], syllables: 2 },
    { word: 'RUA', positions: ['initial'], syllables: 2 },
    { word: 'ROSA', positions: ['initial'], syllables: 2 },
    { word: 'RODA', positions: ['initial'], syllables: 2 },
    { word: 'RIO', positions: ['initial'], syllables: 2 },
    { word: 'RAPOSA', positions: ['initial'], syllables: 3 },
    { word: 'CARRO', positions: ['medial'], syllables: 2 },
    { word: 'FERRO', positions: ['medial'], syllables: 2 },
    { word: 'TERRA', positions: ['medial'], syllables: 2 },
    { word: 'JARRO', positions: ['medial'], syllables: 2 },
    { word: 'SERROTE', positions: ['medial'], syllables: 3 },
    { word: 'CACHORRO', positions: ['medial'], syllables: 3 },
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
    { word: 'SAPO', positions: ['initial'], syllables: 2 },
    { word: 'SOL', positions: ['initial'], syllables: 1 },
    { word: 'SACO', positions: ['initial'], syllables: 2 },
    { word: 'SINO', positions: ['initial'], syllables: 2 },
    { word: 'SUCO', positions: ['initial'], syllables: 2 },
    { word: 'PASTA', positions: ['medial'], syllables: 2 },
    { word: 'FESTA', positions: ['medial'], syllables: 2 },
    { word: 'CESTA', positions: ['medial'], syllables: 2 },
    { word: 'LACO', positions: ['medial'], syllables: 2 },
    { word: 'PALHACO', positions: ['medial'], syllables: 3 },
    { word: 'CABECA', positions: ['medial'], syllables: 3 },
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
 * Pull curated words for a phoneme, filtered by age-appropriate syllable
 * count, shuffled. Used to backfill when the AI didn't supply enough valid
 * words, guaranteeing the activity still has phonetically correct content.
 */
export function getBankWords(
  phoneme: string,
  opts: { age: number; limit?: number; exclude?: string[] } = { age: 8 }
): string[] {
  if (!isPhonemeKey(phoneme)) return [];
  const maxSyll = maxSyllablesForAge(opts.age);
  const excluded = new Set((opts.exclude ?? []).map(normalize));

  const pool = WORD_BANK[phoneme]
    .filter((e) => e.syllables <= maxSyll && !excluded.has(normalize(e.word)))
    .map((e) => e.word);

  // Fisher–Yates shuffle (deterministic enough; order variety per sheet).
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  return opts.limit ? pool.slice(0, opts.limit) : pool;
}

/** Curated distractor words that do NOT contain the given phoneme. */
export function getDistractors(
  phoneme: string,
  opts: { age: number; limit: number; exclude?: string[] }
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
      // Skip anything that happens to also be vetted for the target phoneme.
      if (isVettedWord(entry.word, phoneme)) continue;
      if (!pool.includes(entry.word)) pool.push(entry.word);
    }
  }

  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  return pool.slice(0, opts.limit);
}
