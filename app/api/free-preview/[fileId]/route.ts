import { prisma } from '@/app/db';
import { FREE_PHONEME } from '@/lib/pricing';
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { ActivityStatus } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Public (unauthenticated) preview of activity images for the free phoneme
// only, used by the landing page modal. Anything outside the free phoneme,
// unpublished, or non-image returns 404, so no paid content is exposed.

const s3 = new S3Client({
  region: process.env.AWS_REGION || 'eu-west-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

const paramsSchema = z.object({ fileId: z.string().cuid() });

const PRESIGN_SECONDS = 300;

// "Animais (Fonema /S/)" -> "almanaque-da-fala-animais-fonema-s"
function toFileName(activityName: string): string {
  const slug = activityName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
  return `almanaque-da-fala-${slug || 'atividade'}`;
}

function extensionOf(key: string): string {
  const match = /\.([a-z0-9]{2,5})$/i.exec(key);
  return match ? match[1].toLowerCase() : 'png';
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  const parsed = paramsSchema.safeParse(await params);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: 'Invalid file id' },
      { status: 400 }
    );
  }

  const asDownload = request.nextUrl.searchParams.get('download') === '1';

  try {
    const file = await prisma.activityFile.findFirst({
      where: {
        id: parsed.data.fileId,
        fileType: { startsWith: 'image/' },
        activity: {
          status: ActivityStatus.PUBLISHED,
          phoneme: FREE_PHONEME,
        },
      },
      select: { s3Key: true, activity: { select: { name: true } } },
    });

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'Not found' },
        { status: 404 }
      );
    }

    const url = await getSignedUrl(
      s3,
      new GetObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME || 'fonosapp',
        Key: file.s3Key,
        ...(asDownload && {
          ResponseContentDisposition: `attachment; filename="${toFileName(
            file.activity.name
          )}.${extensionOf(file.s3Key)}"`,
        }),
      }),
      { expiresIn: PRESIGN_SECONDS }
    );

    const response = NextResponse.redirect(url, 302);
    // Cache shorter than the presign lifetime so a cached redirect never
    // points at an expired URL.
    response.headers.set('Cache-Control', 'public, max-age=240');
    return response;
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to load preview' },
      { status: 500 }
    );
  }
}
