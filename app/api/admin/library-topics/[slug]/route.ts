export const dynamic = 'force-dynamic';
import { prisma } from '@/app/db';
import { errorResponse, requireAdmin } from '@/lib/activities/approval';
import { AuditAction, recordAudit } from '@/lib/audit/audit';
import { TOPIC_ABOUT_MAX } from '@/lib/libraryTopicContent';
import { isEditableTopic } from '@/lib/libraryTopics';
import { SecurityMiddleware } from '@/lib/security/securityMiddleware';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Admin: replace (PUT) or restore the default (DELETE) of a topic paragraph.

const NO_STORE = { 'Cache-Control': 'private, no-store' };

const paramsSchema = z.object({ slug: z.string().regex(/^[a-z0-9-]{1,40}$/) });
const putSchema = z.object({
  about: z
    .string()
    .trim()
    .min(1, 'Escreva o texto do tema.')
    .max(TOPIC_ABOUT_MAX, `Use no máximo ${TOPIC_ABOUT_MAX} caracteres.`),
});

const fail = (error: string, status: number) =>
  NextResponse.json({ success: false, error }, { status, headers: NO_STORE });

/** CSRF + rate limit, then admin; returns the slug when all pass. */
async function guard(
  request: NextRequest,
  params: Promise<{ slug: string }>
): Promise<{ response: NextResponse } | { slug: string; adminId: string }> {
  const security = await SecurityMiddleware.apply(request, {
    requireAuth: true,
    requireCSRF: true,
    rateLimitType: 'general',
    validateInput: false,
  });
  if (!security.success) return { response: security.response! };
  const { dbUserId } = await requireAdmin();

  const parsed = paramsSchema.safeParse(await params);
  if (!parsed.success || !isEditableTopic(parsed.data.slug)) {
    return { response: fail('Tema não encontrado', 404) };
  }
  return { slug: parsed.data.slug, adminId: dbUserId };
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const g = await guard(request, params);
    if ('response' in g) return g.response;

    const body = putSchema.safeParse(await request.json().catch(() => null));
    if (!body.success) {
      return fail(body.error.issues[0]?.message ?? 'Texto inválido', 400);
    }

    const row = await prisma.libraryTopicContent.upsert({
      where: { slug: g.slug },
      create: { slug: g.slug, about: body.data.about, updatedById: g.adminId },
      update: { about: body.data.about, updatedById: g.adminId },
      select: { slug: true, about: true, updatedAt: true },
    });

    await recordAudit({
      action: AuditAction.LIBRARY_TOPIC_UPDATE,
      actorType: 'ADMIN',
      actorId: g.adminId,
      targetType: 'LibraryTopicContent',
      targetId: g.slug,
      metadata: { length: row.about.length },
      request,
    });

    return NextResponse.json(
      {
        success: true,
        data: { ...row, updatedAt: row.updatedAt.toISOString() },
      },
      { headers: NO_STORE }
    );
  } catch (error) {
    const { body, status } = errorResponse(error);
    return NextResponse.json(body, { status, headers: NO_STORE });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const g = await guard(request, params);
    if ('response' in g) return g.response;

    await prisma.libraryTopicContent.deleteMany({ where: { slug: g.slug } });

    await recordAudit({
      action: AuditAction.LIBRARY_TOPIC_RESET,
      actorType: 'ADMIN',
      actorId: g.adminId,
      targetType: 'LibraryTopicContent',
      targetId: g.slug,
      request,
    });

    return NextResponse.json({ success: true }, { headers: NO_STORE });
  } catch (error) {
    const { body, status } = errorResponse(error);
    return NextResponse.json(body, { status, headers: NO_STORE });
  }
}
