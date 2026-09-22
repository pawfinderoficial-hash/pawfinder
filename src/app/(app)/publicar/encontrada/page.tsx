import { AppHeader } from "@/components/layout/app-header";
import { PublishForm } from "@/components/publish/publish-form";

export default function PublicarEncontradaPage() {
  return (
    <>
      <AppHeader title="Publicar" subtitle="Mascota encontrada" />
      <PublishForm kind="found" />
    </>
  );
}
