export type AuthMode = "supabase" | "mock";

export type WorkspaceProfile = {
  organization: string;
  companyType: string;
  industry: string;
  employeeBand: string;
  auditStandard: string;
  advisor: string;
  stage: string;
};

export type AssessmentQuestion = {
  id: string;
  domain: string;
  prompt: string;
  evidenceRequired: boolean;
  controlMapping: string[];
  response: "yes" | "no" | "return_later";
  maturityLevel: number;
  advisorDecision: string;
};

export type EvidenceRecord = {
  id: string;
  title: string;
  mappedStandards: string[];
  owner: string;
  due: string;
  status: "Requested" | "Submitted" | "Needs review" | "Accepted";
  freshness: "Current" | "Stale" | "Draft" | "Unknown";
  advisorNotes: string;
};

export type AdvisorClient = {
  client: string;
  workspace: string;
  access: "Review" | "Manage" | "Read only";
  readiness: number;
  evidenceBlockers: number;
  currentDecision: string;
};

export type ReportDraft = {
  title: string;
  audience: string;
  summary: string;
  findings: string[];
  nextActions: string[];
};

export const workspaceProfile: WorkspaceProfile = {
  organization: "Acme Corp",
  companyType: "Manufacturing",
  industry: "Advanced manufacturing",
  employeeBand: "1,001-5,000",
  auditStandard: "DISM + ISO 30415 readiness",
  advisor: "InclusionScore Advisory",
  stage: "Evidence review"
};

export const assessmentQuestions: AssessmentQuestion[] = [
  {
    id: "governance-1",
    domain: "Governance and Accountability",
    prompt: "Has leadership assigned accountable owners for workforce inclusion governance?",
    evidenceRequired: true,
    controlMapping: ["DISM Governance", "ISO 30415 Leadership"],
    response: "yes",
    maturityLevel: 4,
    advisorDecision: "Accept with latest management review minutes."
  },
  {
    id: "hr-1",
    domain: "HR Management",
    prompt: "Are employee lifecycle processes documented and consistently followed across business units?",
    evidenceRequired: true,
    controlMapping: ["DISM HR Management", "ISO 30415 People Management"],
    response: "return_later",
    maturityLevel: 2,
    advisorDecision: "Request process map and regional variance notes."
  },
  {
    id: "pay-1",
    domain: "Pay and Benefits",
    prompt: "Does the organization review pay and benefit access for inequitable outcomes?",
    evidenceRequired: true,
    controlMapping: ["DISM Pay and Benefits", "ISO 30415 Equity", "ISO 30414 Workforce Reporting"],
    response: "no",
    maturityLevel: 1,
    advisorDecision: "Generate remediation task for pay equity review cadence."
  },
  {
    id: "service-1",
    domain: "Workforce Service Requests",
    prompt: "Is there a defined intake, escalation, and closure workflow for accommodation and employee relations requests?",
    evidenceRequired: true,
    controlMapping: ["DISM Service Management", "EPL Workforce Risk"],
    response: "return_later",
    maturityLevel: 2,
    advisorDecision: "Create service request workflow and evidence checklist."
  },
  {
    id: "supplier-1",
    domain: "Supplier Diversity",
    prompt: "Are supplier inclusion expectations documented in procurement controls?",
    evidenceRequired: false,
    controlMapping: ["DISM Supplier Diversity", "ISO 30415 Procurement"],
    response: "yes",
    maturityLevel: 3,
    advisorDecision: "Review procurement policy during next advisor pass."
  }
];

export const evidenceRecords: EvidenceRecord[] = [
  {
    id: "EV-1001",
    title: "Leadership accountability charter",
    mappedStandards: ["DISM Governance", "ISO 30415 Leadership"],
    owner: "Executive Sponsor",
    due: "Jun 18",
    status: "Submitted",
    freshness: "Current",
    advisorNotes: "Needs management review minutes attached."
  },
  {
    id: "EV-1002",
    title: "Manager training completion export",
    mappedStandards: ["EPL", "ISO 30415 Competence"],
    owner: "HR Lead",
    due: "Jun 12",
    status: "Requested",
    freshness: "Stale",
    advisorNotes: "Required before readiness score can move above 75%."
  },
  {
    id: "EV-1003",
    title: "Accommodation request workflow",
    mappedStandards: ["DISM Service Requests", "EPL Workforce Risk"],
    owner: "People Ops",
    due: "Jun 14",
    status: "Needs review",
    freshness: "Draft",
    advisorNotes: "Workflow needs intake, escalation, closure, and owner controls."
  },
  {
    id: "EV-1004",
    title: "Pay equity review procedure",
    mappedStandards: ["DISM Pay and Benefits", "ISO 30414"],
    owner: "Legal",
    due: "Jun 21",
    status: "Requested",
    freshness: "Unknown",
    advisorNotes: "Missing control. Generate implementation task."
  }
];

export const advisorClients: AdvisorClient[] = [
  {
    client: "Acme Corp",
    workspace: "DISM + ISO 30415 readiness",
    access: "Manage",
    readiness: 71,
    evidenceBlockers: 4,
    currentDecision: "Prioritize training records and accommodation workflow."
  },
  {
    client: "Northstar Health",
    workspace: "Workforce risk diagnostic",
    access: "Review",
    readiness: 58,
    evidenceBlockers: 7,
    currentDecision: "Schedule advisor session for service request intake."
  },
  {
    client: "CivicWorks",
    workspace: "Certification preparation",
    access: "Read only",
    readiness: 82,
    evidenceBlockers: 2,
    currentDecision: "Draft executive report and confirm board package."
  }
];

export const initialReportDraft: ReportDraft = {
  title: "DISM Readiness Executive Draft",
  audience: "Executive sponsor, HR, Legal, Advisor",
  summary:
    "Acme Corp is progressing through evidence review with strong governance documentation, incomplete service request controls, and unresolved training evidence. The current readiness posture supports advisor-led remediation before certification review.",
  findings: [
    "Governance ownership is documented but still needs the latest management review record.",
    "Manager training evidence is stale and creates an EPL and ISO 30415 competence blocker.",
    "Accommodation workflow is drafted but lacks complete intake, escalation, closure, and owner evidence.",
    "Pay equity review cadence is not yet documented as a repeatable control."
  ],
  nextActions: [
    "Upload updated training completion export.",
    "Approve accommodation workflow evidence after advisor review.",
    "Create a pay equity review implementation task with Legal and HR owners.",
    "Generate a board-ready workforce risk briefing after evidence blockers are resolved."
  ]
};

export function isSupabaseConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export function calculateReadiness(questions: AssessmentQuestion[], evidence: EvidenceRecord[]) {
  const yesScore = questions.filter((question) => question.response === "yes").length / questions.length;
  const evidenceScore = evidence.filter((item) => item.status === "Accepted" || item.status === "Submitted").length / evidence.length;
  return Math.round((yesScore * 0.55 + evidenceScore * 0.45) * 100);
}
