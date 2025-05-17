-- AlterTable
ALTER TABLE "Hospital" ADD COLUMN     "unAvailableDates" JSONB[] DEFAULT ARRAY[]::JSONB[];
