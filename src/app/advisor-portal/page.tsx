import { AppShell } from "@/components/app-shell";
import { AdvisorAccess } from "@/components/advisor-access";
import { AgentChat } from "@/components/agent-chat";

export default function AdvisorPortalPage() {
  return (
    <AppShell>
      <header className="page-header">
        <div>
          <p className="eyebrow">Advisor Portal</p>
          <h1>Portfolio Oversight</h1>
          <p className="muted">Mocked advisor workspace for client readiness, evidence review, service requests, and implementation planning.</p>
        </div>
        <button className="primary-action">Create implementation plan</button>
      </header>

      <AdvisorAccess />
      <AgentChat />
    </AppShell>
  );
}
