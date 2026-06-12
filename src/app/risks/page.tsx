import { AppShell } from "@/components/app-shell";
import { riskIndicators } from "@/lib/client-portal-data";

export default function RisksPage() {
  return (
    <AppShell>
      <header className="page-header">
        <div>
          <p className="eyebrow">Client Portal</p>
          <h1>Risks</h1>
          <p className="muted">Workforce risk indicators, treatment plans, and underwriting signal drivers.</p>
        </div>
        <button className="secondary-action">Export register</button>
      </header>

      <section className="panel">
        <div className="data-table risk-table">
          <div className="table-row table-head">
            <span>Risk factor</span>
            <span>Score</span>
            <span>Signal</span>
            <span>Treatment</span>
          </div>
          {riskIndicators.map((risk) => (
            <div className="table-row" key={risk.factor}>
              <strong>{risk.factor}</strong>
              <span className="status-chip">{risk.score}</span>
              <span>{risk.signal}</span>
              <span className="muted">{risk.treatment}</span>
            </div>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
