"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, LocateFixed, MapPinCheck, MapPinOff, PawPrint } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ARGENTINA_CITIES, nearestCity } from "@/lib/argentina-cities";
import {
  readBrowserLocation,
  storeBrowserLocation,
} from "@/lib/browser-location";

type LocationGateStatus =
  | "checking"
  | "ready"
  | "requesting"
  | "granted"
  | "denied"
  | "unavailable";

export function LocationGate({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<LocationGateStatus>("checking");
  const [isIos, setIsIos] = useState(false);
  const [cityValue, setCityValue] = useState("");
  const permissionRef = useRef<PermissionStatus | null>(null);

  const requestLocation = useCallback(() => {
    if (!window.isSecureContext || !navigator.geolocation) {
      setStatus("unavailable");
      return;
    }

    setStatus("requesting");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const city = nearestCity(position.coords.latitude, position.coords.longitude);
        storeBrowserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          capturedAt: Date.now(),
          city: `${city.name}, ${city.province}`,
          radiusKm: 20,
          source: "gps",
        });
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
    let timer: number | undefined;
    if (readBrowserLocation()) {
      timer = window.setTimeout(() => setStatus("granted"), 0);
      return () => window.clearTimeout(timer);
    }

    const platformTimer = window.setTimeout(
      () => setIsIos(/iPhone|iPad|iPod/i.test(navigator.userAgent)),
      0,
    );

    if (navigator.permissions) {
      void navigator.permissions
        .query({ name: "geolocation" })
        .then((permission) => {
          permissionRef.current = permission;
          const handlePermission = () => {
            if (permission.state === "granted") {
              requestLocation();
              return;
            }
            setStatus(permission.state === "denied" ? "denied" : "ready");
          };
          permission.onchange = handlePermission;
          handlePermission();
        })
        .catch(() => {
          timer = window.setTimeout(() => setStatus("ready"), 0);
        });
    } else {
      timer = window.setTimeout(() => setStatus("ready"), 0);
    }

    return () => {
      window.clearTimeout(platformTimer);
      if (timer !== undefined) window.clearTimeout(timer);
      if (permissionRef.current) permissionRef.current.onchange = null;
    };
  }, [requestLocation]);

  if (status === "granted") return children;

  const isChecking = status === "checking";
  const isRequesting = status === "requesting";
  const isBusy = isChecking || isRequesting;
  const isDenied = status === "denied";

  const chooseCity = () => {
    const city = ARGENTINA_CITIES.find(
      (candidate) => `${candidate.name}|${candidate.province}` === cityValue,
    );
    if (!city) return;
    storeBrowserLocation({
      lat: city.lat,
      lng: city.lng,
      capturedAt: Date.now(),
      city: `${city.name}, ${city.province}`,
      radiusKm: 20,
      source: "manual",
    });
    setStatus("granted");
  };

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
          ciudad. Podés usar el GPS o elegirla manualmente.
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
                {isChecking
                  ? "Comprobando el permiso"
                  : isRequesting
                    ? "Esperando tu confirmación"
                  : isDenied
                    ? "La ubicación está bloqueada"
                    : status === "ready"
                      ? "Activá la ubicación"
                      : "No pudimos obtener tu ubicación"}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                {isDenied
                  ? isIos
                    ? "En Ajustes del iPhone, abrí Privacidad y seguridad > Localización > Safari Websites o Chrome, y elegí Al usar la app."
                    : "Abrí el icono junto a la dirección del sitio, entrá en permisos y cambiá Ubicación a Permitir."
                  : status === "unavailable"
                    ? "Abrí PawFinder desde http://localhost:43123 y verificá que la ubicación esté habilitada en el navegador y en tu computadora."
                    : status === "ready"
                      ? "Tocá el botón y el navegador te preguntará si querés compartirla."
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
          {isBusy
            ? "Solicitando ubicación…"
            : status === "ready"
              ? "Permitir ubicación"
              : "Volver a intentar"}
        </Button>

        <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" />o<span className="h-px flex-1 bg-border" />
        </div>
        <div className="flex gap-2">
          <select
            value={cityValue}
            onChange={(event) => setCityValue(event.target.value)}
            className="min-h-11 min-w-0 flex-1 rounded-xl border border-input bg-background px-3 text-sm"
            aria-label="Elegir ciudad"
          >
            <option value="">Elegir ciudad</option>
            {ARGENTINA_CITIES.map((city) => (
              <option key={`${city.name}-${city.province}`} value={`${city.name}|${city.province}`}>
                {city.name}, {city.province}
              </option>
            ))}
          </select>
          <Button type="button" variant="outline" onClick={chooseCity} disabled={!cityValue}>
            Continuar
          </Button>
        </div>
      </section>
    </main>
  );
}
