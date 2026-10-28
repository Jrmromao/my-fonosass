import {
  validateWordListActivity,
  validateWordSearchActivity,
  buildWordSearchGrid,
  ActivityValidationError,
} from '@/lib/activities/validateContent';
import { isVettedWord } from '@/lib/activities/wordBank';

/** All positions a word can be found in a grid (horizontal + vertical). */
function gridLines(grid: string[][]): string[] {
  const rows = grid.map((row) => row.join(''));
  const cols = grid[0].map((_, c) => grid.map((row) => row[c]).join(''));
  return [...rows, ...cols];
}

describe('buildWordSearchGrid', () => {
  it('places every placeable word so it is findable', () => {
    const words = ['RATO', 'CARRO', 'RUA', 'ROSA', 'PORTA', 'AMOR'];
    const { grid, placed } = buildWordSearchGrid(words, 10);
    expect(placed.length).toBe(words.length);
    const lines = gridLines(grid);
    for (const w of placed) {
      expect(lines.some((l) => l.includes(w))).toBe(true);
    }
  });

  it('produces a square grid of the requested size', () => {
    const { grid } = buildWordSearchGrid(['CASA'], 8);
    expect(grid.length).toBe(8);
    for (const row of grid) expect(row.length).toBe(8);
  });

  it('fills every cell with a letter', () => {
    const { grid } = buildWordSearchGrid(['CASA', 'BOLA'], 10);
    for (const row of grid) {
      for (const cell of row) expect(cell).toMatch(/^[A-Z]$/);
    }
  });

  it('skips words that cannot fit rather than breaking', () => {
    const { placed } = buildWordSearchGrid(['TOOLONGWORD'], 5);
    expect(placed).not.toContain('TOOLONGWORD');
  });
});

describe('validateWordListActivity (FIND_CIRCLE)', () => {
  const base = {
    titulo: 'Encontre e circule',
    instrucoes: 'Circule as palavras com o som /R/',
  };

  it('accepts a complete valid activity and derives answers', () => {
    const r = validateWordListActivity(
      {
        ...base,
        items: [
          'RATO',
          'CARRO',
          'RUA',
          'ROSA',
          'RODA',
          'RIO',
          'RAPOSA',
          'FERRO',
          'CASA',
          'BOLA',
          'MESA',
          'UVA',
        ],
      },
      {
        type: 'FIND_CIRCLE',
        phoneme: 'R',
        minPhonemeWords: 8,
        minTotalItems: 12,
        age: 8,
      }
    );
    expect(r.items.length).toBeGreaterThanOrEqual(12);
    expect(r.answers!.length).toBeGreaterThanOrEqual(8);
    for (const a of r.answers!) expect(isVettedWord(a, 'R')).toBe(true);
  });

  it('backfills phoneme words from the bank when the AI gives too few', () => {
    const r = validateWordListActivity(
      { ...base, items: ['RATO', 'RUA'] },
      {
        type: 'FIND_CIRCLE',
        phoneme: 'R',
        minPhonemeWords: 8,
        minTotalItems: 12,
        age: 8,
      }
    );
    expect(r.answers!.length).toBeGreaterThanOrEqual(8);
    expect(r.items.length).toBeGreaterThanOrEqual(12);
  });

  it('keeps distractors out of the answer key', () => {
    const r = validateWordListActivity(
      {
        ...base,
        items: [
          'RATO',
          'CARRO',
          'RUA',
          'ROSA',
          'RODA',
          'RIO',
          'RAPOSA',
          'FERRO',
          'CASA',
          'BOLA',
          'MESA',
          'UVA',
        ],
      },
      {
        type: 'FIND_CIRCLE',
        phoneme: 'R',
        minPhonemeWords: 8,
        minTotalItems: 12,
        age: 8,
      }
    );
    expect(r.answers).not.toContain('CASA');
    expect(r.answers).not.toContain('BOLA');
  });

  it('throws when title is missing', () => {
    expect(() =>
      validateWordListActivity(
        { instrucoes: 'x', items: ['RATO'] },
        {
          type: 'FIND_CIRCLE',
          phoneme: 'R',
          minPhonemeWords: 8,
          minTotalItems: 12,
        }
      )
    ).toThrow(ActivityValidationError);
  });

  it('throws for an unknown phoneme with too few heuristic matches', () => {
    expect(() =>
      validateWordListActivity(
        { ...base, items: ['ABC', 'DEF'] },
        {
          type: 'FIND_CIRCLE',
          phoneme: 'QQ',
          minPhonemeWords: 8,
          minTotalItems: 12,
        }
      )
    ).toThrow(ActivityValidationError);
  });
});

describe('validateWordListActivity (BOARD_GAME)', () => {
  it('returns phoneme words as items', () => {
    const items = [
      'RATO',
      'CARRO',
      'RUA',
      'ROSA',
      'RODA',
      'RIO',
      'RAPOSA',
      'FERRO',
      'TERRA',
      'JARRO',
      'SERROTE',
      'CACHORRO',
      'RABO',
      'RAMO',
      'ROUPA',
    ];
    const r = validateWordListActivity(
      { titulo: 'Tabuleiro', instrucoes: 'Jogue!', items },
      {
        type: 'BOARD_GAME',
        phoneme: 'R',
        minPhonemeWords: 15,
        minTotalItems: 15,
        age: 10,
      }
    );
    expect(r.items.length).toBeGreaterThanOrEqual(15);
  });
});

describe('validateWordSearchActivity', () => {
  it('ignores the AI grid and rebuilds a findable one', () => {
    const r = validateWordSearchActivity(
      {
        titulo: 'Caça-palavras',
        instrucoes: 'Ache as palavras',
        items: ['RATO', 'CARRO', 'RUA', 'ROSA', 'PORTA', 'AMOR'],
        grid: [['X']], // garbage grid must be discarded
      },
      { phoneme: 'R', minWords: 6, gridSize: 10, age: 8 }
    );
    expect(r.grid).toBeDefined();
    const lines = gridLines(r.grid!);
    for (const w of r.items) {
      expect(lines.some((l) => l.includes(w))).toBe(true);
    }
  });

  it('backfills from the bank when the AI supplies no valid words', () => {
    const r = validateWordSearchActivity(
      { titulo: 't', instrucoes: 'i', items: ['CASA', 'BOLA'] },
      { phoneme: 'LH', minWords: 6, gridSize: 10, age: 9 }
    );
    expect(r.items.length).toBeGreaterThanOrEqual(6);
    for (const w of r.items) expect(isVettedWord(w, 'LH')).toBe(true);
  });

  it('throws when it cannot reach the minimum for an unknown phoneme', () => {
    expect(() =>
      validateWordSearchActivity(
        { titulo: 't', instrucoes: 'i', items: ['ABC'] },
        { phoneme: 'QQ', minWords: 6, gridSize: 10 }
      )
    ).toThrow(ActivityValidationError);
  });
});
