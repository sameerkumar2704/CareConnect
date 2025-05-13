-- CreateTable
CREATE TABLE "HospitalSpeciality" (
    "hospitalId" TEXT NOT NULL,
    "specialityId" TEXT NOT NULL,

    CONSTRAINT "HospitalSpeciality_pkey" PRIMARY KEY ("hospitalId","specialityId")
);

-- AddForeignKey
ALTER TABLE "HospitalSpeciality" ADD CONSTRAINT "HospitalSpeciality_hospitalId_fkey" FOREIGN KEY ("hospitalId") REFERENCES "Hospital"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HospitalSpeciality" ADD CONSTRAINT "HospitalSpeciality_specialityId_fkey" FOREIGN KEY ("specialityId") REFERENCES "Speciality"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
