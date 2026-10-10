import { SightingStatus } from "@prisma/client";
import { requireUserId } from "@/lib/api-auth";
import { deleteCloudinaryImages } from "@/lib/cloudinary";
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

  const sighting = await prisma.sighting.findUnique({
    where: { id },
    include: { lostPost: true },
  });
  if (!sighting) {
    return Response.json({ error: "Avistamiento no encontrado" }, { status: 404 });
  }

  const isLostOwner = sighting.lostPost.userId === userId;
  if (!isLostOwner) {
    return Response.json({ error: "No autorizado" }, { status: 403 });
  }

  if (action === "contact") {
    if (sighting.status === SightingStatus.DISMISSED) {
      return Response.json(
        { error: "Este avistamiento ya fue descartado" },
        { status: 409 },
      );
    }
    if (sighting.status === SightingStatus.CONTACT_SHARED) {
      return Response.json({
        ok: true,
        contactPhone: sighting.contactPhone,
        contactName: sighting.contactName,
      });
    }

    const transitioned = await prisma.$transaction(async (tx) => {
      const update = await tx.sighting.updateMany({
        where: { id, status: SightingStatus.OPEN },
        data: { status: SightingStatus.CONTACT_SHARED },
      });
      if (update.count === 0) return false;

      await tx.notification.create({
        data: {
          userId: sighting.reporterId,
          type: "SIGHTING",
          title: "El dueño quiere hablarte",
          body: `Quien busca a ${sighting.lostPost.name} pidió tu contacto. Te puede escribir por WhatsApp.`,
          sightingId: id,
          postId: sighting.lostPostId,
        },
      });
      return true;
    });

    if (!transitioned) {
      const current = await prisma.sighting.findUnique({
        where: { id },
        select: { status: true },
      });
      if (current?.status === SightingStatus.DISMISSED) {
        return Response.json(
          { error: "Este avistamiento ya fue descartado" },
          { status: 409 },
        );
      }
    }

    return Response.json({
      ok: true,
      contactPhone: sighting.contactPhone,
      contactName: sighting.contactName,
    });
  }

  if (action === "dismiss") {
    if (sighting.status === SightingStatus.DISMISSED) {
      return Response.json({ ok: true, duplicate: true });
    }
    const update = await prisma.sighting.updateMany({
      where: {
        id,
        status: {
          in: [SightingStatus.OPEN, SightingStatus.CONTACT_SHARED],
        },
      },
      data: { status: SightingStatus.DISMISSED },
    });
    if (update.count > 0) {
      await deleteCloudinaryImages(
        sighting.cloudinaryPublicIds.length > 0
          ? sighting.cloudinaryPublicIds
          : [sighting.cloudinaryPublicId],
      );
    }
    return Response.json({ ok: true, duplicate: update.count === 0 });
  }

  return Response.json({ error: "Acción inválida" }, { status: 400 });
}
