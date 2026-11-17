import {
  resolveFileDownload,
  type DownloadFailureReason,
} from '@/lib/files/download';
import { NextResponse } from 'next/server';

const STATUS: Record<DownloadFailureReason, number> = {
  invalid: 400,
  unauthenticated: 401,
  subscription: 403,
  not_found: 404,
  error: 500,
};

/**
 * Signed download URL for one activity file. Access rules live in
 * lib/access.ts; responses are never cacheable (per-user, creates history).
 */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ fileId: string }> }
) {
  const { fileId } = await params;
  const result = await resolveFileDownload({ fileId });
  const headers = { 'Cache-Control': 'private, no-store' };

  if (result.success) {
    return NextResponse.json({ success: true, data: result }, { headers });
  }
  return NextResponse.json(
    {
      success: false,
      error: result.error,
      requiresSubscription: result.requiresSubscription ?? false,
    },
    { status: STATUS[result.reason], headers }
  );
}
