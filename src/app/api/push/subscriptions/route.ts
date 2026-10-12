import { requireUserId } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const authResult = await requireUserId();
  if ("error" in authResult) return authResult.error;
  const count = await prisma.pushSubscription.count({ where: { userId: authResult.userId } });
  return Response.json({ subscribed: count > 0 });
}

export async function POST(request: Request) {
  const authResult = await requireUserId();
  if ("error" in authResult) return authResult.error;
  const body = await request.json();
  const endpoint = typeof body.endpoint === "string" ? body.endpoint : "";
  const p256dh = typeof body.keys?.p256dh === "string" ? body.keys.p256dh : "";
  const auth = typeof body.keys?.auth === "string" ? body.keys.auth : "";
  if (!endpoint || !p256dh || !auth) {
    return Response.json({ error: "Suscripción inválida" }, { status: 400 });
  }
  await prisma.pushSubscription.upsert({
    where: { endpoint },
    update: { userId: authResult.userId, p256dh, auth },
    create: { userId: authResult.userId, endpoint, p256dh, auth },
  });
  return Response.json({ ok: true });
}

export async function DELETE(request: Request) {
  const authResult = await requireUserId();
  if ("error" in authResult) return authResult.error;
  const body = await request.json().catch(() => ({}));
  if (typeof body.endpoint === "string") {
    await prisma.pushSubscription.deleteMany({
      where: { endpoint: body.endpoint, userId: authResult.userId },
    });
  } else {
    await prisma.pushSubscription.deleteMany({ where: { userId: authResult.userId } });
  }
  return Response.json({ ok: true });
}
