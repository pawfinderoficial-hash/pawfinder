"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Camera, CheckCircle2, Clock3, ImageIcon, MapPin, ShieldCheck } from "lucide-react";
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

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const STEPS = ["Qué viste", "Ubicación", "Momento y contacto", "Revisión"] as const;

type Props = {
  lostPostId: string;
  lostPostName?: string;
};

export function SightingForm({ lostPostId, lostPostName }: Props) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const { publishSighting } = usePawFinder();
  const [step, setStep] = useState(0);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [cloudinaryPublicId, setCloudinaryPublicId] = useState<string>();
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

  const showStep = (nextStep: number) => {
    setErrors([]);
    setStep(nextStep);
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const validateStep = (stepToValidate: number) => {
    const next: string[] = [];
    if (stepToValidate === 1) {
      if (!locationLabel.trim()) next.push("Agregá una referencia de zona.");
      if (!position) next.push("Marcá un punto en el mapa.");
    }
    if (stepToValidate === 2) {
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

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (step < STEPS.length - 1) {
      handleNext();
      return;
    }
    if (!validateStep(2) || !position) return;

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

  const sightingTime = seenAtLocal
    ? new Intl.DateTimeFormat("es-AR", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(seenAtLocal))
    : "Ahora o recientemente";

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-6 px-5 py-5">
      <div className="space-y-4">
        <div>
          <h2 className="font-heading text-xl font-semibold">
            Reportar avistamiento
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            {lostPostName
              ? `Avisale a la familia de ${lostPostName} dónde la viste.`
              : "Avisale a la familia dónde viste a la mascota."}
          </p>
        </div>
        <FormStepper steps={STEPS} currentStep={step} />
      </div>

      <FormErrors errors={errors} />

      {step === 0 ? (
        <section className="space-y-5" aria-labelledby="sighting-details-title">
          <div>
            <h3 id="sighting-details-title" className="font-heading text-lg font-semibold">
              ¿Qué viste?
            </h3>
            <p className="text-sm text-muted-foreground">
              La foto y la nota son opcionales, pero ayudan a confirmar el avistamiento.
            </p>
          </div>

          <div className="space-y-2">
            {imageUrl ? (
              <div className="relative aspect-video overflow-hidden rounded-2xl border border-border/50 bg-muted shadow-sm">
                <Image
                  src={imageUrl}
                  alt="Vista previa del avistamiento"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 640px"
                  unoptimized
                />
              </div>
            ) : (
              <div className="flex aspect-video flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border/60 bg-muted/40 text-sm text-muted-foreground">
                <ImageIcon className="size-7" />
                Podés continuar sin foto
              </div>
            )}
            <label className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-xl border border-border bg-background px-3 text-sm font-medium hover:bg-muted">
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
            <Label htmlFor="note">Nota</Label>
            <Textarea
              id="note"
              rows={5}
              placeholder="Ej. Corría hacia el parque, tenía collar rojo…"
              value={note}
              onChange={(event) => setNote(event.target.value)}
            />
          </div>
        </section>
      ) : null}

      {step === 1 ? (
        <section className="space-y-5" aria-labelledby="sighting-location-title">
          <div>
            <h3 id="sighting-location-title" className="font-heading text-lg font-semibold">
              ¿Dónde la viste?
            </h3>
            <p className="text-sm text-muted-foreground">
              Usamos tu ubicación como punto inicial. Ajustala si fue en otro lugar.
            </p>
          </div>
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
          </div>
        </section>
      ) : null}

      {step === 2 ? (
        <section className="space-y-5" aria-labelledby="sighting-contact-title">
          <div>
            <h3 id="sighting-contact-title" className="font-heading text-lg font-semibold">
              Momento y contacto
            </h3>
            <p className="text-sm text-muted-foreground">
              El horario ayuda a reconstruir el recorrido de la mascota.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="seenAt">Fecha y hora aproximada</Label>
            <Input
              id="seenAt"
              type="datetime-local"
              value={seenAtLocal}
              onChange={(event) => setSeenAtLocal(event.target.value)}
            />
          </div>
          <div className="border-t border-border/70 pt-5">
            <p className="mb-4 text-xs leading-relaxed text-muted-foreground">
              Tu teléfono solo se comparte si la familia elige hablar con vos.
            </p>
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
            </div>
          </div>
        </section>
      ) : null}

      {step === 3 ? (
        <section className="space-y-6" aria-labelledby="sighting-review-title">
          <div>
            <h3 id="sighting-review-title" className="font-heading text-lg font-semibold">
              Revisá el avistamiento
            </h3>
            <p className="text-sm text-muted-foreground">
              Confirmá que la zona y el momento sean correctos antes de enviarlo.
            </p>
          </div>

          <div className="flex gap-4">
            {imageUrl ? (
              <div className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-muted">
                <Image
                  src={imageUrl}
                  alt="Foto del avistamiento"
                  fill
                  className="object-cover"
                  sizes="80px"
                  unoptimized
                />
              </div>
            ) : (
              <div className="flex size-20 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                <ImageIcon className="size-6" />
              </div>
            )}
            <div className="min-w-0 space-y-1">
              <p className="font-semibold text-foreground">
                {lostPostName ? `Avistamiento de ${lostPostName}` : "Avistamiento"}
              </p>
              <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                {note.trim() || "Sin nota adicional"}
              </p>
            </div>
          </div>

          <div className="space-y-3 border-t border-border/70 pt-5 text-sm text-muted-foreground">
            <p className="flex items-center gap-2">
              <MapPin className="size-4 shrink-0 text-primary" />
              {locationLabel}
            </p>
            <p className="flex items-center gap-2">
              <Clock3 className="size-4 shrink-0 text-primary" />
              {sightingTime}
            </p>
            <p className="flex items-start gap-2 text-xs leading-relaxed">
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" />
              Tu teléfono permanece oculto hasta que la familia solicite contacto.
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
        submitLabel="Enviar avistamiento"
        submittingLabel="Enviando…"
      />
    </form>
  );
}
