-- Difficulty and age range were removed from activities (redundant, per the
-- speech therapist). DESTRUCTIVE: existing values in these columns are lost.

-- DropIndex
DROP INDEX IF EXISTS "public"."Activity_type_difficulty_idx";

-- DropIndex
DROP INDEX IF EXISTS "public"."Activity_ageRange_idx";

-- AlterTable
ALTER TABLE "public"."Activity" DROP COLUMN "ageRange",
DROP COLUMN "difficulty";

-- CreateIndex
CREATE INDEX "Activity_type_idx" ON "public"."Activity"("type");

-- DropEnum
DROP TYPE "public"."ActivityDifficulty";

-- DropEnum
DROP TYPE "public"."AgeRange";
