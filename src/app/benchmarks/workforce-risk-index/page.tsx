import { AppShell } from "@/components/app-shell";
import { WorkforceRiskIndexDashboard } from "@/components/workforce-risk-index-dashboard";
import { loadPublishedWorkforceIndexCompanies } from "@/lib/workforce-index/supabase";

export const dynamic = "force-dynamic";

export default async function WorkforceRiskIndexBenchmarkPage() {
  const workforceIndex = await loadPublishedWorkforceIndexCompanies();

  return (
    <AppShell>
      <WorkforceRiskIndexDashboard mode="benchmark" companies={workforceIndex.companies} source={workforceIndex.source} />
    </AppShell>
  );
}
