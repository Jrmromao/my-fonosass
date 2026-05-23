/**
 * Unified content generation script.
 * Usage:
 *   npx tsx scripts/generate-content.ts activities "r,s,l"
 *   npx tsx scripts/generate-content.ts activities "all"
 *   npx tsx scripts/generate-content.ts blog "dicas para pais sobre fonema r"
 */
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { writeFileSync, mkdirSync, existsSync } from 'fs';

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

async function geminiImage(prompt: string): Promise<Buffer | null> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${GEMINI_KEY}`,
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
      '    API error:',
      data.error?.message || JSON.stringify(data).slice(0, 200)
    );
    return null;
  }
  if (!data.candidates?.[0]) {
    console.error('    No candidates in response');
    return null;
  }
  const imgPart = data.candidates[0].content.parts.find(
    (p: any) => p.inlineData
  );
  if (!imgPart) {
    console.error('    Response had text but no image');
    return null;
  }
  return Buffer.from(imgPart.inlineData.data, 'base64');
}

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

async function sendActivityForReview(activity: {
  imageBuffer: Buffer;
  phoneme: string;
  type: string;
  topic: string;
  age: number;
  s3Key: string;
  s3Url: string;
}) {
  if (!TELEGRAM_TOKEN || !TELEGRAM_CHAT) return;

  const APP_URL =
    process.env.NEXT_PUBLIC_APP_URL || 'https://www.almanaquedafala.com.br';
  const approveUrl = `${APP_URL}/api/activities/review?action=approve&key=${encodeURIComponent(activity.s3Key)}`;
  const rejectUrl = `${APP_URL}/api/activities/review?action=reject&key=${encodeURIComponent(activity.s3Key)}`;

  const formData = new FormData();
  formData.append('chat_id', TELEGRAM_CHAT);
  formData.append(
    'photo',
    new Blob([activity.imageBuffer], { type: 'image/png' }),
    'activity.png'
  );
  formData.append(
    'caption',
    `Nova atividade\n\nFonema: /${activity.phoneme}/\nTipo: ${activity.type}\nTema: ${activity.topic}\nIdade: ${activity.age} anos`
  );
  formData.append(
    'reply_markup',
    JSON.stringify({
      inline_keyboard: [
        [
          { text: '✅ Aprovar', url: approveUrl },
          { text: '❌ Rejeitar', url: rejectUrl },
        ],
      ],
    })
  );

  await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendPhoto`, {
    method: 'POST',
    body: formData,
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

async function generateActivities(phonemes: string[]) {
  console.log(
    `\n🎨 Generating activities for phonemes: ${phonemes.join(', ')}\n`
  );
  let count = 0;

  for (const phoneme of phonemes) {
    // Pick random combos for variety
    const combos = [];
    for (let i = 0; i < 10; i++) {
      combos.push({
        type: ACTIVITY_TYPES[i % ACTIVITY_TYPES.length],
        topic: TOPICS[i % TOPICS.length],
        age: AGES[i % AGES.length],
      });
    }

    for (const combo of combos) {
      const style =
        combo.age <= 5
          ? 'Very childish, kindergarten style, big bubbly fonts, thick outlines, stars and hearts'
          : combo.age <= 8
            ? 'Colorful, playful, fun adventurous style, cute illustrations'
            : combo.age <= 11
              ? 'Modern, engaging like a real board game, cool dynamic fonts'
              : 'Clean, modern workbook style, not childish';

      const prompt = `Create a premium colorful A4 portrait activity sheet for kids age ${combo.age} speech therapy.
Theme: ${combo.topic}. Phoneme: /${phoneme}/.
Activity type: ${combo.type.replace('_', ' ').toLowerCase()}.
${style}.
BRAND: Include colorful floating balloons with phoneme letters as decorative elements.
All text in Brazilian Portuguese.
Watermark: almanaquedafala.com.br`;

      try {
        const img = await geminiImage(prompt);
        if (!img) {
          console.log(`  ⚠️ No image for /${phoneme}/ ${combo.type}`);
          continue;
        }

        const key = `activities/${phoneme}/${combo.type.toLowerCase()}-${combo.topic}-age${combo.age}.png`;
        const url = await uploadToS3(key, img, 'image/png');
        count++;
        console.log(
          `  ✅ [${count}] /${phoneme}/ ${combo.type} ${combo.topic} age${combo.age}`
        );

        // Send to Telegram for review with image
        await sendActivityForReview({
          imageBuffer: img,
          phoneme,
          type: combo.type,
          topic: combo.topic,
          age: combo.age,
          s3Key: key,
          s3Url: url,
        });

        // Rate limit
        await new Promise((r) => setTimeout(r, 3000));
      } catch (err: any) {
        console.log(`  ❌ /${phoneme}/ ${combo.type}: ${err.message}`);
      }
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
    console.log('  🔍 Finding trending topics...');
    const topics = await findTrendingTopics();
    // Filter out topics too similar to existing posts
    const fresh = topics.filter(
      (t) =>
        !existingPosts.some((p: string) => {
          const similarity = p
            .split(' ')
            .filter((w: string) => t.toLowerCase().includes(w)).length;
          return similarity > 3;
        })
    );
    if (fresh.length > 0) {
      selectedTopic = await pickBestTopic(fresh);
    } else if (topics.length > 0) {
      selectedTopic = await pickBestTopic(topics);
    } else {
      selectedTopic =
        SEED_KEYWORDS[Math.floor(Math.random() * SEED_KEYWORDS.length)];
    }
  }

  // Check if we already have a very similar post
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
excerpt: "Resumo em 1-2 frases"
author: "Eliane Mota"
authorRole: "Fonoaudióloga - CRFa"
authorInstagram: "https://www.instagram.com/fonoeliane"
tags: ["tag1", "tag2", "tag3"]
---

Conteúdo do artigo aqui...`;

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
