import { AppShell } from "@/components/app-shell";
import { ClientDashboard } from "@/components/client-dashboard";

export default function ClientPortalPage() {
  return (
    <AppShell>
      <ClientDashboard />
    </AppShell>
  );
}
