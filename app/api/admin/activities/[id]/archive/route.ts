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
import { archiveFiles, deleteObjects } from '@/lib/files/archive';
import { deletePreviews } from '@/lib/files/preview';
import { NextRequest } from 'next/server';

// Admin: archive a PUBLISHED activity. Files are copied to archive/ first;
// the database changes only if every copy worked.

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
        files: { select: { id: true, s3Key: true } },
      },
    });
    if (!activity) return fail('Atividade não encontrada.', 404);

    // Same-status is an allowed no-op elsewhere; here it must not re-run.
    if (activity.status !== 'PUBLISHED') {
      return fail('Só atividades publicadas podem ser arquivadas.', 409);
    }
    assertTransition(activity.status, 'ARCHIVED');

    let newKeys: string[];
    try {
      newKeys = await archiveFiles(activity.files);
    } catch (error) {
      console.error('[archive] copy failed', g.id, error);
      return fail(
        'Não foi possível mover os arquivos. Nada foi alterado.',
        502
      );
    }

    try {
      const moved = await prisma.$transaction(async (tx) => {
        const res = await tx.activity.updateMany({
          where: { id: g.id, status: 'PUBLISHED' },
          data: { status: 'ARCHIVED', isPublic: false },
        });
        if (res.count !== 1) return false;
        for (const [i, file] of activity.files.entries()) {
          await tx.activityFile.update({
            where: { id: file.id },
            data: { s3Key: newKeys[i], archivedFromKey: file.s3Key },
          });
        }
        return true;
      });
      if (!moved) {
        // Someone else changed it meanwhile. Keep the copies: they may be
        // the other request's own.
        return fail('O status da atividade mudou. Recarregue a lista.', 409);
      }
    } catch (error) {
      console.error('[archive] database update failed', g.id, error);
      await deleteObjects(newKeys);
      return fail(
        'Não foi possível arquivar a atividade. Nada foi alterado.',
        500
      );
    }

    // The database now points at archive/. Remove what is left behind.
    await deleteObjects(activity.files.map((f) => f.s3Key));
    await Promise.all(activity.files.map((f) => deletePreviews(f.id)));

    await recordAudit({
      action: AuditAction.ACTIVITY_ARCHIVE,
      actorType: 'ADMIN',
      actorId: g.adminId,
      targetType: 'Activity',
      targetId: g.id,
      metadata: { files: activity.files.length },
      request,
    });
    refreshPublicCatalogPages();

    return ok({ id: g.id, status: 'ARCHIVED' as const });
  } catch (error) {
    return failFrom(error);
  }
}
