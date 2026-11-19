import { prisma } from '@/app/db';
import {
  createExportRequest,
  EXPORT_FORMATS,
  MAX_REQUESTS_PER_DAY,
  toExportRequestDto,
} from '@/lib/privacy/dataExportRequests';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const NO_STORE = { 'Cache-Control': 'private, no-store' };

const createSchema = z.object({
  format: z.enum(EXPORT_FORMATS).default('json'),
  reason: z.string().trim().max(500).optional(),
});

async function currentDbUser() {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) return null;
  return prisma.user.findUnique({
    where: { clerkUserId },
    select: { id: true },
  });
}

/** LGPD data-access / portability request (persisted, answered at once). */
export async function POST(request: Request) {
  try {
    const user = await currentDbUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401, headers: NO_STORE }
      );
    }

    const parsed = createSchema.safeParse(
      await request.json().catch(() => ({}))
    );
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid request body' },
        { status: 400, headers: NO_STORE }
      );
    }

    const result = await createExportRequest({
      userId: user.id,
      reason: parsed.data.reason,
    });
    if (!result.ok) {
      return NextResponse.json(
        {
          success: false,
          error: `Limite de ${MAX_REQUESTS_PER_DAY} solicitações por dia atingido.`,
        },
        { status: 429, headers: NO_STORE }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Export request submitted successfully',
        data: toExportRequestDto(result.request),
      },
      { status: 201, headers: NO_STORE }
    );
  } catch (error) {
    console.error('Error creating export request:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create export request' },
      { status: 500, headers: NO_STORE }
    );
  }
}

/** The signed-in user's own requests, newest first. */
export async function GET() {
  try {
    const user = await currentDbUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401, headers: NO_STORE }
      );
    }

    const rows = await prisma.dataExportRequest.findMany({
      where: { userId: user.id },
      orderBy: { requestedAt: 'desc' },
      take: 50,
    });
    const now = new Date();

    return NextResponse.json(
      {
        success: true,
        data: {
          userId: user.id,
          exportRequests: rows.map((r) => toExportRequestDto(r, now)),
          totalRequests: rows.length,
        },
      },
      { headers: NO_STORE }
    );
  } catch (error) {
    console.error('Error retrieving export requests:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve export requests' },
      { status: 500, headers: NO_STORE }
    );
  }
}
