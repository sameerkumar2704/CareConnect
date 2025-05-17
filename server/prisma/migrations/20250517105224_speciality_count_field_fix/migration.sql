/*
  Warnings:

  - The `count` column on the `Speciality` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Speciality" DROP COLUMN "count",
ADD COLUMN     "count" JSONB NOT NULL DEFAULT '{"doctorCount": 0, "hospitalCount": 0}';
