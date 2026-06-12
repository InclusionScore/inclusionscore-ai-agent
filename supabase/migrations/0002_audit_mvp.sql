create type assessment_status as enum (
  'not_started',
  'in_progress',
  'evidence_review',
  'advisor_review',
  'report_ready',
  'complete'
);

create type response_value as enum (
  'yes',
  'no',
  'return_later',
  'not_applicable'
);

create type evidence_status as enum (
  'requested',
  'submitted',
  'needs_review',
  'accepted',
  'rejected'
);

create type advisor_access_level as enum (
  'read_only',
  'review',
  'manage'
);

create table workspaces (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  organization_id uuid not null references organizations(id) on delete cascade,
  name text not null,
  industry text,
  company_type text,
  employee_count_band text,
  audit_standard text not null default 'DISM',
  current_stage text not null default 'diagnostic',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, name)
);

create table assessment_domains (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  description text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table assessment_questions (
  id uuid primary key default gen_random_uuid(),
  domain_id uuid not null references assessment_domains(id) on delete cascade,
  prompt text not null,
  guidance text,
  evidence_required boolean not null default false,
  control_mapping text[] not null default '{}',
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table workspace_assessments (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  name text not null,
  status assessment_status not null default 'in_progress',
  maturity_score numeric(3,1) not null default 1.0,
  exposure_score integer not null default 0,
  readiness_percent integer not null default 0,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table assessment_responses (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references workspace_assessments(id) on delete cascade,
  question_id uuid not null references assessment_questions(id) on delete cascade,
  response response_value not null default 'return_later',
  notes text,
  advisor_notes text,
  answered_by uuid references auth.users(id) on delete set null,
  answered_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (assessment_id, question_id)
);

create table evidence_requests (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  assessment_id uuid references workspace_assessments(id) on delete cascade,
  question_id uuid references assessment_questions(id) on delete set null,
  title text not null,
  description text,
  mapped_standards text[] not null default '{}',
  owner_name text,
  due_date date,
  status evidence_status not null default 'requested',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table evidence_items_mvp (
  id uuid primary key default gen_random_uuid(),
  evidence_request_id uuid not null references evidence_requests(id) on delete cascade,
  workspace_id uuid not null references workspaces(id) on delete cascade,
  title text not null,
  source_url text,
  file_path text,
  freshness text not null default 'unknown',
  sufficiency evidence_status not null default 'submitted',
  reviewer_notes text,
  submitted_by uuid references auth.users(id) on delete set null,
  submitted_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table advisor_workspace_access (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  advisor_tenant_id uuid not null references tenants(id) on delete cascade,
  access_level advisor_access_level not null default 'review',
  status text not null default 'active',
  approved_by uuid references auth.users(id) on delete set null,
  approved_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, advisor_tenant_id)
);

create table agent_conversations (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  title text not null default 'AI DISM Advisor',
  mode text not null default 'mocked',
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table agent_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references agent_conversations(id) on delete cascade,
  workspace_id uuid not null references workspaces(id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table report_drafts (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  assessment_id uuid references workspace_assessments(id) on delete set null,
  title text not null,
  audience text not null,
  summary text not null,
  findings jsonb not null default '[]'::jsonb,
  next_actions jsonb not null default '[]'::jsonb,
  generated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index workspaces_tenant_idx on workspaces(tenant_id);
create index workspaces_org_idx on workspaces(organization_id);
create index workspace_assessments_workspace_idx on workspace_assessments(workspace_id);
create index assessment_responses_assessment_idx on assessment_responses(assessment_id);
create index evidence_requests_workspace_idx on evidence_requests(workspace_id);
create index evidence_items_workspace_idx on evidence_items_mvp(workspace_id);
create index advisor_workspace_access_workspace_idx on advisor_workspace_access(workspace_id);
create index agent_messages_conversation_idx on agent_messages(conversation_id, created_at);
create index report_drafts_workspace_idx on report_drafts(workspace_id, created_at desc);

create trigger workspaces_set_updated_at
before update on workspaces
for each row execute function set_updated_at();

create trigger workspace_assessments_set_updated_at
before update on workspace_assessments
for each row execute function set_updated_at();

create trigger assessment_responses_set_updated_at
before update on assessment_responses
for each row execute function set_updated_at();

create trigger evidence_requests_set_updated_at
before update on evidence_requests
for each row execute function set_updated_at();

create trigger evidence_items_mvp_set_updated_at
before update on evidence_items_mvp
for each row execute function set_updated_at();

create trigger advisor_workspace_access_set_updated_at
before update on advisor_workspace_access
for each row execute function set_updated_at();

create trigger agent_conversations_set_updated_at
before update on agent_conversations
for each row execute function set_updated_at();

create trigger report_drafts_set_updated_at
before update on report_drafts
for each row execute function set_updated_at();

alter table workspaces enable row level security;
alter table assessment_domains enable row level security;
alter table assessment_questions enable row level security;
alter table workspace_assessments enable row level security;
alter table assessment_responses enable row level security;
alter table evidence_requests enable row level security;
alter table evidence_items_mvp enable row level security;
alter table advisor_workspace_access enable row level security;
alter table agent_conversations enable row level security;
alter table agent_messages enable row level security;
alter table report_drafts enable row level security;

create policy "authenticated users can read assessment domains"
on assessment_domains for select
to authenticated
using (true);

create policy "authenticated users can read active questions"
on assessment_questions for select
to authenticated
using (is_active);

create policy "tenant members can read workspaces"
on workspaces for select
using (current_user_has_platform_admin() or current_user_has_tenant_access(tenant_id));

create policy "client admins can manage workspaces"
on workspaces for all
using (
  current_user_has_platform_admin()
  or current_user_has_tenant_role(tenant_id, array['tenant_admin', 'client_admin']::app_role[])
)
with check (
  current_user_has_platform_admin()
  or current_user_has_tenant_role(tenant_id, array['tenant_admin', 'client_admin']::app_role[])
);

create policy "workspace tenant members can read assessments"
on workspace_assessments for select
using (
  exists (
    select 1 from workspaces
    where workspaces.id = workspace_assessments.workspace_id
      and (current_user_has_platform_admin() or current_user_has_tenant_access(workspaces.tenant_id))
  )
);

create policy "workspace writers can manage assessments"
on workspace_assessments for all
using (
  exists (
    select 1 from workspaces
    where workspaces.id = workspace_assessments.workspace_id
      and (
        current_user_has_platform_admin()
        or current_user_has_tenant_role(workspaces.tenant_id, array['tenant_admin', 'client_admin', 'client_contributor']::app_role[])
      )
  )
)
with check (
  exists (
    select 1 from workspaces
    where workspaces.id = workspace_assessments.workspace_id
      and (
        current_user_has_platform_admin()
        or current_user_has_tenant_role(workspaces.tenant_id, array['tenant_admin', 'client_admin', 'client_contributor']::app_role[])
      )
  )
);

create policy "workspace members can read responses"
on assessment_responses for select
using (
  exists (
    select 1
    from workspace_assessments
    join workspaces on workspaces.id = workspace_assessments.workspace_id
    where workspace_assessments.id = assessment_responses.assessment_id
      and (current_user_has_platform_admin() or current_user_has_tenant_access(workspaces.tenant_id))
  )
);

create policy "workspace writers can manage responses"
on assessment_responses for all
using (
  exists (
    select 1
    from workspace_assessments
    join workspaces on workspaces.id = workspace_assessments.workspace_id
    where workspace_assessments.id = assessment_responses.assessment_id
      and (
        current_user_has_platform_admin()
        or current_user_has_tenant_role(workspaces.tenant_id, array['tenant_admin', 'client_admin', 'client_contributor', 'advisor_admin', 'advisor_consultant']::app_role[])
      )
  )
)
with check (
  exists (
    select 1
    from workspace_assessments
    join workspaces on workspaces.id = workspace_assessments.workspace_id
    where workspace_assessments.id = assessment_responses.assessment_id
      and (
        current_user_has_platform_admin()
        or current_user_has_tenant_role(workspaces.tenant_id, array['tenant_admin', 'client_admin', 'client_contributor', 'advisor_admin', 'advisor_consultant']::app_role[])
      )
  )
);

create policy "workspace members can read evidence requests"
on evidence_requests for select
using (
  exists (
    select 1 from workspaces
    where workspaces.id = evidence_requests.workspace_id
      and (current_user_has_platform_admin() or current_user_has_tenant_access(workspaces.tenant_id))
  )
);

create policy "workspace writers can manage evidence requests"
on evidence_requests for all
using (
  exists (
    select 1 from workspaces
    where workspaces.id = evidence_requests.workspace_id
      and (
        current_user_has_platform_admin()
        or current_user_has_tenant_role(workspaces.tenant_id, array['tenant_admin', 'client_admin', 'client_contributor', 'advisor_admin', 'advisor_consultant']::app_role[])
      )
  )
)
with check (
  exists (
    select 1 from workspaces
    where workspaces.id = evidence_requests.workspace_id
      and (
        current_user_has_platform_admin()
        or current_user_has_tenant_role(workspaces.tenant_id, array['tenant_admin', 'client_admin', 'client_contributor', 'advisor_admin', 'advisor_consultant']::app_role[])
      )
  )
);

create policy "workspace members can read evidence items"
on evidence_items_mvp for select
using (
  exists (
    select 1 from workspaces
    where workspaces.id = evidence_items_mvp.workspace_id
      and (current_user_has_platform_admin() or current_user_has_tenant_access(workspaces.tenant_id))
  )
);

create policy "workspace writers can manage evidence items"
on evidence_items_mvp for all
using (
  exists (
    select 1 from workspaces
    where workspaces.id = evidence_items_mvp.workspace_id
      and (
        current_user_has_platform_admin()
        or current_user_has_tenant_role(workspaces.tenant_id, array['tenant_admin', 'client_admin', 'client_contributor', 'advisor_admin', 'advisor_consultant']::app_role[])
      )
  )
)
with check (
  exists (
    select 1 from workspaces
    where workspaces.id = evidence_items_mvp.workspace_id
      and (
        current_user_has_platform_admin()
        or current_user_has_tenant_role(workspaces.tenant_id, array['tenant_admin', 'client_admin', 'client_contributor', 'advisor_admin', 'advisor_consultant']::app_role[])
      )
  )
);

create policy "relationship tenants can read advisor workspace access"
on advisor_workspace_access for select
using (
  current_user_has_platform_admin()
  or current_user_has_tenant_access(advisor_tenant_id)
  or exists (
    select 1 from workspaces
    where workspaces.id = advisor_workspace_access.workspace_id
      and current_user_has_tenant_access(workspaces.tenant_id)
  )
);

create policy "workspace members can read agent conversations"
on agent_conversations for select
using (
  exists (
    select 1 from workspaces
    where workspaces.id = agent_conversations.workspace_id
      and (current_user_has_platform_admin() or current_user_has_tenant_access(workspaces.tenant_id))
  )
);

create policy "workspace members can manage agent conversations"
on agent_conversations for all
using (
  exists (
    select 1 from workspaces
    where workspaces.id = agent_conversations.workspace_id
      and (current_user_has_platform_admin() or current_user_has_tenant_access(workspaces.tenant_id))
  )
)
with check (
  exists (
    select 1 from workspaces
    where workspaces.id = agent_conversations.workspace_id
      and (current_user_has_platform_admin() or current_user_has_tenant_access(workspaces.tenant_id))
  )
);

create policy "workspace members can read agent messages"
on agent_messages for select
using (
  exists (
    select 1 from workspaces
    where workspaces.id = agent_messages.workspace_id
      and (current_user_has_platform_admin() or current_user_has_tenant_access(workspaces.tenant_id))
  )
);

create policy "workspace members can manage agent messages"
on agent_messages for all
using (
  exists (
    select 1 from workspaces
    where workspaces.id = agent_messages.workspace_id
      and (current_user_has_platform_admin() or current_user_has_tenant_access(workspaces.tenant_id))
  )
)
with check (
  exists (
    select 1 from workspaces
    where workspaces.id = agent_messages.workspace_id
      and (current_user_has_platform_admin() or current_user_has_tenant_access(workspaces.tenant_id))
  )
);

create policy "workspace members can read report drafts"
on report_drafts for select
using (
  exists (
    select 1 from workspaces
    where workspaces.id = report_drafts.workspace_id
      and (current_user_has_platform_admin() or current_user_has_tenant_access(workspaces.tenant_id))
  )
);

create policy "workspace reviewers can manage report drafts"
on report_drafts for all
using (
  exists (
    select 1 from workspaces
    where workspaces.id = report_drafts.workspace_id
      and (
        current_user_has_platform_admin()
        or current_user_has_tenant_role(workspaces.tenant_id, array['tenant_admin', 'client_admin', 'advisor_admin', 'advisor_consultant']::app_role[])
      )
  )
)
with check (
  exists (
    select 1 from workspaces
    where workspaces.id = report_drafts.workspace_id
      and (
        current_user_has_platform_admin()
        or current_user_has_tenant_role(workspaces.tenant_id, array['tenant_admin', 'client_admin', 'advisor_admin', 'advisor_consultant']::app_role[])
      )
  )
);

insert into assessment_domains (code, name, description, sort_order)
values
  ('governance', 'Governance and Accountability', 'Leadership, ownership, oversight, and management review.', 10),
  ('hr-management', 'HR Management', 'Policies, employee lifecycle processes, and people operations controls.', 20),
  ('pay-benefits', 'Pay and Benefits', 'Equitable compensation, benefit access, and review practices.', 30),
  ('service-requests', 'Workforce Service Requests', 'Request intake, response workflows, and escalation paths.', 40),
  ('supplier-diversity', 'Supplier Diversity', 'Procurement controls, supplier inclusion, and external accountability.', 50)
on conflict (code) do nothing;
