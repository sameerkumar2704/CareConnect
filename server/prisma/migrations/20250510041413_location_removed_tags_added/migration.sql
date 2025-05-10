/*
  Warnings:

  - You are about to drop the column `locationId` on the `Hospital` table. All the data in the column will be lost.
  - You are about to drop the column `locationId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Location` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Hospital" DROP CONSTRAINT "Hospital_locationId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_locationId_fkey";

-- AlterTable
ALTER TABLE "Hospital" DROP COLUMN "locationId",
ADD COLUMN     "currLocation" JSONB NOT NULL DEFAULT '{}';

-- AlterTable
ALTER TABLE "Speciality" ADD COLUMN     "tags" JSONB[] DEFAULT ARRAY[]::JSONB[];

-- AlterTable
ALTER TABLE "User" DROP COLUMN "locationId",
ADD COLUMN     "currLocation" JSONB NOT NULL DEFAULT '{}';

-- DropTable
DROP TABLE "Location";
