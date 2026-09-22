import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function requireUserId() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return { error: NextResponse.json({ error: "No autorizado" }, { status: 401 }) };
  }
  return { userId };
}
