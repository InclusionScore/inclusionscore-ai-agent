create table insurance_profiles (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  organization_id uuid not null references organizations(id) on delete cascade,
  employee_count integer not null,
  country text not null,
  region text not null,
  industry text not null,
  sector text not null,
  revenue_band text,
  workforce_maturity_score numeric(3,1) not null default 0,
  iso_30415_readiness integer not null default 0,
  iso_30201_readiness integer not null default 0,
  harassment_risk text not null default 'medium',
  discrimination_risk text not null default 'medium',
  retaliation_risk text not null default 'medium',
  training_completion integer not null default 0,
  evidence_completeness integer not null default 0,
  advisor_review_status text not null default 'not_started',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id)
);

create table premium_estimates (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  organization_id uuid not null references organizations(id) on delete cascade,
  insurance_profile_id uuid not null references insurance_profiles(id) on delete cascade,
  estimated_annual_premium integer not null,
  low_range integer not null,
  expected_range integer not null,
  high_range integer not null,
  confidence_level text not null,
  renewal_risk_indicator text not null,
  peer_benchmark_premium integer not null,
  potential_savings_low integer not null,
  potential_savings_high integer not null,
  disclaimer text not null default 'Estimated premium for planning purposes only. Final pricing subject to underwriting.',
  model_version text not null default 'mock-epl-v1',
  created_at timestamptz not null default now()
);

create table underwriting_factors (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  organization_id uuid not null references organizations(id) on delete cascade,
  premium_estimate_id uuid not null references premium_estimates(id) on delete cascade,
  label text not null,
  factor_value numeric(8,2) not null,
  explanation text,
  created_at timestamptz not null default now()
);

create table claims_history (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  organization_id uuid not null references organizations(id) on delete cascade,
  claim_type text not null,
  claim_count integer not null default 0,
  severity text not null default 'none',
  lookback_period text not null default '3 years',
  notes text,
  created_at timestamptz not null default now()
);

create table premium_recommendations (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  organization_id uuid not null references organizations(id) on delete cascade,
  premium_estimate_id uuid references premium_estimates(id) on delete cascade,
  recommendation_type text not null,
  title text not null,
  rationale text,
  potential_premium_impact text,
  priority integer not null default 3,
  source text not null default 'ai',
  created_at timestamptz not null default now()
);

create index insurance_profiles_org_idx on insurance_profiles(organization_id);
create index premium_estimates_org_idx on premium_estimates(organization_id, created_at desc);
create index underwriting_factors_estimate_idx on underwriting_factors(premium_estimate_id);
create index claims_history_org_idx on claims_history(organization_id);
create index premium_recommendations_org_idx on premium_recommendations(organization_id, priority);

create trigger insurance_profiles_set_updated_at
before update on insurance_profiles
for each row execute function set_updated_at();

alter table insurance_profiles enable row level security;
alter table premium_estimates enable row level security;
alter table underwriting_factors enable row level security;
alter table claims_history enable row level security;
alter table premium_recommendations enable row level security;

create policy "organization users can read insurance profiles"
on insurance_profiles for select
using (current_user_can_access_organization(organization_id));

create policy "organization managers can manage insurance profiles"
on insurance_profiles for all
using (current_user_can_manage_organization(organization_id))
with check (current_user_can_manage_organization(organization_id));

create policy "organization users can read premium estimates"
on premium_estimates for select
using (current_user_can_access_organization(organization_id));

create policy "organization managers can manage premium estimates"
on premium_estimates for all
using (current_user_can_manage_organization(organization_id))
with check (current_user_can_manage_organization(organization_id));

create policy "organization users can read underwriting factors"
on underwriting_factors for select
using (current_user_can_access_organization(organization_id));

create policy "organization managers can manage underwriting factors"
on underwriting_factors for all
using (current_user_can_manage_organization(organization_id))
with check (current_user_can_manage_organization(organization_id));

create policy "organization users can read claims history"
on claims_history for select
using (current_user_can_access_organization(organization_id));

create policy "organization managers can manage claims history"
on claims_history for all
using (current_user_can_manage_organization(organization_id))
with check (current_user_can_manage_organization(organization_id));

create policy "organization users can read premium recommendations"
on premium_recommendations for select
using (current_user_can_access_organization(organization_id));

create policy "organization managers can manage premium recommendations"
on premium_recommendations for all
using (current_user_can_manage_organization(organization_id))
with check (current_user_can_manage_organization(organization_id));

create trigger insurance_profiles_audit_log
after insert or update or delete on insurance_profiles
for each row execute function audit_sensitive_workflow_change();

create trigger premium_estimates_audit_log
after insert or update or delete on premium_estimates
for each row execute function audit_sensitive_workflow_change();

create trigger underwriting_factors_audit_log
after insert or update or delete on underwriting_factors
for each row execute function audit_sensitive_workflow_change();

create trigger claims_history_audit_log
after insert or update or delete on claims_history
for each row execute function audit_sensitive_workflow_change();

create trigger premium_recommendations_audit_log
after insert or update or delete on premium_recommendations
for each row execute function audit_sensitive_workflow_change();
