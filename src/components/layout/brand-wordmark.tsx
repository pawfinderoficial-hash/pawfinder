import { cn } from "@/lib/utils";

export function BrandWordmark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-baseline whitespace-nowrap font-heading text-xl font-bold leading-none",
        className,
      )}
      aria-label="PawFinder"
    >
      <span className="text-foreground">Paw</span>
      <span className="text-primary">Finder</span>
    </span>
  );
}
