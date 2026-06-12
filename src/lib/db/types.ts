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

