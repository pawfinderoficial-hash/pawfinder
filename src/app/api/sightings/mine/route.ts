import { requireUserId } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import type { OwnedSighting } from "@/types/pet";

export async function GET() {
  const authResult = await requireUserId();
  if ("error" in authResult) return authResult.error;

  const sightings = await prisma.sighting.findMany({
    where: { reporterId: authResult.userId },
    include: {
      lostPost: {
        select: { id: true, name: true, imageUrl: true, imageUrls: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const items: OwnedSighting[] = sightings.map((sighting) => ({
    id: sighting.id,
    status: sighting.status.toLowerCase() as OwnedSighting["status"],
    note: sighting.note,
    locationLabel: sighting.locationLabel,
    seenAt: sighting.seenAt?.toISOString() ?? null,
    imageUrl: sighting.imageUrl,
    imageUrls:
      sighting.imageUrls.length > 0
        ? sighting.imageUrls
        : sighting.imageUrl
          ? [sighting.imageUrl]
          : [],
    createdAt: sighting.createdAt.toISOString(),
    lostPost: {
      ...sighting.lostPost,
      imageUrls:
        sighting.lostPost.imageUrls.length > 0
          ? sighting.lostPost.imageUrls
          : [sighting.lostPost.imageUrl],
    },
  }));

  return Response.json({ sightings: items });
}
