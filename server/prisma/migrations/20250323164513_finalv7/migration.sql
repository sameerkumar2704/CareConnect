/*
  Warnings:

  - You are about to drop the column `parentName` on the `Hospital` table. All the data in the column will be lost.
  - Added the required column `name` to the `Hospital` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Hospital" DROP COLUMN "parentName",
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "parentId" TEXT;

-- AddForeignKey
ALTER TABLE "Hospital" ADD CONSTRAINT "Hospital_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Hospital"("id") ON DELETE SET NULL ON UPDATE CASCADE;
