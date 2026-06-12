import { AppShell } from "@/components/app-shell";
import { EvidenceTable } from "@/components/evidence-table";

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

      <EvidenceTable />
    </AppShell>
  );
}
