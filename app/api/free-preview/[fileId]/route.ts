import { prisma } from '@/app/db';
import { getFreeSamples } from '@/lib/access';
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Public (unauthenticated) PREVIEW of the free sample images, used by the
// landing page modal. Only the preview image of each free sample is served,
// inline (no download). Downloading needs an account: see
// lib/actions/file-download.action.ts. Anything else returns 404.

const s3 = new S3Client({
  region: process.env.AWS_REGION || 'eu-west-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

const paramsSchema = z.object({ fileId: z.string().cuid() });

const PRESIGN_SECONDS = 300;

const notFound = () =>
  NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  const parsed = paramsSchema.safeParse(await params);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: 'Invalid file id' },
      { status: 400 }
    );
  }

  try {
    const samples = await getFreeSamples();
    if (!samples.some((s) => s.imageFileId === parsed.data.fileId)) {
      return notFound();
    }

    const file = await prisma.activityFile.findUnique({
      where: { id: parsed.data.fileId },
      select: { s3Key: true },
    });
    if (!file) return notFound();

    const url = await getSignedUrl(
      s3,
      new GetObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME || 'fonosapp',
        Key: file.s3Key,
        ResponseContentDisposition: 'inline',
      }),
      { expiresIn: PRESIGN_SECONDS }
    );

    const response = NextResponse.redirect(url, 302);
    // Shorter than the presign lifetime so a cached redirect never points at
    // an expired URL.
    response.headers.set('Cache-Control', 'public, max-age=240');
    return response;
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to load preview' },
      { status: 500 }
    );
  }
}
