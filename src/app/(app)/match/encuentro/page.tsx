"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppHeader } from "@/components/layout/app-header";
import { usePawFinder } from "@/context/pawfinder-context";
import { MOCK_MEETING_POINTS } from "@/lib/mock-meeting-points";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  Home,
  MapPin,
  Phone,
  Store,
  Stethoscope,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function MatchEncuentroPage() {
  const router = useRouter();
  const {
    encounterMatch,
    encounterResult,
    completeEncounterAtHome,
    completeEncounterAtPoint,
    clearEncounterFlow,
  } = usePawFinder();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (!encounterMatch && !encounterResult) {
        router.replace("/match");
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, [encounterMatch, encounterResult, router]);

  if (encounterResult) {
    const locationText =
      encounterResult.mode === "home"
        ? "domicilio a coordinar entre ustedes"
        : `${encounterResult.point.name} — ${encounterResult.point.address}`;

    return (
      <>
        <AppHeader
          title="Encuentro acordado"
          subtitle="Demo — sin envío real de mensajes"
        />
        <div className="space-y-5 px-4 py-6">
          <div className="rounded-2xl border border-primary/20 bg-primary/10 p-5 text-center">
            <CheckCircle2 className="mx-auto size-10 text-primary" />
            <h2 className="mt-3 font-heading text-xl font-semibold">
              Encuentro acordado en {encounterResult.mode === "home" ? "domicilio" : encounterResult.point.name}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {locationText}
            </p>
          </div>
          {encounterMatch ? (
            <div className="rounded-2xl border border-border/50 bg-card/90 p-4 text-sm leading-relaxed">
              <p className="font-medium text-foreground">Recordatorio de contacto</p>
              <p className="mt-2 text-muted-foreground">
                Coordiná día y hora por teléfono con{" "}
                <span className="font-medium text-foreground">
                  {encounterMatch.finderName}
                </span>{" "}
                ({encounterMatch.foundPost.contactPhone}). Llevá documentación del
                animal y, si podés, un familiar o vecino de confianza.
              </p>
              <p className="mt-3 flex items-center gap-2 text-foreground/90">
                <Phone className="size-4 shrink-0 text-primary" />
                {encounterMatch.foundPost.contactPhone}
              </p>
            </div>
          ) : null}
          <Button
            className="pf-btn-emphasis w-full rounded-xl"
            onClick={() => {
              clearEncounterFlow();
              router.push("/feed");
            }}
          >
            Volver a explorar
          </Button>
          <Link
            href="/match"
            className="block text-center text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            Ir a Match
          </Link>
        </div>
      </>
    );
  }

  if (!encounterMatch) {
    return null;
  }

  return (
    <>
      <AppHeader
        title="Punto de encuentro"
        subtitle={`Con ${encounterMatch.finderName} — elegí cómo reunirse`}
      />
      <div className="space-y-5 px-4 py-4">
        <p className="text-sm leading-relaxed text-muted-foreground">
          Elegí un lugar seguro. Los puntos fijos son veterinarias y locales
          auspiciantes (datos de demo).
        </p>

        <button
          type="button"
          onClick={completeEncounterAtHome}
          className="flex w-full items-start gap-3 rounded-2xl border border-border/50 bg-card/90 p-4 text-left shadow-sm transition-colors hover:border-primary/25 hover:bg-primary/[0.04]"
        >
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Home className="size-5" />
          </span>
          <span>
            <span className="block font-heading text-base font-semibold">
              Domicilio a coordinar
            </span>
            <span className="mt-1 block text-sm text-muted-foreground">
              Las partes arreglan en casa o por contacto directo. Ideal si ya se
              conocen o viven cerca.
            </span>
          </span>
        </button>

        <div>
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
            <MapPin className="size-4 text-primary" />
            Punto fijo
          </h3>
          <ul className="space-y-3">
            {MOCK_MEETING_POINTS.map((point) => {
              const isSponsor = point.type === "sponsor";
              return (
                <li key={point.id}>
                  <button
                    type="button"
                    onClick={() => completeEncounterAtPoint(point.id)}
                    className={cn(
                      "w-full rounded-2xl border border-border/50 bg-card/90 p-4 text-left shadow-sm transition-colors hover:border-primary/25 hover:bg-primary/[0.04]",
                      isSponsor && "border-amber-200/50 bg-amber-50/40 dark:bg-amber-950/15",
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className={cn(
                          "flex size-10 shrink-0 items-center justify-center rounded-xl",
                          isSponsor
                            ? "bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-100"
                            : "bg-secondary text-secondary-foreground",
                        )}
                      >
                        {point.type === "vet" ? (
                          <Stethoscope className="size-5" />
                        ) : (
                          <Store className="size-5" />
                        )}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-center gap-2">
                          <span className="font-heading font-semibold">
                            {point.name}
                          </span>
                          {point.sponsorLabel ? (
                            <Badge
                              variant="secondary"
                              className="border-amber-200/80 bg-amber-100/80 text-amber-950"
                            >
                              {point.sponsorLabel}
                            </Badge>
                          ) : null}
                        </span>
                        <span className="mt-1 block text-sm text-muted-foreground">
                          {point.address}
                        </span>
                        <span className="mt-1 block text-xs text-muted-foreground">
                          {point.hours}
                        </span>
                      </span>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <Link
          href="/match"
          className="block pt-2 text-center text-sm text-muted-foreground underline-offset-4 hover:underline"
        >
          Cancelar y volver
        </Link>
      </div>
    </>
  );
}
