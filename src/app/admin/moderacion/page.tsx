"use client";

import Image from "next/image";
import { useState } from "react";
import { Check, Eye, MapPin, ShieldCheck, Trash2 } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Button } from "@/components/ui/button";
import { MODERATION_QUEUE } from "@/lib/mock-admin";

type Decision = "approved" | "observed" | "removed";

const decisionLabel: Record<Decision, string> = {
  approved: "Aprobado",
  observed: "En observacion",
  removed: "Retirado",
};

export default function AdminModeracionPage() {
  const [decisions, setDecisions] = useState<Record<string, Decision>>({});
  const [filter, setFilter] = useState("all");
  const pending = MODERATION_QUEUE.filter((item) => !decisions[item.id]).length;
  const visibleItems = MODERATION_QUEUE.filter((item) => {
    if (filter === "all") return true;
    if (filter === "high") return item.priority === "high";
    return item.category === filter;
  });
  const filters = [
    { value: "all", label: "Todos" },
    { value: "high", label: "Alta prioridad" },
    { value: "personal_data", label: "Datos personales" },
    { value: "duplicate", label: "Duplicados" },
  ];

  return (
    <>
      <AdminPageHeader
        title="Moderacion"
        description="Revisa reportes, datos sensibles y posibles duplicados"
      >
        <span className="rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium">
          {pending} pendientes
        </span>
      </AdminPageHeader>

      <div className="mb-4 flex gap-2 overflow-x-auto" aria-label="Filtros de moderacion">
        {filters.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => setFilter(item.value)}
            className={filter === item.value ? "rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground" : "rounded-lg border border-border bg-card px-3 py-2 text-sm text-muted-foreground"}
          >
            {item.label}
          </button>
        ))}
      </div>

      <ul className="space-y-3">
        {visibleItems.map((item) => {
          const decision = decisions[item.id];
          return (
            <li key={item.id} className="rounded-lg border border-border/60 bg-card p-4">
              <div className="flex flex-col gap-4 sm:flex-row">
                <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden rounded-lg bg-muted sm:w-36">
                  <Image src={item.imageUrl} alt="" fill className="object-cover" sizes="144px" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-heading text-lg font-semibold">{item.title}</h2>
                    <span className={item.priority === "high" ? "rounded-md bg-destructive/10 px-2 py-1 text-xs font-medium text-destructive" : "rounded-md bg-muted px-2 py-1 text-xs font-medium text-muted-foreground"}>
                      Prioridad {item.priority === "high" ? "alta" : item.priority === "medium" ? "media" : "baja"}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{item.reason}</p>
                  <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><MapPin className="size-3.5" />{item.location}</span>
                    <span>Reportado por {item.reportedBy}</span>
                    <span>{item.createdAt}</span>
                  </div>
                  {decision ? (
                    <p className="mt-4 flex items-center gap-2 text-sm font-medium text-primary" role="status">
                      <ShieldCheck className="size-4" /> Decision demo: {decisionLabel[decision]}
                    </p>
                  ) : (
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button size="sm" variant="outline" onClick={() => setDecisions((prev) => ({ ...prev, [item.id]: "approved" }))}>
                        <Check className="size-4" /> Aprobar
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setDecisions((prev) => ({ ...prev, [item.id]: "observed" }))}>
                        <Eye className="size-4" /> Observar
                      </Button>
                      <Button size="sm" variant="outline" className="text-destructive" onClick={() => setDecisions((prev) => ({ ...prev, [item.id]: "removed" }))}>
                        <Trash2 className="size-4" /> Retirar
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
}
