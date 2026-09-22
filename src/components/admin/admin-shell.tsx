"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowLeft,
  BriefcaseBusiness,
  LayoutDashboard,
  PawPrint,
  ShieldCheck,
  Store,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

const adminLinks = [
  { href: "/admin", label: "Resumen", icon: LayoutDashboard },
  { href: "/admin/moderacion", label: "Moderacion", icon: ShieldCheck },
  { href: "/admin/casos", label: "Casos", icon: BriefcaseBusiness },
  { href: "/admin/usuarios", label: "Usuarios", icon: Users },
  { href: "/admin/auspiciantes", label: "Auspiciantes", icon: Store },
];

function AdminLink({
  href,
  label,
  icon: Icon,
}: (typeof adminLinks)[number]) {
  const pathname = usePathname();
  const active = href === "/admin" ? pathname === href : pathname.startsWith(href);

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        active
          ? "bg-primary/12 text-primary"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
      )}
    >
      <Icon className="size-4" />
      {label}
    </Link>
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-background text-foreground md:grid md:grid-cols-[15rem_minmax(0,1fr)]">
      <aside className="hidden border-r border-border/60 bg-card md:flex md:flex-col">
        <div className="flex items-center gap-3 border-b border-border/60 px-5 py-5">
          <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <PawPrint className="size-5" />
          </span>
          <div>
            <p className="font-heading font-semibold">PawFinder</p>
            <p className="text-xs text-muted-foreground">Administracion</p>
          </div>
        </div>
        <nav className="flex-1 space-y-1 p-3" aria-label="Panel de administracion">
          {adminLinks.map((link) => (
            <AdminLink key={link.href} {...link} />
          ))}
        </nav>
        <div className="border-t border-border/60 p-3">
          <Link
            href="/feed"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Volver a la app
          </Link>
          <p className="px-3 pt-3 text-[0.7rem] text-muted-foreground">
            Entorno demo, sin acciones reales
          </p>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="border-b border-border/60 bg-card md:hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2">
              <PawPrint className="size-5 text-primary" />
              <span className="font-heading font-semibold">Administracion</span>
            </div>
            <Link href="/feed" aria-label="Volver a la app">
              <ArrowLeft className="size-5" />
            </Link>
          </div>
          <nav className="flex gap-1 overflow-x-auto px-3 pb-3" aria-label="Panel de administracion">
            {adminLinks.map((link) => (
              <AdminLink key={link.href} {...link} />
            ))}
          </nav>
        </header>
        <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
