import { requireUserId } from "@/lib/api-auth";
import { deleteCloudinaryImages, uploadImageBuffer } from "@/lib/cloudinary";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_IMAGES = 5;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function POST(request: Request) {
  const authResult = await requireUserId();
  if ("error" in authResult) return authResult.error;

  const formData = await request.formData();
  const files = [
    ...formData.getAll("files"),
    ...formData.getAll("file"),
  ].filter((entry): entry is File => entry instanceof File);
  if (files.length === 0) {
    return Response.json({ error: "Agregá al menos una foto" }, { status: 400 });
  }
  if (files.length > MAX_IMAGES) {
    return Response.json(
      { error: `Podés subir hasta ${MAX_IMAGES} fotos.` },
      { status: 400 },
    );
  }
  if (files.some((file) => !ALLOWED_IMAGE_TYPES.has(file.type))) {
    return Response.json(
      { error: "Formato no permitido. Usá JPG, PNG o WebP." },
      { status: 415 },
    );
  }
  if (files.some((file) => file.size > MAX_IMAGE_BYTES)) {
    return Response.json(
      { error: "Cada imagen puede pesar hasta 5 MB." },
      { status: 413 },
    );
  }

  const uploaded: Array<{ url: string; publicId: string }> = [];
  try {
    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer());
      uploaded.push(await uploadImageBuffer(buffer));
    }
  } catch {
    await deleteCloudinaryImages(uploaded.map((image) => image.publicId));
    return Response.json(
      { error: "No pudimos subir todas las fotos. Intentá de nuevo." },
      { status: 502 },
    );
  }

  return Response.json({ images: uploaded, ...uploaded[0] });
}
