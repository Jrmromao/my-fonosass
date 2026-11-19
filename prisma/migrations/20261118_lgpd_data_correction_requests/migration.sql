-- LGPD art. 18 III: persist data-correction requests answered by the DPO/admin.
-- Additive: new enum + new table only.
-- CreateEnum
CREATE TYPE "public"."DataCorrectionRequestStatus" AS ENUM ('PENDING', 'RESOLVED', 'REJECTED');

-- CreateTable
CREATE TABLE "public"."data_correction_requests" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "public"."DataCorrectionRequestStatus" NOT NULL DEFAULT 'PENDING',
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),
    "resolutionNote" TEXT,
    "resolvedById" TEXT,

    CONSTRAINT "data_correction_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "data_correction_requests_userId_requestedAt_idx" ON "public"."data_correction_requests"("userId", "requestedAt");

-- CreateIndex
CREATE INDEX "data_correction_requests_status_requestedAt_idx" ON "public"."data_correction_requests"("status", "requestedAt");

-- AddForeignKey
ALTER TABLE "public"."data_correction_requests" ADD CONSTRAINT "data_correction_requests_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

