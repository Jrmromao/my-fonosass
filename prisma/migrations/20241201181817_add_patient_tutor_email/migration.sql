-- AlterTable
ALTER TABLE "Patient" ADD COLUMN     "tutorEmail" TEXT;

-- AlterTable
ALTER TABLE "_ActivityToPatient" ADD CONSTRAINT "_ActivityToPatient_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_ActivityToPatient_AB_unique";
