-- AlterTable: Add status and approvalToken to Activity
ALTER TABLE "Activity" ADD COLUMN "status" TEXT NOT NULL DEFAULT 'PUBLISHED';
ALTER TABLE "Activity" ADD COLUMN "approvalToken" TEXT;

-- Create index for filtering by status
CREATE INDEX "Activity_status_idx" ON "Activity"("status");
