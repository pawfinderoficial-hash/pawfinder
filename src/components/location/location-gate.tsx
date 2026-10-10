"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, LocateFixed, MapPinCheck, MapPinOff, PawPrint } from "lucide-react";
import { Button } from "@/components/ui/button";

type LocationGateStatus =
  | "checking"
  | "requesting"
  | "granted"
  | "denied"
  | "unavailable";

export function LocationGate({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<LocationGateStatus>("checking");
  const permissionRef = useRef<PermissionStatus | null>(null);

  const requestLocation = useCallback(() => {
    if (!window.isSecureContext || !navigator.geolocation) {
      setStatus("unavailable");
      return;
    }

    setStatus("requesting");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        sessionStorage.setItem(
          "pawfinder:user-location",
          JSON.stringify({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            capturedAt: Date.now(),
          }),
        );
        setStatus("granted");
      },
      (error) => {
        setStatus(
          error.code === error.PERMISSION_DENIED ? "denied" : "unavailable",
        );
      },
      { enableHighAccuracy: true, timeout: 15_000, maximumAge: 30_000 },
    );
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(requestLocation, 0);

    if (navigator.permissions) {
      void navigator.permissions
        .query({ name: "geolocation" })
        .then((permission) => {
          permissionRef.current = permission;
          permission.onchange = requestLocation;
        })
        .catch(() => {
          // Some browsers expose geolocation without exposing its permission state.
        });
    }

    return () => {
      window.clearTimeout(timer);
      if (permissionRef.current) permissionRef.current.onchange = null;
    };
  }, [requestLocation]);

  if (status === "granted") return children;

  const isBusy = status === "checking" || status === "requesting";
  const isDenied = status === "denied";

  return (
    <main className="pf-atmosphere flex min-h-dvh items-center justify-center px-5 py-8">
      <section className="w-full max-w-md text-center" aria-live="polite">
        <div className="mx-auto mb-6 flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <PawPrint className="size-7" strokeWidth={2.25} />
        </div>
        <p className="mb-2 text-sm font-semibold text-primary">PawFinder</p>
        <h1 className="font-heading text-2xl font-semibold text-foreground">
          Necesitamos tu ubicación
        </h1>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
          La usamos para mostrar mascotas y puntos de encuentro cercanos a tu
          ciudad. Es necesaria para continuar.
        </p>

        <div className="pf-surface mt-7 rounded-2xl p-5 text-left">
          <div className="flex gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              {isBusy ? (
                <Loader2 className="size-5 animate-spin" />
              ) : isDenied ? (
                <MapPinOff className="size-5 text-destructive" />
              ) : (
                <MapPinCheck className="size-5" />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground">
                {isBusy
                  ? "Esperando permiso"
                  : isDenied
                    ? "La ubicación está bloqueada"
                    : "No pudimos obtener tu ubicación"}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                {isDenied
                  ? "Abrí el icono junto a la dirección del sitio, entrá en permisos y cambiá Ubicación a Permitir."
                  : status === "unavailable"
                    ? "Abrí PawFinder desde http://localhost:43123 y verificá que la ubicación esté habilitada en el navegador y en tu computadora."
                    : "Aceptá la solicitud de ubicación que muestra el navegador."}
              </p>
            </div>
          </div>
        </div>

        <Button
          type="button"
          size="lg"
          className="mt-5 w-full"
          onClick={requestLocation}
          disabled={isBusy}
        >
          {isBusy ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <LocateFixed className="size-4" />
          )}
          {isBusy ? "Solicitando ubicación…" : "Volver a intentar"}
        </Button>
      </section>
    </main>
  );
}
