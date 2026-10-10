"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  CircleMarker,
  MapContainer,
  TileLayer,
  Marker,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { PetPost } from "@/types/pet";
import { MAP_DEFAULT_CENTER } from "@/lib/mock-pets";
import { cn } from "@/lib/utils";
import { LocateFixed, Loader2, MapPinOff } from "lucide-react";
import {
  clearBrowserLocation,
  readBrowserLocation,
  storeBrowserLocation,
} from "@/lib/browser-location";

const ARGENTINA_CENTER = { lat: -34.6, lng: -64 };

type LocationStatus =
  | "idle"
  | "requesting"
  | "located"
  | "denied"
  | "unavailable";

const lostIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const foundIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function ClickPicker({
  onPick,
}: {
  onPick: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

/** Moves the map when a target center becomes available (e.g. geolocation). */
function MapController({
  target,
  zoom,
}: {
  target: { lat: number; lng: number } | null;
  zoom: number;
}) {
  const map = useMap();

  useEffect(() => {
    if (!target) return;
    map.flyTo([target.lat, target.lng], zoom, { duration: 0.75 });
  }, [map, target, zoom]);

  return null;
}

interface PetMapProps {
  posts: PetPost[];
  heightClass?: string;
  pickerMode?: boolean;
  pickerPosition?: { lat: number; lng: number } | null;
  onPickLocation?: (lat: number, lng: number) => void;
  onMarkerClick?: (post: PetPost) => void;
  fullBleed?: boolean;
  /** Explicit center skips browse-map geolocation. Picker still geolocates. */
  center?: { lat: number; lng: number };
  zoom?: number;
}

export function PetMapInner({
  posts,
  heightClass = "h-[min(60vh,480px)]",
  pickerMode,
  pickerPosition,
  onPickLocation,
  onMarkerClick,
  fullBleed = false,
  center,
  zoom = 13,
}: PetMapProps) {
  // Browse map: geolocate only when no explicit center. Publish picker: always try.
  const followUser = !pickerMode && center === undefined;
  const geolocate = followUser || Boolean(pickerMode);
  const initialCenter =
    center ?? (geolocate ? ARGENTINA_CENTER : MAP_DEFAULT_CENTER);
  const [userCenter, setUserCenter] = useState<{
    lat: number;
    lng: number;
  } | null>(() => readBrowserLocation());
  const pickerPositionRef = useRef(pickerPosition);
  const onPickLocationRef = useRef(onPickLocation);
  const [locationStatus, setLocationStatus] =
    useState<LocationStatus>("idle");

  useEffect(() => {
    pickerPositionRef.current = pickerPosition;
    onPickLocationRef.current = onPickLocation;
  }, [pickerPosition, onPickLocation]);

  useEffect(() => {
    delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })
      ._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
      iconUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
      shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
    });
  }, []);

  const requestLocation = useCallback((useCachedLocation = false) => {
    if (!geolocate) return;

    const cachedLocation = useCachedLocation ? readBrowserLocation() : null;
    if (cachedLocation) {
      const nextCenter = {
        lat: cachedLocation.lat,
        lng: cachedLocation.lng,
      };
      setUserCenter(nextCenter);
      setLocationStatus("located");
      if (pickerMode && !pickerPositionRef.current) {
        onPickLocationRef.current?.(nextCenter.lat, nextCenter.lng);
      }
      return;
    }

    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setLocationStatus("unavailable");
      return;
    }

    setLocationStatus("requesting");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        storeBrowserLocation({ lat, lng, capturedAt: Date.now() });
        setUserCenter({ lat, lng });
        setLocationStatus("located");
        // Seed picker at user location only if they have not tapped yet.
        if (pickerMode && !pickerPositionRef.current) {
          onPickLocationRef.current?.(lat, lng);
        }
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) clearBrowserLocation();
        setLocationStatus(error.code === error.PERMISSION_DENIED ? "denied" : "unavailable");
      },
      { enableHighAccuracy: true, timeout: 15_000, maximumAge: 30_000 },
    );
  }, [geolocate, pickerMode]);

  useEffect(() => {
    const timer = window.setTimeout(() => requestLocation(true), 0);
    return () => window.clearTimeout(timer);
  }, [requestLocation]);

  return (
    <div
      className={cn(
        "relative z-0 w-full overflow-hidden",
        fullBleed ? "rounded-none border-0" : "rounded-2xl border",
        heightClass,
      )}
    >
      <MapContainer
        center={[initialCenter.lat, initialCenter.lng]}
        zoom={center || !geolocate ? zoom : 5}
        className="!h-full !min-h-[240px] w-full"
        style={{ height: "100%", minHeight: 240 }}
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {geolocate ? <MapController target={userCenter} zoom={zoom} /> : null}
        {userCenter ? (
          <CircleMarker
            center={[userCenter.lat, userCenter.lng]}
            radius={8}
            pathOptions={{
              color: "#ffffff",
              fillColor: "#2563eb",
              fillOpacity: 1,
              weight: 3,
            }}
          />
        ) : null}
        {pickerMode && onPickLocation ? (
          <ClickPicker onPick={onPickLocation} />
        ) : null}
        {posts.map((post) => (
          <Marker
            key={post.id}
            position={[post.lat, post.lng]}
            icon={post.kind === "lost" ? lostIcon : foundIcon}
            eventHandlers={
              onMarkerClick
                ? {
                    click: () => onMarkerClick(post),
                  }
                : undefined
            }
          />
        ))}
        {pickerMode && pickerPosition ? (
          <Marker position={[pickerPosition.lat, pickerPosition.lng]} icon={lostIcon} />
        ) : null}
      </MapContainer>
      {geolocate ? (
        <div className="absolute left-3 top-3 z-[500] max-w-[calc(100%-1.5rem)]">
          {locationStatus === "located" ? (
            <button
              type="button"
              onClick={() => requestLocation(false)}
              className="flex size-10 items-center justify-center rounded-full border border-border/60 bg-card/95 text-primary shadow-md backdrop-blur-sm"
              title="Actualizar mi ubicación"
              aria-label="Actualizar mi ubicación"
            >
              <LocateFixed className="size-5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => requestLocation(false)}
              disabled={locationStatus === "requesting"}
              className="flex min-h-10 items-center gap-2 rounded-xl border border-border/60 bg-card/95 px-3 py-2 text-left text-xs font-medium shadow-md backdrop-blur-sm disabled:cursor-wait"
            >
              {locationStatus === "requesting" ? (
                <Loader2 className="size-4 shrink-0 animate-spin text-primary" />
              ) : locationStatus === "denied" || locationStatus === "unavailable" ? (
                <MapPinOff className="size-4 shrink-0 text-destructive" />
              ) : (
                <LocateFixed className="size-4 shrink-0 text-primary" />
              )}
              <span>
                {locationStatus === "requesting"
                  ? "Buscando tu ubicación…"
                  : locationStatus === "denied"
                    ? "Ubicación bloqueada. Habilitala y tocá acá."
                    : locationStatus === "unavailable"
                      ? "No pudimos ubicarte. Intentar de nuevo."
                      : "Usar mi ubicación"}
              </span>
            </button>
          )}
        </div>
      ) : null}
      {pickerMode ? (
        <p className="absolute bottom-2 left-2 right-2 rounded-lg bg-background/90 px-2 py-1 text-center text-xs shadow-sm">
          Tocá el mapa para marcar la ubicación aproximada
        </p>
      ) : null}
    </div>
  );
}
