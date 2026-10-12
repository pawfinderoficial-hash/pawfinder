"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Loader2, LocateFixed, MapPin, MapPinCheck, MapPinOff, PawPrint, Search } from "lucide-react";
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
  const [cityPickerOpen, setCityPickerOpen] = useState(false);
  const [cityQuery, setCityQuery] = useState("");
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

  const visibleCities = useMemo(() => {
    const normalized = cityQuery.trim().toLocaleLowerCase("es");
    if (!normalized) return ARGENTINA_CITIES;
    return ARGENTINA_CITIES.filter((city) =>
      `${city.name} ${city.province}`.toLocaleLowerCase("es").includes(normalized),
    );
  }, [cityQuery]);

  if (status === "granted") return children;

  const isChecking = status === "checking";
  const isRequesting = status === "requesting";
  const isBusy = isChecking || isRequesting;
  const isDenied = status === "denied";

  const chooseCity = (city: (typeof ARGENTINA_CITIES)[number]) => {
    storeBrowserLocation({
      lat: city.lat,
      lng: city.lng,
      capturedAt: 0,
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
        <button
          type="button"
          onClick={() => setCityPickerOpen((current) => !current)}
          className="flex min-h-12 w-full items-center gap-3 rounded-xl border border-input bg-card px-4 text-left text-sm font-semibold shadow-sm"
          aria-expanded={cityPickerOpen}
        >
          <MapPin className="size-5 shrink-0 text-primary" />
          <span className="flex-1">Elegir ciudad manualmente</span>
          <ChevronDown className={`size-4 text-muted-foreground transition-transform ${cityPickerOpen ? "rotate-180" : ""}`} />
        </button>

        {cityPickerOpen ? (
          <div className="mt-2 overflow-hidden rounded-xl border border-border/60 bg-card text-left shadow-sm">
            <div className="relative border-b p-2">
              <Search className="pointer-events-none absolute left-5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={cityQuery}
                onChange={(event) => setCityQuery(event.target.value)}
                placeholder="Buscar ciudad o provincia"
                className="min-h-11 w-full rounded-lg bg-muted/50 pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                autoFocus
              />
            </div>
            <div className="max-h-52 overflow-y-auto">
              {visibleCities.map((city) => (
                <button
                  key={`${city.name}-${city.province}`}
                  type="button"
                  onClick={() => chooseCity(city)}
                  className="flex min-h-12 w-full items-center justify-between border-b px-4 text-left last:border-b-0 active:bg-primary/10"
                >
                  <span className="text-sm font-semibold">{city.name}</span>
                  <span className="text-xs text-muted-foreground">{city.province}</span>
                </button>
              ))}
              {visibleCities.length === 0 ? (
                <p className="px-4 py-5 text-center text-sm text-muted-foreground">No encontramos esa ciudad</p>
              ) : null}
            </div>
          </div>
        ) : null}
      </section>
    </main>
  );
}
