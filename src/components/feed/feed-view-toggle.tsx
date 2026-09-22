"use client";

import { cn } from "@/lib/utils";

export type FeedViewMode = "swipe" | "lista";

const options: { value: FeedViewMode; label: string }[] = [
  { value: "swipe", label: "Swipe" },
  { value: "lista", label: "Lista" },
];

export function FeedViewToggle({
  value,
  onChange,
  className,
}: {
  value: FeedViewMode;
  onChange: (mode: FeedViewMode) => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex rounded-2xl border border-border/60 bg-card/80 p-1 shadow-sm backdrop-blur-sm",
        className,
      )}
      role="tablist"
      aria-label="Modo de exploración"
    >
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(opt.value)}
            className={cn(
              "flex-1 rounded-xl px-4 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-primary/12 text-[var(--action-like-fg)] shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
