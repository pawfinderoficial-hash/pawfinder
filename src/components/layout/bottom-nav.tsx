"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  ClipboardList,
  HeartHandshake,
  MapPin,
  PawPrint,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePawFinder } from "@/context/pawfinder-context";

const links = [
  { href: "/feed", label: "Explorar", icon: PawPrint },
  { href: "/mapa", label: "Mapa", icon: MapPin },
  { href: "/match", label: "Match", icon: HeartHandshake },
  { href: "/mis-avisos", label: "Publicaciones", icon: ClipboardList },
];

const navSpring = { type: "spring" as const, stiffness: 420, damping: 32 };

export function BottomNav() {
  const pathname = usePathname();
  const { pendingMatch, pendingSightings } = usePawFinder();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/98 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl"
      aria-label="Navegación principal"
    >
      <div className="mx-auto grid h-[4.25rem] w-full max-w-lg grid-cols-4 items-stretch px-2 md:max-w-2xl">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          const showBadge =
            href === "/match" &&
            (Boolean(pendingMatch) || pendingSightings.length > 0);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "relative flex h-[4.25rem] min-w-0 flex-col items-center justify-center gap-1 px-1 text-[0.68rem] font-semibold transition-colors",
                active
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {active ? (
                <motion.span
                  layoutId="pf-nav-active"
                  className="absolute left-1/2 top-0 h-1 w-10 -translate-x-1/2 rounded-b-md bg-primary"
                  transition={navSpring}
                  aria-hidden
                />
              ) : null}
              <span className="relative">
                <Icon
                  className="size-[1.3rem]"
                  strokeWidth={active ? 2.35 : 2}
                />
                {showBadge ? (
                  <span
                    className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full bg-destructive ring-2 ring-card"
                    aria-hidden
                  />
                ) : null}
              </span>
              <span className="relative whitespace-nowrap">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
