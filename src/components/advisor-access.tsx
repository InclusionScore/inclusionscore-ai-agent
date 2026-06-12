import { advisorClients } from "@/lib/mvp-data";

export function AdvisorAccess() {
  return (
    <section className="panel panel-wide">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Advisor Access</p>
          <h2>Client review queue</h2>
          <p className="muted">Advisors can review sensitive audit state without forcing every delegate into the secure assessment workflow.</p>
        </div>
        <span className="status-chip">RBAC enforced</span>
      </div>

      <div className="data-table advisor-table">
        <div className="table-row table-head">
          <span>Client</span>
          <span>Workspace</span>
          <span>Access</span>
          <span>Readiness</span>
          <span>Blockers</span>
          <span>Advisor decision</span>
        </div>
        {advisorClients.map((client) => (
          <div className="table-row" key={client.client}>
            <strong>{client.client}</strong>
            <span>{client.workspace}</span>
            <span className="status-chip">{client.access}</span>
            <span>{client.readiness}%</span>
            <span>{client.evidenceBlockers}</span>
            <span className="muted">{client.currentDecision}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
