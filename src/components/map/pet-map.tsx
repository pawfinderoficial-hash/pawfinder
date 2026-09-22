"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";
import type { PetPost } from "@/types/pet";

const PetMapInner = dynamic(
  () =>
    import("@/components/map/map-inner").then((m) => m.PetMapInner),
  {
    ssr: false,
    loading: () => (
      <div
        className="flex h-[min(60vh,480px)] w-full items-center justify-center rounded-2xl border bg-muted"
        role="status"
        aria-label="Cargando mapa"
      >
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    ),
  },
);

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

export function PetMap(props: PetMapProps) {
  return <PetMapInner {...props} />;
}
