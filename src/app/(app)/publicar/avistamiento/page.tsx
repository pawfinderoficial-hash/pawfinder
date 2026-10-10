"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AppHeader } from "@/components/layout/app-header";
import { SightingForm } from "@/components/publish/sighting-form";

function AvistamientoContent() {
  const searchParams = useSearchParams();
  const lostPostId = searchParams.get("lostPostId") ?? "";
  const lostPostName = searchParams.get("name") ?? undefined;

  if (!lostPostId) {
    return (
      <div className="px-5 py-10 text-center text-sm text-muted-foreground">
        Falta el aviso de pérdida vinculado. Volvé al feed y elegí «Puede ser».
      </div>
    );
  }

  return <SightingForm lostPostId={lostPostId} lostPostName={lostPostName} />;
}

export default function PublicarAvistamientoPage() {
  return (
    <>
      <AppHeader title="Avistamiento" />
      <Suspense
        fallback={
          <p className="px-5 py-8 text-sm text-muted-foreground">Cargando…</p>
        }
      >
        <AvistamientoContent />
      </Suspense>
    </>
  );
}
