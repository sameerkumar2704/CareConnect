/*
  Warnings:

  - You are about to alter the column `location` on the `Hospital` table. The data in that column could be lost. The data in that column will be cast from `JsonB` to `Unsupported("geometry(Point, 4326)")`.

*/
-- AlterTable
CREATE EXTENSION IF NOT EXISTS postgis;
ALTER TABLE "Hospital"
ALTER COLUMN location TYPE geometry(Point, 4326)
USING ST_SetSRID(ST_MakePoint(
  (location->>'longitude')::double precision,
  (location->>'latitude')::double precision
), 4326);