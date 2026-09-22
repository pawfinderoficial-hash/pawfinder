import { requireUserId } from "@/lib/api-auth";
import {
  SPONSOR_NOTIFICATION_MOCKS,
  toAppNotification,
} from "@/lib/db-mappers";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const authResult = await requireUserId();
  if ("error" in authResult) return authResult.error;
  const { userId } = authResult;

  const rows = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const notifications = [
    ...rows.map(toAppNotification),
    ...SPONSOR_NOTIFICATION_MOCKS,
  ];

  return Response.json({ notifications });
}

export async function PATCH(request: Request) {
  const authResult = await requireUserId();
  if ("error" in authResult) return authResult.error;
  const { userId } = authResult;
  const body = await request.json();

  if (body.clearAll) {
    await prisma.notification.deleteMany({ where: { userId } });
    return Response.json({ ok: true });
  }

  if (body.id) {
    await prisma.notification.updateMany({
      where: { id: body.id, userId },
      data: { read: true },
    });
  }

  return Response.json({ ok: true });
}
