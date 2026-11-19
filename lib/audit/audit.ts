import 'server-only';
import { prisma } from '@/app/db';
import { getClientIp } from '@/lib/security/clientIp';
import type { AuditActorType, Prisma } from '@prisma/client';

/**
 * Append-only audit trail. Two rules keep it LGPD-safe:
 *  1. ids and action codes only: never names, emails or free text;
 *  2. it can never break the request it describes (errors are swallowed).
 */

/**
 * Months an event is kept. Must match what /lgpd publishes under "Logs de
 * Sistema" (6 meses, the Marco Civil da Internet art. 15 minimum for access
 * logs). If you raise it, change that line on app/lgpd/page.tsx too.
 */
export const AUDIT_RETENTION_MONTHS = 6;

/** Closed list of action codes (keeps the trail searchable and consistent). */
export const AuditAction = {
  WAITING_LIST_READ: 'admin.waiting_list.read',
  CORRECTION_RESOLVE: 'admin.correction_request.resolve',
  ACTIVITIES_SYNC: 'admin.activities.sync',
  FREE_SAMPLES_SET: 'admin.free_samples.set',
  FREE_SAMPLES_CLEAR: 'admin.free_samples.clear',
  LIBRARY_TOPIC_UPDATE: 'admin.library_topic.update',
  LIBRARY_TOPIC_RESET: 'admin.library_topic.reset',
  ACTIVITY_UPDATE: 'admin.activity.update',
  ACTIVITY_ARCHIVE: 'admin.activity.archive',
  ACTIVITY_RESTORE: 'admin.activity.restore',
  ACTIVITY_DELETE: 'admin.activity.delete',
  MONITORING_CLEAR: 'admin.monitoring.clear',
  CACHE_CLEAR: 'admin.cache.clear',
  USER_INSERT: 'admin.user.insert',
  USER_INVITE: 'admin.user.invite',
  USER_UPDATE: 'admin.user.update',
  USER_REMOVE: 'admin.user.remove',
  AUDIT_READ: 'admin.audit.read',
  // Security events
  ADMIN_DENIED: 'security.admin_denied',
  APPROVAL_TOKEN_INVALID: 'security.approval_token_invalid',
  CSP_VIOLATION: 'security.csp_violation',
} as const;

export type AuditActionCode = (typeof AuditAction)[keyof typeof AuditAction];

/** Small, flat, non-personal context only. */
export type AuditMetadata = Record<string, string | number | boolean | null>;

export interface AuditInput {
  action: AuditActionCode;
  actorType: AuditActorType;
  /** Internal User.id (not the Clerk id, never an email). */
  actorId?: string | null;
  targetType?: string;
  targetId?: string;
  metadata?: AuditMetadata;
  /** Pass the request to record the client IP. */
  request?: Pick<Request, 'headers'>;
  /**
   * For events anyone can trigger (e.g. a wrong approval token): write at most
   * one per actor/IP + action in this window, so the trail can't be used to
   * flood the database.
   */
  throttleMs?: number;
}

function cleanMetadata(
  metadata?: AuditMetadata
): Prisma.InputJsonValue | undefined {
  if (!metadata) return undefined;
  const out: Record<string, string | number | boolean | null> = {};
  for (const [key, value] of Object.entries(metadata).slice(0, 10)) {
    out[key.slice(0, 40)] =
      typeof value === 'string' ? value.slice(0, 120) : value;
  }
  return out;
}

/**
 * Record an event. Never throws. Returns true when the event is recorded (or
 * skipped by the throttle) and false when the write failed. Most callers
 * ignore the result (fail open: an audit hiccup must not take admin features
 * down); callers that expose personal data check it and refuse (fail closed).
 */
export async function recordAudit(input: AuditInput): Promise<boolean> {
  try {
    const ip = input.request
      ? getClientIp(input.request as Parameters<typeof getClientIp>[0])
      : null;

    if (input.throttleMs) {
      const recent = await prisma.auditEvent.findFirst({
        where: {
          action: input.action,
          createdAt: { gte: new Date(Date.now() - input.throttleMs) },
          ...(input.actorId ? { actorId: input.actorId } : { ip }),
        },
        select: { id: true },
      });
      if (recent) return true;
    }

    await prisma.auditEvent.create({
      data: {
        action: input.action,
        actorType: input.actorType,
        actorId: input.actorId ?? null,
        targetType: input.targetType,
        targetId: input.targetId,
        ip,
        metadata: cleanMetadata(input.metadata),
      },
    });

    // ~1 in 50 writes also trims events past the retention window, so no
    // scheduled job (or secret) is needed.
    if (Math.random() < 0.02) await purgeExpiredAuditEvents();
    return true;
  } catch (error) {
    console.error('[audit] failed to record event:', input.action, error);
    return false;
  }
}

export async function purgeExpiredAuditEvents(): Promise<number> {
  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - AUDIT_RETENTION_MONTHS);
  const { count } = await prisma.auditEvent.deleteMany({
    where: { createdAt: { lt: cutoff } },
  });
  return count;
}
