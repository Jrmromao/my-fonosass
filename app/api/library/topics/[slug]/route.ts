import { getTopicAbout } from '@/lib/libraryTopicContent';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';

// Paragraph of a library topic page (admin text or the default).

const paramsSchema = z.object({ slug: z.string().regex(/^[a-z0-9-]{1,40}$/) });

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
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
      { success: false, error: 'Tema inválido' },
      { status: 400 }
    );
  }

  try {
    const about = await getTopicAbout(parsed.data.slug);
    if (about === null) {
      return NextResponse.json(
        { success: false, error: 'Tema não encontrado' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { success: true, data: { about } },
      // No HTTP cache: an admin's edit must show on the next visit.
      { headers: { 'Cache-Control': 'private, no-store' } }
    );
  } catch (error) {
    console.error('[library-topic] failed', error);
    return NextResponse.json(
      { success: false, error: 'Falha ao carregar o texto' },
      { status: 500 }
    );
  }
}
