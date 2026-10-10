"use client";

import Image from "next/image";
import { Camera, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";

export const MAX_PHOTOS = 5;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export type PendingPhoto = {
  id: string;
  url: string;
  file?: File;
  isPlaceholder?: boolean;
};

type MultiPhotoPickerProps = {
  photos: PendingPhoto[];
  onChange: (photos: PendingPhoto[]) => void;
  onError: (message: string) => void;
  optional?: boolean;
};

export function MultiPhotoPicker({
  photos,
  onChange,
  onError,
  optional = false,
}: MultiPhotoPickerProps) {
  const actualCount = photos.filter((photo) => !photo.isPlaceholder).length;
  const canAdd = actualCount < MAX_PHOTOS;

  const addFiles = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (selected.length === 0) return;

    const invalidType = selected.find((file) => !ALLOWED_IMAGE_TYPES.has(file.type));
    if (invalidType) {
      onError("Formato no permitido. Usá JPG, PNG o WebP.");
      return;
    }
    const oversized = selected.find((file) => file.size > MAX_IMAGE_BYTES);
    if (oversized) {
      onError("Cada imagen puede pesar hasta 5 MB.");
      return;
    }

    const current = photos.some((photo) => photo.isPlaceholder) ? [] : photos;
    const available = MAX_PHOTOS - current.length;
    if (selected.length > available) {
      onError(`Podés elegir hasta ${MAX_PHOTOS} fotos.`);
      return;
    }

    onChange([
      ...current,
      ...selected.map((file) => ({
        id: `${file.name}-${file.lastModified}-${crypto.randomUUID()}`,
        url: URL.createObjectURL(file),
        file,
      })),
    ]);
  };

  const removePhoto = (photo: PendingPhoto) => {
    if (photo.url.startsWith("blob:")) URL.revokeObjectURL(photo.url);
    onChange(photos.filter((candidate) => candidate.id !== photo.id));
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-foreground">
          Fotos {optional ? "(opcionales)" : ""}
        </span>
        <span className="text-xs text-muted-foreground">
          {actualCount}/{MAX_PHOTOS}
        </span>
      </div>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
        {photos.map((photo, index) => (
          <div
            key={photo.id}
            className="relative aspect-square overflow-hidden rounded-xl border border-border/60 bg-muted"
          >
            <button
              type="button"
              onClick={() =>
                onChange([
                  photo,
                  ...photos.filter((candidate) => candidate.id !== photo.id),
                ])
              }
              className="absolute inset-0"
              aria-label={
                index === 0
                  ? "Foto de portada"
                  : `Usar foto ${index + 1} como portada`
              }
            >
              <Image
                src={photo.url}
                alt=""
                fill
                className="object-cover"
                sizes="128px"
                unoptimized={photo.url.startsWith("blob:")}
              />
            </button>
            {index === 0 ? (
              <span className="pointer-events-none absolute bottom-1 left-1 rounded-md bg-black/65 px-1.5 py-0.5 text-[0.6rem] font-semibold text-white">
                Portada
              </span>
            ) : null}
            {!photo.isPlaceholder ? (
              <button
                type="button"
                onClick={() => removePhoto(photo)}
                className="absolute right-1 top-1 z-10 flex size-6 items-center justify-center rounded-full bg-black/65 text-white"
                aria-label={`Quitar foto ${index + 1}`}
              >
                <X className="size-3.5" />
              </button>
            ) : null}
          </div>
        ))}
        {canAdd ? (
          <label
            className={cn(
              "flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-border bg-muted/35 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted",
              photos.length === 0 && "col-span-2 aspect-auto min-h-24",
            )}
          >
            {photos.length === 0 ? <Camera className="size-5" /> : <Plus className="size-5" />}
            {photos.length === 0 ? "Agregar fotos" : "Agregar"}
            <input
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              onChange={addFiles}
            />
          </label>
        ) : null}
      </div>
      <p className="text-xs text-muted-foreground">
        Tocá una foto para usarla como portada. Podés seleccionar varias juntas.
      </p>
    </div>
  );
}

export async function uploadPendingPhotos(photos: PendingPhoto[]) {
  const files = photos.flatMap((photo) => (photo.file ? [photo.file] : []));
  let uploaded: Array<{ url: string; publicId: string }> = [];

  for (const file of files) {
    const formData = new FormData();
    formData.append("file", await optimizePhoto(file));
    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });
    const result = (await response.json().catch(() => ({}))) as {
      error?: string;
      images?: Array<{ url: string; publicId: string }>;
    };
    if (!response.ok || !result.images) {
      throw new Error(result.error || "No se pudieron subir las fotos");
    }
    uploaded = [...uploaded, result.images[0]];
  }

  let uploadedIndex = 0;
  const imageUrls = photos.map((photo) => {
    if (!photo.file) return photo.url;
    const image = uploaded[uploadedIndex];
    uploadedIndex += 1;
    return image.url;
  });

  return {
    imageUrls,
    cloudinaryPublicIds: uploaded.map((image) => image.publicId),
  };
}

async function optimizePhoto(file: File): Promise<File> {
  if (file.size <= 3.5 * 1024 * 1024 || typeof createImageBitmap === "undefined") {
    return file;
  }

  try {
    const bitmap = await createImageBitmap(file);
    const maxSide = 1920;
    const ratio = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * ratio);
    canvas.height = Math.round(bitmap.height * ratio);
    canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", 0.82),
    );
    if (!blob || blob.size >= file.size) return file;
    return new File([blob], file.name.replace(/\.[^.]+$/, ".jpg"), {
      type: "image/jpeg",
      lastModified: file.lastModified,
    });
  } catch {
    return file;
  }
}
