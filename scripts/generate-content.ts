/**
 * Unified content generation script.
 * Usage:
 *   npx tsx scripts/generate-content.ts activities "r,s,l"
 *   npx tsx scripts/generate-content.ts activities "all"
 *   npx tsx scripts/generate-content.ts blog "dicas para pais sobre fonema r"
 */
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { generateActivityContent } from '../lib/activities/generateContent';
import { ActivityPDFRenderer } from '../lib/activities/pdfRenderer';
import { getWordIllustrations } from '../lib/activities/illustrator';

const GEMINI_KEY = process.env.GOOGLE_CLOUD_API_KEY!;
const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT = process.env.TELEGRAM_REVIEWER_CHAT_ID;
const S3_BUCKET = 'fonosapp';

const s3 = new S3Client({ region: process.env.AWS_REGION || 'us-east-1' });

const ALL_PHONEMES = [
  'p',
  'b',
  't',
  'd',
  'k',
  'g',
  'f',
  'v',
  's',
  'z',
  'r',
  'l',
  'ch',
  'j',
  'lh',
  'nh',
  'm',
  'n',
];
const TOPICS = [
  'animais',
  'comida',
  'transporte',
  'roupas',
  'corpo humano',
  'profissoes',
  'escola',
  'natureza',
  'brinquedos',
  'casa',
];
const ACTIVITY_TYPES = [
  'FIND_CIRCLE',
  'WORD_SEARCH',
  'BOARD_GAME',
  'COLOR_SPEAK',
] as const;
const AGES = [4, 6, 9, 12];

async function geminiText(prompt: string): Promise<string> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${GEMINI_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 3000 },
      }),
    }
  );
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

async function sendTelegram(message: string) {
  if (!TELEGRAM_TOKEN || !TELEGRAM_CHAT) return;
  await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: TELEGRAM_CHAT,
      text: message,
      parse_mode: 'Markdown',
    }),
  });
}

async function uploadToS3(
  key: string,
  body: Buffer,
  contentType: string
): Promise<string> {
  await s3.send(
    new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  );
  return `https://${S3_BUCKET}.s3.amazonaws.com/${key}`;
}

// ─── ACTIVITIES ───────────────────────────────────────────────

// Curated phonemes with a vetted word bank. We restrict automated generation
// to these so every activity has phonetically-correct, well-spelled content.
const CURATED_PHONEMES = new Set([
  'R',
  'L',
  'S',
  'Z',
  'CH',
  'J',
  'K',
  'G',
  'LH',
]);

// Map the script's type list to the deterministic pipeline's supported types.
// COLOR_SPEAK is a picture-word activity, same shape as FIND_CIRCLE.
const TYPE_MAP: Record<
  string,
  'FIND_CIRCLE' | 'WORD_SEARCH' | 'BOARD_GAME' | 'CROSSWORD'
> = {
  FIND_CIRCLE: 'FIND_CIRCLE',
  WORD_SEARCH: 'WORD_SEARCH',
  BOARD_GAME: 'BOARD_GAME',
  COLOR_SPEAK: 'FIND_CIRCLE',
};

function ageToRange(age: number): string {
  if (age <= 3) return 'TODDLER';
  if (age <= 5) return 'PRESCHOOL';
  if (age <= 12) return 'CHILD';
  if (age <= 17) return 'TEENAGER';
  return 'ADULT';
}

function ageToDifficulty(age: number): 'EASY' | 'MEDIUM' | 'HARD' {
  if (age <= 5) return 'EASY';
  if (age <= 9) return 'MEDIUM';
  return 'HARD';
}

/**
 * Generate activities with the deterministic content + layout pipeline.
 *
 * Content (words, grid, crossword) comes from generateActivityContent(), which
 * validates against the curated word bank and rebuilds puzzles in code. Layout
 * is drawn by ActivityPDFRenderer. The image model is used ONLY for per-word
 * clip-art (illustrator.ts), never for text or puzzle structure — this is what
 * fixes the misspellings, broken grids, and wrong-phoneme words.
 */
