-- AlterTable
ALTER TABLE "Hospital" ADD COLUMN     "isProfileChanged" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "verificationCode" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isProfileChanged" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "verificationCode" TEXT;
