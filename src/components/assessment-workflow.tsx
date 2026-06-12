"use client";

import { useMemo, useState } from "react";
import { assessmentQuestions, calculateReadiness, evidenceRecords, type AssessmentQuestion } from "@/lib/mvp-data";

const responseLabels: Record<AssessmentQuestion["response"], string> = {
  yes: "Control exists",
  no: "Gap",
  return_later: "Return later"
};

export function AssessmentWorkflow() {
  const [questions, setQuestions] = useState(assessmentQuestions);
  const readiness = useMemo(() => calculateReadiness(questions, evidenceRecords), [questions]);
  const averageMaturity = useMemo(() => {
    const total = questions.reduce((sum, question) => sum + question.maturityLevel, 0);
    return (total / questions.length).toFixed(1);
  }, [questions]);

  function updateResponse(id: string, response: AssessmentQuestion["response"]) {
    setQuestions((current) =>
      current.map((question) =>
        question.id === id
          ? {
              ...question,
              response,
              maturityLevel: response === "yes" ? Math.max(question.maturityLevel, 3) : response === "no" ? 1 : 2
            }
          : question
      )
    );
  }

  return (
    <section className="panel panel-wide">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Assessment Workflow</p>
          <h2>DISM live audit questions</h2>
          <p className="muted">Capture the advisor-led yes/no/return-later audit flow and convert gaps into evidence and tasks.</p>
        </div>
        <div className="score-stack">
          <span className="status-chip">{readiness}% ready</span>
          <span className="muted">Maturity {averageMaturity} / 5</span>
        </div>
      </div>

      <div className="assessment-list">
        {questions.map((question) => (
          <article className="assessment-item" key={question.id}>
            <div>
              <span className="pill">{question.domain}</span>
              <h3>{question.prompt}</h3>
              <p className="muted">{question.controlMapping.join(" + ")}</p>
            </div>
            <div className="segmented-control" aria-label={`Response for ${question.prompt}`}>
              {(Object.keys(responseLabels) as AssessmentQuestion["response"][]).map((response) => (
                <button
                  className={question.response === response ? "segment active" : "segment"}
                  key={response}
                  onClick={() => updateResponse(question.id, response)}
                  type="button"
                >
                  {responseLabels[response]}
                </button>
              ))}
            </div>
            <div className="assessment-meta">
              <span className="status-chip">Level {question.maturityLevel}</span>
              <span>{question.evidenceRequired ? "Evidence required" : "Evidence optional"}</span>
              <span className="muted">{question.advisorDecision}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
