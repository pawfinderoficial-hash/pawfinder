"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Camera, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PetMap } from "@/components/map/pet-map";
import { usePawFinder } from "@/context/pawfinder-context";
import type { PetKind, PublishDraft } from "@/types/pet";

const DEFAULT_IMAGES: Record<PetKind, string> = {
  lost:
    "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=800&q=80",
  found:
    "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800&q=80",
};

const titles: Record<PetKind, { heading: string; submit: string }> = {
  lost: {
    heading: "Publicar mascota perdida",
    submit: "Publicar aviso de búsqueda",
  },
  found: {
    heading: "Publicar mascota encontrada",
    submit: "Publicar aviso de hallazgo",
  },
};

export function PublishForm({ kind }: { kind: PetKind }) {
  const router = useRouter();
  const { publishPost, clearPublishSuccess } = usePawFinder();
  const [imageUrl, setImageUrl] = useState(DEFAULT_IMAGES[kind]);
  const [name, setName] = useState("");
  const [species, setSpecies] = useState(kind === "lost" ? "Perro" : "");
  const [breed, setBreed] = useState("");
  const [description, setDescription] = useState("");
  const [locationLabel, setLocationLabel] = useState("");
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(
    null,
  );
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const next: string[] = [];
    if (!species.trim()) next.push("Indicá si es perro, gato u otra especie.");
    if (!description.trim() || description.length < 20)
      next.push("La descripción debe tener al menos 20 caracteres.");
    if (!locationLabel.trim()) next.push("Agregá una referencia de ubicación.");
    if (!position) next.push("Marcá un punto en el mapa.");
    if (!contactName.trim()) next.push("Tu nombre es obligatorio.");
    if (!contactPhone.trim()) next.push("Un teléfono de contacto es obligatorio.");
    setErrors(next);
    return next.length === 0;
  };

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [cloudinaryPublicId, setCloudinaryPublicId] = useState<string | undefined>();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      let finalImageUrl = imageUrl;
      let publicId = cloudinaryPublicId;

      if (photoFile) {
        const formData = new FormData();
        formData.append("file", photoFile);
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        if (!uploadRes.ok) {
          throw new Error("No se pudo subir la foto");
        }
        const uploaded = (await uploadRes.json()) as {
          url: string;
          publicId: string;
        };
        finalImageUrl = uploaded.url;
        publicId = uploaded.publicId;
      }

      const draft: PublishDraft = {
        kind,
        name,
        species,
        breed,
        description,
        locationLabel,
        lat: position!.lat,
        lng: position!.lng,
        imageUrl: finalImageUrl,
        contactName,
        contactPhone,
        contactEmail,
      };
      clearPublishSuccess();
      await publishPost({ ...draft, cloudinaryPublicId: publicId });
      router.push("/feed");
    } catch {
      setErrors(["No pudimos publicar. Revisá tu conexión e intentá de nuevo."]);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const url = URL.createObjectURL(file);
      setImageUrl(url);
      setCloudinaryPublicId(undefined);
    }
  };

  const meta = titles[kind];

  return (
    <form onSubmit={handleSubmit} className="space-y-7 px-5 py-5">
      <div>
        <h2 className="font-heading text-xl font-semibold">{meta.heading}</h2>
        <p className="text-sm text-muted-foreground">
          La foto se sube a Cloudinary y el aviso queda guardado en la base de datos.
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
        <Label>Foto</Label>
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
        <label
          className="inline-flex h-7 cursor-pointer items-center gap-1 rounded-lg border border-border bg-background px-2.5 text-sm font-medium hover:bg-muted"
        >
          <Camera className="size-4" />
          Cambiar foto (ejemplo local)
          <input
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={handlePhotoChange}
          />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {kind === "lost" ? (
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="name">Nombre de la mascota</Label>
            <Input
              id="name"
              placeholder="Ej: Luna"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        ) : null}
        <div className="space-y-2">
          <Label htmlFor="species">Especie</Label>
          <Input
            id="species"
            placeholder="Perro, gato…"
            value={species}
            onChange={(e) => setSpecies(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="breed">Raza</Label>
          <Input
            id="breed"
            placeholder="Ej. Mestiza, Siamés, color o collar…"
            value={breed}
            onChange={(e) => setBreed(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descripción</Label>
        <Textarea
          id="description"
          rows={4}
          placeholder="Contá qué pasó, señas particulares, horario aproximado…"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="locationLabel">Zona aproximada visible</Label>
        <Input
          id="locationLabel"
          placeholder="Barrio o punto de referencia, sin domicilio exacto"
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
        <p className="text-xs leading-relaxed text-muted-foreground">
          El mapa publico desplaza levemente el punto. La ubicacion exacta queda
          protegida y solo se usa para buscar coincidencias cercanas.
        </p>
      </div>

      <div className="pf-surface-soft space-y-4 rounded-2xl p-4">
        <h3 className="font-semibold">Contacto</h3>
        <p className="text-xs leading-relaxed text-muted-foreground">
          Estos datos no aparecen en el aviso publico. Se habilitan cuando ambas
          partes confirman una posible coincidencia.
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
        <div className="space-y-2">
          <Label htmlFor="contactEmail">Email (opcional)</Label>
          <Input
            id="contactEmail"
            type="email"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
          />
        </div>
      </div>

      <Button
        type="submit"
        className="pf-btn-emphasis w-full rounded-xl shadow-none"
        size="lg"
        disabled={submitting}
      >
        {submitting ? "Publicando…" : meta.submit}
      </Button>
    </form>
  );
}
