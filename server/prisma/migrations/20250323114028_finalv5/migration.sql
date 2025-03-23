/*
  Warnings:

  - You are about to drop the column `hospitalId` on the `Speciality` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Speciality" DROP CONSTRAINT "Speciality_hospitalId_fkey";

-- AlterTable
ALTER TABLE "Speciality" DROP COLUMN "hospitalId";

-- CreateTable
CREATE TABLE "_HospitalSpecialities" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_HospitalSpecialities_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_HospitalSpecialities_B_index" ON "_HospitalSpecialities"("B");

-- AddForeignKey
ALTER TABLE "_HospitalSpecialities" ADD CONSTRAINT "_HospitalSpecialities_A_fkey" FOREIGN KEY ("A") REFERENCES "Hospital"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_HospitalSpecialities" ADD CONSTRAINT "_HospitalSpecialities_B_fkey" FOREIGN KEY ("B") REFERENCES "Speciality"("id") ON DELETE CASCADE ON UPDATE CASCADE;
