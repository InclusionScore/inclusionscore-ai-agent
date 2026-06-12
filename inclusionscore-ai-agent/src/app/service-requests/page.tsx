import { AppShell } from "@/components/app-shell";
import { serviceRequests } from "@/lib/client-portal-data";

export default function ServiceRequestsPage() {
  return (
    <AppShell>
      <header className="page-header">
        <div>
          <p className="eyebrow">Client Portal</p>
          <h1>Service Requests</h1>
          <p className="muted">DISM service catalog intake, fulfillment status, and advisor support requests.</p>
        </div>
        <button className="primary-action">Create request</button>
      </header>

      <section className="panel">
        <div className="data-table request-table">
          <div className="table-row table-head">
            <span>Request</span>
            <span>Service</span>
            <span>Status</span>
            <span>Requester</span>
            <span>SLA</span>
          </div>
          {serviceRequests.map((request) => (
            <div className="table-row" key={request.id}>
              <strong>{request.id}</strong>
              <span>{request.service}</span>
              <span className="status-chip">{request.status}</span>
              <span>{request.requester}</span>
              <span>{request.sla}</span>
            </div>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
