-- AlterTable
ALTER TABLE "Appointment" ADD COLUMN     "ratingsId" TEXT;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_ratingsId_fkey" FOREIGN KEY ("ratingsId") REFERENCES "Ratings"("id") ON DELETE SET NULL ON UPDATE CASCADE;
