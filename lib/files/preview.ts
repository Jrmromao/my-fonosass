import 'server-only';

import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import path from 'node:path';
import sharp from 'sharp';

// Library previews: page 1 of a PDF, or the image itself, as a small WebP.
// Rendered on first request and stored in S3 under previews/, so each file
// is rendered once per width. The original file is never sent.

const s3 = new S3Client({
  region: process.env.AWS_REGION || 'eu-west-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});
const BUCKET = process.env.AWS_S3_BUCKET_NAME || 'fonosapp';

/** Allowed widths (px): card thumbnail and details dialog. */
export const PREVIEW_WIDTHS = [480, 960] as const;
export type PreviewWidth = (typeof PREVIEW_WIDTHS)[number];

const STANDARD_FONTS = `${path.join(
  process.cwd(),
  'node_modules/pdfjs-dist/standard_fonts'
)}/`;

// Bump to re-render every preview after changing the output.
const VERSION = 'v1';

export interface PreviewSource {
  id: string;
  s3Key: string;
  fileType: string;
}

export const canPreview = (fileType: string) =>
  fileType === 'application/pdf' || fileType.startsWith('image/');

const cacheKey = (fileId: string, width: PreviewWidth) =>
  `previews/${VERSION}/${fileId}-w${width}.webp`;

async function readObject(key: string): Promise<Buffer | null> {
  try {
    const object = await s3.send(
      new GetObjectCommand({ Bucket: BUCKET, Key: key })
    );
    if (!object.Body) return null;
    return Buffer.from(await object.Body.transformToByteArray());
  } catch (error) {
    const name = (error as { name?: string }).name;
    if (name === 'NoSuchKey' || name === 'NotFound') return null;
    throw error;
  }
}

/** Page 1 of a PDF as PNG, `width` px wide. */
async function renderPdfFirstPage(pdf: Buffer, width: number): Promise<Buffer> {
  // Loaded lazily: pdf.js and the canvas binding are only needed here.
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const { createCanvas } = await import('@napi-rs/canvas');

  const doc = await pdfjs.getDocument({
    data: new Uint8Array(pdf),
    // pdf.js >= 4.2 no longer evaluates font code (CVE-2024-4367); keep
    // fonts off the system and out of the DOM anyway.
    disableFontFace: true,
    useSystemFonts: false,
    // Fonts the PDF references but doesn't embed (Helvetica...). Serverless
    // hosts have no system fonts; see outputFileTracingIncludes.
    standardFontDataUrl: STANDARD_FONTS,
    stopAtErrors: false,
  }).promise;
  try {
    const page = await doc.getPage(1);
    const base = page.getViewport({ scale: 1 });
    // Render at 2x the target, then let sharp downscale for sharper text.
    const scale = Math.min((width * 2) / base.width, 4);
    const viewport = page.getViewport({ scale });
    const canvas = createCanvas(
      Math.ceil(viewport.width),
      Math.ceil(viewport.height)
    );
    const context = canvas.getContext('2d');
    // PDFs without a background would come out transparent.
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    await page.render({
      canvas: canvas as unknown as HTMLCanvasElement,
      canvasContext: context as unknown as CanvasRenderingContext2D,
      viewport,
    }).promise;
    return canvas.toBuffer('image/png');
  } finally {
    await doc.destroy();
  }
}

/**
 * WebP preview of a file, from the S3 cache or rendered now (and cached).
 * Returns null for file types that have no preview.
 */
export async function getPreview(
  file: PreviewSource,
  width: PreviewWidth
): Promise<Buffer | null> {
  if (!canPreview(file.fileType)) return null;

  const key = cacheKey(file.id, width);
  const cached = await readObject(key);
  if (cached) return cached;

  const original = await readObject(file.s3Key);
  if (!original) return null;

  const raster =
    file.fileType === 'application/pdf'
      ? await renderPdfFirstPage(original, width)
      : original;

  const webp = await sharp(raster)
    .resize({ width, withoutEnlargement: true })
    .flatten({ background: '#ffffff' })
    .webp({ quality: 75 })
    .toBuffer();

  // Caching is best effort: a failed write only means rendering again.
  try {
    await s3.send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        Body: webp,
        ContentType: 'image/webp',
      })
    );
  } catch (error) {
    console.error('[preview] cache write failed', error);
  }
  return webp;
}
