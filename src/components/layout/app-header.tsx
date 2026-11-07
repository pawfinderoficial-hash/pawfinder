"use client";

import Link from "next/link";
import { Bell, PawPrint } from "lucide-react";
import { usePawFinder } from "@/context/pawfinder-context";
import { BrandWordmark } from "@/components/layout/brand-wordmark";

interface AppHeaderProps {
  title: string;
  showNotificationBell?: boolean;
}

export function AppHeader({
  title,
  showNotificationBell = true,
}: AppHeaderProps) {
  const { userName, unreadNotificationCount } = usePawFinder();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/96 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-lg items-center justify-between gap-2 px-4 md:max-w-2xl">
        <div className="flex min-w-0 flex-1 items-center gap-2.5">
          {title === "PawFinder" ? (
            <BrandWordmark className="text-xl" />
          ) : (
            <>
              <div
                className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground"
                aria-hidden
              >
                <PawPrint className="size-5" strokeWidth={2.25} />
              </div>
              <h1 className="truncate font-heading text-base font-semibold leading-tight text-foreground">
                {title}
              </h1>
            </>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          {showNotificationBell ? (
            <Link
              href="/notificaciones"
              className="relative flex size-10 items-center justify-center rounded-lg border border-border bg-card text-foreground transition-colors hover:bg-muted"
              aria-label={
                unreadNotificationCount > 0
                  ? `Notificaciones, ${unreadNotificationCount} sin leer`
                  : "Notificaciones"
              }
            >
              <Bell className="size-[1.15rem]" strokeWidth={2.1} />
              {unreadNotificationCount > 0 ? (
                <span
                  className="absolute -right-0.5 -top-0.5 flex min-w-[1.125rem] items-center justify-center rounded-full bg-primary px-1 text-[0.65rem] font-bold leading-none text-primary-foreground ring-2 ring-background"
                >
                  {unreadNotificationCount > 9 ? "9+" : unreadNotificationCount}
                </span>
              ) : null}
            </Link>
          ) : null}
          {userName ? (
            <span
              className="max-w-24 truncate rounded-full bg-primary px-3 py-2 font-heading text-xs font-semibold text-primary-foreground"
              title={`Hola, ${userName.split(" ")[0]}`}
              aria-label={`Usuario: ${userName}`}
            >
              Hola, {userName.split(" ")[0]}
            </span>
          ) : null}
        </div>
      </div>
    </header>
  );
}
