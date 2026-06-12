"use client";

import { useState } from "react";
import { initialReportDraft } from "@/lib/mvp-data";

export function ReportDraftGenerator() {
  const [draft, setDraft] = useState(initialReportDraft);
  const [generatedAt, setGeneratedAt] = useState("Draft seeded from current MVP data");

  function generateDraft() {
    setDraft({
      ...initialReportDraft,
      summary:
        "Generated draft: Acme Corp is in evidence review with a readiness posture that depends on closing training, accommodation workflow, and pay equity documentation gaps. The advisor should focus the next audit cycle on evidence sufficiency and owner accountability.",
      nextActions: [
        "Request updated manager training export from HR Lead.",
        "Route accommodation workflow to advisor review.",
        "Assign pay equity procedure drafting to Legal and HR Operations.",
        "Prepare executive report once evidence status reaches submitted or accepted."
      ]
    });
    setGeneratedAt(`Generated in mocked mode at ${new Date().toLocaleTimeString()}`);
  }

  return (
    <section className="panel report-builder">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Report Draft Generator</p>
          <h2>{draft.title}</h2>
          <p className="muted">{generatedAt}</p>
        </div>
        <button className="primary-action" onClick={generateDraft} type="button">
          Generate draft
        </button>
      </div>

      <div className="report-draft">
        <div>
          <span className="muted">Audience</span>
          <strong>{draft.audience}</strong>
        </div>
        <div>
          <span className="muted">Summary</span>
          <p>{draft.summary}</p>
        </div>
        <div className="draft-columns">
          <section>
            <h3>Findings</h3>
            <ul>
              {draft.findings.map((finding) => (
                <li key={finding}>{finding}</li>
              ))}
            </ul>
          </section>
          <section>
            <h3>Next actions</h3>
            <ul>
              {draft.nextActions.map((action) => (
                <li key={action}>{action}</li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </section>
  );
}
