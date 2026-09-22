import { requireUserId } from "@/lib/api-auth";
import { toOwnedReport } from "@/lib/db-mappers";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const authResult = await requireUserId();
  if ("error" in authResult) return authResult.error;
  const { userId } = authResult;

  const posts = await prisma.petPost.findMany({
    where: { userId },
    orderBy: { reportedAt: "desc" },
  });

  const reports = await Promise.all(
    posts.map(async (post) => {
      const candidateCount = await prisma.match.count({
        where: {
          OR: [{ lostPostId: post.id }, { foundPostId: post.id }],
          status: "PENDING",
        },
      });
      return toOwnedReport(post, candidateCount);
    }),
  );

  return Response.json({ reports });
}
