const GEMINI_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent';
const GEMINI_KEY = process.env.GOOGLE_CLOUD_API_KEY!;

type ActivityType = 'FIND_CIRCLE' | 'WORD_SEARCH' | 'BOARD_GAME';

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
};

export async function generateActivityContent(params: {
  type: ActivityType;
  phoneme: string;
  topic: string;
  age: number;
}) {
  const prompt = prompts[params.type](params.phoneme, params.topic, params.age);

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
  return JSON.parse(parts[parts.length - 1].text);
}
