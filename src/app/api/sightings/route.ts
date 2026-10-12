import { PetKind, ReportStatus } from "@prisma/client";
import { requireUserId } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { sendPushToUser } from "@/lib/push-server";

export async function POST(request: Request) {
  const authResult = await requireUserId();
  if ("error" in authResult) return authResult.error;
  const { userId } = authResult;

  const body = await request.json();
  const lostPostId = body.lostPostId as string | undefined;
  if (!lostPostId) {
    return Response.json({ error: "lostPostId requerido" }, { status: 400 });
  }

  const note = typeof body.note === "string" ? body.note.trim() : "";
  const locationLabel =
    typeof body.locationLabel === "string" ? body.locationLabel.trim() : "";
  const contactName =
    typeof body.contactName === "string" ? body.contactName.trim() : "";
  const contactPhone =
    typeof body.contactPhone === "string" ? body.contactPhone.trim() : "";
  const lat = Number(body.lat);
  const lng = Number(body.lng);
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

  if (!locationLabel) {
    return Response.json({ error: "Indicá la zona del avistamiento" }, { status: 400 });
  }
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return Response.json({ error: "Marcá un punto en el mapa" }, { status: 400 });
  }
  if (!contactName) {
    return Response.json({ error: "Tu nombre es obligatorio" }, { status: 400 });
  }
  if (!contactPhone) {
    return Response.json(
      { error: "Un teléfono de contacto es obligatorio" },
      { status: 400 },
    );
  }

  const lostPost = await prisma.petPost.findUnique({ where: { id: lostPostId } });
  if (
    !lostPost ||
    lostPost.kind !== PetKind.LOST ||
    lostPost.status !== ReportStatus.ACTIVE
  ) {
    return Response.json({ error: "Aviso de pérdida no disponible" }, { status: 404 });
  }
  if (lostPost.userId === userId) {
    return Response.json(
      { error: "No podés reportar un avistamiento sobre tu propio aviso" },
      { status: 400 },
    );
  }

  let seenAt: Date | null = null;
  if (body.seenAt) {
    const parsed = new Date(body.seenAt);
    if (!Number.isNaN(parsed.getTime())) seenAt = parsed;
  }

  const sessionUser = await prisma.user.findUnique({ where: { id: userId } });
  const reporterLabel = contactName || sessionUser?.name || "Vecino/a";

  const sighting = await prisma.sighting.create({
    data: {
      lostPostId,
      reporterId: userId,
      note: note || "Vi a esta mascota pero no pude agarrarla.",
      locationLabel,
      lat,
      lng,
      seenAt,
      imageUrl: imageUrls[0] || null,
      imageUrls,
      cloudinaryPublicId: cloudinaryPublicIds[0] || null,
      cloudinaryPublicIds,
      contactName,
      contactPhone,
    },
  });

  await prisma.notification.create({
    data: {
      userId: lostPost.userId,
      type: "SIGHTING",
      title: `Avistamiento de ${lostPost.name}`,
      body: `${reporterLabel} cree haber visto a ${lostPost.name} en ${locationLabel}. Podés descartar o pedir contacto.`,
      sightingId: sighting.id,
      postId: lostPostId,
    },
  });
  await sendPushToUser(lostPost.userId, {
    title: `Avistamiento de ${lostPost.name}`,
    body: `${reporterLabel} cree haberlo visto en ${locationLabel}.`,
    url: "/match",
    tag: `sighting-${sighting.id}`,
  });

  return Response.json({ ok: true, sightingId: sighting.id });
}
