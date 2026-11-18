-- LGPD: persist data-export (access/portability) requests.
-- Additive: new enums + new table only.
-- CreateEnum
CREATE TYPE "public"."DataExportFormat" AS ENUM ('JSON');

-- CreateEnum
CREATE TYPE "public"."DataExportRequestStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "public"."data_export_requests" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "format" "public"."DataExportFormat" NOT NULL DEFAULT 'JSON',
    "reason" TEXT,
    "status" "public"."DataExportRequestStatus" NOT NULL DEFAULT 'PENDING',
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "downloadCount" INTEGER NOT NULL DEFAULT 0,
    "error" TEXT,

    CONSTRAINT "data_export_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "data_export_requests_userId_requestedAt_idx" ON "public"."data_export_requests"("userId", "requestedAt");

-- AddForeignKey
ALTER TABLE "public"."data_export_requests" ADD CONSTRAINT "data_export_requests_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

