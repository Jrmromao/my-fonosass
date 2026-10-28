/**
 * "Cut & sort" activity: a themed worksheet with labeled destination zones at
 * the top and numbered, cut-out picture cards below for the child to sort into
 * the right zone (e.g. "How does each animal move?" -> VOAM / NADAM / ANDAM...).
 *
 * This mirrors the professional reference worksheets. Correctness is guaranteed
 * the same way as the rest of the pipeline: the TEXT (title, zone labels, card
 * words, instructions) is produced by the text model, validated/repaired in
 * code, and rendered deterministically — the image model is used ONLY for the
 * per-card clip-art. Nothing typographic is left to an image model.
 */
import { isPhonemeKey, getBankWords } from './wordBank';

const GEMINI_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent';
const GEMINI_KEY = process.env.GOOGLE_CLOUD_API_KEY!;

export type SortCard = {
  /** Display word, correctly spelled (pt-BR). */
  word: string;
  /** Index (1-based) printed on the card. */
  number: number;
  /** Category this card belongs to (matches a zone key). */
  category: string;
};

export type SortZone = {
  /** Stable key used to map cards -> zone. */
  key: string;
  /** Uppercase label shown on the pill (e.g. "VOAM"). */
  label: string;
  /** A single emoji used as the zone's decorative icon. */
  icon: string;
};

export type SortActivity = {
  title: string;
  instructions: string;
  footer: string;
  zones: SortZone[];
  cards: SortCard[];
};

export class SortValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SortValidationError';
  }
}

function normalize(word: string): string {
  return word
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .trim();
}

