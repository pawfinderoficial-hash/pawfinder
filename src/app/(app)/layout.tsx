import { AppShell } from "@/components/layout/app-shell";
import { InstallPrompt } from "@/components/pwa/InstallPrompt";

export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <AppShell>{children}</AppShell>
      <InstallPrompt />
    </>
  );
}
