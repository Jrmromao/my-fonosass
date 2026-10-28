export const dynamic = 'force-dynamic';
import { prisma } from '@/app/db';
import {
  assertTransition,
  errorResponse,
  requireAdmin,
  type ActivityStatus,
} from '@/lib/activities/approval';
import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const GEMINI_KEY = process.env.GOOGLE_CLOUD_API_KEY;
const BUCKET = process.env.AWS_S3_BUCKET_NAME || 'fonosapp';

const s3 = new S3Client({
  region: process.env.AWS_REGION || 'eu-west-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

const bodySchema = z.object({ feedback: z.string().trim().min(5).max(2000) });

/** fetch with a hard timeout so a hung AI call can't block the request. */
async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  ms = 30_000
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

/** Derive a new, versioned S3 key so we never overwrite the original. */
function versionedKey(key: string): string {
  const stamp = Date.now();
  const dot = key.lastIndexOf('.');
  return dot === -1
    ? `${key}-rev${stamp}`
    : `${key.slice(0, dot)}-rev${stamp}${key.slice(dot)}`;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { dbUserId } = await requireAdmin();

    const { id } = await params;

    let feedback: string;
    try {
      ({ feedback } = bodySchema.parse(await request.json()));
    } catch {
      return NextResponse.json(
        { error: 'Feedback deve ter entre 5 e 2000 caracteres' },
        { status: 400 }
      );
    }

    const activity = await prisma.activity.findUnique({
      where: { id },
      include: { files: true },
    });
    if (!activity) {
      return NextResponse.json(
        { error: 'Activity not found' },
        { status: 404 }
      );
    }

    // Rejection-with-correction sends the item back into review.
    assertTransition(activity.status as ActivityStatus, 'PENDING_REVIEW');

    const imageFile = activity.files.find((f) =>
      f.fileType.startsWith('image/')
    );

    // ---- Image activities: regenerate with Gemini ----
    if (imageFile && GEMINI_KEY) {
      const getCmd = new GetObjectCommand({
        Bucket: BUCKET,
        Key: imageFile.s3Key,
      });
      const s3Obj = await s3.send(getCmd);
      if (!s3Obj.Body) {
        return NextResponse.json(
          { error: 'Arquivo de origem não encontrado no armazenamento' },
          { status: 500 }
        );
      }
      const currentImage = Buffer.from(await s3Obj.Body.transformToByteArray());

      const regeneratePrompt = `Esta é uma folha de atividade de fonoaudiologia com problemas.

FEEDBACK DO REVISOR: ${feedback}

Regenere a folha corrigindo TODOS os problemas acima.

REGRAS:
- Corrija todos os erros de ortografia em português do Brasil
- Garanta que todas as palavras contenham o fonema /${activity.phoneme}/
- Mantenha o mesmo estilo visual e layout
- NÃO adicione marca d'água ou rodapé (são adicionados programaticamente)
- Todo o texto em português do Brasil correto
- Atividade para crianças de faixa ${activity.ageRange}
- Tipo: ${activity.type}`;

      const res = await fetchWithTimeout(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${GEMINI_KEY}`,
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
                      data: currentImage.toString('base64'),
                    },
                  },
                  { text: regeneratePrompt },
                ],
              },
            ],
            generationConfig: { responseModalities: ['IMAGE', 'TEXT'] },
          }),
        }
      );

      if (!res.ok) {
        return NextResponse.json(
          { error: 'Serviço de IA indisponível' },
          { status: 502 }
        );
      }

      const data = await res.json();
      const imgPart = data.candidates?.[0]?.content?.parts?.find(
        (p: { inlineData?: unknown }) => p.inlineData
      );
      if (!imgPart) {
        return NextResponse.json(
          { error: 'Falha ao regenerar a imagem' },
          { status: 502 }
        );
      }

      const newImage = Buffer.from(imgPart.inlineData.data, 'base64');

      // Write to a NEW key so the original is preserved (no destructive
      // overwrite). The file record is repointed to the new version.
      const newKey = versionedKey(imageFile.s3Key);
      await s3.send(
        new PutObjectCommand({
          Bucket: BUCKET,
          Key: newKey,
          Body: newImage,
          ContentType: 'image/png',
        })
      );

      await prisma.$transaction([
        prisma.activityFile.update({
          where: { id: imageFile.id },
          data: { s3Key: newKey, sizeInBytes: newImage.length },
        }),
        prisma.activity.update({
          where: { id },
          data: {
            status: 'PENDING_REVIEW',
            reviewFeedback: feedback,
            reviewedById: dbUserId,
            reviewedAt: new Date(),
          },
        }),
      ]);

      return NextResponse.json({
        success: true,
        regenerated: true,
        message: 'Imagem regenerada com as correções',
      });
    }

    // ---- Text activities: correct via OpenAI ----
    let exerciseData: unknown;
    try {
      exerciseData = JSON.parse(activity.description);
    } catch {
      exerciseData = { titulo: activity.name, descricao: activity.description };
    }

    const textRes = await fetchWithTimeout(
      'https://api.openai.com/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content:
                'Corrija o exercício com base no feedback. Responda APENAS com JSON corrigido. Regras: zero erros ortográficos, zero emojis, português brasileiro perfeito.',
            },
            {
              role: 'user',
              content: `Exercício:\n${JSON.stringify(exerciseData)}\n\nFeedback:\n${feedback}`,
            },
          ],
          max_tokens: 800,
          temperature: 0.3,
        }),
      }
    );

    if (!textRes.ok) {
      return NextResponse.json(
        { error: 'Serviço de IA indisponível' },
        { status: 502 }
      );
    }

    const aiData = await textRes.json();
    const correctedText = aiData.choices?.[0]?.message?.content;
    let correctedData: { titulo?: string };
    try {
      correctedData = JSON.parse(correctedText);
    } catch {
      return NextResponse.json(
        { error: 'A IA retornou uma resposta inválida' },
        { status: 502 }
      );
    }

    await prisma.activity.update({
      where: { id },
      data: {
        name: correctedData.titulo || activity.name,
        description: JSON.stringify(correctedData),
        status: 'PENDING_REVIEW',
        reviewFeedback: feedback,
        reviewedById: dbUserId,
        reviewedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, corrected: correctedData });
  } catch (error) {
    const { body, status } = errorResponse(error);
    return NextResponse.json(body, { status });
  }
}
