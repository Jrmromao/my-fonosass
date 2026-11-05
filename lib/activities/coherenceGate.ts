/**
 * Content coherence gate — the text-layer analogue of the image gate in
 * illustrator.ts. It fails CLOSED: if an activity is incoherent, the caller
 * must skip the S3 upload / review notification, exactly like a bad image is
 * never shipped. See docs/activity-coherence-fix.md (Problem 4).
 *
 * This is a pure function over already-validated content, so it can be unit
 * tested in isolation and reused anywhere in the pipeline.
 */
import {
  carriesPhoneme,
  cellDepth,
  isPhonemeKey,
  WORD_BANK,
  type Position,
  type Theme,
} from './wordBank';
import type { ValidatedActivity, ActivityType } from './validateContent';

export type CoherenceInput = {
  type: ActivityType;
  phoneme: string;
  activity: ValidatedActivity;
  age?: number;
  /** Declared target position, if the sheet claims one. */
  position?: Position;
  /** Declared theme, if the sheet claims one. */
  theme?: Theme;
  /** Max syllables allowed for the age (so the gate can enforce the cap). */
  maxSyllables?: number;
};

export type CoherenceResult = { ok: true } | { ok: false; reasons: string[] };

function normalize(word: string): string {
  return word
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .trim();
}

/** Every position a word can appear in a grid (horizontal + vertical). */
function gridLines(grid: string[][]): string[] {
  if (grid.length === 0) return [];
  const rows = grid.map((row) => row.join(''));
  const cols = grid[0].map((_, c) => grid.map((row) => row[c] ?? '').join(''));
  return [...rows, ...cols];
}

/**
 * Assert an activity is coherent. Returns { ok: true } or a list of concrete
 * reasons it failed — so the caller can log precisely why a sheet was skipped.
 */
export function checkCoherence(input: CoherenceInput): CoherenceResult {
  const { type, phoneme, activity } = input;
  const reasons: string[] = [];

  // --- Title / instructions present and non-empty (Problem 3). ---
  if (!activity.titulo?.trim()) reasons.push('Título ausente');
  if (!activity.instrucoes?.trim()) reasons.push('Instruções ausentes');

  // --- No duplicate items (accent/case-insensitive). ---
  const seen = new Set<string>();
  for (const item of activity.items) {
    const key = normalize(item);
    if (seen.has(key)) reasons.push(`Palavra duplicada: ${item}`);
    seen.add(key);
  }

  // --- FIND_CIRCLE: the answer/distractor invariant (Problem 1). ---
  // For EVERY item: (item is an answer) iff (item carries the phoneme), under
  // the one agreed definition. If these ever disagree, the answer key is
  // self-contradicting by construction.
  if (type === 'FIND_CIRCLE' && activity.answers) {
    const answerSet = new Set(activity.answers.map(normalize));
    for (const item of activity.items) {
      const isAnswer = answerSet.has(normalize(item));
      const carries = carriesPhoneme(item, phoneme);
      if (isAnswer !== carries) {
        reasons.push(
          `Incoerência resposta/distrator: "${item}" ` +
            `(resposta=${isAnswer}, carrega /${phoneme}/=${carries})`
        );
      }
    }
  }

  // --- Every answer carries the phoneme in the DECLARED position (Problem 2). ---
  if (input.position && isPhonemeKey(phoneme) && activity.answers) {
    // A word satisfies the declared position only if the bank vouches for it
    // at that position.
    const atPosition = new Set(
      WORD_BANK[phoneme]
        .filter((e) => e.positions.includes(input.position as Position))
        .map((e) => normalize(e.word))
    );
    for (const a of activity.answers) {
      if (!atPosition.has(normalize(a))) {
        reasons.push(`"${a}" não é /${phoneme}/ em posição ${input.position}`);
      }
    }
  }

  // --- Syllable/age cap, when enforceable via the bank. ---
  if (input.maxSyllables && isPhonemeKey(phoneme)) {
    const syll = new Map(
      WORD_BANK[phoneme].map((e) => [normalize(e.word), e.syllables])
    );
    for (const item of activity.items) {
      const s = syll.get(normalize(item));
      if (s !== undefined && s > input.maxSyllables) {
        reasons.push(
          `"${item}" tem ${s} sílabas (máx ${input.maxSyllables} para a idade)`
        );
      }
    }
  }

  // --- Themed request must be fillable from the bank, not padded (Problem 6). ---
  if (input.theme && isPhonemeKey(phoneme)) {
    const depth = cellDepth(phoneme, {
      position: input.position,
      theme: input.theme,
    });
    const need =
      type === 'FIND_CIRCLE' && activity.answers
        ? activity.answers.length
        : activity.items.length;
    if (depth < need) {
      reasons.push(
        `Banco raso para /${phoneme}/∧${input.position ?? 'qualquer'}∧` +
          `${input.theme}: ${depth} palavras, precisa de ${need}`
      );
    }
  }

  // --- WORD_SEARCH / CROSSWORD: every listed word is actually placed. ---
  if ((type === 'WORD_SEARCH' || type === 'CROSSWORD') && activity.grid) {
    if (type === 'CROSSWORD' && activity.crossword) {
      const placed = new Set(activity.crossword.map((p) => normalize(p.word)));
      for (const item of activity.items) {
        if (!placed.has(normalize(item))) {
          reasons.push(`"${item}" listada mas não cruzada na grade`);
        }
      }
    } else {
      const lines = gridLines(activity.grid).map(normalize);
      for (const item of activity.items) {
        const w = normalize(item).replace(/[^A-Z]/g, '');
        if (!lines.some((l) => l.includes(w))) {
          reasons.push(`"${item}" listada mas não encontrada na grade`);
        }
      }
    }
  }

  return reasons.length === 0 ? { ok: true } : { ok: false, reasons };
}
