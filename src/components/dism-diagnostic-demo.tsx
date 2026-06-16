"use client";

import { useEffect, useMemo, useState } from "react";
import { diagnosticQuestions, type DiagnosticAnswer, type DiagnosticDemoResult } from "@/lib/agent/diagnostic-demo";
import { acmeWorkforceDemo } from "@/lib/demo/acme-workforce-demo";

type OrganizationOption = {
  id: string;
  tenant_id: string;
  name: string;
  industry: string | null;
  employee_count_band: string | null;
};

type DiagnosticResponse = {
  organization: OrganizationOption;
  assessment: {
    id: string;
    maturity_score: number;
    readiness_percent: number;
    risk_level: string;
  };
  conversationId: string;
  result: DiagnosticDemoResult;
  tasks: Array<{ id: string; title: string; status: string; priority: string; domain: string | null }>;
  evidence: Array<{ id: string; title: string; status: string; mapped_standards: string[]; owner_name: string | null }>;
  meta: { model: string };
};

const answerStarters = [
  "Yes, this is documented and reviewed.",
  "Partially. We do this, but evidence is inconsistent.",
  "No, we need to build this.",
  "Not sure. I need to confirm with another owner."
] as const;

const productionFlowSteps = ["Login", "Organization", "Diagnostic", "AI Q&A", "Maturity", "Tasks", "Evidence", "Report"] as const;

