/*
  Warnings:

  - A unique constraint covering the columns `[hospitalId,userId,specialityId]` on the table `Ratings` will be added. If there are existing duplicate values, this will fail.
  - Made the column `specialityId` on table `Ratings` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Ratings" ALTER COLUMN "specialityId" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Ratings_hospitalId_userId_specialityId_key" ON "Ratings"("hospitalId", "userId", "specialityId");

-- AddForeignKey
ALTER TABLE "Ratings" ADD CONSTRAINT "Ratings_specialityId_fkey" FOREIGN KEY ("specialityId") REFERENCES "Speciality"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
