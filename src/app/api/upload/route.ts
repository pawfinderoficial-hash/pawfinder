import { requireUserId } from "@/lib/api-auth";
import { uploadImageBuffer } from "@/lib/cloudinary";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function POST(request: Request) {
  const authResult = await requireUserId();
  if ("error" in authResult) return authResult.error;

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return Response.json({ error: "Archivo requerido" }, { status: 400 });
  }
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    return Response.json(
      { error: "Formato no permitido. Usá JPG, PNG o WebP." },
      { status: 415 },
    );
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return Response.json(
      { error: "La imagen no puede superar los 5 MB." },
      { status: 413 },
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const uploaded = await uploadImageBuffer(buffer);
  return Response.json(uploaded);
}
