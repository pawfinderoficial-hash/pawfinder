import { FlowHeader } from "@/components/layout/flow-header";
import { PublishForm } from "@/components/publish/publish-form";

export default function PublicarPerdidaPage() {
  return (
    <>
      <FlowHeader title="Mascota perdida" />
      <PublishForm kind="lost" />
    </>
  );
}
