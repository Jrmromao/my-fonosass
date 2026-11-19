-- AlterEnum
ALTER TYPE "public"."ActivityStatus" ADD VALUE 'ARCHIVED';

-- AlterTable
ALTER TABLE "public"."ActivityFile" ADD COLUMN     "archivedFromKey" TEXT;

