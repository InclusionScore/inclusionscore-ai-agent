import { AppShell } from "@/components/app-shell";
import { WorkforceRiskIndexDashboard } from "@/components/workforce-risk-index-dashboard";

export default function WorkforceRiskIndexBenchmarkPage() {
  return (
    <AppShell>
      <WorkforceRiskIndexDashboard mode="benchmark" />
    </AppShell>
  );
}
