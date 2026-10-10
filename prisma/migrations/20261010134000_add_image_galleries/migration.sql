-- Preserve the existing cover image while allowing up to five images per report.
ALTER TABLE "PetPost"
ADD COLUMN "imageUrls" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
ADD COLUMN "cloudinaryPublicIds" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

UPDATE "PetPost"
SET "imageUrls" = ARRAY["imageUrl"]
WHERE "imageUrl" IS NOT NULL AND "imageUrl" <> '';

UPDATE "PetPost"
SET "cloudinaryPublicIds" = ARRAY["cloudinaryPublicId"]
WHERE "cloudinaryPublicId" IS NOT NULL AND "cloudinaryPublicId" <> '';

ALTER TABLE "Sighting"
ADD COLUMN "imageUrls" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
ADD COLUMN "cloudinaryPublicIds" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

UPDATE "Sighting"
SET "imageUrls" = ARRAY["imageUrl"]
WHERE "imageUrl" IS NOT NULL AND "imageUrl" <> '';

UPDATE "Sighting"
SET "cloudinaryPublicIds" = ARRAY["cloudinaryPublicId"]
WHERE "cloudinaryPublicId" IS NOT NULL AND "cloudinaryPublicId" <> '';
