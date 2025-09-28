import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const ttsSchema = z.object({
  text: z.string().min(1).max(4000),
  voice: z
    .enum(['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'])
    .default('nova'),
  speed: z.number().min(0.25).max(4.0).default(1.0),
});

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { text, voice, speed } = ttsSchema.parse(body);

    console.log('TTS Request:', { text: text.substring(0, 50), voice, speed });

    // Check if OpenAI API key exists
    if (!process.env.OPENAI_API_KEY) {
      console.error('OpenAI API key not found');
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    // OpenAI TTS API call
    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'tts-1',
        input: text,
        voice: voice,
        speed: speed,
        response_format: 'mp3',
      }),
    });

    console.log('OpenAI Response Status:', response.status);
    console.log(
      'OpenAI Response Headers:',
      Object.fromEntries(response.headers.entries())
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API Error:', response.status, errorText);
      return NextResponse.json(
        {
          error: `OpenAI API Error: ${response.status}`,
          details: errorText,
        },
        { status: response.status }
      );
    }

    const audioBuffer = await response.arrayBuffer();
    console.log('Audio buffer size:', audioBuffer.byteLength);

    if (audioBuffer.byteLength === 0) {
      console.error('Empty audio buffer received');
      return NextResponse.json(
        { error: 'Empty audio response' },
        { status: 500 }
      );
    }

    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.byteLength.toString(),
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('TTS generation error:', error);
    return NextResponse.json(
      {
        error: 'Erro ao gerar áudio',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
