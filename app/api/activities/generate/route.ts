import { imageToPDF } from '@/lib/activities/imageToPDF';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const GEMINI_KEY = process.env.GOOGLE_CLOUD_API_KEY!;

const schema = z.object({
  type: z.enum([
    'FIND_CIRCLE',
    'WORD_SEARCH',
    'BOARD_GAME',
    'CROSSWORD',
    'COLOR_SPEAK',
  ]),
  phoneme: z.string().min(1).max(5),
  topic: z.string().min(1).max(50),
  age: z.number().min(3).max(17),
});

const buildPrompt = (
  type: string,
  phoneme: string,
  topic: string,
  age: number
) => {
  const style =
    age <= 5
      ? 'Very childish, kindergarten style, big bubbly fonts, thick outlines, stars and hearts, large illustrations'
      : age <= 8
        ? 'Colorful, playful, fun adventurous style, cute illustrations, engaging for young kids'
        : age <= 11
          ? 'Modern, engaging like a real board game or workbook, cool dynamic fonts, not babyish'
          : 'Clean, modern, professional workbook style with subtle colors, geometric accents, not childish';

  const types: Record<string, string> = {
    FIND_CIRCLE: `a "Find and Circle" activity with a grid of 12 illustrations (8 containing the phoneme, 4 without). Add empty circles next to each for marking.`,
    WORD_SEARCH: `a word search puzzle with an 8x8 letter grid. Hide 6-8 words with the target phoneme. Show small illustrations and a word list with checkboxes.`,
    BOARD_GAME: `a winding board game path with 15-20 spaces, each with a word containing the phoneme. Include START, FINISH, dice illustration, and special spaces like "Diga 3 vezes!" or "Faca uma frase!"`,
    CROSSWORD: `a crossword puzzle with 6-8 words containing the phoneme. Include numbered clues and a sentence completion section.`,
    COLOR_SPEAK: `a coloring activity with 6 large outlined illustrations of objects with the phoneme. Each has the word below. Instruction: say the word 5 times before coloring.`,
  };

  return `Create a premium colorful A4 portrait activity sheet for ${age <= 5 ? 'toddlers' : 'kids'} age ${age} speech therapy.
Theme: ${topic}. Phoneme: /${phoneme}/.
Design ${types[type] || types.FIND_CIRCLE}
${style}.
BRAND IDENTITY: Include colorful floating balloons as decorative elements around the borders and corners. The balloons should have different colors (purple, blue, pink, orange, green) and some should have phoneme letters written on them. This is the signature visual element of the "Almanaque da Fala" brand.
All text in Brazilian Portuguese.
Watermark at bottom: almanaquedafala.com.br`;
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, phoneme, topic, age } = schema.parse(body);

    const prompt = buildPrompt(type, phoneme, topic, age);

    // Generate image with Gemini
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${GEMINI_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseModalities: ['IMAGE', 'TEXT'] },
        }),
      }
    );

    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || 'Gemini error');

    // Extract image
    const parts = data.candidates[0].content.parts;
    const imagePart = parts.find((p: { inlineData?: unknown }) => p.inlineData);
    if (!imagePart) throw new Error('No image generated');

    const imageBytes = Uint8Array.from(atob(imagePart.inlineData.data), (c) =>
      c.charCodeAt(0)
    );

    // Convert to PDF
    const pdfBytes = await imageToPDF(imageBytes);

    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="atividade-${phoneme}-${type.toLowerCase()}-idade${age}.pdf"`,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Erro ao gerar atividade';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
