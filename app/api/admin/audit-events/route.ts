import { prisma } from '@/app/db';
import { guardAdminActor } from '@/lib/activities/approval';
import { AuditAction, recordAudit } from '@/lib/audit/audit';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const NO_STORE = { 'Cache-Control': 'private, no-store' };

const querySchema = z.object({
  /** Action code or prefix, e.g. "admin." or "security.admin_denied". */
  action: z
    .string()
    .regex(/^[a-z_.]{1,60}$/)
    .optional(),
  actorId: z.string().cuid().optional(),
  targetId: z.string().max(64).optional(),
  limit: z.coerce.number().int().min(1).max(200).default(50),
  /** id of the last event of the previous page. */
  cursor: z.string().cuid().optional(),
});

/**
 * Read-only view of the audit trail (newest first). There is deliberately no
 * update or delete endpoint: the only removal is the 12-month purge.
 */
export async function GET(request: NextRequest) {
  const admin = await guardAdminActor();
  if ('response' in admin) return admin.response;

  try {
    const parsed = querySchema.safeParse(
      Object.fromEntries(request.nextUrl.searchParams)
    );
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid query' },
        { status: 400, headers: NO_STORE }
      );
    }
    const { action, actorId, targetId, limit, cursor } = parsed.data;

    await recordAudit({
      action: AuditAction.AUDIT_READ,
      actorType: 'ADMIN',
      actorId: admin.dbUserId,
      request,
      metadata: { action: action ?? null },
    });

    const rows = await prisma.auditEvent.findMany({
      where: {
        ...(action && { action: { startsWith: action } }),
        ...(actorId && { actorId }),
        ...(targetId && { targetId }),
      },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: limit + 1,
      ...(cursor && { cursor: { id: cursor }, skip: 1 }),
    });

    const page = rows.slice(0, limit);
    return NextResponse.json(
      {
        success: true,
        data: page.map((e) => ({ ...e, createdAt: e.createdAt.toISOString() })),
        nextCursor: rows.length > limit ? page[page.length - 1].id : null,
      },
      { headers: NO_STORE }
    );
  } catch (error) {
    console.error('Error reading audit events:', error);
    return NextResponse.json(
      { error: 'Failed to read audit events' },
      { status: 500, headers: NO_STORE }
    );
  }
}
