import { prisma } from '@/app/db';
import { guardAdmin } from '@/lib/activities/approval';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const NO_STORE = { 'Cache-Control': 'private, no-store' };

const querySchema = z.object({
  status: z.enum(['PENDING', 'RESOLVED', 'REJECTED']).optional(),
});

/** Admin/DPO queue of data-correction requests (oldest pending first). */
export async function GET(request: NextRequest) {
  const denied = await guardAdmin();
  if (denied) return denied;

  try {
    const parsed = querySchema.safeParse({
      status: request.nextUrl.searchParams.get('status') ?? undefined,
    });
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400, headers: NO_STORE }
      );
    }

    const rows = await prisma.dataCorrectionRequest.findMany({
      where: parsed.data.status ? { status: parsed.data.status } : undefined,
      orderBy: [{ status: 'asc' }, { requestedAt: 'asc' }],
      take: 200,
      include: { user: { select: { id: true, email: true, fullName: true } } },
    });

    return NextResponse.json(
      {
        success: true,
        data: rows.map((r) => ({
          id: r.id,
          description: r.description,
          status: r.status,
          requestedAt: r.requestedAt.toISOString(),
          resolvedAt: r.resolvedAt?.toISOString() ?? null,
          resolutionNote: r.resolutionNote,
          user: r.user,
        })),
      },
      { headers: NO_STORE }
    );
  } catch (error) {
    console.error('Error listing correction requests:', error);
    return NextResponse.json(
      { error: 'Failed to list correction requests' },
      { status: 500, headers: NO_STORE }
    );
  }
}
