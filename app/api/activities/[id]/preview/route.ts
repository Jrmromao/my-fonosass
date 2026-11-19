import { prisma } from '@/app/db';
import {
  PREVIEW_WIDTHS,
  type PreviewWidth,
  canPreview,
  getPreview,
} from '@/lib/files/preview';
import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Library thumbnail and preview for signed-in users, subscribers or not:
// page 1 of the activity's file (PDF or image) as a small WebP, inline,
// never the original. The download stays gated by
// /api/files/[fileId]/download. ?w=480 (card) or ?w=960 (details dialog).

// pdf.js and the canvas binding need the Node.js runtime.
export const runtime = 'nodejs';

const paramsSchema = z.object({ id: z.string().cuid() });
const widthSchema = z.coerce
  .number()
  .refine((w): w is PreviewWidth =>
    (PREVIEW_WIDTHS as readonly number[]).includes(w)
  )
  .catch(PREVIEW_WIDTHS[0]);

// Per user (private); the file behind an id doesn't change.
const CACHE = 'private, max-age=86400';

const notFound = () =>
  NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const parsed = paramsSchema.safeParse(await params);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: 'Invalid activity id' },
      { status: 400 }
    );
  }
  const width = widthSchema.parse(
    request.nextUrl.searchParams.get('w') ?? undefined
  );

  try {
    // Only published library activities. Prefer an image file (cheaper and
    // usually the sheet itself), otherwise the PDF.
    const files = await prisma.activityFile.findMany({
      where: {
        activityId: parsed.data.id,
        activity: { status: 'PUBLISHED', isPublic: true },
      },
      orderBy: { createdAt: 'asc' },
      select: { id: true, s3Key: true, fileType: true },
    });
    const file =
      files.find((f) => f.fileType.startsWith('image/')) ??
      files.find((f) => canPreview(f.fileType));
    if (!file) return notFound();

    const webp = await getPreview(file, width);
    if (!webp) return notFound();

    return new Response(new Uint8Array(webp), {
      status: 200,
      headers: {
        'Content-Type': 'image/webp',
        'Content-Disposition': 'inline',
        'Cache-Control': CACHE,
      },
    });
  } catch (error) {
    console.error('[activity-preview] failed', error);
    return NextResponse.json(
      { success: false, error: 'Failed to load preview' },
      { status: 500 }
    );
  }
}
