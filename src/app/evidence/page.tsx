import { AppShell } from "@/components/app-shell";
import { evidenceItems } from "@/lib/client-portal-data";

export default function EvidencePage() {
  return (
    <AppShell>
      <header className="page-header">
        <div>
          <p className="eyebrow">Client Portal</p>
          <h1>Evidence</h1>
          <p className="muted">Evidence collection, sufficiency review, freshness, and control mapping.</p>
        </div>
        <button className="primary-action">Upload evidence</button>
      </header>

      <section className="panel">
        <div className="data-table">
          <div className="table-row table-head">
            <span>Evidence</span>
            <span>Mapped standards</span>
            <span>Owner</span>
            <span>Freshness</span>
            <span>Sufficiency</span>
          </div>
          {evidenceItems.map((item) => (
            <div className="table-row" key={item.title}>
              <strong>{item.title}</strong>
              <span>{item.mappedTo}</span>
              <span>{item.owner}</span>
              <span>{item.freshness}</span>
              <span className="status-chip">{item.sufficiency}</span>
            </div>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
