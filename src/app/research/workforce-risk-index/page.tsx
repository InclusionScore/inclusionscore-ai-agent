import Link from "next/link";
import { WorkforceRiskIndexDashboard } from "@/components/workforce-risk-index-dashboard";

export default function PublicWorkforceRiskIndexPage() {
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
      <WorkforceRiskIndexDashboard mode="public" />
    </main>
  );
}
