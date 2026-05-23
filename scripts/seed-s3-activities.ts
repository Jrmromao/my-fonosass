import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const BUCKET = 'fonosapp';
const REGION = process.env.AWS_REGION || 'eu-west-1';

// Mapping from filename patterns to metadata
const activityTypeMap: Record<string, { type: string; difficulty: string }> = {
  find_circle: { type: 'SPEECH', difficulty: 'BEGINNER' },
  word_search: { type: 'LANGUAGE', difficulty: 'INTERMEDIATE' },
  board_game: { type: 'COGNITIVE', difficulty: 'INTERMEDIATE' },
  color_speak: { type: 'SPEECH', difficulty: 'ADVANCED' },
};

const themeNames: Record<string, string> = {
  animais: 'Animais',
  brinquedos: 'Brinquedos',
  'corpo humano': 'Corpo Humano',
  casa: 'Casa',
  comida: 'Comida',
  profissoes: 'Profissões',
  escola: 'Escola',
  transporte: 'Transporte',
  natureza: 'Natureza',
  roupas: 'Roupas',
};

const activityNames: Record<string, string> = {
  find_circle: 'Encontre e Circule',
  word_search: 'Caça-Palavras',
  board_game: 'Jogo de Tabuleiro',
  color_speak: 'Colorir e Falar',
};

function ageToRange(age: number) {
  if (age <= 3) return 'TODDLER';
  if (age <= 5) return 'PRESCHOOL';
  if (age <= 12) return 'CHILD';
  if (age <= 17) return 'TEENAGER';
  return 'ADULT';
}

// All S3 files organized by phoneme
const files = [
  // P
  'activities/p/find_circle-animais-age4.png',
  'activities/p/find_circle-brinquedos-age4.png',
  'activities/p/find_circle-corpo humano-age4.png',
  'activities/p/word_search-casa-age6.png',
  'activities/p/word_search-comida-age6.png',
  'activities/p/word_search-profissoes-age6.png',
  'activities/p/board_game-escola-age9.png',
  'activities/p/board_game-transporte-age9.png',
  'activities/p/color_speak-natureza-age12.png',
  'activities/p/color_speak-roupas-age12.png',
  // R
  'activities/r/find_circle-animais-age4.png',
  'activities/r/find_circle-brinquedos-age4.png',
  'activities/r/find_circle-corpo humano-age4.png',
  'activities/r/word_search-casa-age6.png',
  'activities/r/word_search-comida-age6.png',
  'activities/r/word_search-profissoes-age6.png',
  'activities/r/board_game-escola-age9.png',
  'activities/r/board_game-transporte-age9.png',
  'activities/r/color_speak-natureza-age12.png',
  'activities/r/color_speak-roupas-age12.png',
  // S
  'activities/s/find_circle-animais-age4.png',
  'activities/s/find_circle-brinquedos-age4.png',
  'activities/s/find_circle-corpo humano-age4.png',
  'activities/s/word_search-casa-age6.png',
  'activities/s/word_search-comida-age6.png',
  'activities/s/word_search-profissoes-age6.png',
  'activities/s/board_game-escola-age9.png',
  'activities/s/board_game-transporte-age9.png',
  'activities/s/color_speak-natureza-age12.png',
  'activities/s/color_speak-roupas-age12.png',
];

function parseKey(key: string) {
  // activities/p/find_circle-animais-age4.png
  const parts = key.split('/');
  const phoneme = parts[1].toUpperCase(); // P, R, S
  const filename = parts[2]; // find_circle-animais-age4.png
  const nameWithoutExt = filename.replace('.png', '');

  // Split: find_circle-animais-age4
  const match = nameWithoutExt.match(/^(.+?)-(.+)-age(\d+)$/);
  if (!match) throw new Error(`Cannot parse: ${key}`);

  const [, actType, theme, ageStr] = match;
  const age = parseInt(ageStr);
  const meta = activityTypeMap[actType];

  return {
    phoneme,
    actType,
    theme,
    age,
    ageRange: ageToRange(age),
    type: meta.type,
    difficulty: meta.difficulty,
    name: `${activityNames[actType]} - ${themeNames[theme] || theme} (Fonema /${phoneme}/)`,
    description: `Atividade de ${(activityNames[actType] || actType).toLowerCase()} com tema "${themeNames[theme] || theme}" para trabalhar o fonema /${phoneme}/. Indicado para crianças de ${age} anos.`,
    s3Key: key,
    fileName: filename,
  };
}

async function main() {
  // Get admin user (first user in DB)
  const adminUser = await prisma.user.findFirst({
    orderBy: { createdAt: 'asc' },
  });
  if (!adminUser) {
    console.error('No user found in DB. Create a user first.');
    process.exit(1);
  }

  console.log(`Using admin user: ${adminUser.fullName} (${adminUser.id})`);

  let created = 0;
  let skipped = 0;

  for (const key of files) {
    const parsed = parseKey(key);

    // Check if activity with this exact name already exists
    const existing = await prisma.activity.findFirst({
      where: { name: parsed.name },
    });

    if (existing) {
      skipped++;
      continue;
    }

    const activity = await prisma.activity.create({
      data: {
        name: parsed.name,
        description: parsed.description,
        type: parsed.type as any,
        difficulty: parsed.difficulty as any,
        ageRange: parsed.ageRange as any,
        phoneme: parsed.phoneme,
        isPublic: true,
        status: 'PUBLISHED',
        createdById: adminUser.id,
      },
    });

    await prisma.activityFile.create({
      data: {
        activityId: activity.id,
        name: parsed.fileName,
        s3Key: parsed.s3Key,
        s3Url: `https://${BUCKET}.s3.${REGION}.amazonaws.com/${parsed.s3Key}`,
        fileType: 'image/png',
        sizeInBytes: 0, // We don't need exact size for display
        uploadedById: adminUser.id,
      },
    });

    created++;
    console.log(`✅ ${parsed.name}`);
  }

  console.log(`\nDone: ${created} created, ${skipped} skipped (already exist)`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
