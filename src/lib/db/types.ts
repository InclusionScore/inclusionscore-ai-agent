import type { PlatformRole } from "@/lib/auth/roles";

export type TenantKind = "platform" | "client" | "advisor" | "broker" | "mga" | "certification_body";

export type Tenant = {
  id: string;
  name: string;
  kind: TenantKind;
  slug: string;
  status: string;
  created_at: string;
  updated_at: string;
};

export type Organization = {
  id: string;
  tenant_id: string;
  parent_id: string | null;
  name: string;
  slug: string;
  industry: string | null;
  employee_count_band: string | null;
  headquarters_country: string | null;
  status: string;
  created_at: string;
  updated_at: string;
};

export type Membership = {
  id: string;
  tenant_id: string;
  organization_id: string | null;
  user_id: string;
  role: PlatformRole;
  status: string;
  created_at: string;
  updated_at: string;
};

export type AuditEvent = {
  id: string;
  tenant_id: string | null;
  organization_id: string | null;
  actor_user_id: string | null;
  actor_role: PlatformRole | null;
  event_type: string;
  object_type: string;
  object_id: string | null;
  action: string;
  before_state: Record<string, unknown> | null;
  after_state: Record<string, unknown> | null;
  metadata: Record<string, unknown>;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
};

export type AssessmentStatus = "not_started" | "in_progress" | "evidence_review" | "advisor_review" | "report_ready" | "complete";
export type ResponseValue = "yes" | "no" | "return_later" | "not_applicable";
export type EvidenceStatus = "requested" | "submitted" | "needs_review" | "accepted" | "rejected";
export type AdvisorAccessLevel = "read_only" | "review" | "manage";

export type Workspace = {
  id: string;
  tenant_id: string;
  organization_id: string;
  name: string;
  industry: string | null;
  company_type: string | null;
  employee_count_band: string | null;
  audit_standard: string;
  current_stage: string;
  created_at: string;
  updated_at: string;
};

export type AssessmentDomain = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  sort_order: number;
  created_at: string;
};

export type AssessmentQuestion = {
  id: string;
  domain_id: string;
  prompt: string;
  guidance: string | null;
  evidence_required: boolean;
  control_mapping: string[];
  sort_order: number;
  is_active: boolean;
  created_at: string;
};

export type WorkspaceAssessment = {
  id: string;
  workspace_id: string;
  name: string;
  status: AssessmentStatus;
  maturity_score: number;
  exposure_score: number;
  readiness_percent: number;
  started_at: string;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type AssessmentResponse = {
  id: string;
  assessment_id: string;
  question_id: string;
  response: ResponseValue;
  notes: string | null;
  advisor_notes: string | null;
  answered_by: string | null;
  answered_at: string | null;
  created_at: string;
  updated_at: string;
};

export type EvidenceRequest = {
  id: string;
  workspace_id: string;
  assessment_id: string | null;
  question_id: string | null;
  title: string;
  description: string | null;
  mapped_standards: string[];
  owner_name: string | null;
  due_date: string | null;
  status: EvidenceStatus;
  created_at: string;
  updated_at: string;
};

export type EvidenceItemMvp = {
  id: string;
  evidence_request_id: string;
  workspace_id: string;
  title: string;
  source_url: string | null;
  file_path: string | null;
  freshness: string;
  sufficiency: EvidenceStatus;
  reviewer_notes: string | null;
  submitted_by: string | null;
  submitted_at: string;
  created_at: string;
  updated_at: string;
};

export type AdvisorWorkspaceAccess = {
  id: string;
  workspace_id: string;
  advisor_tenant_id: string;
  access_level: AdvisorAccessLevel;
  status: string;
  approved_by: string | null;
  approved_at: string;
  created_at: string;
  updated_at: string;
};

export type AgentConversation = {
  id: string;
  workspace_id: string;
  title: string;
  mode: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type AgentMessage = {
  id: string;
  conversation_id: string;
  workspace_id: string;
  role: "user" | "assistant" | "system";
  content: string;
  metadata: Record<string, unknown>;
  created_at: string;
};

export type ReportDraft = {
  id: string;
  workspace_id: string;
  assessment_id: string | null;
  title: string;
  audience: string;
  summary: string;
  findings: unknown[];
  next_actions: unknown[];
  generated_by: string | null;
  created_at: string;
  updated_at: string;
};
