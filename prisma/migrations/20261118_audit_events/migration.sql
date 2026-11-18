-- Append-only audit trail (admin actions on personal data + security events).
-- Additive: new enum + new table only. No foreign keys on purpose.
-- CreateEnum
CREATE TYPE "public"."AuditActorType" AS ENUM ('ADMIN', 'USER', 'MACHINE', 'ANONYMOUS');

-- CreateTable
CREATE TABLE "public"."audit_events" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actorType" "public"."AuditActorType" NOT NULL,
    "actorId" TEXT,
    "action" TEXT NOT NULL,
    "targetType" TEXT,
    "targetId" TEXT,
    "ip" TEXT,
    "metadata" JSONB,

    CONSTRAINT "audit_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "audit_events_createdAt_idx" ON "public"."audit_events"("createdAt");

-- CreateIndex
CREATE INDEX "audit_events_actorId_createdAt_idx" ON "public"."audit_events"("actorId", "createdAt");

-- CreateIndex
CREATE INDEX "audit_events_action_createdAt_idx" ON "public"."audit_events"("action", "createdAt");

-- CreateIndex
CREATE INDEX "audit_events_targetType_targetId_idx" ON "public"."audit_events"("targetType", "targetId");

