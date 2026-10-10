"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Camera, CheckCircle2, MapPin, ShieldCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PetMap } from "@/components/map/pet-map";
import {
  FormErrors,
  FormStepActions,
  FormStepper,
} from "@/components/publish/form-stepper";
import { usePawFinder } from "@/context/pawfinder-context";
import type { PetKind, PublishDraft } from "@/types/pet";

const DEFAULT_IMAGES: Record<PetKind, string> = {
  lost:
    "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=800&q=80",
  found:
    "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800&q=80",
};

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const STEPS = ["Mascota", "Descripción", "Ubicación", "Revisión"] as const;

const titles: Record<PetKind, { submit: string }> = {
  lost: {
    submit: "Publicar búsqueda",
  },
  found: {
    submit: "Publicar hallazgo",
  },
};

export function PublishForm({
  kind,
  targetLostPostId,
}: {
  kind: PetKind;
  targetLostPostId?: string;
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const { publishPost, clearPublishSuccess } = usePawFinder();
  const [step, setStep] = useState(0);
  const [imageUrl, setImageUrl] = useState(DEFAULT_IMAGES[kind]);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [cloudinaryPublicId, setCloudinaryPublicId] = useState<string>();
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

  const meta = titles[kind];

  const showStep = (nextStep: number) => {
    setErrors([]);
    setStep(nextStep);
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const validateStep = (stepToValidate: number) => {
    const next: string[] = [];

    if (stepToValidate === 0 && !species.trim()) {
      next.push("Indicá si es perro, gato u otra especie.");
    }
    if (
      stepToValidate === 1 &&
      (!description.trim() || description.trim().length < 20)
    ) {
      next.push("La descripción debe tener al menos 20 caracteres.");
    }
    if (stepToValidate === 2) {
      if (!locationLabel.trim()) {
        next.push("Agregá una referencia de ubicación.");
      }
      if (!position) next.push("Marcá un punto en el mapa.");
    }
    if (stepToValidate === 3) {
      if (!contactName.trim()) next.push("Tu nombre es obligatorio.");
      if (!contactPhone.trim()) {
        next.push("Un teléfono de contacto es obligatorio.");
      }
    }

    setErrors(next);
    return next.length === 0;
  };

  const handleNext = () => {
    if (!validateStep(step)) return;
    showStep(Math.min(step + 1, STEPS.length - 1));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (step < STEPS.length - 1) {
      handleNext();
      return;
    }
    if (!validateStep(3) || !position) return;

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

      const draft: PublishDraft = {
        kind,
        name: name.trim(),
        species: species.trim(),
        breed: breed.trim(),
        description: description.trim(),
        locationLabel: locationLabel.trim(),
        lat: position.lat,
        lng: position.lng,
        imageUrl: finalImageUrl,
        contactName: contactName.trim(),
        contactPhone: contactPhone.trim(),
        contactEmail: contactEmail.trim(),
        ...(kind === "found" && targetLostPostId
          ? { targetLostPostId }
          : {}),
      };
      clearPublishSuccess();
      await publishPost({ ...draft, cloudinaryPublicId: publicId });
      router.push(kind === "found" && targetLostPostId ? "/match" : "/feed");
    } catch (error) {
      setErrors([
        error instanceof Error
          ? error.message
          : "No pudimos publicar. Revisá tu conexión e intentá de nuevo.",
      ]);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      setErrors(["Formato no permitido. Usá JPG, PNG o WebP."]);
      event.target.value = "";
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setErrors(["La imagen no puede superar los 5 MB."]);
      event.target.value = "";
      return;
    }
    setErrors([]);
    setPhotoFile(file);
    setImageUrl(URL.createObjectURL(file));
    setCloudinaryPublicId(undefined);
  };

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="pf-wizard-form space-y-4 px-4 py-4 sm:space-y-6 sm:px-5 sm:py-5"
    >
      <FormStepper steps={STEPS} currentStep={step} />

      <FormErrors errors={errors} />

      {step === 0 ? (
        <section className="space-y-4" aria-label="Foto e identificación">
          <div className="space-y-2">
            <div className="relative aspect-video overflow-hidden rounded-2xl border border-border/50 bg-muted shadow-sm">
              <Image
                src={imageUrl}
                alt="Vista previa de la mascota"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 640px"
                unoptimized={imageUrl.startsWith("blob:")}
              />
            </div>
            <label className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-xl border border-border bg-background px-3 text-sm font-medium hover:bg-muted">
              <Camera className="size-4" />
              Cambiar foto
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
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
                  placeholder="Ej. Luna"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                />
              </div>
            ) : null}
            <div className="space-y-2">
              <Label htmlFor="species">Especie</Label>
              <Input
                id="species"
                placeholder="Perro, gato…"
                value={species}
                onChange={(event) => setSpecies(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="breed">Raza o aspecto</Label>
              <Input
                id="breed"
                placeholder="Mestiza, siamés…"
                value={breed}
                onChange={(event) => setBreed(event.target.value)}
              />
            </div>
          </div>
        </section>
      ) : null}

      {step === 1 ? (
        <section className="space-y-3" aria-label="Descripción">
          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              rows={7}
              placeholder="Ej. Pelaje marrón, collar rojo, tiene una mancha blanca en el pecho…"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
            <p className="text-right text-xs text-muted-foreground">
              {description.trim().length}/20 caracteres mínimos
            </p>
          </div>
        </section>
      ) : null}

      {step === 2 ? (
        <section className="space-y-4" aria-label="Ubicación">
          <div className="space-y-2">
            <Label htmlFor="locationLabel">Zona o referencia</Label>
            <Input
              id="locationLabel"
              placeholder="Barrio, plaza o esquina cercana"
              value={locationLabel}
              onChange={(event) => setLocationLabel(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Marcá el punto en el mapa</Label>
            <PetMap
              posts={[]}
              pickerMode
              pickerPosition={position}
              onPickLocation={(lat, lng) => setPosition({ lat, lng })}
              heightClass="h-[min(48vh,360px)]"
            />
            {position ? (
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <CheckCircle2 className="size-3.5 text-primary" />
                Ubicación seleccionada
              </p>
            ) : (
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <MapPin className="size-3.5" />
                Tocá el mapa para marcar la ubicación
              </p>
            )}
            <p className="text-xs leading-relaxed text-muted-foreground">
              El aviso público desplaza levemente el punto para proteger la
              ubicación exacta.
            </p>
          </div>
        </section>
      ) : null}

      {step === 3 ? (
        <section className="space-y-5" aria-label="Contacto y revisión">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="contactName">Tu nombre</Label>
              <Input
                id="contactName"
                value={contactName}
                onChange={(event) => setContactName(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactPhone">Teléfono / WhatsApp</Label>
              <Input
                id="contactPhone"
                type="tel"
                inputMode="tel"
                placeholder="+54 376…"
                value={contactPhone}
                onChange={(event) => setContactPhone(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactEmail">Email (opcional)</Label>
              <Input
                id="contactEmail"
                type="email"
                inputMode="email"
                value={contactEmail}
                onChange={(event) => setContactEmail(event.target.value)}
              />
            </div>
          </div>

          <div className="border-t border-border/70 pt-5">
            <div className="flex gap-4">
              <div className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-muted">
                <Image
                  src={imageUrl}
                  alt="Foto del aviso"
                  fill
                  className="object-cover"
                  sizes="80px"
                  unoptimized={imageUrl.startsWith("blob:")}
                />
              </div>
              <div className="min-w-0 space-y-1">
                <p className="font-semibold text-foreground">
                  {name.trim() || (kind === "found" ? "Mascota encontrada" : "Mascota")}
                </p>
                <p className="text-sm text-muted-foreground">
                  {[species.trim(), breed.trim()].filter(Boolean).join(" · ")}
                </p>
                <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                  {description}
                </p>
              </div>
            </div>
            <p className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="size-4 shrink-0 text-primary" />
              {locationLabel}
            </p>
            <p className="mt-3 flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" />
              La ubicación exacta y tus datos de contacto quedan protegidos.
            </p>
          </div>
        </section>
      ) : null}

      <FormStepActions
        currentStep={step}
        totalSteps={STEPS.length}
        onBack={() => showStep(step - 1)}
        onNext={handleNext}
        submitting={submitting}
        submitLabel={meta.submit}
      />
    </form>
  );
}
