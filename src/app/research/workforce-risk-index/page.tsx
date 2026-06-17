import Link from "next/link";
import { WorkforceRiskIndexDashboard } from "@/components/workforce-risk-index-dashboard";
import { loadPublishedWorkforceIndexCompanies } from "@/lib/workforce-index/supabase";

export const dynamic = "force-dynamic";

export default async function PublicWorkforceRiskIndexPage() {
  const workforceIndex = await loadPublishedWorkforceIndexCompanies();

  return (
    <main className="landing-page research-page">
      <nav className="landing-nav" aria-label="Research navigation">
        <strong>InclusionScore Research</strong>
        <div>
          <Link href="/">Home</Link>
          <Link href="/benchmarks/workforce-risk-index">Benchmark workspace</Link>
          <Link className="primary-action" href="/client-portal">
            Launch demo
          </Link>
        </div>
      </nav>
      <WorkforceRiskIndexDashboard mode="public" companies={workforceIndex.companies} source={workforceIndex.source} />
    </main>
  );
}
