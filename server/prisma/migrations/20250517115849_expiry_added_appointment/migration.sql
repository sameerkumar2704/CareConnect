/*
  Warnings:

  - You are about to drop the column `expiryDate` on the `Appointment` table. All the data in the column will be lost.
  - Added the required column `expiry` to the `Appointment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Appointment" DROP COLUMN "expiryDate",
ADD COLUMN     "expiry" TIMESTAMP(3) NOT NULL;
