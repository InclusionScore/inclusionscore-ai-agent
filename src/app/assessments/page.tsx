import { AppShell } from "@/components/app-shell";
import { AssessmentWorkflow } from "@/components/assessment-workflow";
import { WorkspaceSummary } from "@/components/workspace-summary";

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

      <WorkspaceSummary />
      <AssessmentWorkflow />
    </AppShell>
  );
}
