import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ReportStatus } from "@/types/pet";

const statusMeta: Record<
  ReportStatus,
  { label: string; className: string }
> = {
  active: {
    label: "Activo",
    className: "border-emerald-200 bg-emerald-50 text-emerald-800",
  },
  reviewing: {
    label: "En revision",
    className: "border-sky-200 bg-sky-50 text-sky-800",
  },
  paused: {
    label: "Pausado",
    className: "border-amber-200 bg-amber-50 text-amber-800",
  },
  resolved: {
    label: "Resuelto",
    className: "border-border bg-muted text-muted-foreground",
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
