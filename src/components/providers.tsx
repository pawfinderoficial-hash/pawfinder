"use client";

import { SessionProvider } from "next-auth/react";
import { PawFinderProvider } from "@/context/pawfinder-context";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <PawFinderProvider>{children}</PawFinderProvider>
    </SessionProvider>
  );
}
