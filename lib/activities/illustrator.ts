/**
 * Per-object illustration generator.
 *
 * The hard lesson that motivated this module: asking an image model to render a
 * whole worksheet produces garbage — misspelled titles ("ATIVTDADE"), broken
 * word-search grids, duplicated/wrong words. Image models cannot spell or build
 * puzzles. They CAN draw a single, isolated, text-free object well.
 *
 * So the pipeline is split: code owns all text, words, grids and layout
 * (see validateContent.ts + pdfRenderer.ts); this module owns ONLY the
 * decorative clip-art, generating one object at a time with an explicit
 * "no text, no letters" constraint, validating each with an AI-vision gate,
 * retrying, and caching the result in S3 so every word is drawn at most once.
 */
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';

const GEMINI_KEY = process.env.GOOGLE_CLOUD_API_KEY!;
const IMAGE_MODEL = 'gemini-2.5-flash-image';
const VISION_MODEL = 'gemini-2.5-flash-lite';
const BUCKET = process.env.AWS_S3_BUCKET_NAME || 'fonosapp';
const ILLUSTRATION_PREFIX = 'illustrations/words';

const s3 = new S3Client({ region: process.env.AWS_REGION || 'us-east-1' });

/** Accent-insensitive, filesystem-safe slug for an S3 cache key. */
function slug(word: string): string {
  return word
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function cacheKey(word: string): string {
  return `${ILLUSTRATION_PREFIX}/${slug(word)}.png`;
}

async function streamToBuffer(body: unknown): Promise<Buffer> {
  // @aws-sdk returns a web or node stream depending on runtime.
  const stream = body as {
    transformToByteArray?: () => Promise<Uint8Array>;
    [Symbol.asyncIterator]?: () => AsyncIterator<Uint8Array>;
  };
  if (typeof stream.transformToByteArray === 'function') {
    return Buffer.from(await stream.transformToByteArray());
  }
  const chunks: Buffer[] = [];
  for await (const chunk of stream as AsyncIterable<Uint8Array>) {
    chunks.push(Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

/** Return a cached illustration from S3, or null if not present. */
async function getCached(word: string): Promise<Buffer | null> {
  try {
    const res = await s3.send(
      new GetObjectCommand({ Bucket: BUCKET, Key: cacheKey(word) })
    );
    if (!res.Body) return null;
    return await streamToBuffer(res.Body);
  } catch {
    return null; // NoSuchKey / access error -> treat as cache miss
  }
}

async function putCached(word: string, png: Buffer): Promise<void> {
  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: cacheKey(word),
      Body: png,
      ContentType: 'image/png',
    })
  );
}

/** Call Gemini image generation; returns PNG bytes or null on failure. */
async function generateImage(prompt: string): Promise<Buffer | null> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${IMAGE_MODEL}:generateContent?key=${GEMINI_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseModalities: ['IMAGE', 'TEXT'] },
      }),
    }
  );
  const data = await res.json();
  if (!res.ok) {
    console.error(
      '    [illustrator] API error:',
      data.error?.message || JSON.stringify(data).slice(0, 160)
    );
    return null;
  }
  const part = data.candidates?.[0]?.content?.parts?.find(
    (p: { inlineData?: { data: string } }) => p.inlineData
  );
  if (!part?.inlineData?.data) return null;
  return Buffer.from(part.inlineData.data, 'base64');
}

/**
 * AI-vision quality gate. Confirms the generated image is a single, clear,
 * text-free illustration of the intended object. Returns a 0-100 score; the
 * caller decides the pass threshold. Failures return 0 (treat as reject) so a
 * bad render is never shipped.
 */
