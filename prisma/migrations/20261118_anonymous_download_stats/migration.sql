-- Anonymous download statistics and account-deletion log (LGPD Art. 12/16).
-- Additive: new tables only.
-- CreateTable
CREATE TABLE "public"."activity_download_stats" (
    "id" TEXT NOT NULL,
    "activityId" TEXT NOT NULL,
    "month" TIMESTAMP(3) NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "activity_download_stats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."account_deletions" (
    "id" TEXT NOT NULL,
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "hadSubscription" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "account_deletions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "activity_download_stats_month_idx" ON "public"."activity_download_stats"("month");

-- CreateIndex
CREATE UNIQUE INDEX "activity_download_stats_activityId_month_key" ON "public"."activity_download_stats"("activityId", "month");

-- CreateIndex
CREATE INDEX "account_deletions_deletedAt_idx" ON "public"."account_deletions"("deletedAt");

-- AddForeignKey
ALTER TABLE "public"."activity_download_stats" ADD CONSTRAINT "activity_download_stats_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "public"."Activity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

