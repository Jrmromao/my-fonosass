'use server';

import { resolveFileDownload, type DownloadResult } from '@/lib/files/download';

export type { DownloadResult };

/**
 * Server action wrapper. The logic lives in lib/files/download.ts, shared with
 * POST /api/files/[fileId]/download (client components should use the route).
 */
export async function getFileDownloadUrl(input: {
  fileId: string;
}): Promise<DownloadResult> {
  return resolveFileDownload(input);
}
