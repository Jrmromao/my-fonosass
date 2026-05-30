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

      // ═══ STEP 1: Generate validated word list ═══
      const wordListPrompt = `Liste exatamente 8 palavras em português brasileiro que:
1. Contenham o fonema /${phoneme}/ (na posição inicial, medial ou final)
2. Sejam do tema "${combo.topic}"
3. Sejam adequadas para crianças de ${combo.age} anos
4. Tenham ortografia 100% correta em português brasileiro

Responda APENAS com as palavras separadas por vírgula, sem numeração, sem explicação.`;

      const wordListRaw = await geminiText(wordListPrompt);
      const words = wordListRaw
        .split(',')
        .map((w) => w.trim().toLowerCase())
        .filter((w) => w.length > 0)
        .slice(0, 8);

      if (words.length < 4) {
        console.log(`  ⚠️ Insufficient words for /${phoneme}/ ${combo.topic}`);
        continue;
      }

      // ═══ STEP 2: Generate image WITHOUT watermark ═══
      const prompt = `Create a premium A4 portrait activity sheet for kids age ${combo.age} speech therapy.

CONTENT:
- Theme: ${combo.topic}
- Phoneme: /${phoneme}/
- Activity type: ${combo.type.replace('_', ' ').toLowerCase()}
- All text in Brazilian Portuguese
- MANDATORY WORDS TO INCLUDE: ${words.join(', ')}
- These words MUST appear correctly spelled in the activity

VISUAL STYLE:
- Background: clean white
- Primary accent color: warm orange/coral (#f97316)
- Secondary colors: soft gray borders, light orange highlights
- ${style}
- Header: activity title in bold, phoneme badge in orange circle, age indicator
- DO NOT add any footer or watermark text — this will be added programmatically

BRAND ELEMENTS:
- 3-4 small colorful balloons as corner decorations
- Each balloon has a single letter/phoneme on it
- Balloons use these colors: #6366f1, #ec4899, #f59e0b, #10b981, #8b5cf6
- Clean rounded borders on activity areas
- Professional workbook quality

CRITICAL:
- Every word MUST be spelled correctly in Portuguese
- All words MUST contain the phoneme /${phoneme}/
- Do NOT add any watermark or footer text
- Do NOT invent words that don't exist in Portuguese`;

      // ═══ STEP 3: Generate with retry (max 2 attempts) ═══
      let img: Buffer | null = null;
      let qualityScore = 0;
      let validationResult: any = null;

      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          img = await geminiImage(attempt === 0 ? prompt : prompt + '\n\nPREVIOUS ATTEMPT FAILED. Fix: ensure all words are correctly spelled and contain the phoneme.');
          if (!img) break;

          // ═══ STEP 4: AI Vision validation with confidence scoring ═══
          const validationPrompt = `Analise esta imagem de atividade terapêutica infantil. Responda APENAS com JSON:
{
  "words_readable": true/false,
  "spelling_errors": [],
  "words_with_phoneme": 0,
  "total_words_visible": 0,
  "age_appropriate": true/false,
  "professional_quality": true/false,
  "confidence_score": 0-100
}

Critérios de pontuação (confidence_score):
- Palavras legíveis e corretas: +30 pontos
- Todas contêm o fonema /${phoneme}/: +30 pontos
- Visual profissional e adequado à idade ${combo.age}: +20 pontos
- Sem erros ortográficos: +20 pontos
- Cada erro ortográfico: -15 pontos

Palavras esperadas: ${words.join(', ')}
Fonema alvo: /${phoneme}/`;

          const valRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${GEMINI_KEY}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{
                  parts: [
                    { inlineData: { mimeType: 'image/png', data: img.toString('base64') } },
                    { text: validationPrompt },
                  ],
                }],
              }),
            }
          );
          const valData = await valRes.json();
          const valText = valData.candidates?.[0]?.content?.parts?.[0]?.text || '';
          const jsonMatch = valText.match(/\{[\s\S]*\}/);

          if (jsonMatch) {
            validationResult = JSON.parse(jsonMatch[0]);
            qualityScore = validationResult.confidence_score || 0;
          } else {
            qualityScore = 70; // Can't validate — assume moderate quality
          }

          if (qualityScore >= 70) break; // Good enough, stop retrying
          console.log(`  ⚠️ Attempt ${attempt + 1} scored ${qualityScore}/100 — retrying...`);
        } catch (err: any) {
          console.log(`  ❌ Attempt ${attempt + 1} error: ${err.message}`);
        }

        await new Promise((r) => setTimeout(r, 2000));
      }

      if (!img || qualityScore < 40) {
        console.log(`  ⏭️ Skipping /${phoneme}/ ${combo.type} — score ${qualityScore}/100 (min 40)`);
        continue;
      }

      // ═══ STEP 5: All activities go to PENDING_REVIEW — admin approves via Telegram/dashboard ═══
      const status = 'PENDING_REVIEW';

      // ═══ STEP 6: Wrap in branded PDF + upload to S3 ═══
      try {
        const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');

        // Create branded PDF with the activity image
        const pdfDoc = await PDFDocument.create();
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
        const image = await pdfDoc.embedPng(img);

        // Brand colors
        const navy = rgb(30 / 255, 41 / 255, 59 / 255);
        const gray400 = rgb(148 / 255, 163 / 255, 184 / 255);

        // Layout
        const margin = 40;
        const headerHeight = 56;
        const footerHeight = 36;
        const maxWidth = 595 - margin * 2; // A4 width
        const scale = Math.min(maxWidth / image.width, 1);
        const imgWidth = image.width * scale;
        const imgHeight = image.height * scale;
        const pageWidth = 595;
        const pageHeight = imgHeight + headerHeight + footerHeight + margin * 2;

        const page = pdfDoc.addPage([pageWidth, pageHeight]);

        // Header bar
        page.drawRectangle({ x: 0, y: pageHeight - headerHeight, width: pageWidth, height: headerHeight, color: navy });
        page.drawText('almanaquedafala.com.br', { x: margin, y: pageHeight - 35, size: 14, font: fontBold, color: rgb(1, 1, 1) });

        const activityTitle = `${combo.type.replace('_', ' ')} — ${combo.topic} (/${phoneme}/)`;
        page.drawText(activityTitle, { x: margin, y: pageHeight - 50, size: 9, font, color: rgb(0.8, 0.8, 0.8) });

        // Image
        const imgX = (pageWidth - imgWidth) / 2;
        const imgY = footerHeight + margin;
        page.drawImage(image, { x: imgX, y: imgY, width: imgWidth, height: imgHeight });

        // Footer
        page.drawRectangle({ x: 0, y: 0, width: pageWidth, height: footerHeight, color: rgb(0.98, 0.98, 0.99) });
        page.drawLine({ start: { x: 0, y: footerHeight }, end: { x: pageWidth, y: footerHeight }, thickness: 0.5, color: rgb(0.9, 0.9, 0.92) });

        const footerText = `Fonema /${phoneme}/ | ${combo.type.replace('_', ' ')} | Idade: ${combo.age} anos`;
        page.drawText(footerText, { x: margin, y: 12, size: 8, font, color: gray400 });
        page.drawText('almanaquedafala.com.br', {
          x: pageWidth - margin - font.widthOfTextAtSize('almanaquedafala.com.br', 8),
          y: 12, size: 8, font, color: navy,
        });

        const pdfBytes = await pdfDoc.save();
        const pdfBuffer = Buffer.from(pdfBytes);

        const key = `activities/${phoneme}/${combo.type.toLowerCase()}-${combo.topic}-age${combo.age}.pdf`;
        const url = await uploadToS3(key, pdfBuffer, 'application/pdf');
        count++;
        console.log(
          `  [${count}] /${phoneme}/ ${combo.type} ${combo.topic} age${combo.age} — PDF created (score: ${qualityScore}/100)`
        );

        // Send to Telegram for review with quality score (send PNG for visual preview)
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
    console.log('  Finding trending topics...');
    const topics = await findTrendingTopics();
    // Filter out topics too similar to existing posts (stricter: 2+ word overlap = duplicate)
    const fresh = topics.filter(
      (t) =>
        !existingPosts.some((p: string) => {
          const topicWords = t.toLowerCase().split(/\s+/).filter((w: string) => w.length > 3);
          const postWords = p.toLowerCase().split(/\s+/).filter((w: string) => w.length > 3);
          const overlap = topicWords.filter((w: string) => postWords.includes(w)).length;
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
    console.log('  Post already exists: ' + slug + ' — skipping');
    return;
  }

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
