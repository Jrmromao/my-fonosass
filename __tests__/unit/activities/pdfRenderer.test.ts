import { ActivityPDFRenderer } from '@/lib/activities/pdfRenderer';

function isPdf(bytes: Uint8Array): boolean {
  return (
    bytes[0] === 0x25 && // %
    bytes[1] === 0x50 && // P
    bytes[2] === 0x44 && // D
    bytes[3] === 0x46 // F
  );
}

describe('ActivityPDFRenderer.renderActivity', () => {
  it('renders a FIND_CIRCLE activity to a valid PDF', async () => {
    const bytes = await ActivityPDFRenderer.renderActivity('FIND_CIRCLE', {
      titulo: 'Encontre e circule',
      instrucoes: 'Circule as palavras com o som /R/',
      phoneme: 'R',
      difficulty: 'EASY',
      ageRange: '5 anos',
      items: ['RATO', 'CARRO', 'CASA', 'BOLA'],
      answers: ['RATO', 'CARRO'],
    });
    expect(isPdf(bytes)).toBe(true);
    expect(bytes.length).toBeGreaterThan(500);
  });

  it('renders a WORD_SEARCH activity with a grid', async () => {
    const grid = Array.from({ length: 10 }, () =>
      Array.from({ length: 10 }, () => 'A')
    );
    const bytes = await ActivityPDFRenderer.renderActivity('WORD_SEARCH', {
      titulo: 'Caça-palavras',
      instrucoes: 'Ache as palavras',
      phoneme: 'R',
      difficulty: 'MEDIUM',
      ageRange: '8 anos',
      items: ['RATO', 'CARRO'],
      grid,
    });
    expect(isPdf(bytes)).toBe(true);
  });

  it('renders a BOARD_GAME activity', async () => {
    const bytes = await ActivityPDFRenderer.renderActivity('BOARD_GAME', {
      titulo: 'Tabuleiro',
      instrucoes: 'Jogue o dado!',
      phoneme: 'R',
      difficulty: 'HARD',
      ageRange: '12 anos',
      items: ['RATO', 'CARRO', 'RUA', 'ROSA', 'PORTA'],
    });
    expect(isPdf(bytes)).toBe(true);
  });

  it('handles accented pt-BR text without throwing', async () => {
    const bytes = await ActivityPDFRenderer.renderActivity('FIND_CIRCLE', {
      titulo: 'Atividade do coração',
      instrucoes: 'Diga cada palavra três vezes, está bem?',
      phoneme: 'R',
      difficulty: 'EASY',
      ageRange: '6 anos',
      items: ['CORAÇÃO', 'LIMÃO', 'AVIÃO'],
      answers: ['CORAÇÃO'],
    });
    expect(isPdf(bytes)).toBe(true);
  });

  it('renders a CROSSWORD activity with grid and clues', async () => {
    const bytes = await ActivityPDFRenderer.renderActivity('CROSSWORD', {
      titulo: 'Cruzadinha',
      instrucoes: 'Use as dicas',
      phoneme: 'R',
      difficulty: 'MEDIUM',
      ageRange: '9 anos',
      items: ['RATO', 'ROSA'],
      grid: [
        ['R', 'A', 'T', 'O'],
        ['O', '', '', ''],
        ['S', '', '', ''],
        ['A', '', '', ''],
      ],
      crossword: [
        {
          word: 'RATO',
          clue: 'Animal pequeno',
          number: 1,
          row: 0,
          col: 0,
          direction: 'across',
        },
        {
          word: 'ROSA',
          clue: 'Uma flor',
          number: 2,
          row: 0,
          col: 0,
          direction: 'down',
        },
      ],
    });
    expect(isPdf(bytes)).toBe(true);
  });
});
