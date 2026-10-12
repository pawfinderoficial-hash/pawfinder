"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { flushSync } from "react-dom";
import { useState } from "react";
import { AppHeader } from "@/components/layout/app-header";
import { usePawFinder } from "@/context/pawfinder-context";
import { Button } from "@/components/ui/button";
import { PetPostCard } from "@/components/pet/pet-post-card";
import { ImageGallery } from "@/components/pet/image-gallery";
import type { PendingSighting } from "@/types/pet";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import {
  Eye,
  HeartHandshake,
  LockKeyhole,
  MessageCircle,
  PartyPopper,
  X,
} from "lucide-react";

function SightingCard({
  sighting,
  onContact,
  onDismiss,
}: {
  sighting: PendingSighting;
  onContact: () => Promise<{ contactPhone: string; contactName: string }>;
  onDismiss: () => Promise<void>;
}) {
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const phone = sighting.contactPhone;

  const runAction = async (action: () => Promise<void>) => {
    setBusy(true);
    setActionError(null);
    try {
      await action();
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : "No pudimos completar la acción. Intentá de nuevo.",
      );
    } finally {
      setBusy(false);
    }
  };

  const openWhatsApp = async () => {
    setBusy(true);
    setActionError(null);
    try {
      const contact = phone
        ? { contactPhone: phone }
        : await onContact();
      window.location.assign(
        buildWhatsAppUrl(
          contact.contactPhone,
          `Hola, soy quien busca a ${sighting.lostPost.name}. Vi tu avistamiento en PawFinder. ¿Podemos hablar?`,
        ),
      );
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : "No pudimos abrir WhatsApp. Intentá de nuevo.",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <article className="space-y-3 rounded-2xl border border-border/50 bg-card/90 p-4 shadow-sm">
      <div className="flex items-start gap-3">
        {sighting.imageUrl ? (
          <ImageGallery
            images={
              sighting.imageUrls.length > 0
                ? sighting.imageUrls
                : [sighting.imageUrl]
            }
            alt={`Avistamiento de ${sighting.lostPost.name}`}
            className="size-16 shrink-0 rounded-xl"
            compact
          />
        ) : (
          <div className="flex size-16 shrink-0 items-center justify-center rounded-xl bg-muted">
            <Eye className="size-6 text-muted-foreground" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Avistamiento · {sighting.lostPost.name}
          </p>
          <p className="mt-0.5 font-heading text-base font-semibold">
            {sighting.reporterName}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {sighting.locationLabel}
            {sighting.seenAt
              ? ` · ${new Date(sighting.seenAt).toLocaleString("es-AR", {
                  day: "numeric",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                })}`
              : null}
          </p>
        </div>
      </div>
      <p className="text-sm leading-relaxed text-foreground/90">{sighting.note}</p>

      {actionError ? (
        <p
          className="rounded-xl border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
          role="alert"
        >
          {actionError}
        </p>
      ) : null}

      <div className="grid grid-cols-[1fr_3.25rem] gap-2">
        <Button
          className="pf-btn-emphasis min-h-12 rounded-xl shadow-none"
          disabled={busy}
          onClick={() => void openWhatsApp()}
        >
          <MessageCircle className="size-5" />
          Abrir WhatsApp
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-[3.25rem] rounded-xl text-destructive hover:bg-destructive/10 hover:text-destructive"
          disabled={busy}
          onClick={() => void runAction(onDismiss)}
          aria-label="Descartar avistamiento"
          title="Descartar"
        >
          <X className="size-5" />
        </Button>
      </div>
    </article>
  );
}

export default function MatchPage() {
  const router = useRouter();
  const {
    pendingMatch,
    pendingSightings,
    beginEncounterAfterConfirm,
    rejectMatch,
    contactSighting,
    dismissSighting,
  } = usePawFinder();

  const handleConfirm = () => {
    flushSync(() => {
      beginEncounterAfterConfirm();
    });
    router.push("/match/encuentro");
  };

  const hasMatch = Boolean(pendingMatch);
  const hasSightings = pendingSightings.length > 0;

  if (!hasMatch && !hasSightings) {
    return (
      <>
        <AppHeader title="Match" />
        <div className="flex flex-col items-center px-6 py-16 text-center">
          <div className="pf-empty-icon mb-4">
            <HeartHandshake className="size-8" />
          </div>
          <h2 className="font-heading text-xl font-semibold">
            No tenés novedades pendientes
          </h2>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
            Acá vas a ver matches de hallazgo y avistamientos sobre tus mascotas
            perdidas.
          </p>
          <Link
            href="/feed"
            className="mt-6 text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            Volver al feed
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <AppHeader title={hasMatch ? "¡Posible match!" : "Avistamientos"} />
      <div className="space-y-6 px-4 py-4">
        {hasMatch ? (
          <section className="space-y-5">
            <div className="rounded-2xl border border-primary/15 bg-primary/10 p-4 text-sm leading-relaxed text-foreground/90">
              {pendingMatch!.message}
            </div>

            <PetPostCard post={pendingMatch!.foundPost} priority />

            <div className="flex gap-2 rounded-2xl border border-border/50 bg-muted/40 p-3 text-sm text-muted-foreground">
              <LockKeyhole className="mt-0.5 size-4 shrink-0 text-primary" />
              <p>
                El telefono se habilita despues de confirmar la coincidencia. No se
                muestra contacto personal en publicaciones publicas.
              </p>
            </div>

            <p className="text-center text-sm text-muted-foreground">
              ¿Es tu mascota? Confirmá solo si estás seguro/a.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                size="lg"
                className="pf-btn-emphasis flex-1 rounded-xl shadow-none"
                onClick={handleConfirm}
              >
                <PartyPopper className="size-5" />
                Confirmar — ¡es mi mascota!
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="flex-1"
                onClick={rejectMatch}
              >
                Rechazar
              </Button>
            </div>
          </section>
        ) : null}

        {hasSightings ? (
          <section className="space-y-3">
            {hasMatch ? (
              <div>
                <h2 className="font-heading text-lg font-semibold">
                  Avistamientos
                </h2>
                <p className="text-xs text-muted-foreground">
                  No cierran tu aviso de búsqueda
                </p>
              </div>
            ) : null}
            {pendingSightings.map((s) => (
              <SightingCard
                key={s.id}
                sighting={s}
                onContact={() => contactSighting(s.id)}
                onDismiss={() => dismissSighting(s.id)}
              />
            ))}
          </section>
        ) : null}
      </div>
    </>
  );
}
