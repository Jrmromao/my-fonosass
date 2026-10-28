/**
 * Validation + repair for AI-generated activity content.
 *
 * Gemini frequently returns activities that "don't make sense": word-search
 * grids that don't actually contain the listed words, words that don't contain
 * the target phoneme, wrong item counts, etc. These helpers validate the
 * structured JSON the model returns and, for word searches, rebuild the grid
 * deterministically so the hidden words are guaranteed to be findable.
 */

export type ActivityType =
  | 'FIND_CIRCLE'
  | 'WORD_SEARCH'
  | 'BOARD_GAME'
  | 'CROSSWORD';

import {
  getBankWords,
  getDistractors,
  isPhonemeKey,
  isVettedWord,
} from './wordBank';

export type RawActivity = {
  titulo?: unknown;
  instrucoes?: unknown;
  items?: unknown;
  answers?: unknown;
  grid?: unknown;
};

export type ValidatedActivity = {
  titulo: string;
  instrucoes: string;
  items: string[];
  answers?: string[];
  grid?: string[][];
  /** Crossword placements: word, its number, start cell, direction. */
  crossword?: CrosswordPlacement[];
};

/** A single placed word in a crossword. */
export type CrosswordPlacement = {
  word: string;
  clue: string;
  number: number;
  row: number;
  col: number;
  direction: 'across' | 'down';
};

export class ActivityValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ActivityValidationError';
  }
}

/** Normalize a word: uppercase, trimmed, accents removed for comparison. */
function normalize(word: string): string {
  return word
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // strip diacritics
    .toUpperCase()
    .trim();
}

/**
 * Does a word contain the target phoneme?
 *
 * When the phoneme is in the curated word bank AND the word is a vetted bank
 * word, we trust that (authoritative). Otherwise we fall back to a heuristic on
 * the written form (pt-BR grapheme mapping, accent-insensitive). The heuristic
 * is intentionally lenient — it catches words clearly unrelated to the phoneme,
 * but is not full phonological analysis, which is why the bank takes priority.
 */
function containsPhoneme(word: string, phoneme: string): boolean {
  // Authoritative: a vetted bank word is known-correct for its phoneme.
  if (isVettedWord(word, phoneme)) return true;

  const w = normalize(word);
  const p = normalize(phoneme);

  // Map a phoneme to the grapheme(s) that can represent it in Portuguese.
  const graphemes: Record<string, string[]> = {
    R: ['R', 'RR'],
    L: ['L'],
    S: ['S', 'SS', 'C', 'Ç', 'C'],
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

  const candidates = graphemes[p] ?? [p];
  return candidates.some((g) => w.includes(normalize(g)));
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (v): v is string => typeof v === 'string' && v.trim().length > 0
  );
}

/**
 * Validate the LLM output for FIND_CIRCLE and BOARD_GAME activities.
 * Throws ActivityValidationError when the content is unusable so the caller
 * can retry generation.
 */
