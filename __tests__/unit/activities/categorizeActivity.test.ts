import {
  buildCategorizeActivity,
  ANIMALS_MOVEMENT,
  CATEGORIZE_DATASETS,
  CategorizeError,
  type CategorizeDataset,
} from '@/lib/activities/categorizeActivity';

describe('buildCategorizeActivity', () => {
  it('builds a SortActivity from the animals-movement dataset', () => {
    const a = buildCategorizeActivity(ANIMALS_MOVEMENT);
    expect(a.title).toMatch(/BICHO/);
    expect(a.cards.length).toBe(ANIMALS_MOVEMENT.items.length);
    expect(a.zones.length).toBeGreaterThanOrEqual(2);
    // Numbers are 1-based and sequential.
    a.cards.forEach((c, i) => expect(c.number).toBe(i + 1));
  });

  it('every card maps to a declared zone (unambiguous mapping)', () => {
    const a = buildCategorizeActivity(ANIMALS_MOVEMENT);
    const zoneKeys = new Set(a.zones.map((z) => z.key));
    for (const c of a.cards) expect(zoneKeys.has(c.category)).toBe(true);
  });

  it('respects cardCount and drops unused zones', () => {
    // First 3 items span 2 categories (voam, nadam).
    const a = buildCategorizeActivity(ANIMALS_MOVEMENT, { cardCount: 3 });
    expect(a.cards.length).toBe(3);
    // Only categories actually used survive.
    const used = new Set(a.cards.map((c) => c.category));
    for (const z of a.zones) expect(used.has(z.key)).toBe(true);
    expect(a.zones.length).toBe(used.size);
  });

  it('refuses a cardCount that collapses to a single category', () => {
    // First 2 items are both "voam" → < 2 used categories → refuse.
    expect(() =>
      buildCategorizeActivity(ANIMALS_MOVEMENT, { cardCount: 2 })
    ).toThrow(CategorizeError);
  });

  it('refuses a dataset with an item pointing at a missing category', () => {
    const bad: CategorizeDataset = {
      id: 'bad',
      title: 'T',
      instructions: 'i',
      footer: 'f',
      categories: [
        { key: 'a', label: 'A', icon: '🅰️' },
        { key: 'b', label: 'B', icon: '🅱️' },
      ],
      items: [
        { word: 'X', category: 'a' },
        { word: 'Y', category: 'ZZZ' }, // no such category
      ],
    };
    expect(() => buildCategorizeActivity(bad)).toThrow(CategorizeError);
  });

  it('refuses when fewer than 2 categories end up used', () => {
    const bad: CategorizeDataset = {
      id: 'one',
      title: 'T',
      instructions: 'i',
      footer: 'f',
      categories: [
        { key: 'a', label: 'A', icon: '🅰️' },
        { key: 'b', label: 'B', icon: '🅱️' },
      ],
      items: [{ word: 'X', category: 'a' }],
    };
    expect(() => buildCategorizeActivity(bad)).toThrow(CategorizeError);
  });

  it('registers the seed dataset in the registry', () => {
    expect(CATEGORIZE_DATASETS['animais-movimento']).toBe(ANIMALS_MOVEMENT);
  });
});
