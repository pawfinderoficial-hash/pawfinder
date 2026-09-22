"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { sampleBreedFilters } from "@/lib/filter-pets";
import type { PetPost } from "@/types/pet";

export function FeedSearch({
  value,
  onChange,
  posts,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  posts: PetPost[];
  className?: string;
}) {
  const chips = sampleBreedFilters(posts, 3);

  return (
    <div className={cn("space-y-2", className)}>
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Buscar por raza, nombre, zona…"
          className="h-11 rounded-2xl border-border/60 bg-card/90 pl-10 shadow-sm"
          aria-label="Buscar avisos"
        />
      </div>
      {chips.length > 0 && !value ? (
        <div className="flex flex-wrap items-center gap-1.5 px-0.5">
          <span className="text-xs text-muted-foreground">Ej. raza:</span>
          {chips.map((breed) => (
            <button
              key={breed}
              type="button"
              onClick={() => onChange(breed)}
              className="rounded-full border border-border/50 bg-muted/60 px-2.5 py-0.5 text-xs font-medium text-foreground/80 transition-colors hover:border-primary/25 hover:bg-primary/8"
            >
              {breed}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