export function validateWordListActivity(
  raw: RawActivity,
  opts: {
    type: ActivityType;
    phoneme: string;
    minPhonemeWords: number;
    minTotalItems: number;
    age?: number;
  }
): ValidatedActivity {
  const titulo = typeof raw.titulo === 'string' ? raw.titulo.trim() : '';
  const instrucoes =
    typeof raw.instrucoes === 'string' ? raw.instrucoes.trim() : '';
  const items = asStringArray(raw.items);
  const age = opts.age ?? 8;
  const curated = isPhonemeKey(opts.phoneme);

  if (!titulo) throw new ActivityValidationError('Título ausente ou inválido');
  if (!instrucoes)
    throw new ActivityValidationError('Instruções ausentes ou inválidas');

  // Dedupe (case/accent-insensitive) — repeated words make a bad activity.
  const seen = new Set<string>();
  const unique: string[] = [];
  for (const item of items) {
    const key = normalize(item);
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(item.trim());
    }
  }

  // Split the AI's words into phoneme-words and distractors.
  // When the phoneme is curated, containsPhoneme defers to the vetted bank for
  // known words; unknown words fall through to the heuristic.
  let phonemeWords = unique.filter((w) => containsPhoneme(w, opts.phoneme));
  let distractors = unique.filter((w) => !containsPhoneme(w, opts.phoneme));

  // Backfill from the curated bank when the AI didn't supply enough valid
  // phoneme words — guarantees phonetically-correct content instead of failing.
  if (curated && phonemeWords.length < opts.minPhonemeWords) {
    const needed = opts.minPhonemeWords - phonemeWords.length;
    const extra = getBankWords(opts.phoneme, {
      age,
      limit: needed,
      exclude: phonemeWords,
    });
    phonemeWords = [...phonemeWords, ...extra];
  }

  if (phonemeWords.length < opts.minPhonemeWords) {
    throw new ActivityValidationError(
      `Esperado ao menos ${opts.minPhonemeWords} palavras com o fonema /${opts.phoneme}/, encontrado ${phonemeWords.length}`
    );
  }

  // FIND_CIRCLE needs distractors too; backfill those from the bank as well.
  if (opts.type === 'FIND_CIRCLE') {
    const distractorsNeeded = opts.minTotalItems - opts.minPhonemeWords;
    if (curated && distractors.length < distractorsNeeded) {
      const extra = getDistractors(opts.phoneme, {
        age,
        limit: distractorsNeeded - distractors.length,
        exclude: [...phonemeWords, ...distractors],
      });
      distractors = [...distractors, ...extra];
    }
    const phonemePart = phonemeWords.slice(0, opts.minPhonemeWords);
    const distractorPart = distractors.slice(0, distractorsNeeded);
    const combined = [...phonemePart, ...distractorPart];
    if (combined.length < opts.minTotalItems) {
      throw new ActivityValidationError(
        `Não foi possível montar ${opts.minTotalItems} itens (${combined.length} disponíveis)`
      );
    }
    // Shuffle so correct answers aren't all grouped at the top.
    for (let i = combined.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [combined[i], combined[j]] = [combined[j], combined[i]];
    }
    return { titulo, instrucoes, items: combined, answers: phonemePart };
  }

  // BOARD_GAME: all items should be phoneme words.
  const boardItems = phonemeWords.slice(
    0,
    Math.max(opts.minTotalItems, opts.minPhonemeWords)
  );
  if (boardItems.length < opts.minTotalItems) {
    throw new ActivityValidationError(
      `Esperado ao menos ${opts.minTotalItems} itens, recebido ${boardItems.length}`
    );
  }
  return { titulo, instrucoes, items: boardItems, answers: boardItems };
}

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

/**
 * Deterministically build a word-search grid that is GUARANTEED to contain all
 * of the given words (horizontal and vertical only). Returns null when a word
 * can't be placed after a reasonable number of attempts so the caller can
 * drop it or regenerate.
 */
export function buildWordSearchGrid(
  words: string[],
  size = 10
): { grid: string[][]; placed: string[] } {
  const grid: (string | null)[][] = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => null)
  );
  const placed: string[] = [];

  const canPlace = (
    word: string,
    row: number,
    col: number,
    horizontal: boolean
  ): boolean => {
    for (let i = 0; i < word.length; i++) {
      const r = horizontal ? row : row + i;
      const c = horizontal ? col + i : col;
      if (r >= size || c >= size) return false;
      const existing = grid[r][c];
      if (existing !== null && existing !== word[i]) return false;
    }
    return true;
  };

  const place = (
    word: string,
    row: number,
    col: number,
    horizontal: boolean
  ) => {
    for (let i = 0; i < word.length; i++) {
      const r = horizontal ? row : row + i;
      const c = horizontal ? col + i : col;
      grid[r][c] = word[i];
    }
  };

  // Longest words first — they are the hardest to place.
  const ordered = [...words]
    .map((w) => normalize(w).replace(/[^A-Z]/g, ''))
    .filter((w) => w.length > 0 && w.length <= size)
    .sort((a, b) => b.length - a.length);

  for (const word of ordered) {
    let done = false;
    for (let attempt = 0; attempt < 200 && !done; attempt++) {
      const horizontal = Math.random() < 0.5;
      const row = Math.floor(Math.random() * size);
      const col = Math.floor(Math.random() * size);
      if (canPlace(word, row, col, horizontal)) {
        place(word, row, col, horizontal);
        placed.push(word);
        done = true;
      }
    }
    // If a word truly can't fit, skip it rather than produce a broken grid.
  }

  // Fill the blanks with random letters.
  const finalGrid: string[][] = grid.map((row) =>
    row.map(
      (cell) => cell ?? ALPHABET[Math.floor(Math.random() * ALPHABET.length)]
    )
  );

  return { grid: finalGrid, placed };
}

/**
 * Deterministically build a crossword where words interlock on shared letters.
 * The first word is placed horizontally; each subsequent word is placed only if
 * it crosses an already-placed word on a matching letter. Words that can't
 * interlock are skipped (never force an invalid layout). Returns the trimmed
 * grid (cells are letters or '' for blanks) plus numbered placements.
 */
