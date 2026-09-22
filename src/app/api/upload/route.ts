import { requireUserId } from "@/lib/api-auth";
import { uploadImageBuffer } from "@/lib/cloudinary";

export async function POST(request: Request) {
  const authResult = await requireUserId();
  if ("error" in authResult) return authResult.error;

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return Response.json({ error: "Archivo requerido" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const uploaded = await uploadImageBuffer(buffer);
  return Response.json(uploaded);
}
