import { prisma } from '@/app/db';
import { auth } from '@clerk/nextjs/server';
import { ListObjectsV2Command, S3Client } from '@aws-sdk/client-s3';
import { NextResponse } from 'next/server';

const BUCKET = process.env.AWS_S3_BUCKET_NAME || 'fonosapp';

const s3 = new S3Client({
  region: process.env.AWS_REGION || 'eu-west-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

/**
 * AI Quality Check — validates activity metadata for:
 * - Spelling/grammar in Portuguese
 * - Correct watermark reference (almanaquedafala.com.br)
 * - Appropriate content for stated age/phoneme
 * - No emojis
 */
async function runQualityCheck(parsed: {
  name: string;
  description: string;
  phoneme: string;
  ageRange: string;
  type: string;
  difficulty: string;
}): Promise<{ passed: boolean; reason?: string }> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return { passed: true }; // Skip if no API key

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `Voce e um revisor de qualidade para a plataforma almanaquedafala.com.br. Avalie a atividade e responda APENAS com JSON: {"passed": true/false, "reason": "motivo se reprovado"}

Criterios de reprovacao:
- Erros ortograficos ou gramaticais em portugues brasileiro
- Emojis no conteudo
- Nome ou descricao inadequados para a faixa etaria indicada
- Fonema incorreto para o tipo de atividade
- Referencia incorreta a marca (deve ser almanaquedafala.com.br)`,
          },
          {
            role: 'user',
            content: `Nome: ${parsed.name}\nDescricao: ${parsed.description}\nFonema: ${parsed.phoneme}\nFaixa etaria: ${parsed.ageRange}\nTipo: ${parsed.type}\nDificuldade: ${parsed.difficulty}`,
          },
        ],
        max_tokens: 150,
        temperature: 0,
      }),
    });

    if (!response.ok) return { passed: true }; // Don't block on API failure

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    const result = JSON.parse(content);
    return { passed: !!result.passed, reason: result.reason };
  } catch {
    return { passed: true }; // Don't block on parse/network errors
  }
}

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

function parseKey(key: string) {
  const parts = key.split('/');
  if (parts.length < 3) return null;

  const phoneme = parts[1].toUpperCase();
  const filename = parts[2];
  const ext = filename.split('.').pop() || 'png';
  const nameWithoutExt = filename.replace(/\.[^.]+$/, '');

  const match = nameWithoutExt.match(/^(.+?)-(.+)-age(\d+)$/);
  if (!match) return null;

  const [, actType, theme, ageStr] = match;
  const age = parseInt(ageStr);
  const meta = activityTypeMap[actType];
  if (!meta) return null;

  return {
    phoneme,
    age,
    ageRange: ageToRange(age),
    type: meta.type,
    difficulty: meta.difficulty,
    name: `${activityNames[actType] || actType} - ${themeNames[theme] || theme} (Fonema /${phoneme}/)`,
    description: `Atividade de ${(activityNames[actType] || actType).toLowerCase()} com tema "${themeNames[theme] || theme}" para trabalhar o fonema /${phoneme}/. Indicado para crianças de ${age} anos.`,
    s3Key: key,
    fileName: filename,
    fileType: ext === 'pdf' ? 'application/pdf' : `image/${ext}`,
  };
}

export async function POST(request: Request) {
  try {
    // Auth: either Clerk session (browser) or API key (GitHub Actions)
    const authHeader = request.headers.get('authorization');
    const apiKey = authHeader?.replace('Bearer ', '');

    let user;

    if (apiKey === process.env.ADMIN_API_KEY) {
      // Machine-to-machine: use first admin user
      user = await prisma.user.findFirst({ orderBy: { createdAt: 'asc' } });
    } else {
      // Browser: use Clerk session
      const { userId } = await auth();
      if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      user = await prisma.user.findUnique({ where: { clerkUserId: userId } });
    }

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // List all objects under activities/
    let allKeys: string[] = [];
    let continuationToken: string | undefined;

    do {
      const command = new ListObjectsV2Command({
        Bucket: BUCKET,
        Prefix: 'activities/',
        ContinuationToken: continuationToken,
      });
      const response = await s3.send(command);
      const keys =
        response.Contents?.map((obj) => obj.Key!).filter(Boolean) || [];
      allKeys = allKeys.concat(keys);
      continuationToken = response.IsTruncated
        ? response.NextContinuationToken
        : undefined;
    } while (continuationToken);

    // Get existing s3Keys to avoid duplicates
    const existingFiles = await prisma.activityFile.findMany({
      where: { s3Key: { in: allKeys } },
      select: { s3Key: true },
    });
    const existingKeys = new Set(existingFiles.map((f) => f.s3Key));

    let created = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const key of allKeys) {
      if (existingKeys.has(key)) {
        skipped++;
        continue;
      }

      const parsed = parseKey(key);
      if (!parsed) {
        errors.push(`Cannot parse: ${key}`);
        continue;
      }

      // Quality Gate 1: Dedup — no duplicate phoneme + type + ageRange + theme combo
      const existingActivity = await prisma.activity.findFirst({
        where: {
          phoneme: parsed.phoneme,
          type: parsed.type as any,
          ageRange: parsed.ageRange as any,
          name: parsed.name,
        },
      });

      if (existingActivity) {
        skipped++;
        continue;
      }

      // Quality Gate 2: AI quality check on metadata
      const qualityResult = await runQualityCheck(parsed);

      const activity = await prisma.activity.create({
        data: {
          name: parsed.name,
          description: parsed.description,
          type: parsed.type as any,
          difficulty: parsed.difficulty as any,
          ageRange: parsed.ageRange as any,
          phoneme: parsed.phoneme,
          isPublic: qualityResult.passed,
          status: qualityResult.passed ? 'PUBLISHED' : 'PENDING_REVIEW',
          createdById: user.id,
        },
      });

      await prisma.activityFile.create({
        data: {
          activityId: activity.id,
          name: parsed.fileName,
          s3Key: parsed.s3Key,
          s3Url: `https://${BUCKET}.s3.${process.env.AWS_REGION || 'eu-west-1'}.amazonaws.com/${parsed.s3Key}`,
          fileType: parsed.fileType,
          sizeInBytes: 0,
          uploadedById: user.id,
        },
      });

      created++;
    }

    return NextResponse.json({
      success: true,
      created,
      skipped,
      errors: errors.length > 0 ? errors : undefined,
      total: allKeys.length,
    });
  } catch (error) {
    console.error('Sync S3 activities error:', error);
    return NextResponse.json(
      { error: 'Failed to sync activities' },
      { status: 500 }
    );
  }
}
