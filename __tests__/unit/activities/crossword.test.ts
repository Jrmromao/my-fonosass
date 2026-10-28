import {
  buildCrossword,
  validateCrosswordActivity,
  ActivityValidationError,
  type CrosswordPlacement,
} from '@/lib/activities/validateContent';
import { isVettedWord } from '@/lib/activities/wordBank';

/** Verify a placement's letters actually sit in the grid where claimed. */
function placementMatchesGrid(
  grid: string[][],
  p: CrosswordPlacement
): boolean {
  for (let i = 0; i < p.word.length; i++) {
    const r = p.direction === 'across' ? p.row : p.row + i;
    const c = p.direction === 'across' ? p.col + i : p.col;
    if (!grid[r] || grid[r][c] !== p.word[i]) return false;
  }
  return true;
}

describe('buildCrossword', () => {
  it('places words so every placement matches the grid', () => {
    const entries = [
      { word: 'RATO', clue: 'Animal que faz "squeak"' },
      { word: 'ROSA', clue: 'Flor com espinhos' },
      { word: 'CARRO', clue: 'Anda na rua com 4 rodas' },
      { word: 'ROUPA', clue: 'Você veste' },
      { word: 'RUA', clue: 'Onde passam os carros' },
    ];
    const { grid, placements } = buildCrossword(entries);
    expect(placements.length).toBeGreaterThanOrEqual(2);
    for (const p of placements) {
      expect(placementMatchesGrid(grid, p)).toBe(true);
    }
  });

  it('words interlock (share at least one crossing cell)', () => {
    const entries = [
      { word: 'CASA', clue: 'Onde moramos' },
      { word: 'SACO', clue: 'Leva compras' },
      { word: 'MESA', clue: 'Comemos em cima dela' },
    ];
    const { placements } = buildCrossword(entries);
    // At least one across and one down means they crossed.
    const dirs = new Set(placements.map((p) => p.direction));
    if (placements.length >= 2) {
      expect(dirs.size).toBeGreaterThanOrEqual(2);
    }
  });

  it('assigns unique sequential numbers', () => {
    const { placements } = buildCrossword([
      { word: 'RATO', clue: 'a' },
      { word: 'ROSA', clue: 'b' },
      { word: 'OURO', clue: 'c' },
    ]);
    const nums = placements.map((p) => p.number);
    expect(new Set(nums).size).toBe(nums.length);
  });

  it('returns empty for no usable words', () => {
    const { grid, placements } = buildCrossword([{ word: 'A', clue: 'x' }]);
    expect(placements.length).toBe(0);
    expect(grid.length).toBe(0);
  });
});

describe('validateCrosswordActivity', () => {
  const base = {
    titulo: 'Cruzadinha do R',
    instrucoes: 'Use as dicas para completar',
  };

  it('builds a solvable crossword from AI words + clues', () => {
    const r = validateCrosswordActivity(
      {
        ...base,
        items: ['RATO', 'ROSA', 'CARRO', 'ROUPA', 'RUA', 'OURO'],
        clues: ['Animal', 'Flor', 'Veículo', 'Veste', 'Via', 'Metal precioso'],
      },
      { phoneme: 'R', minWords: 6, age: 9 }
    );
    expect(r.crossword).toBeDefined();
    expect(r.crossword!.length).toBeGreaterThanOrEqual(6);
    expect(r.grid).toBeDefined();
    for (const p of r.crossword!) {
      expect(placementMatchesGrid(r.grid!, p)).toBe(true);
    }
  });

  it('backfills from the bank when the AI gives too few words', () => {
    const r = validateCrosswordActivity(
      { ...base, items: ['RATO', 'ROSA'], clues: ['a', 'b'] },
      { phoneme: 'R', minWords: 6, age: 10 }
    );
    expect(r.crossword!.length).toBeGreaterThanOrEqual(6);
    for (const p of r.crossword!) expect(isVettedWord(p.word, 'R')).toBe(true);
  });

  it('throws when title is missing', () => {
    expect(() =>
      validateCrosswordActivity(
        { instrucoes: 'x', items: ['RATO'] },
        { phoneme: 'R', minWords: 6 }
      )
    ).toThrow(ActivityValidationError);
  });

  it('throws for unknown phoneme with too few valid words', () => {
    expect(() =>
      validateCrosswordActivity(
        { ...base, items: ['AB', 'CD'] },
        { phoneme: 'QQ', minWords: 6 }
      )
    ).toThrow(ActivityValidationError);
  });
});
