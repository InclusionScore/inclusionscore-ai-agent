import { AppShell } from "@/components/app-shell";
import {
  assessmentPrograms,
  clientMetrics,
  clientPriorities,
  clientWorkspace,
  evidenceItems,
  reportOutputs,
  riskIndicators,
  serviceRequests
} from "@/lib/client-portal-data";

export default function Home() {
  return (
    <AppShell>
      <header className="page-header">
        <div>
          <p className="eyebrow">Client Portal</p>
          <h1>{clientWorkspace.organization}</h1>
          <p className="muted">
            {clientWorkspace.planStage} with {clientWorkspace.advisor} for {clientWorkspace.reportingPeriod}.
          </p>
        </div>
        <div className="header-actions">
          <button className="secondary-action">Request advisor help</button>
          <button className="primary-action">Start assessment</button>
        </div>
      </header>

      <div className="grid metrics">
        {clientMetrics.map((metric) => (
          <section className="metric-card" data-tone={metric.tone} key={metric.label}>
            <div className="muted">{metric.label}</div>
            <div className="metric-value">{metric.value}</div>
            <div className="muted">{metric.note}</div>
          </section>
        ))}
      </div>

      <div className="dashboard-grid">
        <section className="panel panel-wide">
          <div className="section-heading">
            <div>
              <h2>Priority Work</h2>
              <p className="muted">Workforce risk, evidence, certification, and insurance actions due next.</p>
            </div>
            <a className="text-link" href="/work-queue">View all</a>
          </div>
          <div className="data-table compact-table">
            {clientPriorities.map((item) => (
              <div className="table-row" key={item.title}>
                <span className="pill">{item.category}</span>
                <strong>{item.title}</strong>
                <span className="muted">{item.owner}</span>
                <span>{item.due}</span>
                <span className="status-chip">{item.status}</span>
              </div>
            ))}
          </div>
        </section>

        <aside className="panel">
          <h2>AI DISM Advisor</h2>
          <p className="muted">Recommended next actions from current evidence, risk, and readiness signals.</p>
          <div className="recommendation-list">
            {clientPriorities.slice(0, 3).map((item) => (
              <div className="recommendation" key={item.title}>
                <strong>{item.title}</strong>
                <span className="muted">{item.impact}</span>
              </div>
            ))}
          </div>
        </aside>

        <section className="panel panel-wide">
          <div className="section-heading">
            <div>
              <h2>Assessments</h2>
              <p className="muted">Readiness programs in flight for the client workspace.</p>
            </div>
            <a className="text-link" href="/assessments">Open assessments</a>
          </div>
          <div className="program-grid">
            {assessmentPrograms.map((program) => (
              <article className="program-card" key={program.name}>
                <div className="section-heading compact">
                  <strong>{program.name}</strong>
                  <span className="status-chip">{program.status}</span>
                </div>
                <div className="progress-track" aria-label={`${program.name} progress`}>
                  <span style={{ width: `${program.progress}%` }} />
                </div>
                <p className="muted">{program.nextStep}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="panel">
          <h2>Evidence Health</h2>
          <div className="status-list">
            {evidenceItems.slice(0, 3).map((item) => (
              <div className="status-row" key={item.title}>
                <div>
                  <strong>{item.title}</strong>
                  <span className="muted">{item.mappedTo}</span>
                </div>
                <span className="status-chip">{item.sufficiency}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="panel">
          <h2>Service Requests</h2>
          <div className="status-list">
            {serviceRequests.map((request) => (
              <div className="status-row" key={request.id}>
                <div>
                  <strong>{request.id}</strong>
                  <span className="muted">{request.service}</span>
                </div>
                <span>{request.status}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="panel">
          <h2>Risk Indicators</h2>
          <div className="status-list">
            {riskIndicators.map((risk) => (
              <div className="status-row" key={risk.factor}>
                <div>
                  <strong>{risk.factor}</strong>
                  <span className="muted">{risk.signal}</span>
                </div>
                <span className="status-chip">{risk.score}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="panel">
          <h2>Reports</h2>
          <div className="status-list">
            {reportOutputs.map((report) => (
              <div className="status-row" key={report.name}>
                <div>
                  <strong>{report.name}</strong>
                  <span className="muted">{report.audience}</span>
                </div>
                <span>{report.status}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