export function buildCrossword(entries: { word: string; clue: string }[]): {
  grid: string[][];
  placements: CrosswordPlacement[];
} {
  const SIZE = 20; // generous working area; trimmed at the end
  const cells: (string | null)[][] = Array.from({ length: SIZE }, () =>
    Array.from({ length: SIZE }, () => null)
  );
  const placements: Omit<CrosswordPlacement, 'number'>[] = [];

  const clean = entries
    .map((e) => ({
      word: normalize(e.word).replace(/[^A-Z]/g, ''),
      clue: e.clue,
    }))
    .filter((e) => e.word.length >= 2);

  if (clean.length === 0) return { grid: [], placements: [] };

  const fits = (
    word: string,
    row: number,
    col: number,
    dir: 'across' | 'down'
  ): boolean => {
    for (let i = 0; i < word.length; i++) {
      const r = dir === 'across' ? row : row + i;
      const c = dir === 'across' ? col + i : col;
      if (r < 0 || c < 0 || r >= SIZE || c >= SIZE) return false;
      const existing = cells[r][c];
      if (existing !== null && existing !== word[i]) return false;
    }
    // Ensure the cell just before the start and just after the end are empty
    // (so words don't run into each other end-to-end).
    const beforeR = dir === 'across' ? row : row - 1;
    const beforeC = dir === 'across' ? col - 1 : col;
    const afterR = dir === 'across' ? row : row + word.length;
    const afterC = dir === 'across' ? col + word.length : col;
    if (beforeR >= 0 && beforeC >= 0 && cells[beforeR]?.[beforeC]) return false;
    if (afterR < SIZE && afterC < SIZE && cells[afterR]?.[afterC]) return false;
    return true;
  };

  const put = (
    word: string,
    clue: string,
    row: number,
    col: number,
    dir: 'across' | 'down'
  ) => {
    for (let i = 0; i < word.length; i++) {
      const r = dir === 'across' ? row : row + i;
      const c = dir === 'across' ? col + i : col;
      cells[r][c] = word[i];
    }
    placements.push({ word, clue, row, col, direction: dir });
  };

  // Place the first (longest) word horizontally near the middle.
  const ordered = [...clean].sort((a, b) => b.word.length - a.word.length);
  const first = ordered.shift()!;
  const startRow = Math.floor(SIZE / 2);
  const startCol = Math.floor((SIZE - first.word.length) / 2);
  put(first.word, first.clue, startRow, startCol, 'across');

  // Try to interlock the rest.
  for (const entry of ordered) {
    let placed = false;
    for (let i = 0; i < entry.word.length && !placed; i++) {
      const letter = entry.word[i];
      // Scan placed cells for a matching letter to cross on.
      for (const p of placements) {
        if (placed) break;
        for (let j = 0; j < p.word.length; j++) {
          if (p.word[j] !== letter) continue;
          const crossR = p.direction === 'across' ? p.row : p.row + j;
          const crossC = p.direction === 'across' ? p.col + j : p.col;
          // New word runs perpendicular to the word it crosses.
          const dir = p.direction === 'across' ? 'down' : 'across';
          const row = dir === 'down' ? crossR - i : crossR;
          const col = dir === 'across' ? crossC - i : crossC;
          if (fits(entry.word, row, col, dir)) {
            put(entry.word, entry.clue, row, col, dir);
            placed = true;
            break;
          }
        }
      }
    }
    // If it can't interlock anywhere, skip it (keeps the crossword valid).
  }

  // Trim to the used bounding box.
  let minR = SIZE,
    maxR = 0,
    minC = SIZE,
    maxC = 0;
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (cells[r][c] !== null) {
        minR = Math.min(minR, r);
        maxR = Math.max(maxR, r);
        minC = Math.min(minC, c);
        maxC = Math.max(maxC, c);
      }
    }
  }

  const grid: string[][] = [];
  for (let r = minR; r <= maxR; r++) {
    const row: string[] = [];
    for (let c = minC; c <= maxC; c++) {
      row.push(cells[r][c] ?? '');
    }
    grid.push(row);
  }

  // Number placements by (row, col) reading order, offset into trimmed grid.
  const numbered: CrosswordPlacement[] = placements
    .map((p) => ({ ...p, row: p.row - minR, col: p.col - minC }))
    .sort((a, b) => a.row - b.row || a.col - b.col)
    .map((p, idx) => ({ ...p, number: idx + 1 }));

  return { grid, placements: numbered };
}

/**
 * Validate a CROSSWORD activity. We take the AI's words + clues but build the
 * interlocking layout ourselves so it is always solvable. Requires enough words
 * to actually interlock.
 */