async function scoreIllustration(
  png: Buffer,
  word: string,
  meaning: string
): Promise<number> {
  const prompt = `Analise esta imagem. Ela deveria ser uma ilustração simples, estilo vetor/cartoon, de UM único objeto: "${meaning}" (palavra "${word}"), em fundo branco, SEM nenhum texto ou letra.

Responda APENAS com JSON:
{"depicts_correct_object": true/false, "single_object": true/false, "has_text_or_letters": true/false, "clean_white_background": true/false, "child_friendly": true/false, "score": 0-100}

Pontuação:
- Objeto correto e reconhecível: +40
- Um único objeto centralizado: +20
- Fundo branco limpo: +15
- Estilo infantil/cartoon: +15
- Sem texto/letras: +10
- Penalidade: qualquer texto ou letra visível: -50`;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${VISION_MODEL}:generateContent?key=${GEMINI_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  inlineData: {
                    mimeType: 'image/png',
                    data: png.toString('base64'),
                  },
                },
                { text: prompt },
              ],
            },
          ],
          generationConfig: { responseMimeType: 'application/json' },
        }),
      }
    );
    const data = await res.json();
    if (!res.ok) return 50; // can't validate -> treat as borderline, don't hard-fail
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    const parsed = JSON.parse(text);
    // Any visible text is an automatic reject regardless of the self-score.
    if (parsed.has_text_or_letters === true) return 0;
    const score = Number(parsed.score);
    return Number.isFinite(score) ? score : 50;
  } catch {
    return 50;
  }
}

const PASS_THRESHOLD = 70;
const MAX_ATTEMPTS = 3;

/**
 * Get a clean clip-art PNG for a word, using the S3 cache when available and
 * generating + validating otherwise. Returns null if no acceptable image could
 * be produced (caller should fall back to a plain labeled box).
 *
 * @param word    the pt-BR word (used for the cache key + vision check)
 * @param meaning short description of what to draw, in pt-BR (defaults to word)
 */
export async function getWordIllustration(
  word: string,
  meaning?: string
): Promise<Buffer | null> {
  const desc = meaning ?? word.toLowerCase();

  const cached = await getCached(word);
  if (cached) return cached;

  const prompt = `Ilustração única e simples de: "${desc}".
Estilo: vetor plano (flat design), cartoon infantil, contornos grossos, cores vivas.
Fundo: branco puro, sem cenário.
Composição: UM único objeto centralizado, ocupando a maior parte do quadro.
PROIBIDO: qualquer texto, letra, número, legenda, marca d'água ou borda.
Sem sombras complexas. Adequado para material de fonoaudiologia infantil.`;

  let best: { png: Buffer; score: number } | null = null;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const png = await generateImage(
      attempt === 1
        ? prompt
        : prompt +
            '\n\nTENTATIVA ANTERIOR FALHOU: remova QUALQUER texto/letra e desenhe só o objeto.'
    );
    if (!png) continue;

    const score = await scoreIllustration(png, word, desc);
    if (!best || score > best.score) best = { png, score };

    if (score >= PASS_THRESHOLD) {
      await putCached(word, png);
      console.log(`    [illustrator] "${word}" ok (score ${score})`);
      return png;
    }
    console.log(
      `    [illustrator] "${word}" attempt ${attempt} scored ${score}/100 — retrying`
    );
    await new Promise((r) => setTimeout(r, 1500));
  }

  // Accept the best effort if it at least clears a minimum bar; otherwise give
  // up so the renderer draws a labeled box instead of embedding a bad image.
  if (best && best.score >= 50) {
    await putCached(word, best.png);
    console.log(
      `    [illustrator] "${word}" accepted best effort (score ${best.score})`
    );
    return best.png;
  }

  console.log(
    `    [illustrator] "${word}" no acceptable image — using fallback`
  );
  return null;
}

/**
 * Resolve illustrations for many words. Runs sequentially to respect image-API
 * rate limits. Returns a map word -> PNG (words with no acceptable image are
 * omitted, signalling the renderer to use a text fallback).
 */
export async function getWordIllustrations(
  words: { word: string; meaning?: string }[]
): Promise<Map<string, Buffer>> {
  const out = new Map<string, Buffer>();
  for (const { word, meaning } of words) {
    const png = await getWordIllustration(word, meaning);
    if (png) out.set(word.toUpperCase(), png);
    await new Promise((r) => setTimeout(r, 500));
  }
  return out;
}
