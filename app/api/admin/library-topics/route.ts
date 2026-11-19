export const dynamic = 'force-dynamic';
import { errorResponse, requireAdmin } from '@/lib/activities/approval';
import { listTopicContents } from '@/lib/libraryTopicContent';
import { NextResponse } from 'next/server';

// Admin: every library topic with its default and custom paragraph.

const NO_STORE = { 'Cache-Control': 'private, no-store' };

export async function GET() {
  try {
    await requireAdmin();
    const data = await listTopicContents();
    return NextResponse.json({ success: true, data }, { headers: NO_STORE });
  } catch (error) {
    const { body, status } = errorResponse(error);
    return NextResponse.json(body, { status, headers: NO_STORE });
  }
}
