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
    "You do not merely answer questions. You diagnose the organization, ask focused follow-up questions, map answers to ISO 30415 and ISO 30201 concepts, identify maturity gaps, request evidence, create implementation tasks, explain risk implications, and produce next-step action plans.",
    "For every substantive client answer, determine whether a control exists, whether it is documented, who owns it, whether evidence exists, whether evidence is current, whether the process is repeatable, and whether certification readiness is blocked.",
    "Use this maturity model: 1 ad hoc, 2 informal, 3 documented, 4 implemented, 5 measured and improving.",
    "If the client says yes, ask for proof. If evidence is stale, request updated evidence. If the client says no or partial, recommend an implementation task. If the client is unsure, ask who can confirm. If one artifact satisfies multiple standards, say so.",
    "Return practical advisor guidance in concise business language.",
    "You do not certify conformity, bind insurance, invent evidence, or make individual employment decisions.",
    `Current working mode: ${mode}.`
  ].join(" ");
}

export type DismAdvisorOutput = {
  answer: string;
  follow_up_questions: string[];
  standards_mapping: Array<{
    standard: "ISO 30415" | "ISO 30201" | "DISM";
    concept: string;
    rationale: string;
  }>;
  maturity_gaps: Array<{
    domain: string;
    current_level: number;
    target_level: number;
    gap: string;
  }>;
  recommended_tasks: Array<{
    title: string;
    description: string;
    domain: string;
    priority: "low" | "medium" | "high" | "critical";
    implementation_phase: "plan" | "do" | "check" | "act";
    required_evidence: string[];
    risk_implication: string;
    readiness_impact: string;
  }>;
  evidence_requests: Array<{
    title: string;
    description: string;
    mapped_standards: string[];
    owner_hint: string;
  }>;
  risk_implications: string[];
  certification_readiness: {
    readiness_level: "not_ready" | "partially_ready" | "ready_for_advisor_review" | "ready";
    blockers: string[];
  };
  action_plan: string[];
};

export function buildMockDismAdvisorOutput(message: string): DismAdvisorOutput {
  const normalized = message.toLowerCase();
  const asksAboutEvidence = normalized.includes("evidence") || normalized.includes("proof") || normalized.includes("document");
  const domain = normalized.includes("training")
    ? "Training and Competence"
    : normalized.includes("pay")
      ? "Pay and Benefits"
      : normalized.includes("accommodation") || normalized.includes("request")
        ? "Workforce Service Requests"
        : "Governance and Accountability";

  return {
    answer: asksAboutEvidence
      ? "Start by proving that the control is not only written down, but operating. I would request the current artifact, owner confirmation, and one recent operating record before counting this as readiness evidence."
      : "I would treat this as a diagnostic item first. We need to confirm whether the control exists, whether it is documented, who owns it, and what evidence proves it is operating.",
    follow_up_questions: [
      "Is this process documented today, or does it only happen informally?",
      "Who owns the control and who can approve the evidence?",
      "What artifact proves this happened in the last review cycle?"
    ],
    standards_mapping: [
      {
        standard: "ISO 30415",
        concept: "Inclusive governance, accountability, and evidence of implementation",
        rationale: "The answer affects whether inclusion practices are documented, owned, and repeatable."
      },
      {
        standard: "ISO 30201",
        concept: "Management-system ownership, documented process, and continual improvement",
        rationale: "The control needs defined responsibility, operating evidence, and review cadence."
      },
      {
        standard: "DISM",
        concept: domain,
        rationale: "The domain maturity depends on whether the practice is documented and evidenced."
      }
    ],
    maturity_gaps: [
      {
        domain,
        current_level: 2,
        target_level: 4,
        gap: "The process appears partially defined, but current evidence and repeatable review cadence are not yet confirmed."
      }
    ],
    recommended_tasks: [
      {
        title: `Validate ${domain.toLowerCase()} control evidence`,
        description: "Collect the current artifact, confirm control ownership, and document how often the control is reviewed.",
        domain,
        priority: "high",
        implementation_phase: "plan",
        required_evidence: ["Policy or procedure", "Owner/RACI confirmation", "Recent operating record"],
        risk_implication: "Weak evidence lowers confidence in consistent workforce governance and may increase audit or workforce risk exposure.",
        readiness_impact: "Certification readiness remains blocked until current evidence proves the control is operating."
      }
    ],
    evidence_requests: [
      {
        title: `${domain} operating evidence`,
        description: "Upload the relevant policy, procedure, owner matrix, and the latest review or completion record.",
        mapped_standards: ["DISM", "ISO 30415", "ISO 30201"],
        owner_hint: "Domain owner or HR/People Operations lead"
      }
    ],
    risk_implications: [
      "Unclear ownership creates accountability risk.",
      "Missing evidence creates certification readiness risk.",
      "Stale documentation can hide inconsistent implementation across teams or locations."
    ],
    certification_readiness: {
      readiness_level: "partially_ready",
      blockers: ["Current evidence not confirmed", "Review cadence not confirmed", "Control owner not validated"]
    },
    action_plan: [
      "Confirm whether the control is documented or informal.",
      "Assign an accountable owner.",
      "Collect current evidence and one operating record.",
      "Advisor reviews sufficiency and updates maturity score.",
      "Convert any missing evidence into implementation tasks."
    ]
  };
}
