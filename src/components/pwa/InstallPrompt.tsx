"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
};

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const standalone = window.matchMedia("(display-mode: standalone)");
    if (standalone.matches) return;

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
      setVisible(true);
    };

    const handleInstalled = () => {
      setDeferredPrompt(null);
      setVisible(false);
    };

    const handleDisplayModeChange = (event: MediaQueryListEvent) => {
      if (event.matches) handleInstalled();
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleInstalled);
    standalone.addEventListener("change", handleDisplayModeChange);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleInstalled);
      standalone.removeEventListener("change", handleDisplayModeChange);
    };
  }, []);

  if (!visible || !deferredPrompt) return null;

  const install = async () => {
    const prompt = deferredPrompt;
    setVisible(false);

    try {
      await prompt.prompt();
      await prompt.userChoice;
    } finally {
      setDeferredPrompt(null);
    }
  };

  return (
    <button
      type="button"
      onClick={() => void install()}
      className="fixed inset-x-4 bottom-[calc(5rem+env(safe-area-inset-bottom))] z-[60] mx-auto flex w-[calc(100%-2rem)] max-w-md items-center gap-3 rounded-xl border border-primary bg-card p-3 text-left shadow-lg"
      aria-label="Instalá PawFinder como aplicación"
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <Download className="size-5" aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-heading text-sm font-semibold text-foreground">
          Instalá la app
        </span>
        <span className="block text-xs text-muted-foreground">
          Accedé a PawFinder desde tu pantalla de inicio
        </span>
      </span>
      <span className="font-heading text-xs font-semibold text-foreground">
        Instalar
      </span>
    </button>
  );
}
