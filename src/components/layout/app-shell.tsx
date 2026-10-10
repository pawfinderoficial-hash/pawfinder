"use client";

import { usePathname } from "next/navigation";
import { BottomNav } from "@/components/layout/bottom-nav";
import { PageTransition } from "@/components/layout/page-transition";
import { LocationGate } from "@/components/location/location-gate";
import { cn } from "@/lib/utils";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPublishFlow = pathname.startsWith("/publicar/");

  return (
    <LocationGate>
      <div className="pf-atmosphere flex min-h-dvh flex-col">
        <main
          className={cn(
            "mx-auto w-full max-w-lg flex-1 md:max-w-2xl",
            isPublishFlow ? "pb-28" : "pb-24",
          )}
        >
          <PageTransition>{children}</PageTransition>
        </main>
        {isPublishFlow ? null : <BottomNav />}
      </div>
    </LocationGate>
  );
}
