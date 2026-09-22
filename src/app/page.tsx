"use client";

import { useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { PawPrint, Heart, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

function GoogleMark({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      aria-hidden
      focusable="false"
    >
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

export default function HomePage() {
  const router = useRouter();
  const { status } = useSession();
  const [loading, setLoading] = useState(false);

  if (status === "authenticated") {
    router.replace("/feed");
    return null;
  }

  const continueWithGoogle = async () => {
    setLoading(true);
    await signIn("google", { callbackUrl: "/feed" });
    setLoading(false);
  };

  return (
    <div className="pf-atmosphere flex min-h-full flex-col">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-4 py-8 md:max-w-lg md:py-12">
        <div className="mb-8 text-center">
          <div
            className="mx-auto mb-4 flex size-[4.25rem] items-center justify-center rounded-[1.25rem] bg-primary text-primary-foreground shadow-md"
            aria-hidden
          >
            <PawPrint className="size-9" strokeWidth={2.25} />
          </div>
          <h1 className="pf-heading-brand font-heading font-semibold text-foreground">
            PawFinder
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Reuní mascotas perdidas con quienes las encontraron. Hecho con cariño
            para tu barrio.
          </p>
        </div>

        <Card className="pf-surface-soft border border-border/40 shadow-none">
          <CardContent className="space-y-4 pt-6">
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="h-12 w-full gap-3 rounded-xl border-border/80 bg-white text-[0.95rem] font-semibold text-foreground shadow-sm hover:bg-white/95 dark:bg-card"
              onClick={() => void continueWithGoogle()}
              disabled={loading}
            >
              <GoogleMark className="size-5 shrink-0" />
              {loading ? "Conectando…" : "Continuar con Google"}
            </Button>
            <p className="text-center text-[0.7rem] leading-snug text-muted-foreground">
              Usamos tu cuenta Google solo para identificarte y proteger tus avisos.
            </p>
          </CardContent>
        </Card>

        <ul className="mt-8 space-y-3 text-sm text-muted-foreground">
          <li className="flex gap-2">
            <Heart className="size-4 shrink-0 text-primary" />
            Deslizá publicaciones de mascotas perdidas y encontradas
          </li>
          <li className="flex gap-2">
            <Shield className="size-4 shrink-0 text-primary" />
            Fotos en Cloudinary, datos en Postgres — v1 funcional
          </li>
        </ul>
      </div>
    </div>
  );
}
