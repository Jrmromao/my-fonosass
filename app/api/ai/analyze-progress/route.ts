import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';

const progressSchema = z.object({
  sessionNotes: z.string().min(10),
  patientAge: z.number().min(1).max(100),
  goals: z.array(z.string()),
  previousSessions: z.array(z.string()).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { sessionNotes, patientAge, goals, previousSessions } =
      progressSchema.parse(body);

    const prompt = `Como fonoaudiólogo especialista, analise esta sessão terapêutica:

    NOTAS DA SESSÃO: ${sessionNotes}
    IDADE DO PACIENTE: ${patientAge} anos
    OBJETIVOS TERAPÊUTICOS: ${goals.join(', ')}
    ${previousSessions ? `SESSÕES ANTERIORES: ${previousSessions.join('\n')}` : ''}

    Forneça uma análise profissional em formato JSON:
    {
      "progresso": "Análise do progresso observado",
      "pontosPositivos": ["Ponto 1", "Ponto 2"],
      "areasAtencao": ["Área 1", "Área 2"],
      "recomendacoes": ["Recomendação 1", "Recomendação 2"],
      "proximasSessoes": "Sugestões para próximas sessões",
      "exerciciosCasa": ["Exercício 1", "Exercício 2"],
      "prazoReavaliacao": "Sugestão de prazo para reavaliação"
    }

    Use linguagem técnica profissional em português brasileiro.`;

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
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 1000,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      throw new Error('OpenAI API error');
    }

    const data = await response.json();
    const analysisText = data.choices[0]?.message?.content;

    let analysisData;
    try {
      analysisData = JSON.parse(analysisText);
    } catch {
      analysisData = {
        progresso: 'Análise gerada pela IA',
        pontosPositivos: [analysisText],
        areasAtencao: ['Revisar com profissional'],
        recomendacoes: ['Continuar acompanhamento'],
        proximasSessoes: 'Manter estratégias atuais',
        exerciciosCasa: ['Exercícios de rotina'],
        prazoReavaliacao: '2-4 semanas',
      };
    }

    return NextResponse.json({
      success: true,
      analysis: analysisData,
      metadata: {
        patientAge,
        goals,
        analyzedAt: new Date().toISOString(),
      },
      usage: data.usage,
    });
  } catch (error) {
    console.error('Progress analysis error:', error);
    return NextResponse.json(
      { error: 'Erro ao analisar progresso' },
      { status: 500 }
    );
  }
}
