/*
  Warnings:

  - The values [SPEECH,COGNITIVE,MOTOR,SOCIAL] on the enum `ActivityType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ActivityType_new" AS ENUM ('ANIMALS', 'COLOURS', 'MEANS_OF_TRANSPORT', 'CLOTHING', 'LANGUAGE', 'PROFESSIONS', 'GEOMETRIC_SHAPES', 'NUMBERS_AND_LETTERS', 'MOTOR_SKILLS', 'HUMAN_BODY', 'OTHER');
ALTER TABLE "Activity" ALTER COLUMN "type" TYPE "ActivityType_new" USING ("type"::text::"ActivityType_new");
ALTER TYPE "ActivityType" RENAME TO "ActivityType_old";
ALTER TYPE "ActivityType_new" RENAME TO "ActivityType";
DROP TYPE "ActivityType_old";
COMMIT;
