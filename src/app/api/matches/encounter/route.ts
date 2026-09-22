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
      status: MatchStatus.CONFIRMED,
      OR: [
        { lostPost: { userId } },
        { foundPost: { userId } },
        { initiatorId: userId },
      ],
      meetingMode: null,
    },
    include: { foundPost: true, lostPost: true },
    orderBy: { updatedAt: "desc" },
  });

  if (!match) {
    return Response.json({ encounterMatch: null });
  }

  return Response.json({
    encounterMatch: {
      id: match.id,
      foundPost: toPetPost(match.foundPost, { includeContact: true }),
      message: match.message,
      finderName: match.finderName,
    },
  });
}
