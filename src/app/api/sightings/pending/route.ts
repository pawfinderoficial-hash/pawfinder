import { ReportStatus, SightingStatus } from "@prisma/client";
import { requireUserId } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const authResult = await requireUserId();
  if ("error" in authResult) return authResult.error;
  const { userId } = authResult;

  const rows = await prisma.sighting.findMany({
    where: {
      status: { in: [SightingStatus.OPEN, SightingStatus.CONTACT_SHARED] },
      lostPost: { userId, status: ReportStatus.ACTIVE },
    },
    include: { lostPost: true, reporter: true },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return Response.json({
    pendingSightings: rows.map((s) => ({
      id: s.id,
      status: s.status === "CONTACT_SHARED" ? "contact_shared" : "open",
      note: s.note,
      locationLabel: s.locationLabel,
      lat: s.lat,
      lng: s.lng,
      seenAt: s.seenAt?.toISOString() ?? null,
      imageUrl: s.imageUrl,
      reporterName: s.contactName || s.reporter.name || "Vecino/a",
      contactPhone:
        s.status === SightingStatus.CONTACT_SHARED ? s.contactPhone : null,
      lostPost: {
        id: s.lostPost.id,
        name: s.lostPost.name,
        imageUrl: s.lostPost.imageUrl,
      },
      createdAt: s.createdAt.toISOString(),
    })),
  });
}
