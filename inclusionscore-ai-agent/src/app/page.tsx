import { AppShell } from "@/components/app-shell";

const metrics = [
  { label: "Workforce Risk Score", value: "78", note: "Preferred risk" },
  { label: "Maturity", value: "3.2", note: "Target 4.0" },
  { label: "Certification", value: "71%", note: "Partially ready" },
  { label: "EPL Readiness", value: "83%", note: "Submission draft" }
];

const workQueue = [
  { type: "Evidence", title: "Upload manager training records", owner: "HR Lead", due: "Today" },
  { type: "Risk", title: "Review accommodation workflow gap", owner: "Legal", due: "Fri" },
  { type: "Task", title: "Approve governance charter evidence", owner: "Advisor", due: "Jun 28" },
  { type: "Request", title: "Start ISO 30415 readiness workflow", owner: "D&I Lead", due: "Jul 01" }
];

const agentActions = [
  "Map handbook evidence to EPL and ISO controls",
  "Create corrective action for stale management review",
  "Request missing accommodation procedure evidence"
];

export default function Home() {
  return (
    <AppShell>
      <div className="grid metrics">
        {metrics.map((metric) => (
          <section className="card" key={metric.label}>
            <div className="muted">{metric.label}</div>
            <div className="metric-value">{metric.value}</div>
            <div className="muted">{metric.note}</div>
          </section>
        ))}
      </div>

      <div className="split">
        <section className="card">
          <h2>Work Queue</h2>
          <p className="muted">Priority workforce risk, evidence, certification, and insurance work.</p>
          {workQueue.map((item) => (
            <div className="queue-row" key={item.title}>
              <span className="pill">{item.type}</span>
              <strong>{item.title}</strong>
              <span className="muted">{item.owner}</span>
              <span>{item.due}</span>
            </div>
          ))}
        </section>

        <aside className="card">
          <h2>AI Agent</h2>
          <p className="muted">Consultant guidance grounded in controls, evidence, risk, and workflow state.</p>
          <div className="grid">
            {agentActions.map((action) => (
              <div className="card" key={action}>
                {action}
              </div>
            ))}
          </div>
        </aside>
      </div>
    </AppShell>
  );
}

