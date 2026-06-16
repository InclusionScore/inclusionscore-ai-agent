create table standards (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  description text,
  created_at timestamptz not null default now()
);

create table standard_domains (
  id uuid primary key default gen_random_uuid(),
  standard_id uuid not null references standards(id) on delete cascade,
  code text not null,
  name text not null,
  description text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (standard_id, code)
);

create table maturity_assessments (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  organization_id uuid not null references organizations(id) on delete cascade,
  name text not null,
  status text not null default 'active' check (status in ('draft', 'active', 'complete', 'archived')),
  assessment_period text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table maturity_scores (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  organization_id uuid not null references organizations(id) on delete cascade,
  maturity_assessment_id uuid not null references maturity_assessments(id) on delete cascade,
  standard_id uuid not null references standards(id) on delete cascade,
  standard_domain_id uuid references standard_domains(id) on delete cascade,
  score numeric(3,1) not null check (score >= 0 and score <= 3),
  maturity_level integer not null check (maturity_level between 0 and 3),
  maturity_label text not null,
  owner_name text,
  evidence_status text not null default 'requested',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table benchmark_groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  sector text,
  industry text,
  region text,
  country text,
  company_size text,
  standard_id uuid references standards(id) on delete set null,
  maturity_domain text,
  created_at timestamptz not null default now()
);

create table benchmark_results (
  id uuid primary key default gen_random_uuid(),
  benchmark_group_id uuid not null references benchmark_groups(id) on delete cascade,
  organization_id uuid references organizations(id) on delete cascade,
  client_score numeric(3,1) not null,
  peer_average numeric(3,1) not null,
  top_quartile numeric(3,1) not null,
  gap_to_top_quartile numeric(3,1) not null,
  recommended_next_actions text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table recommendations (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references tenants(id) on delete cascade,
  organization_id uuid references organizations(id) on delete cascade,
  maturity_assessment_id uuid references maturity_assessments(id) on delete cascade,
  title text not null,
  rationale text,
  priority integer not null default 3,
  source text not null default 'system',
  created_at timestamptz not null default now()
);

create table roadmap_items (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  organization_id uuid not null references organizations(id) on delete cascade,
  maturity_assessment_id uuid references maturity_assessments(id) on delete cascade,
  standard_id uuid references standards(id) on delete set null,
  standard_domain_id uuid references standard_domains(id) on delete set null,
  current_level text not null,
  next_level text not null,
  required_tasks text[] not null default '{}',
  evidence_needed text[] not null default '{}',
  owner_name text,
  due_date date,
  ai_recommendation text,
  status text not null default 'open',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table standard_toggles (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  organization_id uuid not null references organizations(id) on delete cascade,
  standard_id uuid not null references standards(id) on delete cascade,
  is_enabled boolean not null default true,
  reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, standard_id)
);

create index maturity_assessments_org_idx on maturity_assessments(organization_id, created_at desc);
create index maturity_scores_assessment_idx on maturity_scores(maturity_assessment_id);
create index benchmark_groups_filters_idx on benchmark_groups(sector, industry, region, country, company_size);
create index recommendations_org_idx on recommendations(organization_id, priority);
create index roadmap_items_org_idx on roadmap_items(organization_id, due_date);
create index standard_toggles_org_idx on standard_toggles(organization_id);

create trigger maturity_assessments_set_updated_at
before update on maturity_assessments
for each row execute function set_updated_at();

create trigger maturity_scores_set_updated_at
before update on maturity_scores
for each row execute function set_updated_at();

create trigger roadmap_items_set_updated_at
before update on roadmap_items
for each row execute function set_updated_at();

create trigger standard_toggles_set_updated_at
before update on standard_toggles
for each row execute function set_updated_at();

alter table standards enable row level security;
alter table standard_domains enable row level security;
alter table maturity_assessments enable row level security;
alter table maturity_scores enable row level security;
alter table benchmark_groups enable row level security;
alter table benchmark_results enable row level security;
alter table recommendations enable row level security;
alter table roadmap_items enable row level security;
alter table standard_toggles enable row level security;

create policy "authenticated users can read standards"
on standards for select
to authenticated
using (true);

create policy "authenticated users can read standard domains"
on standard_domains for select
to authenticated
using (true);

create policy "authenticated users can read benchmark groups"
on benchmark_groups for select
to authenticated
using (true);

create policy "organization users can read maturity assessments"
on maturity_assessments for select
using (current_user_can_access_organization(organization_id));

create policy "organization managers can manage maturity assessments"
on maturity_assessments for all
using (current_user_can_manage_organization(organization_id))
with check (current_user_can_manage_organization(organization_id));

create policy "organization users can read maturity scores"
on maturity_scores for select
using (current_user_can_access_organization(organization_id));

create policy "organization managers can manage maturity scores"
on maturity_scores for all
using (current_user_can_manage_organization(organization_id))
with check (current_user_can_manage_organization(organization_id));

create policy "organization users can read benchmark results"
on benchmark_results for select
using (organization_id is null or current_user_can_access_organization(organization_id));

create policy "organization users can read recommendations"
on recommendations for select
using (organization_id is null or current_user_can_access_organization(organization_id));

create policy "organization managers can manage recommendations"
on recommendations for all
using (organization_id is not null and current_user_can_manage_organization(organization_id))
with check (organization_id is not null and current_user_can_manage_organization(organization_id));

create policy "organization users can read roadmap items"
on roadmap_items for select
using (current_user_can_access_organization(organization_id));

create policy "organization managers can manage roadmap items"
on roadmap_items for all
using (current_user_can_manage_organization(organization_id))
with check (current_user_can_manage_organization(organization_id));

create policy "organization users can read standard toggles"
on standard_toggles for select
using (current_user_can_access_organization(organization_id));

create policy "organization managers can manage standard toggles"
on standard_toggles for all
using (current_user_can_manage_organization(organization_id))
with check (current_user_can_manage_organization(organization_id));

create trigger maturity_assessments_audit_log
after insert or update or delete on maturity_assessments
for each row execute function audit_sensitive_workflow_change();

create trigger maturity_scores_audit_log
after insert or update or delete on maturity_scores
for each row execute function audit_sensitive_workflow_change();

create trigger recommendations_audit_log
after insert or update or delete on recommendations
for each row execute function audit_sensitive_workflow_change();

create trigger roadmap_items_audit_log
after insert or update or delete on roadmap_items
for each row execute function audit_sensitive_workflow_change();

create trigger standard_toggles_audit_log
after insert or update or delete on standard_toggles
for each row execute function audit_sensitive_workflow_change();

insert into standards (code, name, description)
values
  ('iso-30415', 'ISO 30415', 'Human resource management: diversity and inclusion'),
  ('iso-30414', 'ISO 30414', 'Human capital reporting'),
  ('iso-37401', 'ISO 37401', 'Governance and compliance maturity reference'),
  ('iso-30201', 'ISO 30201', 'Management system and documented information reference')
on conflict (code) do nothing;
