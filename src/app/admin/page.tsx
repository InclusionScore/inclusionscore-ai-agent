import { AppShell } from "@/components/app-shell";
import { isSupabaseServerConfigured, createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type AdminMetric = {
  label: string;
  value: string;
  note: string;
  tone: "success" | "warning" | "accent";
};

async function getCount(table: string) {
  const supabase = await createSupabaseServerClient();
  const { count, error } = await supabase.from(table).select("id", { count: "exact", head: true });

  if (error) {
    return { value: "RLS", note: "No accessible rows or permission denied" };
  }

  return { value: String(count || 0), note: "Visible through current user RLS" };
}

async function getAdminMetrics(): Promise<AdminMetric[]> {
  if (!isSupabaseServerConfigured()) {
    return [
      { label: "Supabase Auth", value: "Missing", note: "Set Supabase env vars in Vercel", tone: "warning" },
      { label: "Tenant Isolation", value: "Schema", note: "RLS migrations are present", tone: "accent" },
      { label: "OpenAI", value: process.env.OPENAI_API_KEY ? "Ready" : "Missing", note: "Server-side key only", tone: process.env.OPENAI_API_KEY ? "success" : "warning" },
      { label: "Audit Logs", value: "Schema", note: "Database triggers are present", tone: "accent" }
    ];
  }

  const [organizations, assessments, tasks, evidence, auditLogs, conversations] = await Promise.all([
    getCount("organizations"),
    getCount("assessments"),
    getCount("tasks"),
    getCount("evidence"),
    getCount("audit_logs"),
    getCount("ai_conversations")
  ]);

  return [
    { label: "Organizations", value: organizations.value, note: organizations.note, tone: "accent" },
    { label: "Assessments", value: assessments.value, note: assessments.note, tone: "accent" },
    { label: "Tasks", value: tasks.value, note: tasks.note, tone: "warning" },
    { label: "Evidence", value: evidence.value, note: evidence.note, tone: "warning" },
    { label: "Audit Logs", value: auditLogs.value, note: auditLogs.note, tone: "success" },
    { label: "AI Conversations", value: conversations.value, note: conversations.note, tone: "success" }
  ];
}

export default async function AdminPage() {
  const metrics = await getAdminMetrics();
  const controls = [
    {
      title: "Supabase Auth",
      status: isSupabaseServerConfigured() ? "Configured" : "Needs env vars",
      detail: "Magic-link auth is handled through Supabase browser/server clients."
    },
    {
      title: "Tenant Isolation",
      status: "Enabled",
      detail: "Organization data is protected by RLS and tenant membership checks."
    },
    {
      title: "Advisor Access",
      status: "Explicit assignment",
      detail: "Advisors can only access organizations through active advisor-client access records."
    },
    {
      title: "Server-side OpenAI",
      status: process.env.OPENAI_API_KEY ? "Configured" : "Needs OPENAI_API_KEY",
      detail: "OpenAI requests are made only from Next.js API routes."
    },
    {
      title: "Audit Logging",
      status: "Enabled",
      detail: "Database triggers and API inserts log user, advisor, and AI workflow actions."
    }
  ];

  return (
    <AppShell>
      <header className="page-header">
        <div>
          <p className="eyebrow">Admin Portal</p>
          <h1>Production Readiness</h1>
          <p className="muted">Operational controls for auth, tenant isolation, advisor access, AI routing, and audit logs.</p>
        </div>
      </header>

      <div className="grid metrics admin-metrics">
        {metrics.map((metric) => (
          <section className="metric-card" data-tone={metric.tone} key={metric.label}>
            <div className="muted">{metric.label}</div>
            <div className="metric-value">{metric.value}</div>
            <div className="muted">{metric.note}</div>
          </section>
        ))}
      </div>

      <section className="panel panel-wide">
        <div className="section-heading">
          <div>
            <h2>Launch Controls</h2>
            <p className="muted">A compact checklist for production operators.</p>
          </div>
        </div>
        <div className="status-list">
          {controls.map((control) => (
            <div className="status-row" key={control.title}>
              <div>
                <strong>{control.title}</strong>
                <span className="muted">{control.detail}</span>
              </div>
              <span className="status-chip">{control.status}</span>
            </div>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
