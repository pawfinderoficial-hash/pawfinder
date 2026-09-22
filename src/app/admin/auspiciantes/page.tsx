"use client";

import { useState } from "react";
import { Plus, Store } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ADMIN_SPONSORS } from "@/lib/mock-admin";

export default function AdminAuspiciantesPage() {
  const [sponsors, setSponsors] = useState(ADMIN_SPONSORS);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [benefit, setBenefit] = useState("");

  return (
    <>
      <AdminPageHeader
        title="Auspiciantes"
        description="Beneficios y puntos seguros, separados de las alertas operativas"
      >
        <Button size="sm" onClick={() => setOpen(true)}>
          <Plus className="size-4" />Nuevo auspiciante
        </Button>
      </AdminPageHeader>
      <ul className="grid gap-3 lg:grid-cols-2">
        {sponsors.map((sponsor) => (
          <li key={sponsor.name} className="rounded-lg border border-border/60 bg-card p-4">
            <div className="flex items-start gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-900">
                <Store className="size-5" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="font-heading font-semibold">{sponsor.name}</h2>
                  <span className="rounded-md bg-muted px-2 py-1 text-xs font-medium">{sponsor.status}</span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{sponsor.category} · {sponsor.benefit}</p>
                <p className="mt-3 text-xs text-muted-foreground">{sponsor.impressions.toLocaleString("es-AR")} impresiones en la demo</p>
              </div>
            </div>
          </li>
        ))}
      </ul>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-full max-w-md">
          <SheetHeader>
            <SheetTitle className="text-left font-heading">Nuevo auspiciante</SheetTitle>
          </SheetHeader>
          <form
            className="space-y-4 px-4 pb-6"
            onSubmit={(event) => {
              event.preventDefault();
              if (!name.trim() || !category.trim() || !benefit.trim()) return;
              setSponsors((current) => [
                ...current,
                {
                  name: name.trim(),
                  category: category.trim(),
                  benefit: benefit.trim(),
                  status: "Borrador",
                  impressions: 0,
                },
              ]);
              setName("");
              setCategory("");
              setBenefit("");
              setOpen(false);
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="sponsor-name">Nombre</Label>
              <Input id="sponsor-name" value={name} onChange={(event) => setName(event.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sponsor-category">Categoria</Label>
              <Input id="sponsor-category" value={category} onChange={(event) => setCategory(event.target.value)} placeholder="Veterinaria, pet shop..." required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sponsor-benefit">Beneficio o punto seguro</Label>
              <Input id="sponsor-benefit" value={benefit} onChange={(event) => setBenefit(event.target.value)} required />
            </div>
            <p className="text-xs text-muted-foreground">
              Se guardara como borrador y no aparecera en la app publica.
            </p>
            <Button type="submit" className="w-full">Guardar borrador</Button>
          </form>
        </SheetContent>
      </Sheet>
    </>
  );
}
