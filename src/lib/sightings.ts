import { SightingStatus } from "@prisma/client";
import { deleteCloudinaryImage } from "@/lib/cloudinary";
import { prisma } from "@/lib/prisma";

export async function dismissSightingsForPost(postId: string) {
  const sightings = await prisma.sighting.findMany({
    where: {
      lostPostId: postId,
      status: {
        in: [SightingStatus.OPEN, SightingStatus.CONTACT_SHARED],
      },
    },
    select: { cloudinaryPublicId: true },
  });

  await prisma.sighting.updateMany({
    where: {
      lostPostId: postId,
      status: {
        in: [SightingStatus.OPEN, SightingStatus.CONTACT_SHARED],
      },
    },
    data: { status: SightingStatus.DISMISSED },
  });

  await Promise.all(
    sightings.map((sighting) =>
      deleteCloudinaryImage(sighting.cloudinaryPublicId),
    ),
  );
}
