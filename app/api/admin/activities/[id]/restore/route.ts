export const dynamic = 'force-dynamic';
import { prisma } from '@/app/db';
import {
  fail,
  failFrom,
  guardActivityChange,
  ok,
} from '@/lib/activities/adminRoute';
import { assertTransition } from '@/lib/activities/approval';
import { AuditAction, recordAudit } from '@/lib/audit/audit';
import { refreshPublicCatalogPages } from '@/lib/cache/publicPages';
import { deleteObjects, restoreFiles } from '@/lib/files/archive';
import { NextRequest } from 'next/server';

// Admin: restore an ARCHIVED activity. Files are copied back to their
// original keys (Standard) first; previews are rebuilt on the next view.

export async function POST(
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
        files: { select: { id: true, s3Key: true, archivedFromKey: true } },
      },
    });
    if (!activity) return fail('Atividade não encontrada.', 404);

    if (activity.status !== 'ARCHIVED') {
      return fail('Só atividades arquivadas podem ser restauradas.', 409);
    }
    assertTransition(activity.status, 'PUBLISHED');

    if (activity.files.some((f) => !f.archivedFromKey)) {
      console.error('[restore] file without archivedFromKey', g.id);
      return fail(
        'Não foi possível restaurar: falta a origem de um arquivo. Nada foi alterado.',
        409
      );
    }

    let originalKeys: string[];
    try {
      originalKeys = await restoreFiles(activity.files);
    } catch (error) {
      console.error('[restore] copy failed', g.id, error);
      return fail(
        'Não foi possível mover os arquivos. Nada foi alterado.',
        502
      );
    }

    try {
      const moved = await prisma.$transaction(async (tx) => {
        const res = await tx.activity.updateMany({
          where: { id: g.id, status: 'ARCHIVED' },
          data: { status: 'PUBLISHED', isPublic: true },
        });
        if (res.count !== 1) return false;
        for (const [i, file] of activity.files.entries()) {
          await tx.activityFile.update({
            where: { id: file.id },
            data: { s3Key: originalKeys[i], archivedFromKey: null },
          });
        }
        return true;
      });
      if (!moved) {
        return fail('O status da atividade mudou. Recarregue a lista.', 409);
      }
    } catch (error) {
      console.error('[restore] database update failed', g.id, error);
      await deleteObjects(originalKeys);
      return fail(
        'Não foi possível restaurar a atividade. Nada foi alterado.',
        500
      );
    }

    await deleteObjects(activity.files.map((f) => f.s3Key));

    await recordAudit({
      action: AuditAction.ACTIVITY_RESTORE,
      actorType: 'ADMIN',
      actorId: g.adminId,
      targetType: 'Activity',
      targetId: g.id,
      metadata: { files: activity.files.length },
      request,
    });
    refreshPublicCatalogPages();

    return ok({ id: g.id, status: 'PUBLISHED' as const });
  } catch (error) {
    return failFrom(error);
  }
}
