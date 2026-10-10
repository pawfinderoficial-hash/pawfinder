import { MatchStatus, PetKind, ReportStatus } from "@prisma/client";
import { requireUserId } from "@/lib/api-auth";
import { toPetPost } from "@/lib/db-mappers";
import { prisma } from "@/lib/prisma";

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

  try {
    const { post, matchId } = await prisma.$transaction(async (tx) => {
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

      if (!linkedLostPost) return { post, matchId: undefined };

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

      return { post, matchId: match.id };
    });

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
