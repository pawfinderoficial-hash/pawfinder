"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { CheckCircle2, Clock3, ImageIcon, MapPin, ShieldCheck } from "lucide-react";
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
import {
  MultiPhotoPicker,
  type PendingPhoto,
  uploadPendingPhotos,
} from "@/components/publish/multi-photo-picker";

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
  const [photos, setPhotos] = useState<PendingPhoto[]>([]);
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

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (step < STEPS.length - 1) {
      handleNext();
      return;
    }
    if (!validateStep(2) || !position) return;

    setSubmitting(true);
    try {
      const { imageUrls, cloudinaryPublicIds } =
        await uploadPendingPhotos(photos);

      await publishSighting({
        lostPostId,
        note: note.trim(),
        locationLabel: locationLabel.trim(),
        lat: position.lat,
        lng: position.lng,
        seenAt: seenAtLocal
          ? new Date(seenAtLocal).toISOString()
          : undefined,
        imageUrl: imageUrls[0],
        imageUrls,
        cloudinaryPublicId: cloudinaryPublicIds[0],
        cloudinaryPublicIds,
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
        hour12: false,
      }).format(new Date(seenAtLocal))
    : "Ahora o recientemente";

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="pf-wizard-form space-y-4 px-4 py-4 sm:space-y-6 sm:px-5 sm:py-5"
    >
      <FormStepper steps={STEPS} currentStep={step} />

      <FormErrors errors={errors} />

      {step === 0 ? (
        <section className="space-y-4" aria-label="Qué viste">
          <MultiPhotoPicker
            photos={photos}
            onChange={(nextPhotos) => {
              setErrors([]);
              setPhotos(nextPhotos);
            }}
            onError={(message) => setErrors([message])}
            optional
          />

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
          </div>
        </section>
      ) : null}

      {step === 2 ? (
        <section className="space-y-4" aria-label="Momento y contacto">
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
        <section className="space-y-5" aria-label="Revisión">
          <div className="flex gap-4">
            {photos[0] ? (
              <div className="relative flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-muted text-xs text-muted-foreground">
                <Image
                  src={photos[0].url}
                  alt="Foto del avistamiento"
                  fill
                  className="object-cover"
                  sizes="80px"
                  unoptimized
                />
                {photos.length > 1 ? (
                  <span className="absolute bottom-1 right-1 rounded-md bg-black/65 px-1.5 py-0.5 text-[0.6rem] font-semibold text-white">
                    +{photos.length - 1}
                  </span>
                ) : null}
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
