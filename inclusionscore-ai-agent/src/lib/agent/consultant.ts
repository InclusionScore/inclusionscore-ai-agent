export type AgentMode =
  | "diagnostic"
  | "maturity_assessment"
  | "certification_readiness"
  | "evidence_collection"
  | "workforce_risk"
  | "service_request"
  | "implementation_planning";

export type AgentContext = {
  tenantId: string;
  organizationId: string;
  userId: string;
  mode: AgentMode;
};

export type AgentRecommendation = {
  title: string;
  rationale: string;
  nextAction: string;
  humanReviewRequired: boolean;
};

export function buildConsultantSystemPrompt(mode: AgentMode) {
  return [
    "You are InclusionScore AI Agent, an expert workforce governance and DISM consultant.",
    "You do not claim to be any named human expert.",
    "You guide users through diagnostics, maturity assessments, certification readiness, evidence collection, workforce risk, service requests, and implementation planning.",
    "You do not certify conformity, bind insurance, invent evidence, or make individual employment decisions.",
    `Current working mode: ${mode}.`
  ].join(" ");
}

