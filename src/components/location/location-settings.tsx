"use client";

import { useMemo, useState } from "react";
import { LocateFixed, MapPin, SlidersHorizontal } from "lucide-react";
import { ARGENTINA_CITIES } from "@/lib/argentina-cities";
import { useLocationPreference } from "@/hooks/use-location-preference";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const RADII = [5, 10, 20, 50];

export function LocationSettings() {
  const { location, updateLocation } = useLocationPreference();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [locating, setLocating] = useState(false);

  const cities = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("es");
    if (!normalized) return ARGENTINA_CITIES.slice(0, 8);
    return ARGENTINA_CITIES.filter((city) =>
      `${city.name} ${city.province}`.toLocaleLowerCase("es").includes(normalized),
    ).slice(0, 8);
  }, [query]);

  const chooseCity = (city: (typeof ARGENTINA_CITIES)[number]) => {
    updateLocation({
      lat: city.lat,
      lng: city.lng,
      city: `${city.name}, ${city.province}`,
      radiusKm: location?.radiusKm ?? 20,
      source: "manual",
      capturedAt: location?.capturedAt ?? 0,
    });
    setOpen(false);
  };

  const useGps = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        updateLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          city: "Mi ubicación",
          radiusKm: location?.radiusKm ?? 20,
          source: "gps",
          capturedAt: Date.now(),
        });
        setLocating(false);
        setOpen(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 15_000, maximumAge: 300_000 },
    );
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <button
            type="button"
            className="flex min-h-9 max-w-full items-center gap-2 rounded-full border border-border/60 bg-card/90 px-3 text-xs font-medium text-foreground shadow-sm"
          />
        }
      >
          <MapPin className="size-3.5 shrink-0 text-primary" />
          <span className="truncate">{location?.city ?? "Elegir ciudad"}</span>
          <span className="shrink-0 text-muted-foreground">
            · {location?.radiusKm ?? 20} km
          </span>
          <SlidersHorizontal className="size-3.5 shrink-0 text-muted-foreground" />
      </SheetTrigger>
      <SheetContent side="bottom" className="rounded-t-2xl px-5 pb-8">
        <SheetHeader className="px-0">
          <SheetTitle className="text-left font-heading">Zona de búsqueda</SheetTitle>
        </SheetHeader>

        <div className="mt-4 space-y-5">
          <div>
            <p className="mb-2 text-sm font-semibold">Distancia</p>
            <div className="grid grid-cols-4 gap-2">
              {RADII.map((radius) => (
                <button
                  key={radius}
                  type="button"
                  onClick={() => {
                    if (!location) return;
                    updateLocation({ ...location, radiusKm: radius });
                  }}
                  className={`h-10 rounded-lg border text-sm font-medium ${
                    (location?.radiusKm ?? 20) === radius
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background"
                  }`}
                >
                  {radius} km
                </button>
              ))}
            </div>
          </div>

          <Button type="button" variant="outline" className="w-full" onClick={useGps} disabled={locating}>
            <LocateFixed className="size-4" />
            {locating ? "Buscando…" : "Actualizar con GPS"}
          </Button>

          <div>
            <p className="mb-2 text-sm font-semibold">O elegir una ciudad</p>
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar ciudad o provincia"
              autoComplete="off"
            />
            <div className="mt-2 max-h-56 overflow-y-auto rounded-xl border">
              {cities.map((city) => (
                <button
                  key={`${city.name}-${city.province}`}
                  type="button"
                  onClick={() => chooseCity(city)}
                  className="flex min-h-11 w-full items-center justify-between border-b px-3 text-left text-sm last:border-b-0"
                >
                  <span className="font-medium">{city.name}</span>
                  <span className="text-xs text-muted-foreground">{city.province}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
