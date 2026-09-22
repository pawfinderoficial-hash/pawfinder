import { MatchStatus } from "@prisma/client";
import { requireUserId } from "@/lib/api-auth";
import { toPetPost } from "@/lib/db-mappers";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const authResult = await requireUserId();
  if ("error" in authResult) return authResult.error;
  const { userId } = authResult;

  const match = await prisma.match.findFirst({
    where: {
      status: MatchStatus.PENDING,
      lostPost: { userId },
    },
    include: { foundPost: true, lostPost: true, initiator: true },
    orderBy: { createdAt: "desc" },
  });

  if (!match) {
    return Response.json({ pendingMatch: null });
  }

  return Response.json({
    pendingMatch: {
      id: match.id,
      foundPost: toPetPost(match.foundPost, { includeContact: false }),
      message: match.message,
      finderName: match.finderName,
    },
  });
}
