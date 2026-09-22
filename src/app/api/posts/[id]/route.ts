import { ReportStatus } from "@prisma/client";
import { requireUserId } from "@/lib/api-auth";
import { deleteCloudinaryImage } from "@/lib/cloudinary";
import { toOwnedReport } from "@/lib/db-mappers";
import { prisma } from "@/lib/prisma";

const statusMap: Record<string, ReportStatus> = {
  active: ReportStatus.ACTIVE,
  reviewing: ReportStatus.REVIEWING,
  paused: ReportStatus.PAUSED,
  resolved: ReportStatus.RESOLVED,
};

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const authResult = await requireUserId();
  if ("error" in authResult) return authResult.error;
  const { userId } = authResult;
  const { id } = await context.params;
  const body = await request.json();

  const existing = await prisma.petPost.findUnique({ where: { id } });
  if (!existing || existing.userId !== userId) {
    return Response.json({ error: "No encontrado" }, { status: 404 });
  }

  const data: {
    name?: string;
    description?: string;
    locationLabel?: string;
    status?: ReportStatus;
  } = {};

  if (body.name !== undefined) data.name = body.name;
  if (body.description !== undefined) data.description = body.description;
  if (body.locationLabel !== undefined) data.locationLabel = body.locationLabel;
  if (body.status && statusMap[body.status]) {
    data.status = statusMap[body.status];
  }

  const updated = await prisma.petPost.update({
    where: { id },
    data,
  });

  if (body.status === "resolved") {
    await deleteCloudinaryImage(existing.cloudinaryPublicId);
  }

  const candidateCount = await prisma.match.count({
    where: {
      OR: [{ lostPostId: id }, { foundPostId: id }],
      status: "PENDING",
    },
  });

  return Response.json({ report: toOwnedReport(updated, candidateCount) });
}
