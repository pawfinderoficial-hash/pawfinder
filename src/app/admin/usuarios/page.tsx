"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Input } from "@/components/ui/input";
import { ADMIN_USERS } from "@/lib/mock-admin";

export default function AdminUsuariosPage() {
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLowerCase();
  const users = ADMIN_USERS.filter((user) =>
    [user.name, user.email, user.status]
      .join(" ")
      .toLowerCase()
      .includes(normalizedQuery),
  );

  return (
    <>
      <AdminPageHeader
        title="Usuarios"
        description="Actividad, reputacion y estado de las cuentas"
      />
      <div className="relative mb-4 max-w-md">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Buscar nombre o email"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>
      <div className="overflow-x-auto rounded-lg border border-border/60 bg-card">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-border/60 bg-muted/40 text-xs text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Usuario</th>
              <th className="px-4 py-3 font-medium">Estado</th>
              <th className="px-4 py-3 font-medium">Avisos</th>
              <th className="px-4 py-3 font-medium">Resueltos</th>
              <th className="px-4 py-3 font-medium">Registro</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.email} className="border-b border-border/50 last:border-b-0">
                <td className="px-4 py-3"><p className="font-medium">{user.name}</p><p className="text-xs text-muted-foreground">{user.email}</p></td>
                <td className="px-4 py-3"><span className="rounded-md bg-muted px-2 py-1 text-xs font-medium">{user.status}</span></td>
                <td className="px-4 py-3">{user.reports}</td>
                <td className="px-4 py-3">{user.resolved}</td>
                <td className="px-4 py-3 text-muted-foreground">{user.joined}</td>
              </tr>
            ))}
            {users.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">No hay usuarios que coincidan con la busqueda.</td></tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </>
  );
}
