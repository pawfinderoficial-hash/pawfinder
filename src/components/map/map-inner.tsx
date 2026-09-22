"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { PetPost } from "@/types/pet";
import { MAP_DEFAULT_CENTER } from "@/lib/mock-pets";
import { cn } from "@/lib/utils";

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

interface PetMapProps {
  posts: PetPost[];
  heightClass?: string;
  pickerMode?: boolean;
  pickerPosition?: { lat: number; lng: number } | null;
  onPickLocation?: (lat: number, lng: number) => void;
  onMarkerClick?: (post: PetPost) => void;
  fullBleed?: boolean;
  center?: { lat: number; lng: number };
  zoom?: number;
}

function publicPosition(post: PetPost): [number, number] {
  const hash = Array.from(post.id).reduce(
    (total, character) => total + character.charCodeAt(0),
    0,
  );
  const latOffset = ((hash % 7) - 3) * 0.00035;
  const lngOffset = (((hash * 3) % 7) - 3) * 0.0004;
  return [post.lat + latOffset, post.lng + lngOffset];
}

export function PetMapInner({
  posts,
  heightClass = "h-[min(60vh,480px)]",
  pickerMode,
  pickerPosition,
  onPickLocation,
  onMarkerClick,
  fullBleed = false,
  center = MAP_DEFAULT_CENTER,
  zoom = 13,
}: PetMapProps) {
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

  return (
    <div
      className={cn(
        "relative z-0 w-full overflow-hidden",
        fullBleed ? "rounded-none border-0" : "rounded-2xl border",
        heightClass,
      )}
    >
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={zoom}
        className="!h-full !min-h-[240px] w-full"
        style={{ height: "100%", minHeight: 240 }}
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {pickerMode && onPickLocation ? (
          <ClickPicker onPick={onPickLocation} />
        ) : null}
        {posts.map((post) => (
          <Marker
            key={post.id}
            position={publicPosition(post)}
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
      {pickerMode ? (
        <p className="absolute bottom-2 left-2 right-2 rounded-lg bg-background/90 px-2 py-1 text-center text-xs shadow-sm">
          Tocá el mapa para marcar la ubicación aproximada
        </p>
      ) : null}
    </div>
  );
}
