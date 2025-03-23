/*
  Warnings:

  - The values [OWNER,THERAPIST] on the enum `UserRole` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `practiceId` on the `Activity` table. All the data in the column will be lost.
  - You are about to drop the column `isPublic` on the `ActivityFile` table. All the data in the column will be lost.
  - You are about to drop the column `pagSeguroOrderId` on the `Subscription` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `ActivityProgress` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Document` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DocumentAccessLog` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DocumentCategory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DocumentCategoryAssignment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DocumentModificationLog` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DocumentPermission` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DocumentSharedLink` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DocumentTag` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DocumentTagAssignment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Patient` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PatientActivity` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Practice` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PracticeMember` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProgressNote` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "UserRole_new" AS ENUM ('ADMIN', 'USER');
ALTER TABLE "User" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "role" TYPE "UserRole_new" USING ("role"::text::"UserRole_new");
ALTER TYPE "UserRole" RENAME TO "UserRole_old";
ALTER TYPE "UserRole_new" RENAME TO "UserRole";
DROP TYPE "UserRole_old";
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'USER';
COMMIT;

-- DropForeignKey
ALTER TABLE "Activity" DROP CONSTRAINT "Activity_practiceId_fkey";

-- DropForeignKey
ALTER TABLE "ActivityFile" DROP CONSTRAINT "ActivityFile_uploadedById_fkey";

-- DropForeignKey
ALTER TABLE "ActivityProgress" DROP CONSTRAINT "ActivityProgress_activityId_fkey";

-- DropForeignKey
ALTER TABLE "ActivityProgress" DROP CONSTRAINT "ActivityProgress_patientActivityId_fkey";

-- DropForeignKey
ALTER TABLE "ActivityProgress" DROP CONSTRAINT "ActivityProgress_patientId_fkey";

-- DropForeignKey
ALTER TABLE "Document" DROP CONSTRAINT "Document_patientId_fkey";

-- DropForeignKey
ALTER TABLE "Document" DROP CONSTRAINT "Document_practiceId_fkey";

-- DropForeignKey
ALTER TABLE "Document" DROP CONSTRAINT "Document_uploadedById_fkey";

-- DropForeignKey
ALTER TABLE "DocumentAccessLog" DROP CONSTRAINT "DocumentAccessLog_documentId_fkey";

-- DropForeignKey
ALTER TABLE "DocumentAccessLog" DROP CONSTRAINT "DocumentAccessLog_sharedLinkId_fkey";

-- DropForeignKey
ALTER TABLE "DocumentAccessLog" DROP CONSTRAINT "DocumentAccessLog_userId_fkey";

-- DropForeignKey
ALTER TABLE "DocumentCategoryAssignment" DROP CONSTRAINT "DocumentCategoryAssignment_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "DocumentCategoryAssignment" DROP CONSTRAINT "DocumentCategoryAssignment_documentId_fkey";

-- DropForeignKey
ALTER TABLE "DocumentModificationLog" DROP CONSTRAINT "DocumentModificationLog_documentId_fkey";

-- DropForeignKey
ALTER TABLE "DocumentModificationLog" DROP CONSTRAINT "DocumentModificationLog_userId_fkey";

-- DropForeignKey
ALTER TABLE "DocumentPermission" DROP CONSTRAINT "DocumentPermission_documentId_fkey";

-- DropForeignKey
ALTER TABLE "DocumentPermission" DROP CONSTRAINT "DocumentPermission_grantedById_fkey";

-- DropForeignKey
ALTER TABLE "DocumentPermission" DROP CONSTRAINT "DocumentPermission_userId_fkey";

-- DropForeignKey
ALTER TABLE "DocumentSharedLink" DROP CONSTRAINT "DocumentSharedLink_documentId_fkey";

-- DropForeignKey
ALTER TABLE "DocumentSharedLink" DROP CONSTRAINT "DocumentSharedLink_sharedById_fkey";

-- DropForeignKey
ALTER TABLE "DocumentTagAssignment" DROP CONSTRAINT "DocumentTagAssignment_documentId_fkey";

-- DropForeignKey
ALTER TABLE "DocumentTagAssignment" DROP CONSTRAINT "DocumentTagAssignment_tagId_fkey";

-- DropForeignKey
ALTER TABLE "Patient" DROP CONSTRAINT "Patient_practiceId_fkey";

-- DropForeignKey
ALTER TABLE "Patient" DROP CONSTRAINT "Patient_primaryTherapistId_fkey";

-- DropForeignKey
ALTER TABLE "PatientActivity" DROP CONSTRAINT "PatientActivity_activityId_fkey";

-- DropForeignKey
ALTER TABLE "PatientActivity" DROP CONSTRAINT "PatientActivity_assignedById_fkey";

-- DropForeignKey
ALTER TABLE "PatientActivity" DROP CONSTRAINT "PatientActivity_patientId_fkey";

-- DropForeignKey
ALTER TABLE "PracticeMember" DROP CONSTRAINT "PracticeMember_practiceId_fkey";

-- DropForeignKey
ALTER TABLE "PracticeMember" DROP CONSTRAINT "PracticeMember_userId_fkey";

-- DropForeignKey
ALTER TABLE "ProgressNote" DROP CONSTRAINT "ProgressNote_patientId_fkey";

-- DropForeignKey
ALTER TABLE "ProgressNote" DROP CONSTRAINT "ProgressNote_therapistId_fkey";

-- AlterTable
ALTER TABLE "Activity" DROP COLUMN "practiceId",
ALTER COLUMN "isPublic" SET DEFAULT true;

-- AlterTable
ALTER TABLE "ActivityFile" DROP COLUMN "isPublic";

-- AlterTable
ALTER TABLE "Subscription" DROP COLUMN "pagSeguroOrderId",
ADD COLUMN     "paymentId" TEXT;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "phone",
ALTER COLUMN "role" SET DEFAULT 'USER';

-- DropTable
DROP TABLE "ActivityProgress";

-- DropTable
DROP TABLE "Document";

-- DropTable
DROP TABLE "DocumentAccessLog";

-- DropTable
DROP TABLE "DocumentCategory";

-- DropTable
DROP TABLE "DocumentCategoryAssignment";

-- DropTable
DROP TABLE "DocumentModificationLog";

-- DropTable
DROP TABLE "DocumentPermission";

-- DropTable
DROP TABLE "DocumentSharedLink";

-- DropTable
DROP TABLE "DocumentTag";

-- DropTable
DROP TABLE "DocumentTagAssignment";

-- DropTable
DROP TABLE "Patient";

-- DropTable
DROP TABLE "PatientActivity";

-- DropTable
DROP TABLE "Practice";

-- DropTable
DROP TABLE "PracticeMember";

-- DropTable
DROP TABLE "ProgressNote";

-- DropEnum
DROP TYPE "AccessMethod";

-- DropEnum
DROP TYPE "AccessType";

-- DropEnum
DROP TYPE "AssignmentStatus";

-- DropEnum
DROP TYPE "DocumentType";

-- DropEnum
DROP TYPE "DocumentVisibility";

-- DropEnum
DROP TYPE "MemberStatus";

-- DropEnum
DROP TYPE "ModificationAction";

-- DropEnum
DROP TYPE "PatientStatus";

-- DropEnum
DROP TYPE "PermissionType";

-- DropEnum
DROP TYPE "PracticeRole";

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
