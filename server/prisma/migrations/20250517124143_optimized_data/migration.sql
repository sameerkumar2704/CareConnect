/*
  Warnings:

  - You are about to drop the column `expiry` on the `Appointment` table. All the data in the column will be lost.
  - You are about to drop the column `unAvailableDates` on the `Hospital` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Appointment" DROP COLUMN "expiry";

-- AlterTable
ALTER TABLE "Hospital" DROP COLUMN "unAvailableDates";
