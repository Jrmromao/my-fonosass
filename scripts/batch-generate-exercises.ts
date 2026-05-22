/**
 * Batch generate exercises using AI and send for review via Telegram.
 *
 * Usage: npx tsx scripts/batch-generate-exercises.ts
 *
 * Set env vars: OPENAI_API_KEY, TELEGRAM_BOT_TOKEN, TELEGRAM_REVIEWER_CHAT_ID, DATABASE_URL
 */
import { PrismaClient } from '@prisma/client';
import { nanoid } from 'nanoid';

const prisma = new PrismaClient();

const PHONEMES = [
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
  'ʃ',
  'ʒ',
  'ɲ',
];
const DIFFICULTIES = ['iniciante', 'intermediário', 'avançado'] as const;
const AGE_SAMPLES = [4, 7, 12, 16]; // one per age range

const difficultyMap = {
  iniciante: 'BEGINNER',
  intermediário: 'INTERMEDIATE',
  avançado: 'ADVANCED',
} as const;
const ageToRange = (age: number) => {
  if (age <= 2) return 'TODDLER';
  if (age <= 5) return 'PRESCHOOL';
  if (age <= 12) return 'CHILD';
  if (age <= 17) return 'TEENAGER';
  return 'ADULT';
};

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_REVIEWER_CHAT_ID;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

async function sendTelegram(exercise: {
  id: string;
  name: string;
  phoneme: string;
  difficulty: string;
  ageRange: string;
  approvalToken: string;
}) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) return;

  const reviewUrl = `${APP_URL}/dashboard/exercises/review/${exercise.id}?token=${exercise.approvalToken}`;
  const message = `🆕 *${exercise.name}*\n🔤 /${exercise.phoneme}/ | 📊 ${exercise.difficulty} | 👶 ${exercise.ageRange}\n\n[👁 Ver e aprovar](${reviewUrl})`;

  await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: TELEGRAM_CHAT_ID,
      text: message,
      parse_mode: 'Markdown',
    }),
  });
}

async function generateExercise(
  phoneme: string,
  age: number,
  difficulty: string
) {
  const prompt =
    age <= 12
      ? `Crie um exercício DIVERTIDO e INTERATIVO de fonoaudiologia para criança de ${age} anos, fonema /${phoneme}/, nível ${difficulty}. O exercício deve ser lúdico, com brincadeiras, personagens e atividades que engajem a criança. Responda APENAS em JSON válido com as chaves: titulo, objetivo, instrucoes (array), materiais (array), tempo, observacoes, brincadeira, recompensa.`
      : `Crie um exercício de fonoaudiologia para adulto/adolescente de ${age} anos, fonema /${phoneme}/, nível ${difficulty}. Responda APENAS em JSON válido com as chaves: titulo, objetivo, instrucoes (array), materiais (array), tempo, observacoes.`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${process.env.GOOGLE_CLOUD_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: age <= 12 ? 0.9 : 0.7,
          maxOutputTokens: 2048,
          responseMimeType: 'application/json',
        },
      }),
    }
  );

  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || 'Gemini API error');

  const parts = data.candidates[0].content.parts;
  const text = parts[parts.length - 1].text; // last part has the actual output
  return JSON.parse(text);
}

async function main() {
  // Get or create a system user for AI-generated content
  let systemUser = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
  if (!systemUser) {
    console.error('No admin user found. Create one first.');
    process.exit(1);
  }

  const combos: {
    phoneme: string;
    age: number;
    difficulty: (typeof DIFFICULTIES)[number];
  }[] = [];

  // Generate a subset — customize as needed
  const selectedPhonemes = process.argv[2]
    ? [process.argv[2]]
    : PHONEMES.slice(0, 5);
  const selectedDifficulties = DIFFICULTIES;
  const selectedAges = AGE_SAMPLES.slice(0, 2); // 4 and 7 year olds

  for (const phoneme of selectedPhonemes) {
    for (const difficulty of selectedDifficulties) {
      for (const age of selectedAges) {
        combos.push({ phoneme, age, difficulty });
      }
    }
  }

  console.log(`🚀 Generating ${combos.length} exercises...`);

  let created = 0;
  for (const combo of combos) {
    try {
      const exerciseData = await generateExercise(
        combo.phoneme,
        combo.age,
        combo.difficulty
      );
      const approvalToken = nanoid(32);

      const activity = await prisma.activity.create({
        data: {
          name:
            exerciseData.titulo ||
            `Exercício /${combo.phoneme}/ - ${combo.difficulty}`,
          description: JSON.stringify(exerciseData),
          type: 'SPEECH',
          difficulty: difficultyMap[combo.difficulty],
          ageRange: ageToRange(combo.age),
          phoneme: combo.phoneme,
          isPublic: false,
          status: 'PENDING_REVIEW',
          approvalToken,
          createdById: systemUser.id,
        },
      });

      await sendTelegram({
        id: activity.id,
        name: exerciseData.titulo,
        phoneme: combo.phoneme,
        difficulty: combo.difficulty,
        ageRange: ageToRange(combo.age),
        approvalToken,
      });

      created++;
      console.log(`  ✅ [${created}/${combos.length}] ${exerciseData.titulo}`);

      // Rate limit: 1 request per second
      await new Promise((r) => setTimeout(r, 1000));
    } catch (err) {
      console.error(
        `  ❌ Failed: /${combo.phoneme}/ ${combo.difficulty} age ${combo.age}`,
        err
      );
    }
  }

  console.log(
    `\n🎉 Done! Created ${created}/${combos.length} exercises pending review.`
  );
  await prisma.$disconnect();
}

main();
