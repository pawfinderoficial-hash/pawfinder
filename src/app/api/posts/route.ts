import { MatchStatus, PetKind, ReportStatus } from "@prisma/client";
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
  const targetLostPostId =
    typeof body.targetLostPostId === "string" ? body.targetLostPostId : null;

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

  let matchId: string | undefined;

  if (kind === PetKind.FOUND && targetLostPostId) {
    const lostPost = await prisma.petPost.findUnique({
      where: { id: targetLostPostId },
    });
    if (
      lostPost &&
      lostPost.kind === PetKind.LOST &&
      lostPost.status === ReportStatus.ACTIVE &&
      lostPost.userId !== userId
    ) {
      const existing = await prisma.match.findFirst({
        where: {
          lostPostId: lostPost.id,
          foundPostId: post.id,
          status: { in: [MatchStatus.PENDING, MatchStatus.CONFIRMED] },
        },
      });
      if (!existing) {
        const sessionUser = await prisma.user.findUnique({
          where: { id: userId },
        });
        const finderName = sessionUser?.name || body.contactName || "Vecino/a";
        const message = `Hola, creo que puede haber una coincidencia con ${lostPost.name}. ¿Podemos revisar juntos?`;
        const match = await prisma.match.create({
          data: {
            status: MatchStatus.PENDING,
            message,
            finderName,
            initiatorId: userId,
            lostPostId: lostPost.id,
            foundPostId: post.id,
          },
        });
        matchId = match.id;
        await prisma.notification.create({
          data: {
            userId: lostPost.userId,
            type: "MATCH",
            title: `¡Posible match con ${lostPost.name}!`,
            body: `${finderName} publicó un hallazgo vinculado a tu aviso.`,
            matchId: match.id,
            postId: post.id,
          },
        });
      } else {
        matchId = existing.id;
      }
    }
  }

  return Response.json({
    post: toPetPost(post, { includeContact: true }),
    matchId,
  });
}
