/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Timing` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Timing` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Hospital" ADD COLUMN     "emergency" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "maxAppointments" INTEGER NOT NULL DEFAULT 10;

-- AlterTable
ALTER TABLE "Timing" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt";
