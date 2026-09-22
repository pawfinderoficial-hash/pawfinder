import { MatchStatus, PetKind, ReportStatus } from "@prisma/client";
import { requireUserId } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const authResult = await requireUserId();
  if ("error" in authResult) return authResult.error;
  const { userId } = authResult;

  const { targetPostId } = await request.json();
  if (!targetPostId) {
    return Response.json({ error: "targetPostId requerido" }, { status: 400 });
  }

  const target = await prisma.petPost.findUnique({ where: { id: targetPostId } });
  if (!target || target.status !== ReportStatus.ACTIVE) {
    return Response.json({ error: "Publicación no disponible" }, { status: 404 });
  }
  if (target.userId === userId) {
    return Response.json({ error: "No podés marcar tu propio aviso" }, { status: 400 });
  }

  const myPosts = await prisma.petPost.findMany({
    where: { userId, status: ReportStatus.ACTIVE },
  });

  let lostPostId: string;
  let foundPostId: string;

  if (target.kind === PetKind.FOUND) {
    const myLost = myPosts.find((p) => p.kind === PetKind.LOST);
    if (!myLost) {
      return Response.json(
        {
          error:
            "Publicá primero un aviso de mascota perdida para marcar «Puede ser».",
        },
        { status: 400 },
      );
    }
    lostPostId = myLost.id;
    foundPostId = target.id;
  } else {
    const myFound = myPosts.find((p) => p.kind === PetKind.FOUND);
    if (!myFound) {
      return Response.json(
        {
          error:
            "Publicá un aviso de hallazgo para contactar a quien perdió la mascota.",
        },
        { status: 400 },
      );
    }
    lostPostId = target.id;
    foundPostId = myFound.id;
  }

  const existing = await prisma.match.findFirst({
    where: {
      lostPostId,
      foundPostId,
      status: { in: [MatchStatus.PENDING, MatchStatus.CONFIRMED] },
    },
  });
  if (existing) {
    return Response.json({ ok: true, matchId: existing.id, duplicate: true });
  }

  const lostPost = await prisma.petPost.findUnique({ where: { id: lostPostId } });
  const foundPost = await prisma.petPost.findUnique({
    where: { id: foundPostId },
  });
  if (!lostPost || !foundPost) {
    return Response.json({ error: "Datos incompletos" }, { status: 400 });
  }

  const sessionUser = await prisma.user.findUnique({ where: { id: userId } });
  const finderName = sessionUser?.name || "Vecino/a";
  const message = `Hola, creo que puede haber una coincidencia con ${lostPost.name}. ¿Podemos revisar juntos?`;

  const match = await prisma.match.create({
    data: {
      status: MatchStatus.PENDING,
      message,
      finderName,
      initiatorId: userId,
      lostPostId,
      foundPostId,
    },
  });

  if (lostPost.userId !== userId) {
    await prisma.notification.create({
      data: {
        userId: lostPost.userId,
        type: "MATCH",
        title: `¡Posible match con ${lostPost.name}!`,
        body: `${finderName} marcó «Puede ser» en una publicación relacionada.`,
        matchId: match.id,
        postId: foundPostId,
      },
    });
  }

  await prisma.notification.create({
    data: {
      userId: foundPost.userId,
      type: "MATCH",
      title: "Nuevo interés en tu aviso",
      body: `${finderName} quiere revisar una posible coincidencia.`,
      matchId: match.id,
      postId: lostPostId,
    },
  });

  return Response.json({ ok: true, matchId: match.id });
}
