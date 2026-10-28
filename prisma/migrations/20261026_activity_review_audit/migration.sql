-- Safer defaults: new activities must enter the review workflow instead of
-- being published live. Existing rows are unaffected (defaults only apply to
-- inserts that omit these columns).
ALTER TABLE "Activity" ALTER COLUMN "status" SET DEFAULT 'DRAFT';
ALTER TABLE "Activity" ALTER COLUMN "isPublic" SET DEFAULT false;

-- Review audit trail: who reviewed, when, and the feedback given.
ALTER TABLE "Activity" ADD COLUMN "reviewedById" TEXT;
ALTER TABLE "Activity" ADD COLUMN "reviewedAt" TIMESTAMP(3);
ALTER TABLE "Activity" ADD COLUMN "reviewFeedback" TEXT;

-- Link reviewer to the User table. ON DELETE SET NULL so removing a user does
-- not delete the activities they reviewed.
ALTER TABLE "Activity"
  ADD CONSTRAINT "Activity_reviewedById_fkey"
  FOREIGN KEY ("reviewedById") REFERENCES "User"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "Activity_reviewedById_idx" ON "Activity"("reviewedById");
