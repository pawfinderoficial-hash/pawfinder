import { PetKind, ReportStatus } from "@prisma/client";
import { requireUserId } from "@/lib/api-auth";
import { toPetPost } from "@/lib/db-mappers";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const authResult = await requireUserId();
  if ("error" in authResult) return authResult.error;
  const { userId } = authResult;

  const posts = await prisma.petPost.findMany({
    where: {
      status: ReportStatus.ACTIVE,
      userId: { not: userId },
    },
    orderBy: { reportedAt: "desc" },
    take: 100,
  });

  return Response.json({
    posts: posts.map((post) => toPetPost(post)),
  });
}

export async function POST(request: Request) {
  const authResult = await requireUserId();
  if ("error" in authResult) return authResult.error;
  const { userId } = authResult;

  const body = await request.json();
  const kind = body.kind === "found" ? PetKind.FOUND : PetKind.LOST;

  const post = await prisma.petPost.create({
    data: {
      kind,
      name:
        body.name?.trim() ||
        (kind === PetKind.FOUND ? "Sin nombre" : "Mascota"),
      species: body.species,
      breed: body.breed || null,
      description: body.description,
      locationLabel: body.locationLabel,
      lat: body.lat,
      lng: body.lng,
      imageUrl: body.imageUrl,
      cloudinaryPublicId: body.cloudinaryPublicId || null,
      contactName: body.contactName,
      contactPhone: body.contactPhone,
      contactEmail: body.contactEmail || null,
      userId,
    },
  });

  return Response.json({ post: toPetPost(post, { includeContact: true }) });
}
