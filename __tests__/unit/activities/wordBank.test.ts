import {
  WORD_BANK,
  isVettedWord,
  isPhonemeKey,
  getBankWords,
  getDistractors,
  type PhonemeKey,
} from '@/lib/activities/wordBank';

describe('wordBank', () => {
  describe('isPhonemeKey', () => {
    it('recognizes bank keys', () => {
      expect(isPhonemeKey('R')).toBe(true);
      expect(isPhonemeKey('r')).toBe(true);
      expect(isPhonemeKey('LH')).toBe(true);
    });
    it('rejects unknown keys', () => {
      expect(isPhonemeKey('XYZ')).toBe(false);
      expect(isPhonemeKey('')).toBe(false);
    });
  });

  describe('clinical phoneme distinctions', () => {
    it('separates R-forte from R-fraco', () => {
      expect(isVettedWord('RATO', 'R')).toBe(true);
      expect(isVettedWord('RATO', 'r')).toBe(false);
      expect(isVettedWord('CARRO', 'R')).toBe(true);
      expect(isVettedWord('PORTA', 'r')).toBe(true);
      expect(isVettedWord('PORTA', 'R')).toBe(false);
    });

    it('separates /s/ from /z/', () => {
      expect(isVettedWord('SAPO', 'S')).toBe(true);
      expect(isVettedWord('SAPO', 'Z')).toBe(false);
      expect(isVettedWord('CASA', 'Z')).toBe(true);
      expect(isVettedWord('CASA', 'S')).toBe(false);
    });

    it('is accent-insensitive', () => {
      expect(isVettedWord('limão', 'L')).toBe(true); // LIMAO in bank
    });

    it('returns false for unknown phoneme keys', () => {
      expect(isVettedWord('RATO', 'ZZZ')).toBe(false);
    });
  });

  describe('bank integrity', () => {
    const keys = Object.keys(WORD_BANK) as PhonemeKey[];

    it.each(keys)('every %s word is self-consistent and uppercase', (key) => {
      for (const entry of WORD_BANK[key]) {
        expect(entry.word).toBe(entry.word.toUpperCase());
        expect(entry.positions.length).toBeGreaterThan(0);
        expect(entry.syllables).toBeGreaterThanOrEqual(1);
      }
    });

    it.each(keys)('%s has no duplicate words', (key) => {
      const words = WORD_BANK[key].map((e) => e.word);
      expect(new Set(words).size).toBe(words.length);
    });

    it.each(keys)('%s has at least 6 vetted words', (key) => {
      expect(WORD_BANK[key].length).toBeGreaterThanOrEqual(6);
    });
  });

  describe('getBankWords', () => {
    it('returns only vetted words for the phoneme', () => {
      const words = getBankWords('R', { age: 10 });
      expect(words.length).toBeGreaterThan(0);
      for (const w of words) expect(isVettedWord(w, 'R')).toBe(true);
    });

    it('respects the exclude list', () => {
      const words = getBankWords('R', { age: 10, exclude: ['RATO', 'RUA'] });
      expect(words).not.toContain('RATO');
      expect(words).not.toContain('RUA');
    });

    it('respects the limit', () => {
      const words = getBankWords('L', { age: 12, limit: 3 });
      expect(words.length).toBeLessThanOrEqual(3);
    });

    it('filters by age (younger = fewer/simpler words)', () => {
      const young = getBankWords('G', { age: 4 });
      const older = getBankWords('G', { age: 12 });
      expect(young.length).toBeLessThanOrEqual(older.length);
    });

    it('returns [] for unknown phonemes', () => {
      expect(getBankWords('ZZZ', { age: 8 })).toEqual([]);
    });
  });

  describe('getDistractors', () => {
    it('never returns a word that is vetted for the target phoneme', () => {
      const distractors = getDistractors('R', { age: 10, limit: 8 });
      expect(distractors.length).toBeGreaterThan(0);
      for (const w of distractors) expect(isVettedWord(w, 'R')).toBe(false);
    });

    it('respects the limit', () => {
      const distractors = getDistractors('S', { age: 10, limit: 4 });
      expect(distractors.length).toBeLessThanOrEqual(4);
    });
  });
});
