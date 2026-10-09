-- CreateEnum
CREATE TYPE "SightingStatus" AS ENUM ('OPEN', 'CONTACT_SHARED', 'DISMISSED');

-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'SIGHTING';

-- AlterTable
ALTER TABLE "Notification" ADD COLUMN "sightingId" TEXT;

-- CreateTable
CREATE TABLE "Sighting" (
    "id" TEXT NOT NULL,
    "status" "SightingStatus" NOT NULL DEFAULT 'OPEN',
    "note" TEXT NOT NULL,
    "locationLabel" TEXT NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "seenAt" TIMESTAMP(3),
    "imageUrl" TEXT,
    "cloudinaryPublicId" TEXT,
    "contactName" TEXT NOT NULL,
    "contactPhone" TEXT NOT NULL,
    "reporterId" TEXT NOT NULL,
    "lostPostId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Sighting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Sighting_status_idx" ON "Sighting"("status");

-- CreateIndex
CREATE INDEX "Sighting_lostPostId_idx" ON "Sighting"("lostPostId");

-- CreateIndex
CREATE INDEX "Sighting_reporterId_idx" ON "Sighting"("reporterId");

-- AddForeignKey
ALTER TABLE "Sighting" ADD CONSTRAINT "Sighting_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sighting" ADD CONSTRAINT "Sighting_lostPostId_fkey" FOREIGN KEY ("lostPostId") REFERENCES "PetPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;
