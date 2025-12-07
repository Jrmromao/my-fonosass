import 'server-only';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export class LLMService {
  private static instance: LLMService;

  static getInstance(): LLMService {
    if (!LLMService.instance) {
      LLMService.instance = new LLMService();
    }
    return LLMService.instance;
  }

  /**
   * Generate personalized speech therapy exercises
   */
  async generateExercise(params: {
    phoneme: string;
    difficulty: 'iniciante' | 'intermediário' | 'avançado';
    age: number;
    specificNeeds?: string;
  }) {
    const { phoneme, difficulty, age, specificNeeds } = params;

    const prompt = `Como fonoaudiólogo especialista, crie um exercício terapêutico para:
    
    Fonema: /${phoneme}/
    Dificuldade: ${difficulty}
    Idade: ${age} anos
    ${specificNeeds ? `Necessidades específicas: ${specificNeeds}` : ''}
    
    Forneça:
    1. Título do exercício
    2. Objetivo terapêutico
    3. Instruções passo a passo
    4. Materiais necessários
    5. Critérios de sucesso
    6. Variações para casa
    
    Responda em português brasileiro, adequado para profissionais de fonoaudiologia.`;

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content:
              'Você é um fonoaudiólogo experiente especializado em terapia da fala no Brasil. Suas respostas devem ser profissionais, baseadas em evidências e adequadas às práticas clínicas brasileiras.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      });

      return {
        success: true,
        exercise: response.choices[0]?.message?.content,
        usage: response.usage,
      };
    } catch (error) {
      console.error('Error generating exercise:', error);
      return {
        success: false,
        error: 'Erro ao gerar exercício. Tente novamente.',
      };
    }
  }

  /**
   * Analyze session progress and provide insights
   */
  async analyzeProgress(params: {
    sessionNotes: string;
    previousSessions?: string[];
    patientAge: number;
    goals: string[];
  }) {
    const { sessionNotes, previousSessions, patientAge, goals } = params;

    const prompt = `Analise esta sessão de fonoaudiologia:
    
    Notas da sessão atual: ${sessionNotes}
    ${previousSessions ? `Sessões anteriores: ${previousSessions.join('\n')}` : ''}
    Idade do paciente: ${patientAge} anos
    Objetivos terapêuticos: ${goals.join(', ')}
    
    Forneça:
    1. Análise do progresso
    2. Pontos positivos observados
    3. Áreas que precisam de atenção
    4. Recomendações para próximas sessões
    5. Sugestões de exercícios para casa
    
    Seja específico e baseado em evidências clínicas.`;

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content:
              'Você é um fonoaudiólogo sênior analisando o progresso de pacientes. Forneça insights clínicos precisos e recomendações práticas.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 800,
      });

      return {
        success: true,
        analysis: response.choices[0]?.message?.content,
        usage: response.usage,
      };
    } catch (error) {
      console.error('Error analyzing progress:', error);
      return {
        success: false,
        error: 'Erro ao analisar progresso. Tente novamente.',
      };
    }
  }

  /**
   * Generate treatment plan
   */
  async generateTreatmentPlan(params: {
    diagnosis: string;
    patientAge: number;
    severity: 'leve' | 'moderado' | 'severo';
    sessionFrequency: string;
    duration: number; // weeks
  }) {
    const { diagnosis, patientAge, severity, sessionFrequency, duration } =
      params;

    const prompt = `Crie um plano de tratamento fonoaudiológico para:
    
    Diagnóstico: ${diagnosis}
    Idade: ${patientAge} anos
    Severidade: ${severity}
    Frequência: ${sessionFrequency}
    Duração: ${duration} semanas
    
    Inclua:
    1. Objetivos gerais e específicos
    2. Cronograma de metas por semana
    3. Técnicas e abordagens recomendadas
    4. Exercícios principais por fase
    5. Critérios de avaliação
    6. Orientações para família
    
    Baseie-se nas melhores práticas da fonoaudiologia brasileira.`;

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content:
              'Você é um fonoaudiólogo especialista em planejamento terapêutico, seguindo as diretrizes do CFFa e práticas baseadas em evidências.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.4,
        max_tokens: 1200,
      });

      return {
        success: true,
        treatmentPlan: response.choices[0]?.message?.content,
        usage: response.usage,
      };
    } catch (error) {
      console.error('Error generating treatment plan:', error);
      return {
        success: false,
        error: 'Erro ao gerar plano de tratamento. Tente novamente.',
      };
    }
  }

  /**
   * Generate content for blog/education
   */
  async generateEducationalContent(params: {
    topic: string;
    audience: 'profissionais' | 'pais' | 'pacientes';
    length: 'curto' | 'médio' | 'longo';
  }) {
    const { topic, audience, length } = params;

    const audienceContext = {
      profissionais: 'fonoaudiólogos e profissionais da saúde',
      pais: 'pais e cuidadores de crianças',
      pacientes: 'pacientes em tratamento fonoaudiológico',
    };

    const lengthGuide = {
      curto: '300-500 palavras',
      médio: '800-1200 palavras',
      longo: '1500-2000 palavras',
    };

    const prompt = `Escreva um artigo educativo sobre: ${topic}
    
    Público-alvo: ${audienceContext[audience]}
    Extensão: ${lengthGuide[length]}
    
    O artigo deve:
    1. Ter título atrativo
    2. Introdução clara
    3. Conteúdo bem estruturado
    4. Linguagem adequada ao público
    5. Informações baseadas em evidências
    6. Conclusão prática
    7. Otimizado para SEO (palavras-chave naturais)
    
    Foque no mercado brasileiro e use português brasileiro.`;

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content:
              'Você é um especialista em comunicação em saúde, criando conteúdo educativo sobre fonoaudiologia para o público brasileiro.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.6,
        max_tokens: 2000,
      });

      return {
        success: true,
        content: response.choices[0]?.message?.content,
        usage: response.usage,
      };
    } catch (error) {
      console.error('Error generating content:', error);
      return {
        success: false,
        error: 'Erro ao gerar conteúdo. Tente novamente.',
      };
    }
  }
}
