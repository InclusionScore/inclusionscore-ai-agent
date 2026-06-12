import Link from "next/link";
import { AppShell } from "@/components/app-shell";

const demoLinks = [
  { label: "Client Portal", href: "/client-portal", description: "Client dashboard, work queue, evidence, and service requests." },
  { label: "Advisor Portal", href: "/advisor-portal", description: "Portfolio oversight and advisor delivery workflow." },
  { label: "Assessments", href: "/assessments", description: "DISM diagnostics, maturity, certification, and EPL readiness." },
  { label: "Evidence", href: "/evidence", description: "Evidence health, sufficiency, freshness, and standards mapping." },
  { label: "Risks", href: "/risks", description: "Workforce risk indicators and treatment planning." },
  { label: "Reports", href: "/reports", description: "Executive, certification, and underwriting report outputs." },
  { label: "AI DISM Advisor", href: "/agent", description: "Mocked consultant guidance and action recommendations." }
] as const;

export default function Home() {
  return (
    <AppShell>
      <header className="page-header">
        <div>
          <p className="eyebrow">InclusionScore AI Agent</p>
          <h1>Workforce Risk Management Demo</h1>
          <p className="muted">A mocked ServiceNow-style demo for DISM workflows, certification readiness, evidence, risk, reports, and advisor guidance.</p>
        </div>
        <div className="header-actions">
          <Link className="secondary-action" href="/agent">Open AI advisor</Link>
          <Link className="primary-action" href="/client-portal">Open client portal</Link>
        </div>
      </header>

      <section className="portal-grid">
        {demoLinks.map((link) => (
          <Link className="portal-card" href={link.href} key={link.href}>
            <strong>{link.label}</strong>
            <span className="muted">{link.description}</span>
          </Link>
        ))}
      </section>
    </AppShell>
  );
}
