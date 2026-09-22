"use client";

import { useState } from "react";
import { AppHeader } from "@/components/layout/app-header";
import { PetMap } from "@/components/map/pet-map";
import { usePawFinder } from "@/context/pawfinder-context";
import { PetKindBadge } from "@/components/feed/pet-kind-badge";
import { PetPostCard } from "@/components/pet/pet-post-card";
import { MapPinOff } from "lucide-react";
import type { PetPost } from "@/types/pet";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

const MAP_HEIGHT = "h-[calc(100dvh-11rem)]";

export default function MapaPage() {
  const { allPosts } = usePawFinder();
  const [selected, setSelected] = useState<PetPost | null>(null);
  const [reportSent, setReportSent] = useState(false);
  const lost = allPosts.filter((p) => p.kind === "lost").length;
  const found = allPosts.filter((p) => p.kind === "found").length;

  return (
    <>
      <AppHeader
        title="Mapa"
        subtitle="Zonas aproximadas de mascotas perdidas y encontradas"
      />
      {reportSent ? (
        <div className="mx-4 mt-3 rounded-xl border border-primary/15 bg-primary/10 px-3 py-2 text-sm" role="status">
          Reporte enviado al equipo de moderacion.
        </div>
      ) : null}
      <div className="relative -mx-4 w-[calc(100%+2rem)]">
        {allPosts.length === 0 ? (
          <div className="flex flex-col items-center px-6 py-12 text-center">
            <div className="pf-empty-icon">
              <MapPinOff className="size-8" />
            </div>
            <p className="mt-4 font-heading text-lg font-semibold">
              Todavía no hay marcadores
            </p>
            <p className="text-sm text-muted-foreground">
              Publicá un aviso para verlo acá.
            </p>
          </div>
        ) : (
          <div className={`relative ${MAP_HEIGHT}`}>
            <div className="pointer-events-none absolute inset-x-0 top-3 z-[500] flex flex-wrap justify-center gap-2 px-3">
              <span
                className="pointer-events-auto rounded-full border border-border/50 bg-card/95 px-3 py-1 text-xs font-medium shadow-sm backdrop-blur-sm"
              >
                {allPosts.length} en el mapa
              </span>
              <span className="pointer-events-auto flex items-center gap-1.5 rounded-full border border-border/50 bg-card/95 px-2.5 py-1 text-xs shadow-sm backdrop-blur-sm">
                <PetKindBadge kind="lost" />
                <span className="text-muted-foreground">{lost}</span>
              </span>
              <span className="pointer-events-auto flex items-center gap-1.5 rounded-full border border-border/50 bg-card/95 px-2.5 py-1 text-xs shadow-sm backdrop-blur-sm">
                <PetKindBadge kind="found" />
                <span className="text-muted-foreground">{found}</span>
              </span>
            </div>
            <PetMap
              posts={allPosts}
              fullBleed
              heightClass={`${MAP_HEIGHT} w-full`}
              onMarkerClick={setSelected}
            />
          </div>
        )}
      </div>

      <Sheet
        open={selected !== null}
        onOpenChange={(open) => !open && setSelected(null)}
      >
        <SheetContent
          side="bottom"
          className="max-h-[88vh] overflow-y-auto rounded-t-3xl border-t-0 px-0 pb-8"
        >
          {selected ? (
            <>
              <SheetHeader className="px-5 pb-2">
                <SheetTitle className="pf-heading-app text-left font-heading">
                  {selected.name}
                </SheetTitle>
              </SheetHeader>
              <div className="px-4">
                <PetPostCard
                  post={selected}
                  className="border-0 shadow-none ring-0"
                  priority
                  onReport={() => {
                    setReportSent(true);
                    setSelected(null);
                  }}
                />
              </div>
            </>
          ) : null}
        </SheetContent>
      </Sheet>
    </>
  );
}
