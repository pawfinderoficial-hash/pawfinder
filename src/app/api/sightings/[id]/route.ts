import { SightingStatus } from "@prisma/client";
import { requireUserId } from "@/lib/api-auth";
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

    await prisma.sighting.update({
      where: { id },
      data: { status: SightingStatus.CONTACT_SHARED },
    });

    await prisma.notification.create({
      data: {
        userId: sighting.reporterId,
        type: "SIGHTING",
        title: "El dueño quiere hablarte",
        body: `Quien busca a ${sighting.lostPost.name} pidió tu contacto. Te puede escribir por WhatsApp.`,
        sightingId: id,
        postId: sighting.lostPostId,
      },
    });

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
    await prisma.sighting.update({
      where: { id },
      data: { status: SightingStatus.DISMISSED },
    });
    return Response.json({ ok: true });
  }

  return Response.json({ error: "Acción inválida" }, { status: 400 });
}
