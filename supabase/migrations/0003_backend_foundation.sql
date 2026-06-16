create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  tenant_id uuid references tenants(id) on delete set null,
  organization_id uuid references organizations(id) on delete set null,
  full_name text,
  title text,
  email text,
  avatar_url text,
  default_role app_role not null default 'client_viewer',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table advisor_client_access (
  id uuid primary key default gen_random_uuid(),
  advisor_tenant_id uuid not null references tenants(id) on delete cascade,
  client_tenant_id uuid not null references tenants(id) on delete cascade,
  client_organization_id uuid not null references organizations(id) on delete cascade,
  access_level text not null default 'review' check (access_level in ('read_only', 'review', 'manage')),
  status text not null default 'active' check (status in ('pending', 'active', 'paused', 'revoked')),
  approved_by uuid references auth.users(id) on delete set null,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (advisor_tenant_id, client_organization_id)
);

create table assessments (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  organization_id uuid not null references organizations(id) on delete cascade,
  workspace_id uuid references workspaces(id) on delete set null,
  name text not null,
  standard_set text[] not null default array['DISM', 'ISO 30415', 'ISO 30201'],
  status text not null default 'in_progress' check (status in ('not_started', 'in_progress', 'evidence_review', 'advisor_review', 'report_ready', 'complete')),
  scope text not null default 'organization',
  current_domain text,
  maturity_score numeric(3,1) not null default 1.0,
  readiness_percent integer not null default 0 check (readiness_percent between 0 and 100),
  risk_level text not null default 'watchlist' check (risk_level in ('preferred', 'watchlist', 'high', 'critical')),
  created_by uuid references auth.users(id) on delete set null,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table evidence (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  organization_id uuid not null references organizations(id) on delete cascade,
  assessment_id uuid references assessments(id) on delete cascade,
  title text not null,
  description text,
  evidence_type text not null default 'document',
  mapped_concepts text[] not null default '{}',
  mapped_standards text[] not null default '{}',
  owner_name text,
  status text not null default 'requested' check (status in ('requested', 'submitted', 'needs_review', 'accepted', 'rejected')),
  freshness text not null default 'unknown' check (freshness in ('unknown', 'current', 'stale', 'draft')),
  source_url text,
  storage_path text,
  due_date date,
  reviewer_notes text,
  submitted_by uuid references auth.users(id) on delete set null,
  submitted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table tasks (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  organization_id uuid not null references organizations(id) on delete cascade,
  assessment_id uuid references assessments(id) on delete cascade,
  evidence_id uuid references evidence(id) on delete set null,
  title text not null,
  description text,
  domain text,
  mapped_concepts text[] not null default '{}',
  owner_name text,
  owner_user_id uuid references auth.users(id) on delete set null,
  status text not null default 'open' check (status in ('open', 'in_progress', 'blocked', 'advisor_review', 'complete', 'cancelled')),
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high', 'critical')),
  implementation_phase text not null default 'plan' check (implementation_phase in ('plan', 'do', 'check', 'act')),
  required_evidence text[] not null default '{}',
  risk_implication text,
  readiness_impact text,
  due_date date,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table audit_logs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references tenants(id) on delete set null,
  organization_id uuid references organizations(id) on delete set null,
  actor_user_id uuid references auth.users(id) on delete set null,
  action text not null,
  resource_type text not null,
  resource_id uuid,
  summary text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table ai_conversations (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references tenants(id) on delete cascade,
  organization_id uuid references organizations(id) on delete cascade,
  assessment_id uuid references assessments(id) on delete set null,
  title text not null default 'AI DISM Advisor',
  mode text not null default 'diagnostic',
  model text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table ai_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references ai_conversations(id) on delete cascade,
  tenant_id uuid references tenants(id) on delete cascade,
  organization_id uuid references organizations(id) on delete cascade,
  assessment_id uuid references assessments(id) on delete set null,
  role text not null check (role in ('user', 'assistant', 'system', 'tool')),
  content text not null,
  structured_output jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index profiles_tenant_idx on profiles(tenant_id);
create index advisor_client_access_client_idx on advisor_client_access(client_organization_id);
create index advisor_client_access_advisor_idx on advisor_client_access(advisor_tenant_id);
create index assessments_org_idx on assessments(organization_id, created_at desc);
create index evidence_assessment_idx on evidence(assessment_id, status);
create index tasks_assessment_idx on tasks(assessment_id, status);
create index audit_logs_org_idx on audit_logs(organization_id, created_at desc);
create index ai_conversations_org_idx on ai_conversations(organization_id, created_at desc);
create index ai_messages_conversation_idx on ai_messages(conversation_id, created_at);

create trigger profiles_set_updated_at
before update on profiles
for each row execute function set_updated_at();

create trigger advisor_client_access_set_updated_at
before update on advisor_client_access
for each row execute function set_updated_at();

create trigger assessments_set_updated_at
before update on assessments
for each row execute function set_updated_at();

create trigger evidence_set_updated_at
before update on evidence
for each row execute function set_updated_at();

create trigger tasks_set_updated_at
before update on tasks
for each row execute function set_updated_at();

create trigger ai_conversations_set_updated_at
before update on ai_conversations
for each row execute function set_updated_at();

create or replace function current_user_can_access_organization(target_organization_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from organizations
    where organizations.id = target_organization_id
      and (
        current_user_has_platform_admin()
        or current_user_has_tenant_access(organizations.tenant_id)
        or exists (
          select 1
          from advisor_client_access
          where advisor_client_access.client_organization_id = target_organization_id
            and advisor_client_access.status = 'active'
            and current_user_has_tenant_access(advisor_client_access.advisor_tenant_id)
        )
      )
  );
$$;

create or replace function current_user_can_manage_organization(target_organization_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from organizations
    where organizations.id = target_organization_id
      and (
        current_user_has_platform_admin()
        or current_user_has_tenant_role(organizations.tenant_id, array['tenant_admin', 'client_admin']::app_role[])
        or exists (
          select 1
          from advisor_client_access
          where advisor_client_access.client_organization_id = target_organization_id
            and advisor_client_access.status = 'active'
            and advisor_client_access.access_level = 'manage'
            and current_user_has_tenant_access(advisor_client_access.advisor_tenant_id)
        )
      )
  );
$$;

alter table profiles enable row level security;
alter table advisor_client_access enable row level security;
alter table assessments enable row level security;
alter table evidence enable row level security;
alter table tasks enable row level security;
alter table audit_logs enable row level security;
alter table ai_conversations enable row level security;
alter table ai_messages enable row level security;

create policy "users can read accessible profiles"
on profiles for select
using (
  current_user_has_platform_admin()
  or id = auth.uid()
  or (tenant_id is not null and current_user_has_tenant_access(tenant_id))
);

create policy "users can update their own profile"
on profiles for update
using (id = auth.uid())
with check (id = auth.uid());

create policy "users can insert their own profile"
on profiles for insert
with check (id = auth.uid());

create policy "relationship members can read advisor client access"
on advisor_client_access for select
using (
  current_user_has_platform_admin()
  or current_user_has_tenant_access(advisor_tenant_id)
  or current_user_has_tenant_access(client_tenant_id)
);

create policy "client admins can manage advisor client access"
on advisor_client_access for all
using (
  current_user_has_platform_admin()
  or current_user_has_tenant_role(client_tenant_id, array['tenant_admin', 'client_admin']::app_role[])
)
with check (
  current_user_has_platform_admin()
  or current_user_has_tenant_role(client_tenant_id, array['tenant_admin', 'client_admin']::app_role[])
);

create policy "organization users can read assessments"
on assessments for select
using (current_user_can_access_organization(organization_id));

create policy "organization managers can manage assessments"
on assessments for all
using (current_user_can_manage_organization(organization_id))
with check (current_user_can_manage_organization(organization_id));

create policy "organization users can read evidence"
on evidence for select
using (current_user_can_access_organization(organization_id));

create policy "organization managers can manage evidence"
on evidence for all
using (current_user_can_manage_organization(organization_id))
with check (current_user_can_manage_organization(organization_id));

create policy "organization users can read tasks"
on tasks for select
using (current_user_can_access_organization(organization_id));

create policy "organization managers can manage tasks"
on tasks for all
using (current_user_can_manage_organization(organization_id))
with check (current_user_can_manage_organization(organization_id));

create policy "organization users can read audit logs"
on audit_logs for select
using (
  current_user_has_platform_admin()
  or (organization_id is not null and current_user_can_access_organization(organization_id))
  or (tenant_id is not null and current_user_has_tenant_access(tenant_id))
);

create policy "organization users can read ai conversations"
on ai_conversations for select
using (
  organization_id is null
  or current_user_can_access_organization(organization_id)
);

create policy "organization users can manage ai conversations"
on ai_conversations for all
using (
  organization_id is null
  or current_user_can_access_organization(organization_id)
)
with check (
  organization_id is null
  or current_user_can_access_organization(organization_id)
);

create policy "organization users can read ai messages"
on ai_messages for select
using (
  organization_id is null
  or current_user_can_access_organization(organization_id)
);

create policy "organization users can manage ai messages"
on ai_messages for all
using (
  organization_id is null
  or current_user_can_access_organization(organization_id)
)
with check (
  organization_id is null
  or current_user_can_access_organization(organization_id)
);
