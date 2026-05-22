import { prisma } from '@/app/db';
import { TelegramService } from '@/services/telegramService';
import { auth } from '@clerk/nextjs/server';
import { nanoid } from 'nanoid';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const exerciseSchema = z.object({
  phoneme: z.string().min(1).max(10),
  age: z.number().min(1).max(100),
  difficulty: z.enum(['iniciante', 'intermediário', 'avançado']),
  autoSave: z.boolean().optional().default(false),
});

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

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { phoneme, age, difficulty, autoSave } = exerciseSchema.parse(body);

    const childFriendlyPrompt =
      age <= 12
        ? `Crie um exercício DIVERTIDO e LÚDICO de fonoaudiologia para CRIANÇA de ${age} anos com o fonema /${phoneme}/, nível ${difficulty}.

      IMPORTANTE: Use linguagem infantil, brincadeiras, jogos, histórias, personagens e atividades envolventes.
      
      Responda APENAS em formato JSON válido:
      {
        "titulo": "Nome divertido do exercício",
        "objetivo": "Objetivo terapêutico específico",
        "instrucoes": ["Passo 1", "Passo 2", "Passo 3"],
        "materiais": ["Material 1", "Material 2"],
        "tempo": "10-15 minutos",
        "observacoes": "Dicas para tornar mais divertido",
        "brincadeira": "Descrição de uma brincadeira específica com o fonema",
        "recompensa": "Sugestão de recompensa"
      }`
        : `Crie um exercício de fonoaudiologia para o fonema /${phoneme}/, idade ${age} anos, nível ${difficulty}.

      Responda APENAS em formato JSON válido:
      {
        "titulo": "Nome do exercício",
        "objetivo": "Objetivo terapêutico específico",
        "instrucoes": ["Passo 1", "Passo 2", "Passo 3"],
        "materiais": ["Material 1", "Material 2"],
        "tempo": "15-20 minutos",
        "observacoes": "Dicas importantes para o terapeuta"
      }
      
      Use linguagem profissional em português brasileiro.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: childFriendlyPrompt }],
        max_tokens: 800,
        temperature: age <= 12 ? 0.9 : 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error('OpenAI API error');
    }

    const data = await response.json();
    const exerciseText = data.choices[0]?.message?.content;

    let exerciseData;
    try {
      exerciseData = JSON.parse(exerciseText);
    } catch {
      exerciseData = {
        titulo: `Exercício para ${phoneme}`,
        objetivo: 'Exercício gerado pela IA',
        instrucoes: [exerciseText],
        materiais: ['Conforme necessário'],
        tempo: '15-20 minutos',
        observacoes: 'Exercício gerado automaticamente',
      };
    }

    // Auto-save to DB and notify reviewer
    let savedActivity = null;
    if (autoSave) {
      const approvalToken = nanoid(32);
      const user = await prisma.user.findUnique({
        where: { clerkUserId: userId },
      });

      if (user) {
        savedActivity = await prisma.activity.create({
          data: {
            name: exerciseData.titulo,
            description: JSON.stringify(exerciseData),
            type: 'SPEECH',
            difficulty: difficultyMap[difficulty],
            ageRange: ageToRange(age),
            phoneme,
            isPublic: false,
            status: 'PENDING_REVIEW',
            approvalToken,
            createdById: user.id,
          },
        });

        // Send Telegram notification
        await TelegramService.sendExerciseForReview({
          id: savedActivity.id,
          name: exerciseData.titulo,
          phoneme,
          difficulty,
          ageRange: ageToRange(age),
          approvalToken,
        });
      }
    }

    return NextResponse.json({
      success: true,
      exercise: exerciseData,
      saved: savedActivity
        ? { id: savedActivity.id, status: savedActivity.status }
        : null,
      metadata: {
        phoneme,
        age,
        difficulty,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Exercise generation error:', error);
    return NextResponse.json(
      { error: 'Erro ao gerar exercício' },
      { status: 500 }
    );
  }
}