export function validateCrosswordActivity(
  raw: RawActivity & { clues?: unknown },
  opts: { phoneme: string; minWords: number; age?: number }
): ValidatedActivity {
  const titulo = typeof raw.titulo === 'string' ? raw.titulo.trim() : '';
  const instrucoes =
    typeof raw.instrucoes === 'string' ? raw.instrucoes.trim() : '';
  const items = asStringArray(raw.items);
  const clues = asStringArray((raw as { clues?: unknown }).clues);
  const age = opts.age ?? 8;
  const curated = isPhonemeKey(opts.phoneme);

  if (!titulo) throw new ActivityValidationError('Título ausente ou inválido');
  if (!instrucoes)
    throw new ActivityValidationError('Instruções ausentes ou inválidas');

  // Pair words with clues; keep only phoneme words long enough to interlock.
  const seen = new Set<string>();
  const entries: { word: string; clue: string }[] = [];
  items.forEach((item, i) => {
    const w = normalize(item).replace(/[^A-Z]/g, '');
    if (w.length < 3 || seen.has(w)) return;
    if (!containsPhoneme(item, opts.phoneme)) return;
    seen.add(w);
    entries.push({
      word: w,
      clue: clues[i] ?? `Palavra com o som /${opts.phoneme}/`,
    });
  });

  // Backfill from the bank if the AI didn't supply enough valid words.
  if (curated && entries.length < opts.minWords) {
    const extra = getBankWords(opts.phoneme, {
      age,
      exclude: entries.map((e) => e.word),
    });
    for (const w of extra) {
      const clean = normalize(w).replace(/[^A-Z]/g, '');
      if (clean.length < 3 || seen.has(clean)) continue;
      seen.add(clean);
      entries.push({
        word: clean,
        clue: `Palavra com o som /${opts.phoneme}/`,
      });
      if (entries.length >= opts.minWords + 2) break; // extras help interlock
    }
  }

  if (entries.length < opts.minWords) {
    throw new ActivityValidationError(
      `Esperado ao menos ${opts.minWords} palavras válidas com o fonema /${opts.phoneme}/, encontrado ${entries.length}`
    );
  }

  const { grid, placements } = buildCrossword(entries);

  if (placements.length < opts.minWords) {
    throw new ActivityValidationError(
      `Apenas ${placements.length} palavras conseguiram se cruzar (mínimo ${opts.minWords})`
    );
  }

  return {
    titulo,
    instrucoes,
    items: placements.map((p) => p.word),
    grid,
    crossword: placements,
  };
}

/**
 * Validate a WORD_SEARCH activity. We ignore any grid the model produced and
 * rebuild it ourselves so the hidden words are always findable.
 */
export function validateWordSearchActivity(
  raw: RawActivity,
  opts: { phoneme: string; minWords: number; gridSize?: number; age?: number }
): ValidatedActivity {
  const titulo = typeof raw.titulo === 'string' ? raw.titulo.trim() : '';
  const instrucoes =
    typeof raw.instrucoes === 'string' ? raw.instrucoes.trim() : '';
  const items = asStringArray(raw.items);
  const age = opts.age ?? 8;
  const curated = isPhonemeKey(opts.phoneme);

  if (!titulo) throw new ActivityValidationError('Título ausente ou inválido');
  if (!instrucoes)
    throw new ActivityValidationError('Instruções ausentes ou inválidas');

  // Keep only words that contain the phoneme and fit in the grid.
  const size = opts.gridSize ?? 10;
  const seen = new Set<string>();
  const words: string[] = [];
  for (const item of items) {
    const clean = normalize(item).replace(/[^A-Z]/g, '');
    if (clean.length === 0 || clean.length > size) continue;
    if (seen.has(clean)) continue;
    if (!containsPhoneme(item, opts.phoneme)) continue;
    seen.add(clean);
    words.push(clean);
  }

  // Backfill from the curated bank when the AI didn't supply enough valid words.
  if (curated && words.length < opts.minWords) {
    const extra = getBankWords(opts.phoneme, {
      age,
      exclude: words,
    });
    for (const w of extra) {
      const clean = normalize(w).replace(/[^A-Z]/g, '');
      if (clean.length === 0 || clean.length > size || seen.has(clean))
        continue;
      seen.add(clean);
      words.push(clean);
      if (words.length >= opts.minWords) break;
    }
  }

  if (words.length < opts.minWords) {
    throw new ActivityValidationError(
      `Esperado ao menos ${opts.minWords} palavras válidas com o fonema /${opts.phoneme}/, encontrado ${words.length}`
    );
  }

  const { grid, placed } = buildWordSearchGrid(words, size);

  if (placed.length < opts.minWords) {
    throw new ActivityValidationError(
      `Apenas ${placed.length} de ${words.length} palavras couberam na grade ${size}x${size}`
    );
  }

  return { titulo, instrucoes, items: placed, grid };
}
