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
        "flex rounded-xl border border-border bg-muted p-1 shadow-sm",
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
              "flex-1 rounded-lg px-4 py-2.5 font-heading text-sm font-semibold transition-colors",
              active
                ? "bg-primary text-primary-foreground shadow-sm"
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
