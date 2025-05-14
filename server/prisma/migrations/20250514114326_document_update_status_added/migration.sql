-- CreateEnum
CREATE TYPE "DocumentStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "status" "DocumentStatus" NOT NULL DEFAULT 'PENDING';
