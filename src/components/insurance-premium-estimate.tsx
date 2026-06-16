"use client";

import { useState } from "react";
import { currency, demoInsuranceInputs, demoPremiumEstimate, type PremiumEstimate } from "@/lib/insurance/premium-estimate";

type PremiumAiRecommendation = {
  maturity_actions: string[];
  policy_updates: string[];
  evidence_to_collect: string[];
  training_steps: string[];
  certification_actions: string[];
  premium_reduction_summary: string;
  meta?: {
    mocked?: boolean;
    model?: string;
  };
};

const fallbackRecommendation: PremiumAiRecommendation = {
  maturity_actions: ["Move governance and evidence management from Under Control to Measured.", "Close ISO 30415 and ISO 30201 readiness blockers."],
  policy_updates: ["Refresh anti-harassment, discrimination, retaliation, accommodation, and escalation procedures."],
  evidence_to_collect: ["Manager training export", "Governance RACI", "Evidence register", "Incident response workflow", "Advisor review notes"],
  training_steps: ["Reach 90%+ manager training completion.", "Document overdue-training escalation."],
  certification_actions: ["Prepare advisor review package.", "Link evidence to certification readiness controls."],
  premium_reduction_summary:
    "Improving maturity, evidence completeness, and advisor-reviewed readiness may support better underwriting confidence and reduce renewal pressure."
};

export function InsurancePremiumEstimate() {
  const [aiRecommendation, setAiRecommendation] = useState<PremiumAiRecommendation | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const estimate = demoPremiumEstimate;

  async function generateAiRecommendation() {
    setIsLoadingAi(true);

    try {
      const response = await fetch("/api/insurance/premium-recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inputs: demoInsuranceInputs,
          estimate
        })
      });
      const payload = (await response.json()) as PremiumAiRecommendation;
      setAiRecommendation(response.ok ? payload : fallbackRecommendation);
    } catch {
      setAiRecommendation(fallbackRecommendation);
    } finally {
      setIsLoadingAi(false);
    }
  }

  return (
    <section className="panel panel-wide insurance-estimate" id="insurance-premium-estimate">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Insurance Premium Estimate</p>
          <h2>Employment Practices Liability planning estimate</h2>
          <p className="muted">Estimated premium for planning purposes only. Final pricing subject to underwriting.</p>
        </div>
        <button className="primary-action" disabled={isLoadingAi} onClick={generateAiRecommendation} type="button">
          {isLoadingAi ? "Generating..." : "How to reduce your premium"}
        </button>
      </div>

      <div className="premium-layout">
        <PremiumSummary estimate={estimate} />
        <RiskInputPanel />
      </div>

      <PremiumFactorPanel estimate={estimate} />
      <RoadmapPremiumImpact estimate={estimate} />
      <AiPremiumPanel recommendation={aiRecommendation || fallbackRecommendation} />
    </section>
  );
}

function PremiumSummary({ estimate }: { estimate: PremiumEstimate }) {
  return (
    <div className="premium-summary">
      <section className="premium-hero-card">
        <span className="muted">Estimated EPL Premium</span>
        <strong>{currency(estimate.estimatedAnnualPremium)}/year</strong>
        <span className="muted">
          Likely range: {currency(estimate.lowRange)}-{currency(estimate.highRange)}
        </span>
      </section>
      <div className="premium-metrics">
        <PremiumMiniMetric label="Confidence" value={estimate.confidenceLevel} />
        <PremiumMiniMetric label="Renewal risk" value={estimate.renewalRiskIndicator} />
        <PremiumMiniMetric label="Peer benchmark" value={currency(estimate.peerBenchmarkPremium)} />
        <PremiumMiniMetric label="Potential savings" value={`${currency(estimate.potentialSavingsLow)}-${currency(estimate.potentialSavingsHigh)}`} />
      </div>
    </div>
  );
}

function PremiumMiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="premium-mini-metric">
      <span className="muted">{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function RiskInputPanel() {
  const inputs = [
    ["Employee count", demoInsuranceInputs.employeeCount.toLocaleString()],
    ["Country / region", `${demoInsuranceInputs.country} / ${demoInsuranceInputs.region}`],
    ["Industry / sector", `${demoInsuranceInputs.industry} / ${demoInsuranceInputs.sector}`],
    ["Revenue band", demoInsuranceInputs.revenueBand],
    ["Prior claims", demoInsuranceInputs.priorClaims.replace(/_/g, " ")],
    ["Workforce maturity", `${demoInsuranceInputs.workforceMaturityScore.toFixed(1)} / 3`],
    ["ISO 30415 readiness", `${demoInsuranceInputs.iso30415Readiness}%`],
    ["ISO 30201 readiness", `${demoInsuranceInputs.iso30201Readiness}%`],
    ["Training completion", `${demoInsuranceInputs.trainingCompletion}%`],
    ["Evidence completeness", `${demoInsuranceInputs.evidenceCompleteness}%`],
    ["Advisor review", demoInsuranceInputs.advisorReviewStatus.replace(/_/g, " ")]
  ] as const;

  return (
    <section className="risk-input-panel">
      <h3>Risk Inputs</h3>
      <div className="risk-input-grid">
        {inputs.map(([label, value]) => (
          <div key={label}>
            <span className="muted">{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>
      <div className="risk-chip-row">
        <span className="status-chip">Harassment: {demoInsuranceInputs.harassmentRisk}</span>
        <span className="status-chip">Discrimination: {demoInsuranceInputs.discriminationRisk}</span>
        <span className="status-chip">Retaliation: {demoInsuranceInputs.retaliationRisk}</span>
      </div>
    </section>
  );
}

function PremiumFactorPanel({ estimate }: { estimate: PremiumEstimate }) {
  return (
    <section className="premium-factor-panel">
      <div className="section-heading compact">
        <h3>Transparent Premium Logic</h3>
        <span className="pill">Mock model</span>
      </div>
      <div className="factor-grid">
        {estimate.modelFactors.map((factor) => (
          <div className="factor-card" key={factor.label}>
            <span className="muted">{factor.label}</span>
            <strong>{typeof factor.value === "number" && factor.value > 100 ? currency(factor.value) : factor.value.toFixed(2)}</strong>
            <span>{factor.explanation}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function RoadmapPremiumImpact({ estimate }: { estimate: PremiumEstimate }) {
  return (
    <section className="premium-roadmap-impact">
      <div className="section-heading compact">
        <h3>Roadmap Actions That May Reduce Insurance Risk</h3>
        <span className="status-chip">Planning impact</span>
      </div>
      <div className="status-list">
        {estimate.roadmapPremiumImpacts.map((item) => (
          <div className="status-row" key={item.action}>
            <div>
              <strong>{item.action}</strong>
              <span className="muted">{item.riskReduced}</span>
            </div>
            <span>{item.potentialImpact}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function AiPremiumPanel({ recommendation }: { recommendation: PremiumAiRecommendation }) {
  const groups = [
    ["Maturity actions", recommendation.maturity_actions],
    ["Policy updates", recommendation.policy_updates],
    ["Evidence to collect", recommendation.evidence_to_collect],
    ["Training steps", recommendation.training_steps],
    ["Certification actions", recommendation.certification_actions]
  ] as const;

  return (
    <section className="ai-premium-panel">
      <div className="section-heading compact">
        <h3>How to reduce your premium</h3>
        <span className="pill">{recommendation.meta?.mocked ? "Fallback" : recommendation.meta?.model || "Planning guidance"}</span>
      </div>
      <p>{recommendation.premium_reduction_summary}</p>
      <div className="premium-ai-grid">
        {groups.map(([label, items]) => (
          <div key={label}>
            <h4>{label}</h4>
            <ul>
              {items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
