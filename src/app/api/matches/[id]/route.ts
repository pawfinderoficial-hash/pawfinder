import { MatchStatus, ReportStatus } from "@prisma/client";
import { requireUserId } from "@/lib/api-auth";
import { deleteCloudinaryImage } from "@/lib/cloudinary";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const authResult = await requireUserId();
  if ("error" in authResult) return authResult.error;
  const { userId } = authResult;
  const { id } = await context.params;
  const body = await request.json();
  const action = body.action as string;

  const match = await prisma.match.findUnique({
    where: { id },
    include: { lostPost: true, foundPost: true },
  });
  if (!match) {
    return Response.json({ error: "Match no encontrado" }, { status: 404 });
  }

  const isLostOwner = match.lostPost.userId === userId;
  const isParticipant =
    isLostOwner ||
    match.foundPost.userId === userId ||
    match.initiatorId === userId;

  if (!isParticipant) {
    return Response.json({ error: "No autorizado" }, { status: 403 });
  }

  if (action === "confirm") {
    if (!isLostOwner) {
      return Response.json(
        { error: "Solo quien perdió la mascota puede confirmar" },
        { status: 403 },
      );
    }
    await prisma.match.update({
      where: { id },
      data: { status: MatchStatus.CONFIRMED },
    });
    await prisma.notification.createMany({
      data: [
        {
          userId: match.foundPost.userId,
          type: "MATCH_CONFIRMED",
          title: "¡Match confirmado!",
          body: "Coordiná el punto de encuentro en la app.",
          matchId: id,
        },
        {
          userId: match.lostPost.userId,
          type: "MATCH_CONFIRMED",
          title: "Match confirmado",
          body: "Elegí cómo reunirte con la otra persona.",
          matchId: id,
        },
      ],
    });
    return Response.json({ ok: true });
  }

  if (action === "reject") {
    if (!isLostOwner) {
      return Response.json({ error: "No autorizado" }, { status: 403 });
    }
    await prisma.match.update({
      where: { id },
      data: { status: MatchStatus.REJECTED },
    });
    await prisma.notification.create({
      data: {
        userId: match.initiatorId,
        type: "MATCH_REJECTED",
        title: "Match rechazado",
        body: "La persona indicó que no era su mascota.",
        matchId: id,
      },
    });
    return Response.json({ ok: true });
  }

  if (action === "encounter") {
    const meetingMode = body.meetingMode as string;
    const meetingPointId = body.meetingPointId as string | undefined;

    await prisma.match.update({
      where: { id },
      data: {
        meetingMode,
        meetingPointId: meetingPointId ?? null,
        status: MatchStatus.CLOSED,
      },
    });

    const posts = [match.lostPost, match.foundPost];
    for (const post of posts) {
      await deleteCloudinaryImage(post.cloudinaryPublicId);
      await prisma.petPost.update({
        where: { id: post.id },
        data: { status: ReportStatus.RESOLVED, imageUrl: post.imageUrl },
      });
    }

    await prisma.notification.createMany({
      data: [
        {
          userId: match.lostPost.userId,
          type: "ENCOUNTER",
          title: "Encuentro acordado",
          body: "¡Éxitos con la reunión! Los avisos se cerraron.",
          matchId: id,
        },
        {
          userId: match.foundPost.userId,
          type: "ENCOUNTER",
          title: "Encuentro acordado",
          body: "Coordiná por teléfono. Los avisos se cerraron.",
          matchId: id,
        },
      ],
    });

    return Response.json({ ok: true });
  }

  return Response.json({ error: "Acción inválida" }, { status: 400 });
}