export function DismDiagnosticDemo() {
  const [organizations, setOrganizations] = useState<OrganizationOption[]>([]);
  const [selectedOrganizationId, setSelectedOrganizationId] = useState("");
  const [organizationName, setOrganizationName] = useState<string>(acmeWorkforceDemo.organizationName);
  const [industry, setIndustry] = useState<string>(acmeWorkforceDemo.industry);
  const [employeeCountBand, setEmployeeCountBand] = useState<string>(acmeWorkforceDemo.employeeCountBand);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<DiagnosticResponse | null>(null);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingOrganizations, setIsLoadingOrganizations] = useState(true);

  const currentQuestion = diagnosticQuestions[currentQuestionIndex];
  const completedAnswers = useMemo(
    () =>
      diagnosticQuestions
        .map((question) => ({
          ...question,
          answer: answers[question.id]?.trim() || ""
        }))
        .filter((answer): answer is DiagnosticAnswer => Boolean(answer.answer)),
    [answers]
  );
  const progress = Math.round((completedAnswers.length / diagnosticQuestions.length) * 100);
  const activeFlowStep = result ? "Report" : completedAnswers.length > 0 ? "AI Q&A" : selectedOrganizationId ? "Diagnostic" : "Organization";

  useEffect(() => {
    async function loadOrganizations() {
      try {
        const response = await fetch("/api/organizations");
        const payload = (await response.json()) as { organizations?: OrganizationOption[]; error?: string };
        if (!response.ok) {
          throw new Error(payload.error || "Could not load organizations.");
        }

        const nextOrganizations = payload.organizations || [];
        setOrganizations(nextOrganizations);
        setSelectedOrganizationId((current) => current || nextOrganizations[0]?.id || "");
      } catch (caughtError) {
        setError(caughtError instanceof Error ? caughtError.message : "Could not load organizations.");
      } finally {
        setIsLoadingOrganizations(false);
      }
    }

    loadOrganizations();
  }, []);

  async function createOrganization() {
    setIsLoading(true);
    setError("");
    setStatus("Creating organization workspace...");

    try {
      const response = await fetch("/api/organizations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: organizationName,
          industry,
          employeeCountBand,
          headquartersCountry: acmeWorkforceDemo.headquartersCountry
        })
      });
      const payload = (await response.json()) as { organization?: OrganizationOption; error?: string };
      if (!response.ok || !payload.organization) {
        throw new Error(payload.error || "Could not create organization.");
      }

      setOrganizations((current) => [payload.organization as OrganizationOption, ...current]);
      setSelectedOrganizationId(payload.organization.id);
      setStatus("Organization workspace ready.");
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Could not create organization.");
    } finally {
      setIsLoading(false);
    }
  }

  function saveCurrentAnswer(value: string) {
    setAnswers((current) => ({
      ...current,
      [currentQuestion.id]: value
    }));
  }

  function moveQuestion(delta: number) {
    setCurrentQuestionIndex((current) => Math.max(0, Math.min(diagnosticQuestions.length - 1, current + delta)));
  }

  function loadInvestorDemoAnswers() {
    setOrganizationName(acmeWorkforceDemo.organizationName);
    setIndustry(acmeWorkforceDemo.industry);
    setEmployeeCountBand(acmeWorkforceDemo.employeeCountBand);
    setAnswers(acmeWorkforceDemo.answers);
    setCurrentQuestionIndex(0);
    setStatus("Investor demo answers loaded. Create/select the organization, then generate the AI action plan.");
    setError("");
  }

  async function runDiagnostic() {
    if (!selectedOrganizationId) {
      setError("Create or select an organization before starting the diagnostic.");
      return;
    }

    if (completedAnswers.length < 5) {
      setError("Answer at least five diagnostic questions before generating results.");
      return;
    }

    setIsLoading(true);
    setError("");
    setStatus("Calling the AI DISM Advisor and saving results to Supabase...");

    try {
      const response = await fetch("/api/diagnostics/dism-demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationId: selectedOrganizationId,
          answers: completedAnswers
        })
      });
      const payload = (await response.json()) as DiagnosticResponse & { error?: string };

      if (!response.ok) {
        throw new Error(payload.error || "Could not complete diagnostic.");
      }

      setResult(payload);
      window.localStorage.setItem("iscore-dism-demo-result", JSON.stringify(payload));
      window.dispatchEvent(new Event("iscore-dism-demo-result-updated"));
      setStatus("Diagnostic saved to Supabase and dashboard results updated.");
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Could not complete diagnostic.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="panel panel-wide diagnostic-demo">
      <div className="section-heading">
        <div>
          <p className="eyebrow">AI DISM Advisor Demo</p>
          <h2>Workforce Risk / DISM diagnostic</h2>
          <p className="muted">Create a client workspace, answer six advisor questions, then save the OpenAI-generated assessment, tasks, and evidence to Supabase.</p>
        </div>
        <span className="status-chip">{progress}% answered</span>
      </div>

      <ol className="flow-stepper" aria-label="Production demo flow">
        {productionFlowSteps.map((step) => (
          <li className={step === activeFlowStep ? "active" : ""} key={step}>
            {step}
          </li>
        ))}
      </ol>

      <div className="diagnostic-layout">
        <aside className="diagnostic-sidebar">
          <h3>Organization</h3>
          <p className="muted">{acmeWorkforceDemo.presenterContext}</p>
          <label>
            Select workspace
            <select disabled={isLoadingOrganizations} value={selectedOrganizationId} onChange={(event) => setSelectedOrganizationId(event.target.value)}>
              <option value="">{isLoadingOrganizations ? "Loading organizations..." : "No organization selected"}</option>
              {organizations.map((organization) => (
                <option key={organization.id} value={organization.id}>
                  {organization.name}
                </option>
              ))}
            </select>
          </label>
          {!isLoadingOrganizations && organizations.length === 0 ? (
            <p className="empty-state">No organizations yet. Create Acme Workforce Demo to start the investor flow.</p>
          ) : null}
          <div className="form-grid single">
            <label>
              New organization
              <input value={organizationName} onChange={(event) => setOrganizationName(event.target.value)} />
            </label>
            <label>
              Industry
              <input value={industry} onChange={(event) => setIndustry(event.target.value)} />
            </label>
            <label>
              Employee band
              <input value={employeeCountBand} onChange={(event) => setEmployeeCountBand(event.target.value)} />
            </label>
          </div>
          <button className="secondary-action" disabled={isLoading} onClick={createOrganization} type="button">
            Create organization
          </button>
          <button className="primary-action" disabled={isLoading} onClick={loadInvestorDemoAnswers} type="button">
            Load investor demo answers
          </button>
        </aside>

        <div className="diagnostic-main">
          <div className="question-card">
            <div className="section-heading compact">
              <span className="pill">
                Question {currentQuestionIndex + 1} of {diagnosticQuestions.length}
              </span>
              <span className="status-chip">{currentQuestion.domain}</span>
            </div>
            <h3>{currentQuestion.question}</h3>
            <div className="mapping-grid">
              <div>
                <span className="muted">ISO 30415</span>
                <strong>{currentQuestion.iso30415Concept}</strong>
              </div>
              <div>
                <span className="muted">ISO 30201</span>
                <strong>{currentQuestion.iso30201Concept}</strong>
              </div>
              <div>
                <span className="muted">Likely evidence</span>
                <strong>{currentQuestion.evidenceHint}</strong>
              </div>
            </div>
            <textarea
              aria-label="Diagnostic answer"
              onChange={(event) => saveCurrentAnswer(event.target.value)}
              rows={5}
              value={answers[currentQuestion.id] || ""}
            />
            <div className="quick-answer-grid">
              {answerStarters.map((starter) => (
                <button className="secondary-action" key={starter} onClick={() => saveCurrentAnswer(starter)} type="button">
                  {starter}
                </button>
              ))}
            </div>
            <div className="header-actions">
              <button className="secondary-action" disabled={currentQuestionIndex === 0} onClick={() => moveQuestion(-1)} type="button">
                Previous
              </button>
              <button
                className="secondary-action"
                disabled={currentQuestionIndex === diagnosticQuestions.length - 1}
                onClick={() => moveQuestion(1)}
                type="button"
              >
                Next
              </button>
              <button className="primary-action" disabled={isLoading || completedAnswers.length < 5} onClick={runDiagnostic} type="button">
                {isLoading ? "Generating..." : "Generate AI action plan"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {status ? <p className="muted">{status}</p> : null}
      {error ? <p className="error-text">{error}</p> : null}
      {result ? <DiagnosticResults result={result} /> : null}
    </section>
  );
}

