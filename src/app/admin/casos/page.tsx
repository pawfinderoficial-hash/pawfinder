"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Input } from "@/components/ui/input";
import { ADMIN_CASES } from "@/lib/mock-admin";

export default function AdminCasosPage() {
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLowerCase();
  const cases = ADMIN_CASES.filter((item) =>
    [item.id, item.pet, item.area, item.status]
      .join(" ")
      .toLowerCase()
      .includes(normalizedQuery),
  );

  return (
    <>
      <AdminPageHeader
        title="Casos"
        description="Avisos, coincidencias y resoluciones de la comunidad"
      />
      <div className="mb-4 flex max-w-md items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Buscar por ID, mascota o zona"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
      </div>
      <div className="overflow-x-auto rounded-lg border border-border/60 bg-card">
        <table className="w-full min-w-[700px] text-left text-sm">
          <thead className="border-b border-border/60 bg-muted/40 text-xs text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Caso</th>
              <th className="px-4 py-3 font-medium">Tipo</th>
              <th className="px-4 py-3 font-medium">Zona</th>
              <th className="px-4 py-3 font-medium">Estado</th>
              <th className="px-4 py-3 font-medium">Candidatos</th>
              <th className="px-4 py-3 font-medium">Antiguedad</th>
            </tr>
          </thead>
          <tbody>
            {cases.map((item) => (
              <tr key={item.id} className="border-b border-border/50 last:border-b-0">
                <td className="px-4 py-3"><p className="font-medium">{item.pet}</p><p className="text-xs text-muted-foreground">{item.id}</p></td>
                <td className="px-4 py-3">{item.type}</td>
                <td className="px-4 py-3">{item.area}</td>
                <td className="px-4 py-3"><span className="rounded-md bg-muted px-2 py-1 text-xs font-medium">{item.status}</span></td>
                <td className="px-4 py-3">{item.candidates}</td>
                <td className="px-4 py-3 text-muted-foreground">{item.age}</td>
              </tr>
            ))}
            {cases.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">No hay casos que coincidan con la busqueda.</td></tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </>
  );
}
