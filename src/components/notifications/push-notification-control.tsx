"use client";

import { useEffect, useState } from "react";
import { BellRing, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type PushState = "checking" | "unsupported" | "off" | "on" | "denied" | "busy";

function urlBase64ToUint8Array(value: string) {
  const padding = "=".repeat((4 - (value.length % 4)) % 4);
  const base64 = (value + padding).replace(/-/g, "+").replace(/_/g, "/");
  return Uint8Array.from(window.atob(base64), (character) => character.charCodeAt(0));
}

export function PushNotificationControl() {
  const [state, setState] = useState<PushState>("checking");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) {
      const timer = window.setTimeout(() => setState("unsupported"), 0);
      return () => window.clearTimeout(timer);
    }
    if (Notification.permission === "denied") {
      const timer = window.setTimeout(() => setState("denied"), 0);
      return () => window.clearTimeout(timer);
    }
    void navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => registration.pushManager.getSubscription())
      .then((subscription) => setState(subscription ? "on" : "off"))
      .catch(() => setState("unsupported"));
  }, []);

  const enable = async () => {
    setState("busy");
    setMessage(null);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setState(permission === "denied" ? "denied" : "off");
        return;
      }
      const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!publicKey) throw new Error("Falta configurar la clave de notificaciones.");
      const registration = await navigator.serviceWorker.ready;
      const subscription =
        (await registration.pushManager.getSubscription()) ??
        (await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey),
        }));
      const response = await fetch("/api/push/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subscription.toJSON()),
      });
      if (!response.ok) throw new Error("No pudimos guardar la suscripción.");
      setState("on");
      setMessage("Listo. Te avisaremos aunque PawFinder no esté abierto.");
    } catch (error) {
      setState("off");
      setMessage(error instanceof Error ? error.message : "No pudimos activar las notificaciones.");
    }
  };

  const disable = async () => {
    setState("busy");
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    if (subscription) {
      await fetch("/api/push/subscriptions", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint: subscription.endpoint }),
      });
      await subscription.unsubscribe();
    }
    setState("off");
    setMessage("Notificaciones desactivadas en este dispositivo.");
  };

  if (state === "checking") return null;

  return (
    <section className="rounded-xl border border-primary/15 bg-primary/[0.05] p-3">
      <div className="flex items-center gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <BellRing className="size-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">Avisos importantes</p>
          <p className="text-xs leading-relaxed text-muted-foreground">
            {state === "on"
              ? "Activos en este dispositivo"
              : state === "denied"
                ? "Bloqueados en la configuración del navegador"
                : state === "unsupported"
                  ? "En iPhone, agregá PawFinder a inicio para activarlos"
                  : "Recibí matches y avistamientos aunque cierres PawFinder"}
          </p>
        </div>
        {state !== "unsupported" && state !== "denied" ? (
          <Button
            type="button"
            size="sm"
            variant={state === "on" ? "outline" : "default"}
            disabled={state === "busy"}
            onClick={() => void (state === "on" ? disable() : enable())}
          >
            {state === "busy" ? <Loader2 className="size-4 animate-spin" /> : state === "on" ? "Desactivar" : "Activar"}
          </Button>
        ) : null}
      </div>
      {message ? <p className="mt-2 text-xs text-muted-foreground" role="status">{message}</p> : null}
    </section>
  );
}
