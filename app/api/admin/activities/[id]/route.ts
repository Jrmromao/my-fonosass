export const dynamic = 'force-dynamic';
import { prisma } from '@/app/db';
import {
  fail,
  failFrom,
  guardActivityChange,
  ok,
} from '@/lib/activities/adminRoute';
import { AuditAction, recordAudit } from '@/lib/audit/audit';
import { refreshPublicCatalogPages } from '@/lib/cache/publicPages';
import { deleteObjects } from '@/lib/files/archive';
import { deletePreviews } from '@/lib/files/preview';
import { sanitizeInput } from '@/lib/security/inputValidation';
import { NextRequest } from 'next/server';
import { z } from 'zod';

// Admin: edit (PATCH) or really delete (DELETE) an activity.

// Same limits as the create form (lib/actions/activity.action.ts).
const ACTIVITY_NAME_MIN = 3;
const ACTIVITY_NAME_MAX = 100;
const ACTIVITY_DESCRIPTION_MIN = 10;
const ACTIVITY_DESCRIPTION_MAX = 2000;

const patchSchema = z
  .object({
    name: z
      .string()
      .transform((v) => sanitizeInput(v, ACTIVITY_NAME_MAX))
      .pipe(
        z
          .string()
          .min(
            ACTIVITY_NAME_MIN,
            `O título precisa ter pelo menos ${ACTIVITY_NAME_MIN} caracteres.`
          )
      )
      .optional(),
    description: z
      .string()
      .transform((v) => sanitizeInput(v, ACTIVITY_DESCRIPTION_MAX))
      .pipe(
        z
          .string()
          .min(
            ACTIVITY_DESCRIPTION_MIN,
            `A descrição precisa ter pelo menos ${ACTIVITY_DESCRIPTION_MIN} caracteres.`
          )
      )
      .optional(),
  })
  .strict()
  .refine((v) => v.name !== undefined || v.description !== undefined, {
    message: 'Informe o título ou a descrição.',
  });

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const g = await guardActivityChange(request, params);
    if ('response' in g) return g.response;

    const body = patchSchema.safeParse(await request.json().catch(() => null));
    if (!body.success) {
      return fail(body.error.issues[0]?.message ?? 'Dados inválidos.', 400);
    }

    const current = await prisma.activity.findUnique({
      where: { id: g.id },
      select: { id: true, name: true, description: true },
    });
    if (!current) return fail('Atividade não encontrada.', 404);

    const data: { name?: string; description?: string } = {};
    if (body.data.name !== undefined && body.data.name !== current.name) {
      data.name = body.data.name;
    }
    if (
      body.data.description !== undefined &&
      body.data.description !== current.description
    ) {
      data.description = body.data.description;
    }

    const changed = Object.keys(data);
    const updated =
      changed.length === 0
        ? current
        : await prisma.activity.update({
            where: { id: g.id },
            data,
            select: { id: true, name: true, description: true },
          });

    if (changed.length > 0) {
      // Only which fields changed, never the text (LGPD-safe trail).
      await recordAudit({
        action: AuditAction.ACTIVITY_UPDATE,
        actorType: 'ADMIN',
        actorId: g.adminId,
        targetType: 'Activity',
        targetId: g.id,
        metadata: { fields: changed.join(',') },
        request,
      });
      refreshPublicCatalogPages();
    }

    return ok(updated);
  } catch (error) {
    return failFrom(error);
  }
}

const HISTORY_MESSAGE =
  'Esta atividade tem histórico; arquive em vez de excluir.';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const g = await guardActivityChange(request, params);
    if ('response' in g) return g.response;

    const activity = await prisma.activity.findUnique({
      where: { id: g.id },
      select: {
        id: true,
        status: true,
        files: { select: { id: true, s3Key: true } },
      },
    });
    if (!activity) return fail('Atividade não encontrada.', 404);

    if (activity.status !== 'DRAFT' && activity.status !== 'REJECTED') {
      return fail(
        'Só rascunhos e atividades rejeitadas podem ser excluídos. Arquive as demais.',
        409
      );
    }

    const [downloads, stats, samples] = await Promise.all([
      prisma.downloadHistory.count({ where: { activityId: g.id } }),
      prisma.activityDownloadStat.count({ where: { activityId: g.id } }),
      prisma.freeSampleSelection.count({ where: { activityId: g.id } }),
    ]);
    if (downloads + stats + samples > 0) return fail(HISTORY_MESSAGE, 409);

    // The history check and the delete share a transaction, so a download
    // recorded in between makes the delete fail on the foreign key instead.
    await prisma.$transaction([
      prisma.activityFile.deleteMany({ where: { activityId: g.id } }),
      prisma.activity.delete({ where: { id: g.id } }),
    ]);

    // Best effort: a stray object is harmless, a failed request is not.
    await deleteObjects(activity.files.map((f) => f.s3Key));
    await Promise.all(activity.files.map((f) => deletePreviews(f.id)));

    await recordAudit({
      action: AuditAction.ACTIVITY_DELETE,
      actorType: 'ADMIN',
      actorId: g.adminId,
      targetType: 'Activity',
      targetId: g.id,
      metadata: { files: activity.files.length },
      request,
    });
    refreshPublicCatalogPages();

    return ok({ id: g.id });
  } catch (error) {
    return failFrom(error);
  }
}
