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
  const { pendingMatch } = usePawFinder();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/50 bg-card/88 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl"
      aria-label="Navegación principal"
    >
      <div className="mx-auto flex max-w-lg items-stretch justify-around px-2 py-1.5 md:max-w-2xl">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          const showBadge = href === "/match" && pendingMatch;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "relative flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-2xl px-2 py-2 text-[0.7rem] font-semibold transition-colors",
                active
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {active ? (
                <motion.span
                  layoutId="pf-nav-active"
                  className="absolute inset-0 rounded-2xl bg-primary/10"
                  transition={navSpring}
                  aria-hidden
                />
              ) : null}
              <span className="relative">
                <Icon
                  className="size-[1.35rem]"
                  strokeWidth={active ? 2.35 : 2}
                />
                {showBadge ? (
                  <span
                    className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full bg-primary ring-2 ring-card"
                    aria-hidden
                  />
                ) : null}
              </span>
              <span className="relative">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