async function callGemini(prompt: string): Promise<unknown> {
  const res = await fetch(`${GEMINI_URL}?key=${GEMINI_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
        responseMimeType: 'application/json',
      },
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || 'Gemini error');
  const parts = data.candidates?.[0]?.content?.parts;
  try {
    return JSON.parse(parts[parts.length - 1].text);
  } catch {
    throw new SortValidationError('Gemini retornou JSON inválido');
  }
}

/**
 * Generate a themed cut-and-sort activity.
 *
 * The activity sorts words by a SEMANTIC attribute (how an animal moves, which
 * supermarket shelf a food belongs on, etc.). When a phoneme is supplied, every
 * card word must contain it — giving a speech-therapy sheet that is also a fun
 * categorization game.
 *
 * @param theme     pt-BR theme, e.g. "animais" or "alimentos"
 * @param phoneme   optional target phoneme; when curated, cards are validated
 *                  against the word bank and all must carry the phoneme.
 * @param age       target age (controls vocabulary difficulty)
 */
export async function generateSortActivity(params: {
  theme: string;
  phoneme?: string;
  age: number;
  cardCount?: number;
  maxAttempts?: number;
}): Promise<SortActivity> {
  const cardCount = params.cardCount ?? 12;
  const maxAttempts = params.maxAttempts ?? 3;
  const phonemeClause = params.phoneme
    ? `\n- TODAS as palavras DEVEM conter o som /${params.phoneme}/ (fonema alvo da terapia).`
    : '';

  const prompt = `Crie uma atividade de RECORTAR E CLASSIFICAR para fonoaudiologia infantil (idade ${params.age} anos), em português brasileiro.

Tema: ${params.theme}
Estrutura: alguns "destinos" (categorias) e ${cardCount} cartões para a criança recortar e colar no destino certo.${phonemeClause}

Regras:
- Entre 3 e 6 categorias (destinos), cada uma com um rótulo CURTO em MAIÚSCULAS (1 palavra) e UM emoji representativo.
- ${cardCount} cartões, cada um com uma palavra simples (1 palavra) e a categoria à qual pertence.
- Distribua os cartões de forma razoavelmente equilibrada entre as categorias.
- Ortografia 100% correta em português brasileiro. Sem repetir palavras.
- Palavras concretas e ilustráveis (coisas que dá para desenhar).

Responda APENAS em JSON:
{
  "title": "TÍTULO CURTO E DIVERTIDO EM MAIÚSCULAS",
  "instructions": "Instrução curta para a criança (1 frase).",
  "footer": "Dica final curta (1 frase).",
  "zones": [{"key":"voam","label":"VOAM","icon":"🦋"}],
  "cards": [{"word":"borboleta","category":"voam"}]
}`;

  let lastError: Error | null = null;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const raw = (await callGemini(prompt)) as Record<string, unknown>;
      return validateSortActivity(raw, {
        phoneme: params.phoneme,
        age: params.age,
        cardCount,
      });
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
    }
  }
  throw new Error(
    `Falha ao gerar atividade de classificação após ${maxAttempts} tentativas: ${lastError?.message ?? 'desconhecido'}`
  );
}

/** Validate + repair the model output into a usable SortActivity. */
export function validateSortActivity(
  raw: Record<string, unknown>,
  opts: { phoneme?: string; age: number; cardCount: number }
): SortActivity {
  const title = typeof raw.title === 'string' ? raw.title.trim() : '';
  const instructions =
    typeof raw.instructions === 'string' ? raw.instructions.trim() : '';
  const footer =
    typeof raw.footer === 'string' && raw.footer.trim()
      ? raw.footer.trim()
      : 'Diga o nome antes de colar!';

  if (!title) throw new SortValidationError('Título ausente');
  if (!instructions) throw new SortValidationError('Instruções ausentes');

  const rawZones = Array.isArray(raw.zones) ? raw.zones : [];
  const zones: SortZone[] = rawZones
    .map((z) => z as Record<string, unknown>)
    .filter((z) => typeof z.label === 'string' && typeof z.key === 'string')
    .map((z) => ({
      key: String(z.key),
      label: String(z.label).toUpperCase().trim(),
      icon: typeof z.icon === 'string' && z.icon ? String(z.icon) : '⭐',
    }));

  if (zones.length < 2 || zones.length > 6) {
    throw new SortValidationError(
      `Esperado 2-6 categorias, recebido ${zones.length}`
    );
  }
  const zoneKeys = new Set(zones.map((z) => z.key));

  // Cards: keep valid, deduped, phoneme-carrying (when a phoneme is set) cards
  // that map to a known zone.
  const rawCards = Array.isArray(raw.cards) ? raw.cards : [];
  const seen = new Set<string>();
  const kept: { word: string; category: string }[] = [];
  for (const c of rawCards) {
    const card = c as Record<string, unknown>;
    const word = typeof card.word === 'string' ? card.word.trim() : '';
    const category =
      typeof card.category === 'string' ? card.category.trim() : '';
    if (!word || !zoneKeys.has(category)) continue;
    const key = normalize(word);
    if (seen.has(key)) continue;
    if (opts.phoneme && isPhonemeKey(opts.phoneme.toUpperCase())) {
      if (!bankHasOrHeuristic(word, opts.phoneme)) continue;
    }
    seen.add(key);
    kept.push({ word, category });
  }

  if (kept.length < Math.min(6, opts.cardCount)) {
    throw new SortValidationError(
      `Poucos cartões válidos (${kept.length}); mínimo ${Math.min(6, opts.cardCount)}`
    );
  }

  const cards: SortCard[] = kept
    .slice(0, opts.cardCount)
    .map((c, i) => ({ word: c.word, category: c.category, number: i + 1 }));

  // Drop zones that ended up with no cards (keeps the layout honest).
  const usedCategories = new Set(cards.map((c) => c.category));
  const usedZones = zones.filter((z) => usedCategories.has(z.key));

  return { title, instructions, footer, zones: usedZones, cards };
}

/** Phoneme membership check: trust the bank for curated phonemes. */
function bankHasOrHeuristic(word: string, phoneme: string): boolean {
  const p = phoneme.toUpperCase();
  if (isPhonemeKey(p)) {
    // Accept either a vetted bank word or a word whose written form plausibly
    // carries the phoneme (lenient — exact phonetics is the bank's job).
    const vetted = getBankWords(p, { age: 99 }).map(normalize);
    const w = normalize(word);
    if (vetted.includes(w)) return true;
  }
  // Lenient grapheme fallback.
  const graphemes: Record<string, string[]> = {
    R: ['R'],
    L: ['L'],
    S: ['S', 'C', 'Ç'],
    Z: ['Z', 'S'],
    CH: ['CH', 'X'],
    J: ['J', 'G'],
    K: ['C', 'QU', 'K'],
    G: ['G', 'GU'],
    LH: ['LH'],
  };
  const cands = graphemes[phoneme.toUpperCase()] ?? [phoneme.toUpperCase()];
  const w = normalize(word);
  return cands.some((g) => w.includes(normalize(g)));
}
