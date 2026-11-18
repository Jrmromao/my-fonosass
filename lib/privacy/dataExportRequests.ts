import 'server-only';
import { prisma } from '@/app/db';
import type { DataExportRequest } from '@prisma/client';

/** How long the download link of a request stays valid. */
export const EXPORT_LINK_TTL_MS = 7 * 24 * 60 * 60 * 1000;

/** Abuse guard: max requests per user in a rolling 24h window. */
export const MAX_REQUESTS_PER_DAY = 5;

/** Only JSON exists (GET /api/user-data/export). LGPD art. 18 V / 19 §3. */
export const EXPORT_FORMATS = ['json'] as const;

export type ExportRequestStatus =
  | 'PENDING'
  | 'COMPLETED'
  | 'FAILED'
  | 'EXPIRED';

export interface ExportRequestDto {
  id: string;
  format: string;
  status: ExportRequestStatus;
  requestedAt: string;
  completedAt: string | null;
  expiresAt: string;
  downloadUrl: string | null;
  downloadCount: number;
}

/** Response shape for the client. EXPIRED is derived, never stored. */
export function toExportRequestDto(
  row: DataExportRequest,
  now: Date = new Date()
): ExportRequestDto {
  const expired = row.expiresAt <= now;
  const status: ExportRequestStatus =
    row.status === 'COMPLETED' && expired ? 'EXPIRED' : row.status;

  return {
    id: row.id,
    format: row.format.toLowerCase(),
    status,
    requestedAt: row.requestedAt.toISOString(),
    completedAt: row.completedAt?.toISOString() ?? null,
    expiresAt: row.expiresAt.toISOString(),
    downloadUrl:
      status === 'COMPLETED'
        ? `/api/user-data/export?request=${encodeURIComponent(row.id)}`
        : null,
    downloadCount: row.downloadCount,
  };
}

/**
 * Persist a request and answer it immediately: the export is generated on
 * demand from live data, so there is no background job and nothing to lose
 * between serverless invocations. The row is the proof the request was made
 * and answered (requestedAt / completedAt).
 */
export async function createExportRequest(input: {
  userId: string;
  reason?: string;
}): Promise<{ ok: true; request: DataExportRequest } | { ok: false }> {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const recent = await prisma.dataExportRequest.count({
    where: { userId: input.userId, requestedAt: { gte: since } },
  });
  if (recent >= MAX_REQUESTS_PER_DAY) return { ok: false };

  const now = new Date();
  const request = await prisma.dataExportRequest.create({
    data: {
      userId: input.userId,
      format: 'JSON',
      reason: input.reason,
      status: 'COMPLETED',
      requestedAt: now,
      completedAt: now,
      expiresAt: new Date(now.getTime() + EXPORT_LINK_TTL_MS),
    },
  });
  return { ok: true, request };
}

/**
 * Count a download against a request the user owns and that is still valid.
 * Returns false when the id is unknown, foreign, expired or not completed.
 */
export async function recordExportDownload(
  requestId: string,
  userId: string
): Promise<boolean> {
  const result = await prisma.dataExportRequest.updateMany({
    where: {
      id: requestId,
      userId,
      status: 'COMPLETED',
      expiresAt: { gt: new Date() },
    },
    data: { downloadCount: { increment: 1 } },
  });
  return result.count > 0;
}
