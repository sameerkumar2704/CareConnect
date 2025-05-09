-- DropForeignKey
ALTER TABLE "Appointment" DROP CONSTRAINT "Appointment_ratingsId_fkey";

-- AlterTable
ALTER TABLE "Ratings" ADD COLUMN     "feedback" TEXT,
ADD COLUMN     "specialityId" TEXT;
