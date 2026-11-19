import 'server-only';
import { prisma } from '@/app/db';
import type {
  DataCorrectionRequest,
  DataCorrectionRequestStatus,
} from '@prisma/client';
import { z } from 'zod';

/** Abuse guard: max requests per user in a rolling 24h window. */
export const MAX_CORRECTION_REQUESTS_PER_DAY = 5;

export const createCorrectionSchema = z.object({
  description: z.string().trim().min(10).max(1000),
});

export const resolveCorrectionSchema = z.object({
  status: z.enum(['RESOLVED', 'REJECTED']),
  resolutionNote: z.string().trim().min(1).max(1000),
});

export interface CorrectionRequestDto {
  id: string;
  description: string;
  status: DataCorrectionRequestStatus;
  requestedAt: string;
  resolvedAt: string | null;
  resolutionNote: string | null;
}

export function toCorrectionRequestDto(
  row: DataCorrectionRequest
): CorrectionRequestDto {
  return {
    id: row.id,
    description: row.description,
    status: row.status,
    requestedAt: row.requestedAt.toISOString(),
    resolvedAt: row.resolvedAt?.toISOString() ?? null,
    resolutionNote: row.resolutionNote,
  };
}

export async function createCorrectionRequest(input: {
  userId: string;
  description: string;
}): Promise<{ ok: true; request: DataCorrectionRequest } | { ok: false }> {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const recent = await prisma.dataCorrectionRequest.count({
    where: { userId: input.userId, requestedAt: { gte: since } },
  });
  if (recent >= MAX_CORRECTION_REQUESTS_PER_DAY) return { ok: false };

  const request = await prisma.dataCorrectionRequest.create({
    data: { userId: input.userId, description: input.description },
  });
  return { ok: true, request };
}

/**
 * Answer a PENDING request. Returns null when it doesn't exist or was
 * already answered (answers are final, so the record can't be rewritten).
 */
export async function resolveCorrectionRequest(input: {
  id: string;
  adminDbUserId: string;
  status: 'RESOLVED' | 'REJECTED';
  resolutionNote: string;
}): Promise<DataCorrectionRequest | null> {
  const result = await prisma.dataCorrectionRequest.updateMany({
    where: { id: input.id, status: 'PENDING' },
    data: {
      status: input.status,
      resolutionNote: input.resolutionNote,
      resolvedAt: new Date(),
      resolvedById: input.adminDbUserId,
    },
  });
  if (result.count === 0) return null;
  return prisma.dataCorrectionRequest.findUnique({ where: { id: input.id } });
}
