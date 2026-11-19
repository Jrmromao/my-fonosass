import { prisma } from '@/app/db';
import { guardAdmin } from '@/lib/activities/approval';
import { toExportRequestDto } from '@/lib/privacy/dataExportRequests';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const NO_STORE = { 'Cache-Control': 'private, no-store' };

const idSchema = z.string().cuid();

const updateSchema = z.object({
  status: z.enum(['PENDING', 'COMPLETED', 'FAILED']).optional(),
  error: z.string().trim().max(500).nullable().optional(),
});

// GET one of the signed-in user's own export requests
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401, headers: NO_STORE }
      );
    }

    const { id } = await params;
    if (!idSchema.safeParse(id).success) {
      return NextResponse.json(
        { success: false, error: 'Export request not found' },
        { status: 404, headers: NO_STORE }
      );
    }

    // Ownership is part of the query: someone else's id looks like a miss.
    const row = await prisma.dataExportRequest.findFirst({
      where: { id, user: { clerkUserId } },
    });
    if (!row) {
      return NextResponse.json(
        { success: false, error: 'Export request not found' },
        { status: 404, headers: NO_STORE }
      );
    }

    return NextResponse.json(
      { success: true, data: toExportRequestDto(row) },
      { headers: NO_STORE }
    );
  } catch (error) {
    console.error('Error retrieving export request:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve export request' },
      { status: 500, headers: NO_STORE }
    );
  }
}

// PUT: admin correction of a request's status (e.g. mark FAILED with a note)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await guardAdmin();
  if (denied) return denied;

  try {
    const { id } = await params;
    if (!idSchema.safeParse(id).success) {
      return NextResponse.json(
        { success: false, error: 'Export request not found' },
        { status: 404, headers: NO_STORE }
      );
    }

    const parsed = updateSchema.safeParse(
      await request.json().catch(() => null)
    );
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid request body' },
        { status: 400, headers: NO_STORE }
      );
    }

    const existing = await prisma.dataExportRequest.findUnique({
      where: { id },
    });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Export request not found' },
        { status: 404, headers: NO_STORE }
      );
    }

    const { status, error } = parsed.data;
    const updated = await prisma.dataExportRequest.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(status === 'COMPLETED' &&
          !existing.completedAt && { completedAt: new Date() }),
        ...(error !== undefined && { error }),
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Export request updated successfully',
        data: toExportRequestDto(updated),
      },
      { headers: NO_STORE }
    );
  } catch (error) {
    console.error('Error updating export request:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update export request' },
      { status: 500, headers: NO_STORE }
    );
  }
}
