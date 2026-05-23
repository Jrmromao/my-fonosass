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
      ? 'Very childish style: big bubbly fonts, thick outlines for coloring, large illustrations, simple layout'
      : age <= 8
        ? 'Playful style: fun illustrations, engaging layout, medium complexity'
        : age <= 11
          ? 'Modern style: like a real board game or workbook, cool fonts, more detail'
          : 'Clean workbook style: professional, not childish, geometric accents';

  const types: Record<string, string> = {
    FIND_CIRCLE: `a "Encontre e Circule" activity with a grid of 12 illustrations (8 containing the phoneme, 4 without). Add empty circles next to each for marking.`,
    WORD_SEARCH: `a word search puzzle with an 8x8 letter grid. Hide 6-8 words with the target phoneme. Show small illustrations and a word list with checkboxes.`,
    BOARD_GAME: `a winding board game path with 15-20 spaces, each with a word containing the phoneme. Include START, FINISH, dice illustration, and special spaces.`,
    CROSSWORD: `a crossword puzzle with 6-8 words containing the phoneme. Include numbered clues.`,
    COLOR_SPEAK: `a coloring activity with 6 large outlined illustrations of objects with the phoneme. Each has the word below.`,
  };

  return `Create a premium A4 portrait activity sheet for kids age ${age} speech therapy.

CONTENT:
- Theme: ${topic}
- Phoneme: /${phoneme}/
- Design ${types[type] || types.FIND_CIRCLE}
- All text in Brazilian Portuguese

VISUAL STYLE (MUST follow exactly):
- Background: clean white
- Primary accent color: warm orange/coral (#f97316)
- Secondary colors: soft gray borders, light orange highlights
- ${style}
- Header: activity title in bold, phoneme badge in orange circle, age indicator
- Footer: small text "almanaquedafala.com.br" centered, light gray, 8pt

BRAND ELEMENTS (MUST include):
- 3-4 small colorful balloons as corner decorations (not overwhelming)
- Each balloon has a single letter/phoneme on it
- Balloons use these colors only: #6366f1, #ec4899, #f59e0b, #10b981, #8b5cf6
- Clean rounded borders on activity areas
- No gradients on backgrounds
- Professional workbook quality

DO NOT:
- Use neon colors
- Add random decorative shapes
- Use more than 2 fonts
- Make it look like a coloring book cover
- Add excessive stars or hearts`;
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
