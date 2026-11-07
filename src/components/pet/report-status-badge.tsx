import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ReportStatus } from "@/types/pet";

const statusMeta: Record<
  ReportStatus,
  { label: string; className: string }
> = {
  active: {
    label: "Activo",
    className: "border-primary bg-accent text-foreground",
  },
  reviewing: {
    label: "En revision",
    className: "border-[var(--badge-seen-fg)]/25 bg-[var(--badge-seen-bg)] text-[var(--badge-seen-fg)]",
  },
  paused: {
    label: "Pausado",
    className: "border-border bg-muted text-muted-foreground",
  },
  resolved: {
    label: "Resuelto",
    className: "border-[var(--badge-found-fg)]/25 bg-[var(--badge-found-bg)] text-[var(--badge-found-fg)]",
  },
};

export function ReportStatusBadge({
  status,
  className,
}: {
  status: ReportStatus;
  className?: string;
}) {
  const meta = statusMeta[status];
  return (
    <Badge variant="outline" className={cn(meta.className, className)}>
      {meta.label}
    </Badge>
  );
}
