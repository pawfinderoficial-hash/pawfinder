import { AppHeader } from "@/components/layout/app-header";
import { PublishForm } from "@/components/publish/publish-form";

export default function PublicarPerdidaPage() {
  return (
    <>
      <AppHeader title="Publicar" subtitle="Mascota perdida" />
      <PublishForm kind="lost" />
    </>
  );
}
