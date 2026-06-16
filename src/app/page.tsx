import Link from "next/link";

const demoSteps = [
  "Login",
  "Create organization",
  "Start DISM Diagnostic",
  "AI Advisor Q&A",
  "Maturity Summary",
  "Tasks",
  "Evidence Requests",
  "Download Report"
] as const;

export default function Home() {
  return (
    <main className="landing-page">
      <nav className="landing-nav" aria-label="Landing navigation">
        <strong>InclusionScore AI Agent</strong>
        <div>
          <Link href="/admin">Admin</Link>
          <Link className="primary-action" href="/client-portal">
            Launch demo
          </Link>
        </div>
      </nav>

      <section className="landing-hero">
        <div>
          <p className="eyebrow">ServiceNow for Workforce Risk Management</p>
          <h1>Turn DISM advisory conversations into evidence, tasks, maturity scores, and board-ready action plans.</h1>
          <p className="landing-copy">
            A production-ready customer demo that moves from login to organization setup, AI-guided DISM diagnostic, ISO 30415 and ISO 30201 mapping,
            implementation tasks, evidence requests, and a downloadable readiness report.
          </p>
          <div className="header-actions">
            <Link className="primary-action" href="/client-portal">
              Start production demo
            </Link>
            <Link className="secondary-action" href="/reports">
              View reports
            </Link>
          </div>
        </div>
        <aside className="landing-panel">
          <h2>Demo Path</h2>
          <ol className="landing-steps">
            {demoSteps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </aside>
      </section>

      <section className="landing-band">
        <article>
          <h2>Secure by design</h2>
          <p>Supabase auth, tenant-isolated Row Level Security, explicit advisor-client access, and audit logs for AI and advisor workflow actions.</p>
        </article>
        <article>
          <h2>Advisor-grade output</h2>
          <p>The AI does more than chat. It diagnoses, asks follow-ups, maps to standards, identifies maturity gaps, and creates implementation work.</p>
        </article>
        <article>
          <h2>Customer-ready flow</h2>
          <p>The guided demo is intentionally linear so a real customer can complete a first Workforce Risk / DISM diagnostic in one session.</p>
        </article>
      </section>
    </main>
  );
}
