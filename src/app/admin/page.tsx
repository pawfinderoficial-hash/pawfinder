import Link from "next/link";
import { ArrowRight, CheckCircle2, Clock3, Flag, PawPrint, Users } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ADMIN_CASES, MODERATION_QUEUE } from "@/lib/mock-admin";

const metrics = [
  { label: "Avisos activos", value: "38", detail: "+6 esta semana", icon: PawPrint },
  { label: "Posibles matches", value: "12", detail: "5 esperan respuesta", icon: Clock3 },
  { label: "Casos resueltos", value: "24", detail: "63% del total", icon: CheckCircle2 },
  { label: "Usuarios activos", value: "186", detail: "+18 este mes", icon: Users },
];

export default function AdminDashboardPage() {
  return (
    <>
      <AdminPageHeader
        title="Resumen operativo"
        description="Estado de la comunidad y tareas que requieren intervencion"
      >
        <span className="rounded-lg border border-border bg-card px-3 py-2 text-xs text-muted-foreground">
          Actualizado hace 2 min
        </span>
      </AdminPageHeader>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Metricas principales">
        {metrics.map(({ label, value, detail, icon: Icon }) => (
          <div key={label} className="rounded-lg border border-border/60 bg-card p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{label}</p>
              <Icon className="size-4 text-primary" />
            </div>
            <p className="mt-3 text-2xl font-semibold">{value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
          </div>
        ))}
      </section>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_1fr]">
        <section>
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="font-heading text-lg font-semibold">Requiere moderacion</h2>
              <p className="text-xs text-muted-foreground">Reportes ordenados por prioridad</p>
            </div>
            <Link href="/admin/moderacion" className="flex items-center gap-1 text-sm font-medium text-primary">
              Ver cola <ArrowRight className="size-4" />
            </Link>
          </div>
          <div className="overflow-hidden rounded-lg border border-border/60 bg-card">
            {MODERATION_QUEUE.map((item) => (
              <div key={item.id} className="flex items-start gap-3 border-b border-border/50 p-4 last:border-b-0">
                <Flag className="mt-0.5 size-4 shrink-0 text-destructive" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{item.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{item.reason}</p>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">{item.createdAt}</span>
              </div>
            ))}
          </div>
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="font-heading text-lg font-semibold">Casos recientes</h2>
              <p className="text-xs text-muted-foreground">Seguimiento del recorrido completo</p>
            </div>
            <Link href="/admin/casos" className="flex items-center gap-1 text-sm font-medium text-primary">
              Ver todos <ArrowRight className="size-4" />
            </Link>
          </div>
          <div className="overflow-hidden rounded-lg border border-border/60 bg-card">
            {ADMIN_CASES.slice(0, 4).map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-3 border-b border-border/50 p-4 last:border-b-0">
                <div>
                  <p className="font-medium">{item.pet}</p>
                  <p className="text-xs text-muted-foreground">{item.id} · {item.area}</p>
                </div>
                <span className="rounded-md bg-muted px-2 py-1 text-xs font-medium">{item.status}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
