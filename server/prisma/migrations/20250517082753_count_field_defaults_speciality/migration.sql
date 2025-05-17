-- AlterTable
ALTER TABLE "Speciality" ALTER COLUMN "count" SET DEFAULT ARRAY['{"doctorCount": 0, "hospitalCount": 0}']::JSONB[];
