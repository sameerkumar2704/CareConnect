/*
  Warnings:

  - You are about to drop the `Timing` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Timing" DROP CONSTRAINT "Timing_hospitalId_fkey";

-- AlterTable
ALTER TABLE "Hospital" ADD COLUMN     "timings" JSONB;

-- DropTable
DROP TABLE "Timing";
