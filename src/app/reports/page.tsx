import { AppShell } from "@/components/app-shell";
import { ReportDraftGenerator } from "@/components/report-draft-generator";
import { reportOutputs } from "@/lib/client-portal-data";

export default function ReportsPage() {
  return (
    <AppShell>
      <header className="page-header">
        <div>
          <p className="eyebrow">Client Portal</p>
          <h1>Reports</h1>
          <p className="muted">Maturity, certification readiness, underwriting, and executive reporting outputs.</p>
        </div>
        <button className="primary-action">Generate report</button>
      </header>

      <section className="report-grid">
        {reportOutputs.map((report) => (
          <article className="report-card" key={report.name}>
            <div className="section-heading compact">
              <h2>{report.name}</h2>
              <span className="status-chip">{report.status}</span>
            </div>
            <p className="muted">{report.contents}</p>
            <dl className="meta-list">
              <div>
                <dt>Audience</dt>
                <dd>{report.audience}</dd>
              </div>
            </dl>
          </article>
        ))}
      </section>

      <ReportDraftGenerator />
    </AppShell>
  );
}
