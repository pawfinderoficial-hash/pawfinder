import { MatchStatus, PetKind, ReportStatus } from "@prisma/client";
import { requireUserId } from "@/lib/api-auth";
import { toPetPost } from "@/lib/db-mappers";
import { prisma } from "@/lib/prisma";
import { sendPushToUser } from "@/lib/push-server";

class LinkedPostError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

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
  const imageUrls = Array.isArray(body.imageUrls)
    ? body.imageUrls.filter((url: unknown): url is string => typeof url === "string").slice(0, 5)
    : typeof body.imageUrl === "string"
      ? [body.imageUrl]
      : [];
  const cloudinaryPublicIds = Array.isArray(body.cloudinaryPublicIds)
    ? body.cloudinaryPublicIds
        .filter((id: unknown): id is string => typeof id === "string")
        .slice(0, 5)
    : typeof body.cloudinaryPublicId === "string"
      ? [body.cloudinaryPublicId]
      : [];

  if (imageUrls.length === 0) {
    return Response.json({ error: "Agregá al menos una foto" }, { status: 400 });
  }

  try {
    const { post, matchId, pushUserId } = await prisma.$transaction(async (tx) => {
      const linkedLostPost =
        kind === PetKind.FOUND && targetLostPostId
          ? await tx.petPost.findUnique({ where: { id: targetLostPostId } })
          : null;

      if (targetLostPostId && kind === PetKind.FOUND) {
        if (
          !linkedLostPost ||
          linkedLostPost.kind !== PetKind.LOST ||
          linkedLostPost.status !== ReportStatus.ACTIVE
        ) {
          throw new LinkedPostError(
            "El aviso de pérdida ya no está disponible",
            409,
          );
        }
        if (linkedLostPost.userId === userId) {
          throw new LinkedPostError(
            "No podés vincular un hallazgo a tu propio aviso",
            400,
          );
        }
      }

      const post = await tx.petPost.create({
        data: {
          kind,
          name:
            body.name?.trim() ||
            (kind === PetKind.FOUND ? "Sin nombre" : "Mascota"),
          species: body.species,
          breed: body.breed || null,
          color: body.color?.trim() || null,
          size: body.size?.trim() || null,
          sex: body.sex?.trim() || null,
          ageLabel: body.ageLabel?.trim() || null,
          collar: body.collar?.trim() || null,
          description: body.description,
          locationLabel: body.locationLabel,
          lat: body.lat,
          lng: body.lng,
          imageUrl: imageUrls[0],
          imageUrls,
          cloudinaryPublicId: cloudinaryPublicIds[0] || null,
          cloudinaryPublicIds,
          contactName: body.contactName,
          contactPhone: body.contactPhone,
          contactEmail: body.contactEmail || null,
          userId,
        },
      });

      if (!linkedLostPost) return { post, matchId: undefined, pushUserId: undefined };

      const sessionUser = await tx.user.findUnique({ where: { id: userId } });
      const finderName = sessionUser?.name || body.contactName || "Vecino/a";
      const message = `Hola, creo que puede haber una coincidencia con ${linkedLostPost.name}. ¿Podemos revisar juntos?`;
      const match = await tx.match.create({
        data: {
          status: MatchStatus.PENDING,
          message,
          finderName,
          initiatorId: userId,
          lostPostId: linkedLostPost.id,
          foundPostId: post.id,
        },
      });
      await tx.notification.create({
        data: {
          userId: linkedLostPost.userId,
          type: "MATCH",
          title: `¡Posible match con ${linkedLostPost.name}!`,
          body: `${finderName} publicó un hallazgo vinculado a tu aviso.`,
          matchId: match.id,
          postId: post.id,
        },
      });

      return { post, matchId: match.id, pushUserId: linkedLostPost.userId };
    });

    if (matchId && pushUserId) {
      await sendPushToUser(pushUserId, {
        title: "Publicaron un posible hallazgo",
        body: "Hay una publicación vinculada a tu aviso. Revisá si coincide.",
        url: "/match",
        tag: `match-${matchId}`,
      });
    }

    return Response.json({
      post: toPetPost(post, { includeContact: true }),
      matchId,
    });
  } catch (error) {
    if (error instanceof LinkedPostError) {
      return Response.json({ error: error.message }, { status: error.status });
    }
    throw error;
  }
}