async function generateActivities(phonemes: string[]) {
  console.log(
    `\n🎨 Generating activities for phonemes: ${phonemes.join(', ')}\n`
  );
  let count = 0;

  for (const [phonemeIndex, rawPhoneme] of phonemes.entries()) {
    const phoneme = rawPhoneme.toUpperCase();

    if (!CURATED_PHONEMES.has(phoneme)) {
      console.log(
        `  ⏭️ Skipping /${rawPhoneme}/ — no curated word bank (not yet supported)`
      );
      continue;
    }

    // One activity per phoneme; vary type/topic/age across phonemes.
    const rawType = ACTIVITY_TYPES[phonemeIndex % ACTIVITY_TYPES.length];
    const type = TYPE_MAP[rawType];
    const topic = TOPICS[phonemeIndex % TOPICS.length];
    const age = AGES[phonemeIndex % AGES.length];

    try {
      // ═══ STEP 1: Deterministic, validated content (text only) ═══
      const content = await generateActivityContent({
        type,
        phoneme,
        topic,
        age,
      });

      // ═══ STEP 2: Per-word clip-art (picture-word types only) ═══
      let illustrations: Map<string, Buffer> | undefined;
      if (type === 'FIND_CIRCLE') {
        // Illustrate the answer words (the ones carrying the phoneme). Cached
        // in S3 per word, so repeat words across sheets cost nothing.
        const toIllustrate = (content.answers ?? content.items).slice(0, 8);
        illustrations = await getWordIllustrations(
          toIllustrate.map((w) => ({ word: w }))
        );
      }

      // ═══ STEP 3: Deterministic PDF render ═══
      const pdfBytes = await ActivityPDFRenderer.renderActivity(type, {
        titulo: content.titulo,
        instrucoes: content.instrucoes,
        phoneme,
        difficulty: ageToDifficulty(age),
        ageRange: ageToRange(age),
        items: content.items,
        answers: content.answers,
        grid: content.grid,
        crossword: content.crossword,
        illustrations,
      });
      const pdfBuffer = Buffer.from(pdfBytes);

      // ═══ STEP 4: Upload to S3 (admin approves later via review flow) ═══
      const key = `activities/${rawPhoneme.toLowerCase()}/${rawType.toLowerCase()}-${topic}-age${age}.pdf`;
      await uploadToS3(key, pdfBuffer, 'application/pdf');
      count++;
      console.log(
        `  [${count}] /${phoneme}/ ${rawType} ${topic} age${age} — PDF created (${content.items.length} items, ${illustrations?.size ?? 0} illustrations)`
      );

      // Review notification is sent by the sync-activities route after the
      // DB row + single-use approvalToken exist.

      await new Promise((r) => setTimeout(r, 1500));
    } catch (err: any) {
      console.log(`  ❌ /${phoneme}/ ${rawType}: ${err.message}`);
    }
  }

  await sendTelegram(
    `🎨 *${count} atividades geradas!*\nFonemas: ${phonemes.join(', ')}\nAcesse o painel para revisar.`
  );
  console.log(`\n🎉 Done! ${count} activities uploaded to S3.`);
}

// ─── BLOG ─────────────────────────────────────────────────────

const SEED_KEYWORDS = [
  'fonoaudiologia infantil',
  'atraso na fala',
  'exercicios fonoaudiologia',
  'fonema r crianca',
  'quando procurar fonoaudiologo',
  'terapia da fala',
  'crianca nao fala',
  'dislalia tratamento',
  'fala infantil desenvolvimento',
  'fonoaudiologo online',
];

async function findTrendingTopics(): Promise<string[]> {
  // Use Google autocomplete to find what people are searching
  const topics: string[] = [];

  for (const seed of SEED_KEYWORDS.slice(0, 5)) {
    try {
      const res = await fetch(
        `https://suggestqueries.google.com/complete/search?client=firefox&hl=pt-BR&q=${encodeURIComponent(seed)}`
      );
      const [, suggestions] = await res.json();
      topics.push(...suggestions.slice(0, 3));
    } catch {
      /* skip */
    }
    await new Promise((r) => setTimeout(r, 500));
  }

  // Deduplicate and filter
  const unique = [...new Set(topics)].filter((t) => t.length > 10 && t !== '');
  console.log(`  📊 Found ${unique.length} trending topics`);
  return unique;
}

