"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AppHeader } from "@/components/layout/app-header";
import { PublishForm } from "@/components/publish/publish-form";

function EncontradaContent() {
  const searchParams = useSearchParams();
  const targetLostPostId = searchParams.get("targetLostPostId") ?? undefined;

  return (
    <PublishForm kind="found" targetLostPostId={targetLostPostId} />
  );
}

export default function PublicarEncontradaPage() {
  return (
    <>
      <AppHeader title="Publicar" subtitle="Mascota encontrada" />
      <Suspense
        fallback={
          <p className="px-5 py-8 text-sm text-muted-foreground">Cargando…</p>
        }
      >
        <EncontradaContent />
      </Suspense>
    </>
  );
}
