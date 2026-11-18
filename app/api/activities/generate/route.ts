import { generateActivityContent } from '@/lib/activities/generateContent';
import { ActivityPDFRenderer } from '@/lib/activities/pdfRenderer';
import { prisma } from '@/app/db';
import { getEffectiveAccess } from '@/lib/auth/viewAs';
import { rateLimiters } from '@/lib/security/rateLimiter';
import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Only the activity types that go through the validated JSON -> render path.
// The puzzle layout (grids, board, answers) is built deterministically by our
// code and validated in lib/activities, never taken from the AI as an image.
const schema = z.object({
  type: z.enum(['FIND_CIRCLE', 'WORD_SEARCH', 'BOARD_GAME', 'CROSSWORD']),
  // Letters only: also lands in the Content-Disposition filename.
  phoneme: z
    .string()
    .min(1)
    .max(5)
    .regex(/^\p{L}+$/u),
  // Free text that reaches the LLM prompt: no markup or control characters.
  topic: z
    .string()
    .min(1)
    .max(50)
    .regex(/^[\p{L}\p{N} \-]+$/u),
  age: z.number().int().min(3).max(17),
});

function difficultyForAge(age: number): 'EASY' | 'MEDIUM' | 'HARD' {
  if (age <= 6) return 'EASY';
  if (age <= 10) return 'MEDIUM';
  return 'HARD';
}

export async function POST(request: NextRequest) {
  // Each call spends OpenAI budget, so it is limited to signed-in subscribers
  // (or admins) and rate limited per client.
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }

  const limit = await rateLimiters.aiGeneration.checkAsync(request);
  if (!limit.success) {
    return NextResponse.json(
      { error: 'Muitas solicitações. Tente novamente mais tarde.' },
      {
        status: 429,
        headers: {
          'Retry-After': Math.ceil(
            (limit.resetTime - Date.now()) / 1000
          ).toString(),
        },
      }
    );
  }

  const user = await prisma.user.findUnique({
    where: { clerkUserId },
    select: { id: true, role: true },
  });
  const access = user ? await getEffectiveAccess(user) : null;
  if (!access || !(access.isAdmin || access.subscribed)) {
    return NextResponse.json(
      { error: 'Assine o plano Profissional para gerar atividades.' },
      { status: 403 }
    );
  }

  let parsed: z.infer<typeof schema>;
  try {
    const body = await request.json();
    parsed = schema.parse(body);
  } catch {
    return NextResponse.json(
      { error: 'Parâmetros inválidos. Verifique tipo, fonema, tema e idade.' },
      { status: 400 }
    );
  }

  const { type, phoneme, topic, age } = parsed;

  try {
    // 1. Generate + validate content (retries internally, throws if it can't
    //    produce a valid activity after several attempts).
    const content = await generateActivityContent({
      type,
      phoneme,
      topic,
      age,
    });

    // 2. Render the PDF ourselves from the validated content.
    const pdfBytes = await ActivityPDFRenderer.renderActivity(type, {
      titulo: content.titulo,
      instrucoes: content.instrucoes,
      phoneme,
      difficulty: difficultyForAge(age),
      ageRange: `${age} anos`,
      items: content.items,
      answers: content.answers,
      grid: content.grid,
      crossword: content.crossword,
    });

    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="atividade-${phoneme}-${type.toLowerCase()}-idade${age}.pdf"`,
      },
    });
  } catch (error) {
    // Never emit a half-valid activity: fail loudly with a clean pt-BR message.
    console.error('[activities/generate] falha ao gerar atividade:', error);
    return NextResponse.json(
      {
        error:
          'Não foi possível gerar uma atividade válida no momento. Tente novamente.',
      },
      { status: 502 }
    );
  }
}