async function pickBestTopic(topics: string[]): Promise<string> {
  // Ask Gemini to pick the best topic for our audience
  const prompt = `Você é um especialista em SEO para fonoaudiologia brasileira.
Destes tópicos de busca, escolha O MELHOR para escrever um artigo de blog que atraia fonoaudiólogos e pais de crianças em terapia.
Critérios: alta intenção de busca, pouca concorrência, relevante para nosso público.

Tópicos:
${topics.map((t, i) => `${i + 1}. ${t}`).join('\n')}

Responda APENAS com o tópico escolhido, nada mais.`;

  const chosen = await geminiText(prompt);
  return chosen
    .trim()
    .replace(/^["'\d.\s]+/, '')
    .replace(/["']+$/, '');
}

async function generateBlogPost(topic?: string) {
  let selectedTopic = topic;

  // Get existing posts to avoid duplicates
  const postsDir = 'app/blog/posts';
  const existingPosts = existsSync(postsDir)
    ? require('fs')
        .readdirSync(postsDir)
        .map((f: string) => f.replace('.md', '').replace(/-/g, ' '))
    : [];

  if (!selectedTopic) {
    console.log('  Finding trending topics...');
    const topics = await findTrendingTopics();
    // Filter out topics too similar to existing posts (stricter: 2+ word overlap = duplicate)
    const fresh = topics.filter(
      (t) =>
        !existingPosts.some((p: string) => {
          const topicWords = t
            .toLowerCase()
            .split(/\s+/)
            .filter((w: string) => w.length > 3);
          const postWords = p
            .toLowerCase()
            .split(/\s+/)
            .filter((w: string) => w.length > 3);
          const overlap = topicWords.filter((w: string) =>
            postWords.includes(w)
          ).length;
          return overlap >= 2;
        })
    );
    if (fresh.length > 0) {
      selectedTopic = await pickBestTopic(fresh);
    } else if (topics.length > 0) {
      // All topics are similar — pick one that's least similar
      selectedTopic = await pickBestTopic(topics.slice(-3));
    } else {
      selectedTopic =
        SEED_KEYWORDS[Math.floor(Math.random() * SEED_KEYWORDS.length)];
    }
  }

  // Final dedup: check if slug already exists
  const slug = selectedTopic!
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);

  const filePath = `${postsDir}/${slug}.md`;
  if (existsSync(filePath)) {
    console.log(`  ⚠️ Post already exists: ${filePath}. Skipping.`);
    return;
  }

  console.log(`\n📝 Generating blog post: "${selectedTopic}"\n`);

  const prompt = `Escreva um artigo de blog profissional para fonoaudiólogos brasileiros sobre: "${selectedTopic}"

Requisitos:
- 800-1200 palavras
- Tom profissional mas acessível
- Baseado em evidências (cite práticas do CFFa quando relevante)
- Inclua dicas práticas
- Otimizado para SEO
- Público: fonoaudiólogos e pais de crianças em terapia

IMPORTANTE - Conversão:
- No meio do artigo, inclua um parágrafo natural mencionando que o Almanaque da Fala oferece atividades prontas para imprimir sobre este tema. Use algo como: "No Almanaque da Fala, disponibilizamos atividades ilustradas e prontas para imprimir que trabalham exatamente esse fonema. [Experimente grátis](/cadastro)."
- No final, inclua um CTA claro: "Quer receber atividades prontas para usar na sua prática? Cadastre-se gratuitamente no Almanaque da Fala e acesse nossa biblioteca de materiais."
- NÃO seja agressivo na venda. O CTA deve ser natural e útil, como uma recomendação de colega.

Formato do output (markdown):
---
title: "Título do artigo"
date: "${new Date().toISOString().split('T')[0]}"
excerpt: "Resumo em 1-2 frases para SEO (máximo 160 caracteres)"
author: "Eliane Mota"
authorRole: "Fonoaudióloga"
authorInstagram: "https://www.instagram.com/fonoeliane"
tags: ["tag1 long-tail", "tag2 long-tail", "tag3 long-tail"]
featured: false
seo:
  title: "Título Otimizado para SEO | Almanaque da Fala"
  description: "Descrição SEO com palavra-chave principal (máximo 160 caracteres)"
  keywords: ["palavra-chave principal", "variação 1", "variação 2", "variação 3"]
---

Conteúdo do artigo aqui...

REGRAS SEO OBRIGATÓRIAS:
- Título deve conter a palavra-chave principal
- Excerpt deve ter no máximo 160 caracteres
- Tags devem ser long-tail (ex: "exercícios fonema r crianças" não apenas "exercícios")
- seo.title deve ser diferente do title principal e incluir "| Almanaque da Fala"
- seo.description deve ser diferente do excerpt
- seo.keywords deve ter 4 palavras-chave relevantes para busca no Google
- NÃO usar "Dr." ou "Dra." — o título profissional é "Fonoaudióloga"
- Sempre incluir authorRole: "Fonoaudióloga"
authorInstagram: "https://www.instagram.com/fonoeliane"`;

  const content = await geminiText(prompt);
  if (!content) {
    console.log('❌ Failed to generate');
    return;
  }

  if (!existsSync(postsDir)) mkdirSync(postsDir, { recursive: true });

  writeFileSync(filePath, content);
  console.log(`  ✅ Saved: ${filePath}`);

  await sendTelegram(
    `📝 *Novo post gerado:*\n"${selectedTopic}"\n\nArquivo: \`${filePath}\`\nRevise e aprove antes de publicar.`
  );
}

// ─── MAIN ─────────────────────────────────────────────────────

async function main() {
  const [, , command, arg] = process.argv;

  if (command === 'activities') {
    const phonemes =
      !arg || arg === 'all'
        ? ALL_PHONEMES
        : arg.split(',').map((p) => p.trim());
    await generateActivities(phonemes);
  } else if (command === 'blog') {
    await generateBlogPost(arg || undefined);
  } else {
    console.log(
      'Usage: npx tsx scripts/generate-content.ts [activities|blog] [args]'
    );
  }
}

main().catch(console.error);
