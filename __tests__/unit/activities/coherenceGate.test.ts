import { checkCoherence } from '@/lib/activities/coherenceGate';
import type { ValidatedActivity } from '@/lib/activities/validateContent';

const baseFindCircle: ValidatedActivity = {
  titulo: 'Palavras com o som /S/',
  instrucoes: 'Circule as palavras com o som /S/.',
  items: ['SAPO', 'SOL', 'SACO', 'PATO', 'BOLA', 'LUA'],
  answers: ['SAPO', 'SOL', 'SACO'],
};

describe('checkCoherence — FIND_CIRCLE', () => {
  it('passes a coherent sheet', () => {
    const r = checkCoherence({
      type: 'FIND_CIRCLE',
      phoneme: 'S',
      activity: baseFindCircle,
    });
    expect(r.ok).toBe(true);
  });

  it('fails when a distractor also carries the phoneme (Problem 1)', () => {
    // SAPO is a /S/ word but listed only as an item, NOT in answers →
    // answer/carries invariant broken.
    const r = checkCoherence({
      type: 'FIND_CIRCLE',
      phoneme: 'S',
      activity: {
        ...baseFindCircle,
        items: ['SAPO', 'SOL', 'SACO', 'PATO'],
        answers: ['SOL', 'SACO'], // SAPO missing from answers
      },
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reasons.join(' ')).toMatch(/SAPO/);
  });

  it('fails when an answer does not carry the phoneme', () => {
    const r = checkCoherence({
      type: 'FIND_CIRCLE',
      phoneme: 'S',
      activity: {
        ...baseFindCircle,
        answers: ['SAPO', 'SOL', 'BOLA'], // BOLA is not /S/
      },
    });
    expect(r.ok).toBe(false);
  });

  it('fails on duplicate items', () => {
    const r = checkCoherence({
      type: 'FIND_CIRCLE',
      phoneme: 'S',
      activity: {
        ...baseFindCircle,
        items: ['SAPO', 'SAPO', 'SOL', 'SACO', 'PATO', 'BOLA'],
      },
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reasons.join(' ')).toMatch(/duplicada/i);
  });

  it('fails when an answer is not in the declared position (Problem 2)', () => {
    // PASTA is /S/ but MEDIAL; declaring an initial-position sheet must reject.
    const r = checkCoherence({
      type: 'FIND_CIRCLE',
      phoneme: 'S',
      position: 'initial',
      activity: {
        titulo: 'Palavras com o som /S/ no início',
        instrucoes: 'x',
        items: ['SAPO', 'SOL', 'PASTA', 'PATO'],
        answers: ['SAPO', 'SOL', 'PASTA'],
      },
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reasons.join(' ')).toMatch(/PASTA/);
  });

  it('fails a themed request the bank is too shallow to fill (Problem 6)', () => {
    const r = checkCoherence({
      type: 'FIND_CIRCLE',
      phoneme: 'LH',
      theme: 'transporte', // no LH ∧ transporte words exist
      activity: {
        titulo: 't',
        instrucoes: 'i',
        items: ['PALHA', 'FILHO'],
        answers: ['PALHA', 'FILHO'],
      },
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reasons.join(' ')).toMatch(/raso/);
  });

  it('fails when titulo is empty', () => {
    const r = checkCoherence({
      type: 'FIND_CIRCLE',
      phoneme: 'S',
      activity: { ...baseFindCircle, titulo: '' },
    });
    expect(r.ok).toBe(false);
  });
});

describe('checkCoherence — WORD_SEARCH', () => {
  it('fails when a listed word is not placed in the grid', () => {
    const r = checkCoherence({
      type: 'WORD_SEARCH',
      phoneme: 'S',
      activity: {
        titulo: 't',
        instrucoes: 'i',
        items: ['SAPO', 'SOL'],
        grid: [
          ['S', 'A', 'P', 'O'],
          ['X', 'Y', 'Z', 'W'],
          ['Q', 'Q', 'Q', 'Q'],
          ['R', 'R', 'R', 'R'],
        ],
      },
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reasons.join(' ')).toMatch(/SOL/);
  });

  it('passes when all words are placed', () => {
    const r = checkCoherence({
      type: 'WORD_SEARCH',
      phoneme: 'S',
      activity: {
        titulo: 't',
        instrucoes: 'i',
        items: ['SAPO'],
        grid: [
          ['S', 'A', 'P', 'O'],
          ['X', 'Y', 'Z', 'W'],
          ['Q', 'Q', 'Q', 'Q'],
          ['R', 'R', 'R', 'R'],
        ],
      },
    });
    expect(r.ok).toBe(true);
  });
});
