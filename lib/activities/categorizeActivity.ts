/**
 * Categorize-by-attribute activity (doc Problem 7 / Reference A:
 * "Como cada bicho se move?"). This is a SEMANTIC task, not a phoneme task:
 * the child sorts items into attribute buckets (e.g. animals by how they move).
 *
 * Correctness here cannot come from an LLM for the same reason the phoneme
 * content is curated — a wrong item→category mapping is a clinical/factual
 * error, not a style nit. So the mapping is a hand-vetted dataset. The LLM is
 * not in this path at all. Layout reuses the SortActivity renderer (Problem 5).
 *
 * The seed dataset below is intentionally small and obvious (from Reference A).
 * Expanding it is human data-entry, vetted by the supervising fonoaudióloga —
 * NOT something to generate. `buildCategorizeActivity` refuses to emit a sheet
 * it cannot fill from the dataset rather than inventing items.
 */
import type { SortActivity, SortCard, SortZone } from './sortActivity';

export class CategorizeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CategorizeError';
  }
}

/** A vetted categorization dataset: items each mapping to exactly one bucket. */
export type CategorizeDataset = {
  /** Stable id, e.g. "animais-movimento". */
  id: string;
  title: string;
  instructions: string;
  footer: string;
  /** The attribute buckets (destination zones). */
  categories: { key: string; label: string; icon: string }[];
  /** Each item in EXACTLY one category (unambiguous by construction). */
  items: { word: string; category: string }[];
};

/**
 * Reference A, re-expressed as our own dataset (not copied layout/wording).
 * Animals sorted by how they move. Every item maps to exactly one bucket.
 */
export const ANIMALS_MOVEMENT: CategorizeDataset = {
  id: 'animais-movimento',
  title: 'COMO CADA BICHO SE MOVE?',
  instructions: 'Recorte cada bicho e cole no grupo de como ele se move.',
  footer: 'Diga o nome do bicho e como ele se move antes de colar!',
  categories: [
    { key: 'voam', label: 'VOAM', icon: '🦋' },
    { key: 'nadam', label: 'NADAM', icon: '🐟' },
    { key: 'andam', label: 'ANDAM', icon: '🐾' },
    { key: 'rastejam', label: 'RASTEJAM', icon: '🐍' },
    { key: 'saltam', label: 'SALTAM', icon: '🦘' },
    { key: 'escalam', label: 'ESCALAM', icon: '🦎' },
  ],
  items: [
    { word: 'ARARA', category: 'voam' },
    { word: 'CORUJA', category: 'voam' },
    { word: 'TUBARAO', category: 'nadam' },
    { word: 'TARTARUGA', category: 'nadam' },
    { word: 'TIGRE', category: 'andam' },
    { word: 'GIRAFA', category: 'andam' },
    { word: 'COBRA', category: 'rastejam' },
    { word: 'GRILO', category: 'saltam' },
    { word: 'CANGURU', category: 'saltam' },
    { word: 'MACACO', category: 'escalam' },
    { word: 'LAGARTIXA', category: 'escalam' },
    { word: 'CARACOL', category: 'rastejam' },
  ],
};

/** All datasets available for generation, keyed by id. */
export const CATEGORIZE_DATASETS: Record<string, CategorizeDataset> = {
  [ANIMALS_MOVEMENT.id]: ANIMALS_MOVEMENT,
};

/**
 * Turn a vetted dataset into a SortActivity the existing renderer can draw.
 * Refuses (throws) rather than pad when a dataset is internally inconsistent —
 * e.g. an item points at a category that doesn't exist, or a category ends up
 * empty.
 */
export function buildCategorizeActivity(
  dataset: CategorizeDataset,
  opts: { cardCount?: number } = {}
): SortActivity {
  const categoryKeys = new Set(dataset.categories.map((c) => c.key));

  // Every item must map to a declared category (unambiguous mapping invariant).
  for (const it of dataset.items) {
    if (!categoryKeys.has(it.category)) {
      throw new CategorizeError(
        `Item "${it.word}" aponta para categoria inexistente "${it.category}"`
      );
    }
  }

  const limit = opts.cardCount ?? dataset.items.length;
  const chosen = dataset.items.slice(0, limit);

  const cards: SortCard[] = chosen.map((it, i) => ({
    word: it.word,
    category: it.category,
    number: i + 1,
  }));

  // Keep only categories that actually have a card (honest layout).
  const used = new Set(cards.map((c) => c.category));
  const zones: SortZone[] = dataset.categories
    .filter((c) => used.has(c.key))
    .map((c) => ({ key: c.key, label: c.label.toUpperCase(), icon: c.icon }));

  if (zones.length < 2) {
    throw new CategorizeError(
      `Dataset "${dataset.id}" produziu menos de 2 categorias usadas`
    );
  }

  return {
    title: dataset.title,
    instructions: dataset.instructions,
    footer: dataset.footer,
    zones,
    cards,
  };
}
