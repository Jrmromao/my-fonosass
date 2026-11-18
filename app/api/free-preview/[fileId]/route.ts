import { prisma } from '@/app/db';
import { getFreeSamples } from '@/lib/access';
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';
import { z } from 'zod';

// Public (unauthenticated) PREVIEW of the free sample images, used by the
// landing page and the auth pages. Only the preview image of each free sample
// is served, inline, as a resized WebP (no download of the original).
// Downloading needs an account: see app/api/files/[fileId]/download.
// Anything else returns 404.
//
// Uploads are ~1 MB PNGs; the pages show them at 250-500 px. Resizing here and
// letting the CDN cache the result turns a multi-second load into one small
// cached file.

const s3 = new S3Client({
  region: process.env.AWS_REGION || 'eu-west-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

const paramsSchema = z.object({ fileId: z.string().cuid() });

/** Allowed output widths (px). Fixed so the CDN keeps few variants. */
const WIDTHS = [512, 1024] as const;
const widthSchema = z.coerce
  .number()
  .refine((w): w is (typeof WIDTHS)[number] =>
    (WIDTHS as readonly number[]).includes(w)
  )
  .catch(1024);

// CDN: 1 hour, then refreshed in the background (10 min). A sample removed
// from the free list stops being served within that window.
const CACHE = 'public, max-age=300, s-maxage=3600, stale-while-revalidate=600';

const notFound = () =>
  NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });

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
  const width = widthSchema.parse(
    new URL(request.url).searchParams.get('w') ?? undefined
  );

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

    const object = await s3.send(
      new GetObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME || 'fonosapp',
        Key: file.s3Key,
      })
    );
    if (!object.Body) return notFound();
    const original = Buffer.from(await object.Body.transformToByteArray());

    const webp = await sharp(original)
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();

    return new Response(new Uint8Array(webp), {
      status: 200,
      headers: {
        'Content-Type': 'image/webp',
        'Content-Disposition': 'inline',
        'Cache-Control': CACHE,
      },
    });
  } catch (error) {
    console.error('[free-preview] failed', error);
    return NextResponse.json(
      { success: false, error: 'Failed to load preview' },
      { status: 500 }
    );
  }
}
