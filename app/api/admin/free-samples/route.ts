export const dynamic = 'force-dynamic';
import { prisma } from '@/app/db';
import { FREE_SAMPLE_COUNT, getFreeSamplesForMonth } from '@/lib/access';
import { errorResponse, requireAdmin } from '@/lib/activities/approval';
import { SecurityMiddleware } from '@/lib/security/securityMiddleware';
import { monthBucket } from '@/lib/stats/downloadStats';
import { refreshPublicCatalogPages } from '@/lib/cache/publicPages';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const NO_STORE = { 'Cache-Control': 'private, no-store' };

/** "2026-11" -> first day of that month (UTC); default: current month. */
const monthParam = z
  .string()
  .regex(/^\d{4}-(0[1-9]|1[0-2])$/)
  .transform((v) => new Date(`${v}-01T00:00:00.000Z`));

const putSchema = z.object({
  month: monthParam,
  activityIds: z
    .array(z.string().min(1).max(64))
    .length(FREE_SAMPLE_COUNT)
    .refine((ids) => new Set(ids).size === ids.length, 'Atividades repetidas'),
});

const fail = (error: string, status: number) =>
  NextResponse.json({ success: false, error }, { status, headers: NO_STORE });

// Pages that show the free samples: refresh them after a change.
const refreshPages = refreshPublicCatalogPages;

async function guard(request: NextRequest, csrf: boolean) {
  if (csrf) {
    const security = await SecurityMiddleware.apply(request, {
      requireAuth: true,
      requireCSRF: true,
      rateLimitType: 'general',
      validateInput: false,
    });
    if (!security.success) return { response: security.response! };
  }
  return { admin: await requireAdmin() };
}

/** Free samples of a month (?mes=YYYY-MM), and whether they're chosen. */
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const raw = request.nextUrl.searchParams.get('mes');
    const parsed = raw ? monthParam.safeParse(raw) : null;
    if (parsed && !parsed.success) return fail('Mês inválido', 400);
    const result = await getFreeSamplesForMonth(
      parsed?.success ? parsed.data : new Date()
    );
    return NextResponse.json(
      { success: true, data: result },
      { headers: NO_STORE }
    );
  } catch (error) {
    const { body, status } = errorResponse(error);
    return NextResponse.json(body, { status, headers: NO_STORE });
  }
}

/** Choose the free activities of a month (overrides the rotation). */
export async function PUT(request: NextRequest) {
  try {
    const g = await guard(request, true);
    if ('response' in g) return g.response;

    const body = putSchema.safeParse(await request.json().catch(() => null));
    if (!body.success) {
      return fail(`Escolha ${FREE_SAMPLE_COUNT} atividades diferentes.`, 400);
    }
    const month = monthBucket(body.data.month);
    if (month < monthBucket(new Date())) {
      return fail('Não é possível alterar meses passados.', 400);
    }

    // Same eligibility as the free samples: published, with an image.
    const eligible = await prisma.activity.count({
      where: {
        id: { in: body.data.activityIds },
        status: 'PUBLISHED',
        isPublic: true,
        files: { some: { fileType: { startsWith: 'image/' } } },
      },
    });
    if (eligible !== body.data.activityIds.length) {
      return fail('Escolha atividades publicadas e com imagem.', 400);
    }

    await prisma.$transaction([
      prisma.freeSampleSelection.deleteMany({ where: { month } }),
      prisma.freeSampleSelection.createMany({
        data: body.data.activityIds.map((activityId, position) => ({
          month,
          position,
          activityId,
          createdById: g.admin.dbUserId,
        })),
      }),
    ]);
    refreshPages();

    return NextResponse.json(
      { success: true, data: await getFreeSamplesForMonth(month) },
      { headers: NO_STORE }
    );
  } catch (error) {
    const { body, status } = errorResponse(error);
    return NextResponse.json(body, { status, headers: NO_STORE });
  }
}

/** Go back to the automatic rotation for a month. */
export async function DELETE(request: NextRequest) {
  try {
    const g = await guard(request, true);
    if ('response' in g) return g.response;

    const parsed = monthParam.safeParse(
      request.nextUrl.searchParams.get('mes') ?? ''
    );
    if (!parsed.success) return fail('Mês inválido', 400);
    const month = monthBucket(parsed.data);

    await prisma.freeSampleSelection.deleteMany({ where: { month } });
    refreshPages();

    return NextResponse.json(
      { success: true, data: await getFreeSamplesForMonth(month) },
      { headers: NO_STORE }
    );
  } catch (error) {
    const { body, status } = errorResponse(error);
    return NextResponse.json(body, { status, headers: NO_STORE });
  }
}
