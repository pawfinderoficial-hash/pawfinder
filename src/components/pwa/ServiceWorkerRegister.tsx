"use client";

import { useEffect } from "react";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    void navigator.serviceWorker.register("/sw.js").catch((error: unknown) => {
      if (process.env.NODE_ENV === "development") {
        console.error("No se pudo registrar el service worker de PawFinder.", error);
      }
    });
  }, []);

  return null;
}
