"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { AlertCircle, Camera, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PetMap } from "@/components/map/pet-map";
import { usePawFinder } from "@/context/pawfinder-context";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

type Props = {
  lostPostId: string;
  lostPostName?: string;
};

export function SightingForm({ lostPostId, lostPostName }: Props) {
  const router = useRouter();
  const { publishSighting } = usePawFinder();
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [cloudinaryPublicId, setCloudinaryPublicId] = useState<string | undefined>();
  const [note, setNote] = useState("");
  const [locationLabel, setLocationLabel] = useState("");
  const [seenAtLocal, setSeenAtLocal] = useState("");
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(
    null,
  );
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const next: string[] = [];
    if (!locationLabel.trim()) next.push("Agregá una referencia de zona.");
    if (!position) next.push("Marcá un punto en el mapa.");
    if (!contactName.trim()) next.push("Tu nombre es obligatorio.");
    if (!contactPhone.trim()) next.push("Un teléfono de contacto es obligatorio.");
    setErrors(next);
    return next.length === 0;
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      setErrors(["Formato no permitido. Usá JPG, PNG o WebP."]);
      e.target.value = "";
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setErrors(["La imagen no puede superar los 5 MB."]);
      e.target.value = "";
      return;
    }
    setErrors([]);
    setPhotoFile(file);
    setImageUrl(URL.createObjectURL(file));
    setCloudinaryPublicId(undefined);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !position) return;
    setSubmitting(true);
    try {
      let finalImageUrl: string | undefined;
      let publicId = cloudinaryPublicId;

      if (photoFile) {
        const formData = new FormData();
        formData.append("file", photoFile);
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        if (!uploadRes.ok) {
          const uploadError = (await uploadRes.json().catch(() => ({}))) as {
            error?: string;
          };
          throw new Error(uploadError.error || "No se pudo subir la foto");
        }
        const uploaded = (await uploadRes.json()) as {
          url: string;
          publicId: string;
        };
        finalImageUrl = uploaded.url;
        publicId = uploaded.publicId;
      }

      await publishSighting({
        lostPostId,
        note: note.trim(),
        locationLabel: locationLabel.trim(),
        lat: position.lat,
        lng: position.lng,
        seenAt: seenAtLocal
          ? new Date(seenAtLocal).toISOString()
          : undefined,
        imageUrl: finalImageUrl,
        cloudinaryPublicId: publicId,
        contactName: contactName.trim(),
        contactPhone: contactPhone.trim(),
      });
      router.push("/feed");
    } catch (error) {
      setErrors([
        error instanceof Error
          ? error.message
          : "No pudimos enviar el avistamiento. Intentá de nuevo.",
      ]);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-7 px-5 py-5">
      <div>
        <h2 className="font-heading text-xl font-semibold">
          Reportar avistamiento
        </h2>
        <p className="text-sm text-muted-foreground">
          {lostPostName
            ? `Avisale al dueño de ${lostPostName} dónde la viste. No cierra la búsqueda.`
            : "Avisale al dueño dónde la viste. No cierra la búsqueda."}
        </p>
      </div>

      {errors.length > 0 ? (
        <div
          className="flex gap-2 rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
          role="alert"
        >
          <AlertCircle className="size-5 shrink-0" />
          <ul className="list-inside list-disc space-y-0.5">
            {errors.map((err) => (
              <li key={err}>{err}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="space-y-2">
        <Label>Foto (opcional)</Label>
        {imageUrl ? (
          <div className="relative aspect-video overflow-hidden rounded-2xl border border-border/50 bg-muted shadow-sm">
            <Image
              src={imageUrl}
              alt="Vista previa"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 640px"
              unoptimized={imageUrl.startsWith("blob:")}
            />
          </div>
        ) : (
          <div className="flex aspect-video items-center justify-center rounded-2xl border border-dashed border-border/60 bg-muted/40 text-sm text-muted-foreground">
            Sin foto — podés enviar solo la zona y la nota
          </div>
        )}
        <label className="inline-flex h-7 cursor-pointer items-center gap-1 rounded-lg border border-border bg-background px-2.5 text-sm font-medium hover:bg-muted">
          <Camera className="size-4" />
          {imageUrl ? "Cambiar foto" : "Agregar foto"}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={handlePhotoChange}
          />
        </label>
      </div>

      <div className="space-y-2">
        <Label htmlFor="note">Nota / qué viste</Label>
        <Textarea
          id="note"
          rows={3}
          placeholder="Ej: Corría por la vereda hacia el parque, collar rojo…"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="seenAt">Fecha y hora aproximada</Label>
        <Input
          id="seenAt"
          type="datetime-local"
          value={seenAtLocal}
          onChange={(e) => setSeenAtLocal(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="locationLabel">Zona</Label>
        <Input
          id="locationLabel"
          placeholder="Barrio o punto de referencia"
          value={locationLabel}
          onChange={(e) => setLocationLabel(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label>Ubicación en el mapa</Label>
        <PetMap
          posts={[]}
          pickerMode
          pickerPosition={position}
          onPickLocation={(lat, lng) => setPosition({ lat, lng })}
          heightClass="h-56"
        />
        {position ? (
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            <CheckCircle2 className="size-3.5 text-primary" />
            Punto marcado: {position.lat.toFixed(4)}, {position.lng.toFixed(4)}
          </p>
        ) : null}
      </div>

      <div className="pf-surface-soft space-y-4 rounded-2xl p-4">
        <h3 className="font-semibold">Tu contacto</h3>
        <p className="text-xs leading-relaxed text-muted-foreground">
          No se muestra al crear el avistamiento. Solo si el dueño elige «Quiero
          hablar», ve tu teléfono. Vos no ves el del dueño en ese paso.
        </p>
        <div className="space-y-2">
          <Label htmlFor="contactName">Tu nombre</Label>
          <Input
            id="contactName"
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contactPhone">Teléfono / WhatsApp</Label>
          <Input
            id="contactPhone"
            type="tel"
            placeholder="+54 11 …"
            value={contactPhone}
            onChange={(e) => setContactPhone(e.target.value)}
          />
        </div>
      </div>

      <Button
        type="submit"
        className="pf-btn-emphasis w-full rounded-xl shadow-none"
        size="lg"
        disabled={submitting}
      >
        {submitting ? "Enviando…" : "Enviar avistamiento"}
      </Button>
    </form>
  );
}
