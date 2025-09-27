import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { text, voice = 'pt-BR-Standard-A' } = await request.json();

    console.log('Google TTS Request:', { text, voice });

    if (!process.env.GOOGLE_CLOUD_API_KEY) {
      console.error('Google API key not found');
      return NextResponse.json(
        { error: 'Google API key not configured' },
        { status: 500 }
      );
    }

    console.log(
      'Using API key:',
      process.env.GOOGLE_CLOUD_API_KEY.substring(0, 10) + '...'
    );

    // Google Cloud TTS API call
    const requestBody = {
      input: { text },
      voice: {
        languageCode: 'pt-BR',
        name: voice,
      },
      audioConfig: {
        audioEncoding: 'MP3',
        speakingRate: 0.9,
        pitch: 0.0,
        volumeGainDb: 0.0,
      },
    };

    console.log('Request body:', JSON.stringify(requestBody, null, 2));

    const response = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${process.env.GOOGLE_CLOUD_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      }
    );

    console.log('Google API Response Status:', response.status);
    console.log(
      'Google API Response Headers:',
      Object.fromEntries(response.headers.entries())
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Google TTS API Error Details:', errorText);

      // Return the actual error from Google
      return NextResponse.json(
        {
          error: 'Google TTS API Error',
          details: errorText,
          status: response.status,
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('Google TTS Response keys:', Object.keys(data));

    if (!data.audioContent) {
      console.error('No audioContent in response:', data);
      return NextResponse.json(
        { error: 'No audio content received' },
        { status: 500 }
      );
    }

    // Convert base64 audio to buffer
    const audioBuffer = Buffer.from(data.audioContent, 'base64');
    console.log('Audio buffer size:', audioBuffer.length);

    // Validate audio buffer
    if (audioBuffer.length === 0) {
      console.error('Empty audio buffer');
      return NextResponse.json(
        { error: 'Empty audio buffer' },
        { status: 500 }
      );
    }

    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.length.toString(),
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('TTS Error Details:', error);
    return NextResponse.json(
      {
        error: 'Internal error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
