// Wording of the free offer, shared by the landing and auth pages.
// Client-safe (no Prisma).

interface OfferItem {
  phoneme: string;
}

/** "/s/" when every free activity is of the same phoneme, else null. */
export function sharedPhonemeLabel(items: OfferItem[]): string | null {
  if (items.length === 0) return null;
  const first = items[0].phoneme;
  if (!first || items.some((i) => i.phoneme !== first)) return null;
  return `/${first.toLowerCase()}/`;
}

/** "2 atividades do fonema /s/ grátis" or "2 atividades grátis". */
export function freeOfferText(items: OfferItem[]): string {
  const n = items.length;
  const count = n === 1 ? 'uma atividade' : `${n} atividades`;
  const phoneme = sharedPhonemeLabel(items);
  return phoneme ? `${count} do fonema ${phoneme} grátis` : `${count} grátis`;
}
