"use client";

import { BottomNav } from "@/components/layout/bottom-nav";
import { PageTransition } from "@/components/layout/page-transition";
import { LocationGate } from "@/components/location/location-gate";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <LocationGate>
      <div className="pf-atmosphere flex min-h-dvh flex-col">
        <main className="mx-auto w-full max-w-lg flex-1 pb-24 md:max-w-2xl">
          <PageTransition>{children}</PageTransition>
        </main>
        <BottomNav />
      </div>
    </LocationGate>
  );
}
