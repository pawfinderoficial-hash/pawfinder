"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { filterPetPosts } from "@/lib/filter-pets";
import { MapPin } from "lucide-react";
import { usePawFinder } from "@/context/pawfinder-context";
import { PetKindBadge } from "@/components/feed/pet-kind-badge";
import { PetPostCard } from "@/components/pet/pet-post-card";
import { SwipeActions } from "@/components/feed/swipe-actions";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { PetPost } from "@/types/pet";
import { Button } from "@/components/ui/button";
import { RotateCcw, SearchX } from "lucide-react";
import { PawPrint } from "lucide-react";

function FeedListRow({
  post,
  onSelect,
}: {
  post: PetPost;
  onSelect: () => void;
}) {
  const speciesLine = [post.species, post.breed].filter(Boolean).join(" · ");

  return (
    <button
      type="button"
      onClick={onSelect}
      className="flex w-full gap-3 rounded-2xl border border-border/50 bg-card/90 p-3 text-left shadow-sm transition-colors hover:border-primary/20 hover:bg-card"
    >
      <div className="relative size-[4.5rem] shrink-0 overflow-hidden rounded-xl bg-muted">
        <Image
          src={post.imageUrl}
          alt=""
          fill
          className="object-cover"
          sizes="72px"
        />
      </div>
      <div className="min-w-0 flex-1 space-y-1.5 py-0.5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-heading text-base font-semibold text-foreground">
            {post.name}
          </span>
          <PetKindBadge kind={post.kind} className="scale-95" />
        </div>
        {speciesLine ? (
          <p className="truncate text-sm text-muted-foreground">{speciesLine}</p>
        ) : null}
        <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
          <MapPin className="size-3.5 shrink-0 text-primary/80" aria-hidden />
          {post.locationLabel}
        </p>
      </div>
    </button>
  );
}

export function FeedList() {
  const {
    feedStack,
    feedSearchQuery,
    swipeCard,
    resetFeed,
    allPosts,
    setFeedSearchQuery,
  } = usePawFinder();
  const visiblePosts = useMemo(
    () => filterPetPosts(feedStack, feedSearchQuery),
    [feedStack, feedSearchQuery],
  );
  const [selected, setSelected] = useState<PetPost | null>(null);
  const [reportSent, setReportSent] = useState(false);

  const handlePass = () => {
    if (!selected) return;
    swipeCard("left", selected.id);
    setSelected(null);
  };

  const handleLike = () => {
    if (!selected) return;
    swipeCard("right", selected.id);
    setSelected(null);
  };

  if (visiblePosts.length === 0) {
    const isSearchActive = feedSearchQuery.trim().length > 0;
    const hasPostsLeft = feedStack.length > 0;

    if (isSearchActive && hasPostsLeft) {
      return (
        <div className="flex flex-col items-center px-6 py-16 text-center">
          <div className="pf-empty-icon mb-4">
            <SearchX className="size-8" />
          </div>
          <h2 className="font-heading text-xl font-semibold">
            Ningún aviso coincide
          </h2>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
            Probá otra raza, nombre o zona.
          </p>
          <Button
            className="mt-6 rounded-xl"
            variant="outline"
            onClick={() => setFeedSearchQuery("")}
          >
            Limpiar búsqueda
          </Button>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center px-6 py-16 text-center">
        <div className="pf-empty-icon mb-4">
          <PawPrint className="size-8" />
        </div>
        <h2 className="font-heading text-xl font-semibold">
          No hay avisos en la lista
        </h2>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
          Ya revisaste todos los avisos. Podés recargar el demo o ver el mapa.
        </p>
        <Button className="mt-6 rounded-xl" variant="outline" onClick={resetFeed}>
          <RotateCcw className="size-4" />
          Volver a cargar avisos
        </Button>
        <p className="mt-4 text-xs text-muted-foreground">
          {allPosts.length} publicaciones en la comunidad
        </p>
      </div>
    );
  }

  return (
    <>
      {reportSent ? (
        <div className="mx-4 mt-3 rounded-xl border border-primary/15 bg-primary/10 px-3 py-2 text-sm" role="status">
          Recibimos el reporte. El equipo de moderacion lo revisara.
        </div>
      ) : null}
      <ul className="flex flex-col gap-2.5 px-4 py-3">
        {visiblePosts.map((post) => (
          <li key={post.id}>
            <FeedListRow post={post} onSelect={() => setSelected(post)} />
          </li>
        ))}
      </ul>

      <Sheet open={selected !== null} onOpenChange={(open) => !open && setSelected(null)}>
        <SheetContent side="bottom" className="max-h-[92vh] overflow-y-auto rounded-t-3xl border-t-0 px-0 pb-8">
          {selected ? (
            <>
              <SheetHeader className="px-5 pb-2">
                <SheetTitle className="font-heading text-left text-lg">
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
                <SwipeActions
                  className="mt-5"
                  onPass={handlePass}
                  onLike={handleLike}
                />
              </div>
            </>
          ) : null}
        </SheetContent>
      </Sheet>
    </>
  );
}
