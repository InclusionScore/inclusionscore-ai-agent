import { AppShell } from "@/components/app-shell";
import { assessmentPrograms } from "@/lib/client-portal-data";

export default function AssessmentsPage() {
  return (
    <AppShell>
      <header className="page-header">
        <div>
          <p className="eyebrow">Client Portal</p>
          <h1>Assessments</h1>
          <p className="muted">Diagnostics, DISM maturity, certification readiness, and workforce risk reviews.</p>
        </div>
        <button className="primary-action">New assessment</button>
      </header>

      <section className="panel">
        <div className="data-table">
          <div className="table-row table-head">
            <span>Assessment</span>
            <span>Status</span>
            <span>Owner</span>
            <span>Progress</span>
            <span>Next step</span>
          </div>
          {assessmentPrograms.map((program) => (
            <div className="table-row" key={program.name}>
              <strong>{program.name}</strong>
              <span className="status-chip">{program.status}</span>
              <span>{program.owner}</span>
              <span>{program.progress}%</span>
              <span className="muted">{program.nextStep}</span>
            </div>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
