import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';

const contentSchema = z.object({
  type: z.enum(['blog', 'social', 'email', 'guide']),
  topic: z.string().min(5),
  audience: z.enum(['fonoaudiologos', 'pais', 'estudantes']),
  length: z.enum(['curto', 'medio', 'longo']),
});

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { type, topic, audience, length } = contentSchema.parse(body);

    const prompts = {
      blog: `Escreva um artigo de blog profissional sobre "${topic}" para ${audience}. 
             Inclua: título atrativo, introdução, 3-5 seções principais, conclusão.
             Tom: educativo e profissional. Tamanho: ${length}.`,

      social: `Crie uma postagem para Instagram sobre "${topic}" para ${audience}.
              Inclua: texto engajante, hashtags relevantes, call-to-action.
              Tom: amigável e informativo. Tamanho: ${length}.`,

      email: `Escreva um email educativo sobre "${topic}" para ${audience}.
             Inclua: assunto atrativo, saudação, conteúdo valioso, CTA.
             Tom: pessoal e útil. Tamanho: ${length}.`,

      guide: `Crie um guia prático sobre "${topic}" para ${audience}.
             Inclua: passos claros, dicas práticas, exemplos.
             Tom: instrutivo e claro. Tamanho: ${length}.`,
    };

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content:
              'Você é um especialista em fonoaudiologia e marketing de conteúdo. Crie conteúdo educativo e envolvente em português brasileiro.',
          },
          {
            role: 'user',
            content: prompts[type],
          },
        ],
        max_tokens: length === 'longo' ? 2000 : length === 'medio' ? 1000 : 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error('OpenAI API error');
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    return NextResponse.json({
      success: true,
      content,
      metadata: {
        type,
        topic,
        audience,
        length,
        generatedAt: new Date().toISOString(),
      },
      usage: data.usage,
    });
  } catch (error) {
    console.error('Content generation error:', error);
    return NextResponse.json(
      { error: 'Erro ao gerar conteúdo' },
      { status: 500 }
    );
  }
}
