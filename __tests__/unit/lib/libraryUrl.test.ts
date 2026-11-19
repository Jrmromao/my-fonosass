import { describe, expect, it } from '@jest/globals';
import {
  libraryHref,
  libraryQuery,
  parseLibraryParams,
} from '@/lib/libraryUrl';
import { PHONEMES } from '@/lib/phonemes';

const parse = (qs: string) => parseLibraryParams(new URLSearchParams(qs));

describe('library URL (pt-BR)', () => {
  it('writes Portuguese keys and values', () => {
    expect(libraryQuery({ type: 'SPEECH', page: 1 })).toBe('categoria=fonema');
    expect(
      libraryHref({
        type: 'SPEECH',
        phoneme: 'R_FORTE',
        search: 'sapo',
        page: 2,
      })
    ).toBe(
      '/dashboard/biblioteca?categoria=fonema&fonema=r-forte&busca=sapo&pagina=2'
    );
  });

  it('reads the Portuguese URL back into internal codes', () => {
    const { filters, legacy } = parse('categoria=figuras-geometricas&pagina=3');
    expect(legacy).toBe(false);
    expect(filters).toMatchObject({
      type: 'GEOMETRIC_SHAPES',
      page: 3,
    });
  });

  it('round-trips every phoneme in the taxonomy', () => {
    for (const code of PHONEMES) {
      const { filters } = parse(libraryQuery({ phoneme: code }));
      expect(filters.phoneme).toBe(code);
    }
  });

  it('accepts old English links and flags them for rewriting', () => {
    const { filters, legacy } = parse('page=1&type=SPEECH&phoneme=S');
    expect(legacy).toBe(true);
    expect(filters).toMatchObject({
      type: 'SPEECH',
      phoneme: 'S',
      page: 1,
    });
    expect(libraryQuery(filters)).toBe('categoria=fonema&fonema=s');
  });

  it('ignores unknown values instead of passing them to the API', () => {
    const { filters } = parse('categoria=xyz&pagina=abc');
    expect(filters.type).toBe('');
    expect(filters.page).toBe(1);
  });
});
