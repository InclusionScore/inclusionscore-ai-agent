export const clientWorkspace = {
  organization: "Acme Corp",
  planStage: "DISM implementation",
  advisor: "InclusionScore Advisory",
  reportingPeriod: "Q3 readiness cycle"
};

export const clientMetrics = [
  { label: "Workforce Risk Score", value: "78", note: "Preferred risk", tone: "success" },
  { label: "DISM Maturity", value: "3.2", note: "Target 4.0", tone: "accent" },
  { label: "Certification Readiness", value: "71%", note: "9 blockers", tone: "warning" },
  { label: "Evidence Sufficiency", value: "64%", note: "18 items due", tone: "warning" }
] as const;

export const clientPriorities = [
  {
    category: "Evidence",
    title: "Upload manager training records",
    owner: "HR Lead",
    due: "Today",
    status: "Blocked",
    impact: "EPL underwriting and ISO 30415 competence controls"
  },
  {
    category: "Risk",
    title: "Review accommodation workflow gap",
    owner: "Legal",
    due: "Jun 14",
    status: "Needs review",
    impact: "Employee relations risk and service request response time"
  },
  {
    category: "Certification",
    title: "Approve governance charter evidence",
    owner: "Executive Sponsor",
    due: "Jun 18",
    status: "In review",
    impact: "Leadership accountability and management review readiness"
  },
  {
    category: "Service Request",
    title: "Start ISO 30415 readiness workflow",
    owner: "D&I Lead",
    due: "Jul 01",
    status: "Queued",
    impact: "Certification readiness path"
  }
] as const;

export const assessmentPrograms = [
  {
    name: "DISM Diagnostic",
    progress: 86,
    status: "Active",
    owner: "D&I Lead",
    nextStep: "Validate leadership accountability responses"
  },
  {
    name: "ISO 30415 Readiness",
    progress: 71,
    status: "Evidence review",
    owner: "Advisor",
    nextStep: "Resolve 9 evidence blockers"
  },
  {
    name: "EPL Workforce Risk",
    progress: 83,
    status: "Draft report",
    owner: "Legal",
    nextStep: "Confirm training and complaint-response artifacts"
  },
  {
    name: "Workforce Governance Maturity",
    progress: 64,
    status: "In progress",
    owner: "HR Operations",
    nextStep: "Complete service management process questions"
  }
] as const;

export const evidenceItems = [
  {
    title: "Anti-harassment and retaliation policy",
    mappedTo: "EPL, ISO 30415, DISM Governance",
    owner: "Legal",
    freshness: "Current",
    sufficiency: "Accepted"
  },
  {
    title: "Manager training completion export",
    mappedTo: "EPL, ISO 30415 Competence",
    owner: "HR Lead",
    freshness: "Stale",
    sufficiency: "Missing update"
  },
  {
    title: "Accommodation request procedure",
    mappedTo: "DISM Service Requests, ISO 30415 Inclusion",
    owner: "People Ops",
    freshness: "Current",
    sufficiency: "Needs review"
  },
  {
    title: "Board workforce risk briefing",
    mappedTo: "ISO 30414, Workforce Risk Reporting",
    owner: "Executive Sponsor",
    freshness: "Draft",
    sufficiency: "Advisor review"
  }
] as const;

export const serviceRequests = [
  {
    id: "SR-1042",
    service: "Certification readiness review",
    status: "In fulfillment",
    requester: "D&I Lead",
    sla: "3 business days"
  },
  {
    id: "SR-1043",
    service: "Evidence mapping support",
    status: "Waiting on client",
    requester: "HR Lead",
    sla: "1 business day"
  },
  {
    id: "SR-1044",
    service: "Workforce risk memo",
    status: "Queued",
    requester: "Legal",
    sla: "5 business days"
  }
] as const;

export const riskIndicators = [
  {
    factor: "Complaint response consistency",
    score: "Medium",
    signal: "Case closure artifacts vary by region",
    treatment: "Standardize investigation workflow evidence"
  },
  {
    factor: "Manager training coverage",
    score: "High",
    signal: "Training record is stale for two business units",
    treatment: "Refresh completion export and escalation plan"
  },
  {
    factor: "Leadership accountability",
    score: "Low",
    signal: "Governance charter and review cadence are documented",
    treatment: "Attach latest management review minutes"
  }
] as const;

export const reportOutputs = [
  {
    name: "Executive Workforce Risk Brief",
    audience: "Executive team",
    status: "Ready to generate",
    contents: "Risk score, top blockers, maturity trend, next 30 days"
  },
  {
    name: "Certification Readiness Report",
    audience: "Client and advisor",
    status: "Needs evidence",
    contents: "Control coverage, evidence gaps, corrective actions"
  },
  {
    name: "EPL Underwriting Signal Pack",
    audience: "Broker",
    status: "Draft",
    contents: "Workforce risk factors, evidence summary, remediation plan"
  }
] as const;
