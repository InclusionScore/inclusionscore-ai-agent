export type InsuranceRiskInputs = {
  employeeCount: number;
  country: string;
  region: string;
  industry: string;
  sector: string;
  revenueBand: string;
  priorClaims: "none" | "one_minor" | "multiple_or_major";
  workforceMaturityScore: number;
  iso30415Readiness: number;
  iso30201Readiness: number;
  harassmentRisk: "low" | "medium" | "high";
  discriminationRisk: "low" | "medium" | "high";
  retaliationRisk: "low" | "medium" | "high";
  trainingCompletion: number;
  evidenceCompleteness: number;
  advisorReviewStatus: "not_started" | "in_review" | "complete";
};

export type PremiumEstimate = {
  estimatedAnnualPremium: number;
  lowRange: number;
  expectedRange: number;
  highRange: number;
  confidenceLevel: "Low" | "Medium" | "High";
  renewalRiskIndicator: "Preferred" | "Watchlist" | "Elevated" | "Critical";
  peerBenchmarkPremium: number;
  potentialSavingsLow: number;
  potentialSavingsHigh: number;
  modelFactors: Array<{
    label: string;
    value: number;
    explanation: string;
  }>;
  roadmapPremiumImpacts: Array<{
    action: string;
    riskReduced: string;
    potentialImpact: string;
  }>;
};

export const demoInsuranceInputs: InsuranceRiskInputs = {
  employeeCount: 4500,
  country: "Canada",
  region: "North America",
  industry: "Consulting and assurance",
  sector: "Professional Services",
  revenueBand: "$1B-$5B",
  priorClaims: "one_minor",
  workforceMaturityScore: 2.1,
  iso30415Readiness: 71,
  iso30201Readiness: 64,
  harassmentRisk: "medium",
  discriminationRisk: "medium",
  retaliationRisk: "low",
  trainingCompletion: 82,
  evidenceCompleteness: 68,
  advisorReviewStatus: "in_review"
};

export function currency(value: number) {
  return new Intl.NumberFormat("en-US", {
    currency: "USD",
    maximumFractionDigits: 0,
    style: "currency"
  }).format(value);
}

export function estimateEplPremium(inputs: InsuranceRiskInputs): PremiumEstimate {
  const basePremium = Math.max(18000, inputs.employeeCount * 18);
  const industryFactor = inputs.industry.toLowerCase().includes("consulting") ? 1.05 : 1.15;
  const regionFactor = inputs.country === "Canada" ? 0.95 : inputs.region === "North America" ? 1.08 : 1;
  const claimsFactor = inputs.priorClaims === "none" ? 0.92 : inputs.priorClaims === "one_minor" ? 1.12 : 1.45;
  const maturityFactor = inputs.workforceMaturityScore >= 2.5 ? 0.88 : inputs.workforceMaturityScore >= 2 ? 0.98 : 1.18;
  const readinessAverage = (inputs.iso30415Readiness + inputs.iso30201Readiness) / 2;
  const readinessFactor = readinessAverage >= 80 ? 0.9 : readinessAverage >= 65 ? 0.98 : 1.12;
  const riskFactor =
    1 +
    [inputs.harassmentRisk, inputs.discriminationRisk, inputs.retaliationRisk].reduce((sum, risk) => {
      if (risk === "high") return sum + 0.12;
      if (risk === "medium") return sum + 0.06;
      return sum;
    }, 0);
  const trainingFactor = inputs.trainingCompletion >= 90 ? 0.93 : inputs.trainingCompletion >= 75 ? 1 : 1.1;
  const evidenceFactor = inputs.evidenceCompleteness >= 85 ? 0.92 : inputs.evidenceCompleteness >= 65 ? 1 : 1.14;
  const advisorFactor = inputs.advisorReviewStatus === "complete" ? 0.94 : inputs.advisorReviewStatus === "in_review" ? 1 : 1.08;

  const expected = Math.round(
    basePremium *
      industryFactor *
      regionFactor *
      claimsFactor *
      maturityFactor *
      readinessFactor *
      riskFactor *
      trainingFactor *
      evidenceFactor *
      advisorFactor
  );
  const low = Math.round(expected * 0.82);
  const high = Math.round(expected * 1.28);
  const peerBenchmarkPremium = Math.round(basePremium * industryFactor * regionFactor * 1.08);
  const savingsLow = Math.max(6000, Math.round(expected * 0.14));
  const savingsHigh = Math.max(savingsLow + 6000, Math.round(expected * 0.29));
  const confidenceLevel = inputs.evidenceCompleteness >= 80 && inputs.advisorReviewStatus === "complete" ? "High" : inputs.evidenceCompleteness >= 60 ? "Medium" : "Low";
  const renewalRiskIndicator =
    expected <= peerBenchmarkPremium * 0.9
      ? "Preferred"
      : expected <= peerBenchmarkPremium * 1.05
        ? "Watchlist"
        : expected <= peerBenchmarkPremium * 1.25
          ? "Elevated"
          : "Critical";

  return {
    estimatedAnnualPremium: expected,
    lowRange: low,
    expectedRange: expected,
    highRange: high,
    confidenceLevel,
    renewalRiskIndicator,
    peerBenchmarkPremium,
    potentialSavingsLow: savingsLow,
    potentialSavingsHigh: savingsHigh,
    modelFactors: [
      { label: "Base premium", value: basePremium, explanation: `${inputs.employeeCount.toLocaleString()} employees × workforce exposure rate` },
      { label: "Industry factor", value: industryFactor, explanation: inputs.industry },
      { label: "Region factor", value: regionFactor, explanation: `${inputs.country}, ${inputs.region}` },
      { label: "Claims factor", value: claimsFactor, explanation: inputs.priorClaims.replace(/_/g, " ") },
      { label: "Maturity factor", value: maturityFactor, explanation: `Workforce maturity ${inputs.workforceMaturityScore.toFixed(1)} / 3` },
      { label: "Readiness factor", value: readinessFactor, explanation: `ISO readiness average ${Math.round(readinessAverage)}%` },
      { label: "Evidence factor", value: evidenceFactor, explanation: `${inputs.evidenceCompleteness}% evidence completeness` }
    ],
    roadmapPremiumImpacts: [
      {
        action: "Complete ISO 30415 governance evidence package",
        riskReduced: "Leadership accountability and certification readiness",
        potentialImpact: "May reduce renewal concern by improving underwriting confidence"
      },
      {
        action: "Refresh manager training completion evidence",
        riskReduced: "Harassment, discrimination, and retaliation prevention",
        potentialImpact: "May support preferred EPL risk tier"
      },
      {
        action: "Centralize evidence register and advisor review",
        riskReduced: "Evidence sufficiency and claim defensibility",
        potentialImpact: `Planning savings ${currency(savingsLow)}-${currency(savingsHigh)}`
      }
    ]
  };
}

export const demoPremiumEstimate = estimateEplPremium(demoInsuranceInputs);
