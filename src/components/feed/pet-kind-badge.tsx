import { Badge } from "@/components/ui/badge";
import type { PetKind } from "@/types/pet";
import { cn } from "@/lib/utils";

const labels: Record<PetKind, string> = {
  lost: "Perdida",
  found: "Encontrada",
};

export function PetKindBadge({
  kind,
  className,
}: {
  kind: PetKind;
  className?: string;
}) {
  return (
    <Badge
      variant="secondary"
      className={cn(
        "border-0 px-2.5 py-0.5 text-[0.7rem] font-semibold tracking-wide shadow-sm backdrop-blur-sm",
        kind === "lost"
          ? "bg-[var(--badge-lost-bg)] text-[var(--badge-lost-fg)]"
          : "bg-[var(--badge-found-bg)] text-[var(--badge-found-fg)]",
        className,
      )}
    >
      {labels[kind]}
    </Badge>
  );
}
