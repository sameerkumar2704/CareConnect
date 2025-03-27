-- DropForeignKey
ALTER TABLE "Hospital" DROP CONSTRAINT "Hospital_locationId_fkey";

-- AddForeignKey
ALTER TABLE "Hospital" ADD CONSTRAINT "Hospital_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE CASCADE ON UPDATE CASCADE;
