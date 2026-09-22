"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  CheckCircle2,
  Eye,
  FilePenLine,
  HeartHandshake,
  Pause,
  Play,
  Plus,
  Sparkles,
} from "lucide-react";
import { AppHeader } from "@/components/layout/app-header";
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
import type { OwnedReport } from "@/types/pet";

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
  const { ownedReports, updateReportStatus } = usePawFinder();
  const [editing, setEditing] = useState<OwnedReport | null>(null);
  const [publishOpen, setPublishOpen] = useState(false);

  const activeCount = ownedReports.filter(
    (report) => report.status === "active" || report.status === "reviewing",
  ).length;

  return (
    <>
      <AppHeader
        title="Mis publicaciones"
        subtitle="Publica, edita y cerra los casos que ya se resolvieron"
      />
      <div className="space-y-4 px-4 py-4">
        <Button
          size="lg"
          className="pf-btn-emphasis w-full rounded-xl shadow-none"
          onClick={() => setPublishOpen(true)}
        >
          <Plus className="size-5" />
          Nueva publicacion
        </Button>

        <div className="grid grid-cols-3 gap-2" aria-label="Resumen de avisos">
          <div className="rounded-2xl border border-border/50 bg-card/90 p-3">
            <p className="text-xl font-semibold">{activeCount}</p>
            <p className="text-xs text-muted-foreground">En busqueda</p>
          </div>
          <div className="rounded-2xl border border-border/50 bg-card/90 p-3">
            <p className="text-xl font-semibold">
              {ownedReports.reduce((total, report) => total + report.candidateCount, 0)}
            </p>
            <p className="text-xs text-muted-foreground">Coincidencias</p>
          </div>
          <div className="rounded-2xl border border-border/50 bg-card/90 p-3">
            <p className="text-xl font-semibold">
              {ownedReports.filter((report) => report.status === "resolved").length}
            </p>
            <p className="text-xs text-muted-foreground">Resueltos</p>
          </div>
        </div>

        <ul className="space-y-3" aria-label="Tus publicaciones">
          {ownedReports.map((report) => (
            <li
              key={report.id}
              className="overflow-hidden rounded-2xl border border-border/50 bg-card/90 shadow-sm"
            >
              <div className="flex gap-3 p-3">
                <div className="relative size-24 shrink-0 overflow-hidden rounded-xl bg-muted">
                  <Image
                    src={report.imageUrl}
                    alt={`Foto de ${report.name}`}
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                </div>
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
                      <HeartHandshake className="size-3.5" /> {report.candidateCount} posibles
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 border-t border-border/40 px-3 py-3">
                <Button size="sm" variant="outline" onClick={() => setEditing(report)}>
                  <FilePenLine className="size-4" />
                  Editar
                </Button>
                {report.status === "active" || report.status === "reviewing" ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateReportStatus(report.id, "paused")}
                  >
                    <Pause className="size-4" />
                    Pausar
                  </Button>
                ) : report.status === "paused" ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateReportStatus(report.id, "active")}
                  >
                    <Play className="size-4" />
                    Reactivar
                  </Button>
                ) : null}
                {report.status !== "resolved" ? (
                  <Button
                    size="sm"
                    className="pf-btn-emphasis"
                    onClick={() => updateReportStatus(report.id, "resolved")}
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
