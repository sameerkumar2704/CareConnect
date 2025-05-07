/*
  Warnings:

  - Added the required column `expiration` to the `Appointment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `paidPrice` to the `Appointment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Appointment" ADD COLUMN     "expiration" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "paidPrice" INTEGER NOT NULL;
