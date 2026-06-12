import { AppShell } from "@/components/app-shell";

const clientPortfolio = [
  { client: "Acme Corp", readiness: "71%", risk: "Preferred", blocker: "Manager training evidence" },
  { client: "Northstar Health", readiness: "58%", risk: "Watchlist", blocker: "Accommodation workflow" },
  { client: "CivicWorks", readiness: "82%", risk: "Preferred", blocker: "Board reporting package" }
] as const;

export default function AdvisorPortalPage() {
  return (
    <AppShell>
      <header className="page-header">
        <div>
          <p className="eyebrow">Advisor Portal</p>
          <h1>Portfolio Oversight</h1>
          <p className="muted">Mocked advisor workspace for client readiness, evidence review, service requests, and implementation planning.</p>
        </div>
        <button className="primary-action">Create implementation plan</button>
      </header>

      <section className="panel">
        <div className="data-table">
          <div className="table-row table-head">
            <span>Client</span>
            <span>Readiness</span>
            <span>Risk tier</span>
            <span>Current blocker</span>
            <span>Advisor action</span>
          </div>
          {clientPortfolio.map((client) => (
            <div className="table-row" key={client.client}>
              <strong>{client.client}</strong>
              <span>{client.readiness}</span>
              <span className="status-chip">{client.risk}</span>
              <span>{client.blocker}</span>
              <span className="muted">Review and assign next task</span>
            </div>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
