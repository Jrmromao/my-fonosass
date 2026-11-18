-- Admin-chosen free activities per month (override of the monthly rotation).
-- Additive: new table only.
-- CreateTable
CREATE TABLE "public"."free_sample_selections" (
    "id" TEXT NOT NULL,
    "month" TIMESTAMP(3) NOT NULL,
    "position" INTEGER NOT NULL,
    "activityId" TEXT NOT NULL,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "free_sample_selections_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "free_sample_selections_month_position_key" ON "public"."free_sample_selections"("month", "position");

-- CreateIndex
CREATE UNIQUE INDEX "free_sample_selections_month_activityId_key" ON "public"."free_sample_selections"("month", "activityId");

-- AddForeignKey
ALTER TABLE "public"."free_sample_selections" ADD CONSTRAINT "free_sample_selections_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "public"."Activity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

