"use client";

import { BottomNav } from "@/components/layout/bottom-nav";
import { PageTransition } from "@/components/layout/page-transition";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="pf-atmosphere flex min-h-full flex-col">
      <main className="mx-auto w-full max-w-lg flex-1 pb-24 md:max-w-2xl">
        <PageTransition>{children}</PageTransition>
      </main>
      <BottomNav />
    </div>
  );
}
