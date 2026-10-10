"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Binoculars,
  CheckCircle2,
  Clock3,
  Eye,
  FilePenLine,
  HeartHandshake,
  MapPin,
  Pause,
  Play,
  Plus,
  Sparkles,
} from "lucide-react";
import { AppHeader } from "@/components/layout/app-header";
import { ImageGallery } from "@/components/pet/image-gallery";
import { ReportStatusBadge } from "@/components/pet/report-status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { usePawFinder } from "@/context/pawfinder-context";
import type { OwnedReport, OwnedSighting } from "@/types/pet";

const sightingStatus: Record<
  OwnedSighting["status"],
  { label: string; className: string }
> = {
  open: {
    label: "Enviado",
    className: "bg-primary/10 text-primary",
  },
  contact_shared: {
    label: "Contacto solicitado",
    className: "bg-emerald-100 text-emerald-800",
  },
  dismissed: {
    label: "Descartado",
    className: "bg-muted text-muted-foreground",
  },
};

function SightingCard({ sighting }: { sighting: OwnedSighting }) {
  const status = sightingStatus[sighting.status];
  const reportedAt = new Intl.DateTimeFormat("es-AR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(sighting.createdAt));

  return (
    <li className="overflow-hidden rounded-2xl border border-border/50 bg-card/90 shadow-sm">
      <div className="flex gap-3 p-3">
        <ImageGallery
          images={
            sighting.imageUrls.length > 0
              ? sighting.imageUrls
              : sighting.lostPost.imageUrls?.length
                ? sighting.lostPost.imageUrls
                : [sighting.lostPost.imageUrl]
          }
          alt={`Avistamiento de ${sighting.lostPost.name}`}
          className="size-24 shrink-0 rounded-xl"
          compact
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-heading text-base font-semibold">
              {sighting.lostPost.name}
            </h2>
            <span className={`rounded-full px-2 py-1 text-[0.65rem] font-semibold ${status.className}`}>
              {status.label}
            </span>
          </div>
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
            {sighting.note || "Sin nota adicional"}
          </p>
          <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="size-3.5 shrink-0" />
            <span className="truncate">{sighting.locationLabel}</span>
          </p>
        </div>
      </div>
      <p className="flex items-center gap-1.5 border-t border-border/40 px-3 py-2.5 text-xs text-muted-foreground">
        <Clock3 className="size-3.5" />
        Enviado el {reportedAt}
      </p>
    </li>
  );
}

function EditReportSheet({
  report,
  open,
  onOpenChange,
}: {
  report: OwnedReport;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { updateOwnedReport } = usePawFinder();
  const [name, setName] = useState(report.name);
  const [description, setDescription] = useState(report.description);
  const [locationLabel, setLocationLabel] = useState(report.locationLabel);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[90dvh] overflow-y-auto rounded-t-3xl">
        <SheetHeader>
          <SheetTitle className="text-left font-heading">Editar aviso</SheetTitle>
        </SheetHeader>
        <form
          className="space-y-4 px-4 pb-6"
          onSubmit={(event) => {
            event.preventDefault();
            updateOwnedReport(report.id, { name, description, locationLabel });
            onOpenChange(false);
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="edit-report-name">Nombre</Label>
            <Input
              id="edit-report-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-report-description">Descripcion</Label>
            <Textarea
              id="edit-report-description"
              rows={4}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-report-location">Zona aproximada</Label>
            <Input
              id="edit-report-location"
              value={locationLabel}
              onChange={(event) => setLocationLabel(event.target.value)}
            />
          </div>
          <Button type="submit" className="pf-btn-emphasis w-full rounded-xl">
            Guardar cambios
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}

export default function MisAvisosPage() {
  const { ownedReports, ownedSightings, updateReportStatus } = usePawFinder();
  const [editing, setEditing] = useState<OwnedReport | null>(null);
  const [publishOpen, setPublishOpen] = useState(false);
  const [view, setView] = useState<"reports" | "sightings">("reports");

  const activeCount = ownedReports.filter(
    (report) => report.status === "active" || report.status === "reviewing",
  ).length;

  return (
    <>
      <AppHeader title="Mis publicaciones" />
      <div className="space-y-4 px-4 py-4">
        <div
          className="grid grid-cols-2 rounded-xl bg-muted p-1"
          role="tablist"
          aria-label="Tipo de publicación"
        >
          <button
            type="button"
            role="tab"
            aria-selected={view === "reports"}
            className={`h-9 rounded-lg text-sm font-semibold transition-colors ${
              view === "reports"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground"
            }`}
            onClick={() => setView("reports")}
          >
            Avisos ({ownedReports.length})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={view === "sightings"}
            className={`h-9 rounded-lg text-sm font-semibold transition-colors ${
              view === "sightings"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground"
            }`}
            onClick={() => setView("sightings")}
          >
            Avistamientos ({ownedSightings.length})
          </button>
        </div>

        {view === "reports" ? (
          <>
            <Button
              size="lg"
              className="pf-btn-emphasis w-full rounded-xl shadow-none"
              onClick={() => setPublishOpen(true)}
            >
              <Plus className="size-5" />
              Nueva publicación
            </Button>

            <div className="grid grid-cols-3 gap-2" aria-label="Resumen de avisos">
              <div className="rounded-xl border border-border/50 bg-card/90 p-3">
                <p className="text-xl font-semibold">{activeCount}</p>
                <p className="text-xs text-muted-foreground">En búsqueda</p>
              </div>
              <div className="rounded-xl border border-border/50 bg-card/90 p-3">
                <p className="text-xl font-semibold">
                  {ownedReports.reduce(
                    (total, report) => total + report.candidateCount,
                    0,
                  )}
                </p>
                <p className="text-xs text-muted-foreground">Coincidencias</p>
              </div>
              <div className="rounded-xl border border-border/50 bg-card/90 p-3">
                <p className="text-xl font-semibold">
                  {
                    ownedReports.filter(
                      (report) => report.status === "resolved",
                    ).length
                  }
                </p>
                <p className="text-xs text-muted-foreground">Resueltos</p>
              </div>
            </div>

            {ownedReports.length === 0 ? (
              <div className="px-4 py-12 text-center">
                <p className="text-sm text-muted-foreground">
                  Todavía no publicaste avisos.
                </p>
              </div>
            ) : (
              <ul className="space-y-3" aria-label="Tus avisos">
                {ownedReports.map((report) => (
                  <li
                    key={report.id}
                    className="overflow-hidden rounded-2xl border border-border/50 bg-card/90 shadow-sm"
                  >
                    <div className="flex gap-3 p-3">
                      <ImageGallery
                        images={report.imageUrls?.length ? report.imageUrls : [report.imageUrl]}
                        alt={`Foto de ${report.name}`}
                        className="size-24 shrink-0 rounded-xl"
                        compact
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="font-heading text-lg font-semibold">
                            {report.name}
                          </h2>
                          <ReportStatusBadge status={report.status} />
                        </div>
                        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                          {report.locationLabel}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Eye className="size-3.5" /> {report.views} vistas
                          </span>
                          <span className="flex items-center gap-1">
                            <HeartHandshake className="size-3.5" />{" "}
                            {report.candidateCount} posibles
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 border-t border-border/40 px-3 py-3">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditing(report)}
                      >
                        <FilePenLine className="size-4" />
                        Editar
                      </Button>
                      {report.status === "active" ||
                      report.status === "reviewing" ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            updateReportStatus(report.id, "paused")
                          }
                        >
                          <Pause className="size-4" />
                          Pausar
                        </Button>
                      ) : report.status === "paused" ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            updateReportStatus(report.id, "active")
                          }
                        >
                          <Play className="size-4" />
                          Reactivar
                        </Button>
                      ) : null}
                      {report.status !== "resolved" ? (
                        <Button
                          size="sm"
                          className="pf-btn-emphasis"
                          onClick={() =>
                            updateReportStatus(report.id, "resolved")
                          }
                        >
                          <CheckCircle2 className="size-4" />
                          Marcar resuelto
                        </Button>
                      ) : null}
                    </div>
                    <p className="px-3 pb-3 text-xs text-muted-foreground">
                      {report.updatedAt}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </>
        ) : ownedSightings.length === 0 ? (
          <div className="flex flex-col items-center px-4 py-12 text-center">
            <div className="pf-empty-icon mb-4">
              <Binoculars className="size-8" />
            </div>
            <h2 className="font-heading text-lg font-semibold">
              Todavía no reportaste avistamientos
            </h2>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              Los avistamientos que envíes desde Explorar aparecerán acá.
            </p>
          </div>
        ) : (
          <ul className="space-y-3" aria-label="Tus avistamientos">
            {ownedSightings.map((sighting) => (
              <SightingCard key={sighting.id} sighting={sighting} />
            ))}
          </ul>
        )}
      </div>
      {editing ? (
        <EditReportSheet
          key={editing.id}
          report={editing}
          open
          onOpenChange={(open) => !open && setEditing(null)}
        />
      ) : null}
      <Sheet open={publishOpen} onOpenChange={setPublishOpen}>
        <SheetContent side="bottom" className="rounded-t-3xl border-t-0 pb-8">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2 text-left font-heading pf-heading-app">
              <Sparkles className="size-5 text-primary" />
              ¿Que queres publicar?
            </SheetTitle>
          </SheetHeader>
          <div className="mt-5 flex flex-col gap-3 px-4">
            <Link
              href="/publicar/perdida"
              onClick={() => setPublishOpen(false)}
              className="pf-btn-emphasis flex min-h-[4.5rem] flex-col items-start justify-center rounded-2xl px-4 py-3.5 text-left shadow-none transition-colors"
            >
              <span className="block font-semibold">Mascota perdida</span>
              <span className="block text-sm font-normal opacity-90">
                Avisa a la comunidad que buscas a tu mascota
              </span>
            </Link>
            <Link
              href="/publicar/encontrada"
              onClick={() => setPublishOpen(false)}
              className="pf-action-pass flex min-h-[4.5rem] flex-col items-start justify-center rounded-2xl px-4 py-3.5 text-left transition-colors"
            >
              <span className="block font-semibold">Mascota encontrada</span>
              <span className="block text-sm font-normal text-muted-foreground">
                Conta donde la viste para reunirla con su familia
              </span>
            </Link>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
