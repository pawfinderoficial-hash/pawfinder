"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { flushSync } from "react-dom";
import { AppHeader } from "@/components/layout/app-header";
import { usePawFinder } from "@/context/pawfinder-context";
import { Button } from "@/components/ui/button";
import { PetPostCard } from "@/components/pet/pet-post-card";
import {
  HeartHandshake,
  LockKeyhole,
  PartyPopper,
} from "lucide-react";

export default function MatchPage() {
  const router = useRouter();
  const {
    pendingMatch,
    beginEncounterAfterConfirm,
    rejectMatch,
  } = usePawFinder();

  const handleConfirm = () => {
    flushSync(() => {
      beginEncounterAfterConfirm();
    });
    router.push("/match/encuentro");
  };

  if (!pendingMatch) {
    return (
      <>
        <AppHeader title="Match" subtitle="Posibles reuniones" />
        <div className="flex flex-col items-center px-6 py-16 text-center">
          <div className="pf-empty-icon mb-4">
            <HeartHandshake className="size-8" />
          </div>
          <h2 className="font-heading text-xl font-semibold">
            No tenés matches pendientes
          </h2>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
            Cuando alguien crea que encontró a tu mascota, vas a poder confirmar
            o rechazar acá.
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

  const { foundPost, message, finderName } = pendingMatch;

  return (
    <>
      <AppHeader title="¡Posible match!" subtitle={`Mensaje de ${finderName}`} />
      <div className="space-y-5 px-4 py-4">
        <div className="rounded-2xl border border-primary/15 bg-primary/10 p-4 text-sm leading-relaxed text-foreground/90">
          {message}
        </div>

        <PetPostCard post={foundPost} priority />

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
      </div>
    </>
  );
}
