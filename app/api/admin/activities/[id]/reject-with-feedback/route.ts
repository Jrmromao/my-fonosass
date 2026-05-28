export const dynamic = "force-dynamic";
import { prisma } from '@/app/db';
import { auth } from '@clerk/nextjs/server';
import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { NextRequest, NextResponse } from 'next/server';

const GEMINI_KEY = process.env.GOOGLE_CLOUD_API_KEY;
const BUCKET = process.env.AWS_S3_BUCKET_NAME || 'fonosapp';

const s3 = new S3Client({
  region: process.env.AWS_REGION || 'eu-west-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { feedback } = await request.json();

    if (!feedback || feedback.trim().length < 5) {
      return NextResponse.json(
        { error: 'Feedback must be at least 5 characters' },
        { status: 400 }
      );
    }

    const activity = await prisma.activity.findUnique({
      where: { id },
      include: { files: true },
    });

    if (!activity) {
      return NextResponse.json({ error: 'Activity not found' }, { status: 404 });
    }

    const hasImageFile = activity.files.some((f) =>
      f.fileType.startsWith('image/')
    );

    // If activity has an image file, regenerate the image with corrections
    if (hasImageFile && GEMINI_KEY) {
      const file = activity.files[0];

      // Get the current image from S3
      const getCmd = new GetObjectCommand({ Bucket: BUCKET, Key: file.s3Key });
      const s3Obj = await s3.send(getCmd);
      const currentImage = Buffer.from(
        await s3Obj.Body!.transformToByteArray()
      );

      // Ask AI to regenerate with corrections
      const regeneratePrompt = `This is a speech therapy activity sheet that has issues.

FEEDBACK FROM REVIEWER: ${feedback}

Please regenerate this activity sheet fixing ALL the issues mentioned above.

RULES:
- Fix all spelling errors in Portuguese
- Ensure all words contain the phoneme /${activity.phoneme}/
- Keep the same visual style and layout
- DO NOT add any watermark or footer text (added programmatically)
- All text must be in correct Brazilian Portuguese
- Activity is for children age ${activity.ageRange}
- Theme/type: ${activity.type}`;

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${GEMINI_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [
                { inlineData: { mimeType: 'image/png', data: currentImage.toString('base64') } },
                { text: regeneratePrompt },
              ],
            }],
            generationConfig: { responseModalities: ['IMAGE', 'TEXT'] },
          }),
        }
      );

      const data = await res.json();
      const imgPart = data.candidates?.[0]?.content?.parts?.find(
        (p: any) => p.inlineData
      );

      if (imgPart) {
        const newImage = Buffer.from(imgPart.inlineData.data, 'base64');

        // Upload corrected image to S3 (overwrite)
        await s3.send(
          new PutObjectCommand({
            Bucket: BUCKET,
            Key: file.s3Key,
            Body: newImage,
            ContentType: 'image/png',
          })
        );

        await prisma.activity.update({
          where: { id },
          data: { status: 'PENDING_REVIEW' },
        });

        return NextResponse.json({
          success: true,
          regenerated: true,
          message: 'Image regenerated with corrections',
        });
      }

      return NextResponse.json(
        { error: 'Failed to regenerate image' },
        { status: 500 }
      );
    }

    // For text-based activities, fix via text AI
    let exerciseData;
    try {
      exerciseData = JSON.parse(activity.description);
    } catch {
      exerciseData = { titulo: activity.name, descricao: activity.description };
    }

    const textRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `Corrija o exercício com base no feedback. Responda APENAS com JSON corrigido. Regras: zero erros ortográficos, zero emojis, português brasileiro perfeito.`,
          },
          {
            role: 'user',
            content: `Exercício:\n${JSON.stringify(exerciseData)}\n\nFeedback:\n${feedback}`,
          },
        ],
        max_tokens: 800,
        temperature: 0.3,
      }),
    });

    if (!textRes.ok) {
      return NextResponse.json({ error: 'AI service unavailable' }, { status: 502 });
    }

    const aiData = await textRes.json();
    const correctedText = aiData.choices?.[0]?.message?.content;
    let correctedData;
    try {
      correctedData = JSON.parse(correctedText);
    } catch {
      return NextResponse.json({ error: 'AI returned invalid response' }, { status: 500 });
    }

    await prisma.activity.update({
      where: { id },
      data: {
        name: correctedData.titulo || activity.name,
        description: JSON.stringify(correctedData),
        status: 'PENDING_REVIEW',
      },
    });

    return NextResponse.json({ success: true, corrected: correctedData });
  } catch (error) {
    console.error('Reject with feedback error:', error);
    return NextResponse.json(
      { error: 'Failed to process feedback' },
      { status: 500 }
    );
  }
}
