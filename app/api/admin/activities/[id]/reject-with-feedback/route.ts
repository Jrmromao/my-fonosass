import { prisma } from '@/app/db';
import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { feedback } = await request.json();

    if (!feedback || feedback.trim().length < 5) {
      return NextResponse.json(
        { error: 'Feedback must be at least 5 characters' },
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

    // Parse existing exercise data
    let exerciseData;
    try {
      exerciseData = JSON.parse(activity.description);
    } catch {
      exerciseData = { titulo: activity.name, descricao: activity.description };
    }

    // Ask AI to fix based on feedback
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
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
            content: `Voce e um revisor de conteudo para almanaquedafala.com.br. Corrija o exercicio com base no feedback do admin. Responda APENAS com o JSON corrigido, mantendo a mesma estrutura. Regras: zero erros ortograficos, zero emojis, portugues brasileiro perfeito, conteudo adequado para a faixa etaria.`,
          },
          {
            role: 'user',
            content: `Exercicio atual:\n${JSON.stringify(exerciseData, null, 2)}\n\nFeedback do admin:\n${feedback}\n\nCorreija e retorne o JSON corrigido.`,
          },
        ],
        max_tokens: 800,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'AI service unavailable' },
        { status: 502 }
      );
    }

    const aiData = await response.json();
    const correctedText = aiData.choices?.[0]?.message?.content;

    let correctedData;
    try {
      correctedData = JSON.parse(correctedText);
    } catch {
      return NextResponse.json(
        { error: 'AI returned invalid response' },
        { status: 500 }
      );
    }

    // Update the activity with corrected content, keep as PENDING_REVIEW
    await prisma.activity.update({
      where: { id },
      data: {
        name: correctedData.titulo || activity.name,
        description: JSON.stringify(correctedData),
        status: 'PENDING_REVIEW',
      },
    });

    return NextResponse.json({
      success: true,
      corrected: correctedData,
    });
  } catch (error) {
    console.error('Reject with feedback error:', error);
    return NextResponse.json(
      { error: 'Failed to process feedback' },
      { status: 500 }
    );
  }
}
