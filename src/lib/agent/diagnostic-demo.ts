export type DiagnosticQuestion = {
  id: string;
  domain: string;
  question: string;
  iso30415Concept: string;
  iso30201Concept: string;
  evidenceHint: string;
};

export type DiagnosticAnswer = DiagnosticQuestion & {
  answer: string;
};

export type DiagnosticDemoResult = {
  advisor_summary: string;
  maturity_summary: {
    overall_level: number;
    label: string;
    explanation: string;
    domain_scores: Array<{
      domain: string;
      level: number;
      rationale: string;
    }>;
  };
  standards_mapping: Array<{
    standard: "ISO 30415" | "ISO 30201" | "DISM";
    concept: string;
    evidence_needed: string;
  }>;
  top_risks: Array<{
    title: string;
    severity: "low" | "medium" | "high" | "critical";
    implication: string;
  }>;
  recommended_next_steps: string[];
  evidence_requests: Array<{
    title: string;
    description: string;
    mapped_standards: string[];
    owner_hint: string;
  }>;
  implementation_tasks: Array<{
    title: string;
    description: string;
    domain: string;
    priority: "low" | "medium" | "high" | "critical";
    implementation_phase: "plan" | "do" | "check" | "act";
    required_evidence: string[];
    risk_implication: string;
    readiness_impact: string;
  }>;
  action_plan: string[];
};

export const diagnosticQuestions: DiagnosticQuestion[] = [
  {
    id: "governance-accountability",
    domain: "Governance and Accountability",
    question: "Who owns workforce inclusion governance, and is that accountability documented?",
    iso30415Concept: "Leadership accountability and inclusive governance",
    iso30201Concept: "Defined responsibility, governance structure, and management-system ownership",
    evidenceHint: "Governance charter, RACI, board or executive review record"
  },
  {
    id: "workforce-service-requests",
    domain: "Workforce Service Requests",
    question: "How are accommodation, employee relations, or inclusion-related requests captured, escalated, and closed?",
    iso30415Concept: "Inclusive employee experience and equitable access to support",
    iso30201Concept: "Service workflow, escalation path, and closure control",
    evidenceHint: "Request intake form, escalation procedure, closure log"
  },
  {
    id: "training-competence",
    domain: "Training and Competence",
    question: "Are manager training records current, and can you prove completion by business unit or location?",
    iso30415Concept: "Competence, awareness, and inclusive behavior enablement",
    iso30201Concept: "Competence control, training record, and periodic review",
    evidenceHint: "Training completion export, curriculum, overdue training report"
  },
  {
    id: "pay-benefits",
    domain: "Pay and Benefits",
    question: "Do you review pay, benefits, or advancement outcomes for inequitable patterns?",
    iso30415Concept: "Equity in employment practices and access to opportunity",
    iso30201Concept: "Measured process, corrective action, and management review",
    evidenceHint: "Pay equity procedure, analysis summary, corrective action tracker"
  },
  {
    id: "evidence-management",
    domain: "Evidence Management",
    question: "Where do you keep workforce governance evidence, and who reviews whether it is current and sufficient?",
    iso30415Concept: "Evidence of inclusive practices and accountability",
    iso30201Concept: "Documented information, records control, and evidence sufficiency",
    evidenceHint: "Evidence register, document owner list, review cadence"
  },
  {
    id: "risk-reporting",
    domain: "Workforce Risk Reporting",
    question: "What workforce risk information is reported to leadership, and how often is it reviewed?",
    iso30415Concept: "Leadership review, monitoring, and continual improvement",
    iso30201Concept: "Management review, measurement, and improvement planning",
    evidenceHint: "Executive dashboard, management review minutes, risk register"
  }
];

export function buildDiagnosticPrompt(organizationName: string, answers: DiagnosticAnswer[]) {
  const answerBlock = answers
    .map(
      (answer, index) => `${index + 1}. Domain: ${answer.domain}
Question: ${answer.question}
Client answer: ${answer.answer}
ISO 30415 concept: ${answer.iso30415Concept}
ISO 30201 concept: ${answer.iso30201Concept}
Likely evidence: ${answer.evidenceHint}`
    )
    .join("\n\n");

  return `Create a Workforce Risk / DISM diagnostic result for ${organizationName}.

Use the client's answers below. Behave like an expert DISM advisor: diagnose, map to ISO 30415 and ISO 30201, identify maturity gaps, request evidence, create implementation tasks, explain risk, and prepare certification readiness.

${answerBlock}`;
}

export const diagnosticResultSchemaInstruction = `
Return only valid JSON with this exact shape:
{
  "advisor_summary": "string",
  "maturity_summary": {
    "overall_level": 1,
    "label": "string",
    "explanation": "string",
    "domain_scores": [{"domain": "string", "level": 1, "rationale": "string"}]
  },
  "standards_mapping": [{"standard": "ISO 30415|ISO 30201|DISM", "concept": "string", "evidence_needed": "string"}],
  "top_risks": [{"title": "string", "severity": "low|medium|high|critical", "implication": "string"}],
  "recommended_next_steps": ["string"],
  "evidence_requests": [{"title": "string", "description": "string", "mapped_standards": ["string"], "owner_hint": "string"}],
  "implementation_tasks": [{"title": "string", "description": "string", "domain": "string", "priority": "low|medium|high|critical", "implementation_phase": "plan|do|check|act", "required_evidence": ["string"], "risk_implication": "string", "readiness_impact": "string"}],
  "action_plan": ["string"]
}
`;
