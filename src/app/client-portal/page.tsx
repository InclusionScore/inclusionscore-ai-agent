import { AppShell } from "@/components/app-shell";
import { AssessmentWorkflow } from "@/components/assessment-workflow";
import { AuthPanel } from "@/components/auth-panel";
import { ClientDashboard } from "@/components/client-dashboard";
import { ClientDashboardLiveResults } from "@/components/client-dashboard-live-results";
import { DismDiagnosticDemo } from "@/components/dism-diagnostic-demo";
import { EvidenceTable } from "@/components/evidence-table";
import { WorkspaceSummary } from "@/components/workspace-summary";

export default function ClientPortalPage() {
  return (
    <AppShell>
      <AuthPanel />
      <WorkspaceSummary />
      <ClientDashboard />
      <ClientDashboardLiveResults />
      <DismDiagnosticDemo />
      <AssessmentWorkflow />
      <EvidenceTable />
    </AppShell>
  );
}
