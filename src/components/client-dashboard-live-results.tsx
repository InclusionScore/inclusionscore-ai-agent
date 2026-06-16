"use client";

import { useEffect, useState } from "react";
import type { DiagnosticDemoResult } from "@/lib/agent/diagnostic-demo";

type SavedDiagnostic = {
  organization: {
    name: string;
  };
  assessment: {
    id: string;
    maturity_score: number;
    readiness_percent: number;
    risk_level: string;
  };
  result: DiagnosticDemoResult;
  tasks: Array<{ id: string; title: string; priority: string; domain: string | null }>;
  evidence: Array<{ id: string; title: string; mapped_standards: string[]; owner_name: string | null }>;
};

export function ClientDashboardLiveResults() {
  const [saved, setSaved] = useState<SavedDiagnostic | null>(null);

  useEffect(() => {
    function refreshSavedResult() {
      const raw = window.localStorage.getItem("iscore-dism-demo-result");
      if (raw) {
        setSaved(JSON.parse(raw) as SavedDiagnostic);
      }
    }

    refreshSavedResult();
    window.addEventListener("iscore-dism-demo-result-updated", refreshSavedResult);

    return () => {
      window.removeEventListener("iscore-dism-demo-result-updated", refreshSavedResult);
    };
  }, []);

  if (!saved) {
    return null;
  }

  return (
    <section className="panel panel-wide live-results-panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Latest AI Diagnostic</p>
          <h2>{saved.organization.name}</h2>
          <p className="muted">{saved.result.advisor_summary}</p>
        </div>
        <span className="status-chip">{saved.assessment.risk_level}</span>
      </div>

      <div className="grid metrics">
        <section className="metric-card" data-tone="accent">
          <div className="muted">Maturity</div>
          <div className="metric-value">{saved.assessment.maturity_score}</div>
          <div className="muted">{saved.result.maturity_summary.label}</div>
        </section>
        <section className="metric-card" data-tone="success">
          <div className="muted">Readiness</div>
          <div className="metric-value">{saved.assessment.readiness_percent}%</div>
          <div className="muted">Certification posture</div>
        </section>
        <section className="metric-card" data-tone="warning">
          <div className="muted">Tasks</div>
          <div className="metric-value">{saved.tasks.length}</div>
          <div className="muted">Implementation items</div>
        </section>
        <section className="metric-card" data-tone="warning">
          <div className="muted">Evidence</div>
          <div className="metric-value">{saved.evidence.length}</div>
          <div className="muted">Requested artifacts</div>
        </section>
      </div>

      <div className="result-grid">
        <article>
          <h3>Top Risks</h3>
          <ul>
            {saved.result.top_risks.slice(0, 3).map((risk) => (
              <li key={risk.title}>
                <strong>{risk.title}</strong>: {risk.implication}
              </li>
            ))}
          </ul>
        </article>
        <article>
          <h3>Next Steps</h3>
          <ol>
            {saved.result.recommended_next_steps.slice(0, 4).map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </article>
      </div>
    </section>
  );
}