function DiagnosticResults({ result }: { result: DiagnosticResponse }) {
  function downloadReport() {
    const report = [
      `# InclusionScore AI Agent Report`,
      ``,
      `Organization: ${result.organization.name}`,
      `Assessment ID: ${result.assessment.id}`,
      `Maturity: ${result.assessment.maturity_score}`,
      `Readiness: ${result.assessment.readiness_percent}%`,
      `Risk Level: ${result.assessment.risk_level}`,
      ``,
      `## Advisor Summary`,
      result.result.advisor_summary,
      ``,
      `## Maturity Summary`,
      result.result.maturity_summary.explanation,
      ``,
      `## Top Risks`,
      ...result.result.top_risks.slice(0, 3).map((risk) => `- ${risk.title} (${risk.severity}): ${risk.implication}`),
      ``,
      `## Recommended Next Steps`,
      ...result.result.recommended_next_steps.map((step) => `- ${step}`),
      ``,
      `## Implementation Tasks`,
      ...result.result.implementation_tasks.map((task) => `- ${task.title}: ${task.readiness_impact}`),
      ``,
      `## Evidence Requests`,
      ...result.result.evidence_requests.map((evidence) => `- ${evidence.title}: ${evidence.description}`),
      ``,
      `Generated by InclusionScore AI Agent.`
    ].join("\n");
    const blob = new Blob([report], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${result.organization.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-dism-report.md`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section className="diagnostic-results">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Generated Report</p>
          <h2>Maturity Summary and Action Plan</h2>
          <p className="muted">Saved to Supabase and ready for customer review.</p>
        </div>
        <button className="primary-action" onClick={downloadReport} type="button">
          Download report
        </button>
      </div>
      <div className="grid metrics">
        <section className="metric-card" data-tone="accent">
          <div className="muted">Maturity</div>
          <div className="metric-value">{result.assessment.maturity_score}</div>
          <div className="muted">{result.result.maturity_summary.label}</div>
        </section>
        <section className="metric-card" data-tone="success">
          <div className="muted">Readiness</div>
          <div className="metric-value">{result.assessment.readiness_percent}%</div>
          <div className="muted">Saved assessment</div>
        </section>
        <section className="metric-card" data-tone="warning">
          <div className="muted">Tasks</div>
          <div className="metric-value">{result.tasks.length}</div>
          <div className="muted">Generated implementation work</div>
        </section>
        <section className="metric-card" data-tone="warning">
          <div className="muted">Evidence</div>
          <div className="metric-value">{result.evidence.length}</div>
          <div className="muted">Requested artifacts</div>
        </section>
      </div>

      <div className="result-grid">
        <article className="panel">
          <h3>Maturity Summary</h3>
          <p>{result.result.maturity_summary.explanation}</p>
        </article>
        <article className="panel">
          <h3>Top 3 Risks</h3>
          <div className="status-list">
            {result.result.top_risks.slice(0, 3).map((risk) => (
              <div className="status-row" key={risk.title}>
                <div>
                  <strong>{risk.title}</strong>
                  <span className="muted">{risk.implication}</span>
                </div>
                <span className="status-chip">{risk.severity}</span>
              </div>
            ))}
          </div>
        </article>
        <article className="panel">
          <h3>Recommended Next Steps</h3>
          <ol>
            {result.result.recommended_next_steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </article>
        <article className="panel">
          <h3>Implementation Tasks</h3>
          <div className="status-list">
            {result.result.implementation_tasks.map((task) => (
              <div className="status-row" key={task.title}>
                <div>
                  <strong>{task.title}</strong>
                  <span className="muted">{task.readiness_impact}</span>
                </div>
                <span className="status-chip">{task.priority}</span>
              </div>
            ))}
          </div>
        </article>
        <article className="panel">
          <h3>Evidence Requests</h3>
          <div className="status-list">
            {result.result.evidence_requests.map((evidence) => (
              <div className="status-row" key={evidence.title}>
                <div>
                  <strong>{evidence.title}</strong>
                  <span className="muted">{evidence.description}</span>
                </div>
                <span className="status-chip">{evidence.owner_hint}</span>
              </div>
            ))}
          </div>
        </article>
        <article className="panel">
          <h3>Supabase Records</h3>
          <p className="muted">Assessment {result.assessment.id}</p>
          <p className="muted">Conversation {result.conversationId}</p>
          <p className="muted">Model {result.meta.model}</p>
        </article>
      </div>
    </section>
  );
}
