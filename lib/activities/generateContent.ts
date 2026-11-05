import {
  ActivityValidationError,
  validateCrosswordActivity,
  validateWordListActivity,
  validateWordSearchActivity,
  type ValidatedActivity,
} from './validateContent';
import { isPhonemeKey, type Position, type Theme } from './wordBank';

const GEMINI_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent';
const GEMINI_KEY = process.env.GOOGLE_CLOUD_API_KEY!;

type ActivityType = 'FIND_CIRCLE' | 'WORD_SEARCH' | 'BOARD_GAME' | 'CROSSWORD';

const prompts: Record<
  ActivityType,
  (phoneme: string, topic: string, age: number) => string
> = {
  FIND_CIRCLE: (
    phoneme,
    topic,
    age
  ) => `Crie uma atividade "Encontre e Circule" para fonoaudiologia infantil.

Fonema alvo: /${phoneme}/
Tema: ${topic}
Idade: ${age} anos

Gere uma lista de 12 palavras em português brasileiro relacionadas ao tema.
- 8 palavras DEVEM conter o fonema /${phoneme}/
- 4 palavras NÃO contêm o fonema (distratores)
- Todas devem ser palavras simples que uma criança de ${age} anos conhece

Responda em JSON:
{"titulo":"...","instrucoes":"Circule as palavras que têm o som /${phoneme}/!","items":["palavra1","palavra2"...],"answers":["apenas as corretas"]}`,

  WORD_SEARCH: (
    phoneme,
    topic,
    age
  ) => `Crie um Caça-Palavras para fonoaudiologia infantil.

Fonema alvo: /${phoneme}/
Tema: ${topic}
Idade: ${age} anos

Gere 6 palavras em português brasileiro com o fonema /${phoneme}/ relacionadas ao tema.
Depois crie uma grade 10x10 de letras maiúsculas onde essas palavras estão escondidas (horizontal e vertical apenas).
Preencha os espaços vazios com letras aleatórias.

Responda em JSON:
{"titulo":"...","instrucoes":"Encontre as palavras escondidas e diga cada uma 3 vezes!","items":["palavra1","palavra2"...],"grid":[["A","B","C",...],["D","E","F",...],...]}`,

  BOARD_GAME: (
    phoneme,
    topic,
    age
  ) => `Crie um Jogo de Tabuleiro de Fala para fonoaudiologia infantil.

Fonema alvo: /${phoneme}/
Tema: ${topic}
Idade: ${age} anos

Gere 15 palavras em português brasileiro com o fonema /${phoneme}/ relacionadas ao tema.
Cada palavra será uma casa do tabuleiro. A criança joga o dado, avança e diz a palavra.

Responda em JSON:
{"titulo":"...","instrucoes":"Jogue o dado, avance as casas e diga a palavra em voz alta!","items":["palavra1","palavra2"...]}`,

  CROSSWORD: (
    phoneme,
    topic,
    age
  ) => `Crie uma Palavra-Cruzada para fonoaudiologia infantil.

Fonema alvo: /${phoneme}/
Tema: ${topic}
Idade: ${age} anos

Gere 8 palavras em português brasileiro com o fonema /${phoneme}/ relacionadas ao tema.
- Cada palavra deve ter no mínimo 3 letras.
- Para cada palavra, escreva uma dica curta e simples (adequada para ${age} anos), SEM usar a própria palavra.
- Prefira palavras que compartilhem letras entre si (para se cruzarem melhor).

Responda em JSON:
{"titulo":"...","instrucoes":"Use as dicas para completar a cruzadinha!","items":["palavra1","palavra2"...],"clues":["dica da palavra1","dica da palavra2"...]}`,
};

async function callGemini(prompt: string): Promise<unknown> {
  const res = await fetch(`${GEMINI_URL}?key=${GEMINI_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.8,
        maxOutputTokens: 2048,
        responseMimeType: 'application/json',
      },
    }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || 'Gemini error');

  const parts = data.candidates[0].content.parts;
  try {
    return JSON.parse(parts[parts.length - 1].text);
  } catch {
    throw new ActivityValidationError('Gemini retornou JSON inválido');
  }
}

function validate(
  type: ActivityType,
  raw: unknown,
  phoneme: string,
  age: number,
  position?: Position,
  theme?: Theme
): ValidatedActivity {
  const obj = (raw ?? {}) as Record<string, unknown>;
  switch (type) {
    case 'FIND_CIRCLE':
      return validateWordListActivity(obj, {
        type,
        phoneme,
        minPhonemeWords: 5,
        minTotalItems: 9,
        age,
        position,
        theme,
      });
    case 'BOARD_GAME':
      return validateWordListActivity(obj, {
        type,
        phoneme,
        minPhonemeWords: 15,
        minTotalItems: 15,
        age,
        position,
        theme,
      });
    case 'WORD_SEARCH':
      return validateWordSearchActivity(obj, {
        phoneme,
        minWords: 6,
        gridSize: 10,
        age,
      });
    case 'CROSSWORD':
      return validateCrosswordActivity(obj, {
        phoneme,
        minWords: 6,
        age,
      });
  }
}

const POSITION_PT: Record<Position, string> = {
  initial: 'no início',
  medial: 'no meio',
  final: 'no fim',
};

/**
 * An always-true title/instruction derived only from facts we can guarantee
 * (phoneme + optional position). Replaces any theme the words don't actually
 * satisfy — a mismatched label is worse than a neutral one (Problem 3, Part 1).
 */
function honestLabels(
  phoneme: string,
  position?: Position
): { titulo: string; instrucoes: string } {
  const where = position ? ` ${POSITION_PT[position]} das palavras` : '';
  return {
    titulo: `Palavras com o som /${phoneme}/${where}`,
    instrucoes: `Encontre e diga as palavras com o som /${phoneme}/${where}.`,
  };
}

export async function generateActivityContent(params: {
  type: ActivityType;
  phoneme: string;
  topic: string;
  age: number;
  position?: Position;
  theme?: Theme;
  maxAttempts?: number;
}): Promise<ValidatedActivity> {
  const prompt = prompts[params.type](params.phoneme, params.topic, params.age);
  const maxAttempts = params.maxAttempts ?? 3;

  let lastError: Error | null = null;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const raw = await callGemini(prompt);
      const result = validate(
        params.type,
        raw,
        params.phoneme,
        params.age,
        params.position,
        params.theme
      );
      // Problem 3, Part 1: for curated phonemes, don't trust the model's themed
      // title — it may claim a topic the backfilled words don't satisfy. Use a
      // neutral, always-true label based on phoneme (+ position).
      if (isPhonemeKey(params.phoneme)) {
        const honest = honestLabels(params.phoneme, params.position);
        result.titulo = honest.titulo;
        result.instrucoes = honest.instrucoes;
      }
      return result;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      // Only retry on validation/parse failures; a hard API error won't fix
      // itself by retrying with the same prompt, but one extra try is cheap.
      if (!(err instanceof ActivityValidationError) && attempt > 1) break;
    }
  }

  throw new Error(
    `Falha ao gerar atividade válida após ${maxAttempts} tentativas: ${lastError?.message ?? 'erro desconhecido'}`
  );
}
