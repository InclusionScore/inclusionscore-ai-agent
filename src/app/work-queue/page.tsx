import { AppShell } from "@/components/app-shell";
import { clientPriorities } from "@/lib/client-portal-data";

export default function WorkQueuePage() {
  return (
    <AppShell>
      <header className="page-header">
        <div>
          <p className="eyebrow">Client Portal</p>
          <h1>Work Queue</h1>
          <p className="muted">Tasks, approvals, service requests, evidence reviews, and readiness blockers.</p>
        </div>
        <button className="secondary-action">Filter queue</button>
      </header>

      <section className="panel">
        <div className="data-table">
          <div className="table-row table-head">
            <span>Type</span>
            <span>Work item</span>
            <span>Owner</span>
            <span>Due</span>
            <span>Status</span>
          </div>
          {clientPriorities.map((item) => (
            <div className="table-row" key={item.title}>
              <span className="pill">{item.category}</span>
              <strong>{item.title}</strong>
              <span>{item.owner}</span>
              <span>{item.due}</span>
              <span className="status-chip">{item.status}</span>
            </div>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
