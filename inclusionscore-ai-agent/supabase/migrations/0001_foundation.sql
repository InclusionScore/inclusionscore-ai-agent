create extension if not exists "pgcrypto";

create type app_role as enum (
  'platform_super_admin',
  'tenant_admin',
  'client_admin',
  'client_contributor',
  'client_viewer',
  'advisor_admin',
  'advisor_consultant',
  'certification_reviewer',
  'insurance_broker',
  'mga_underwriter',
  'auditor',
  'executive_viewer'
);

create type tenant_kind as enum (
  'platform',
  'client',
  'advisor',
  'broker',
  'mga',
  'certification_body'
);

create table tenants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  kind tenant_kind not null default 'client',
  slug text not null unique,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table organizations (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  parent_id uuid references organizations(id) on delete set null,
  name text not null,
  slug text not null,
  industry text,
  employee_count_band text,
  headquarters_country text,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, slug)
);

create table memberships (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  organization_id uuid references organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role app_role not null,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, organization_id, user_id, role)
);

create table advisor_client_relationships (
  id uuid primary key default gen_random_uuid(),
  advisor_tenant_id uuid not null references tenants(id) on delete cascade,
  client_tenant_id uuid not null references tenants(id) on delete cascade,
  client_organization_id uuid not null references organizations(id) on delete cascade,
  status text not null default 'pending',
  access_approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (advisor_tenant_id, client_organization_id)
);

create table broker_client_relationships (
  id uuid primary key default gen_random_uuid(),
  broker_tenant_id uuid not null references tenants(id) on delete cascade,
  client_tenant_id uuid not null references tenants(id) on delete cascade,
  client_organization_id uuid not null references organizations(id) on delete cascade,
  mga_tenant_id uuid references tenants(id) on delete set null,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (broker_tenant_id, client_organization_id)
);

create table audit_events (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references tenants(id) on delete set null,
  organization_id uuid references organizations(id) on delete set null,
  actor_user_id uuid references auth.users(id) on delete set null,
  actor_role app_role,
  event_type text not null,
  object_type text not null,
  object_id uuid,
  action text not null,
  before_state jsonb,
  after_state jsonb,
  metadata jsonb not null default '{}'::jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamptz not null default now()
);

create index memberships_user_id_idx on memberships(user_id);
create index memberships_tenant_id_idx on memberships(tenant_id);
create index memberships_organization_id_idx on memberships(organization_id);
create index organizations_tenant_id_idx on organizations(tenant_id);
create index audit_events_tenant_created_idx on audit_events(tenant_id, created_at desc);
create index audit_events_object_idx on audit_events(object_type, object_id);

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger tenants_set_updated_at
before update on tenants
for each row execute function set_updated_at();

create trigger organizations_set_updated_at
before update on organizations
for each row execute function set_updated_at();

create trigger memberships_set_updated_at
before update on memberships
for each row execute function set_updated_at();

create trigger advisor_client_relationships_set_updated_at
before update on advisor_client_relationships
for each row execute function set_updated_at();

create trigger broker_client_relationships_set_updated_at
before update on broker_client_relationships
for each row execute function set_updated_at();

create or replace function current_user_has_tenant_access(target_tenant_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from memberships
    where memberships.user_id = auth.uid()
      and memberships.tenant_id = target_tenant_id
      and memberships.status = 'active'
  );
$$;

create or replace function current_user_has_platform_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from memberships
    where memberships.user_id = auth.uid()
      and memberships.role = 'platform_super_admin'
      and memberships.status = 'active'
  );
$$;

create or replace function current_user_has_tenant_role(target_tenant_id uuid, allowed_roles app_role[])
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from memberships
    where memberships.user_id = auth.uid()
      and memberships.tenant_id = target_tenant_id
      and memberships.role = any(allowed_roles)
      and memberships.status = 'active'
  );
$$;

alter table tenants enable row level security;
alter table organizations enable row level security;
alter table memberships enable row level security;
alter table advisor_client_relationships enable row level security;
alter table broker_client_relationships enable row level security;
alter table audit_events enable row level security;

create policy "tenant members can read tenants"
on tenants for select
using (current_user_has_platform_admin() or current_user_has_tenant_access(id));

create policy "platform admins can manage tenants"
on tenants for all
using (current_user_has_platform_admin())
with check (current_user_has_platform_admin());

create policy "tenant members can read organizations"
on organizations for select
using (current_user_has_platform_admin() or current_user_has_tenant_access(tenant_id));

create policy "tenant admins can manage organizations"
on organizations for all
using (
  current_user_has_platform_admin()
  or current_user_has_tenant_role(organizations.tenant_id, array['tenant_admin', 'client_admin', 'advisor_admin']::app_role[])
)
with check (
  current_user_has_platform_admin()
  or current_user_has_tenant_role(organizations.tenant_id, array['tenant_admin', 'client_admin', 'advisor_admin']::app_role[])
);

create policy "users can read their memberships"
on memberships for select
using (
  current_user_has_platform_admin()
  or user_id = auth.uid()
  or current_user_has_tenant_access(tenant_id)
);

create policy "tenant admins can manage memberships"
on memberships for all
using (
  current_user_has_platform_admin()
  or current_user_has_tenant_role(memberships.tenant_id, array['tenant_admin']::app_role[])
)
with check (
  current_user_has_platform_admin()
  or current_user_has_tenant_role(memberships.tenant_id, array['tenant_admin']::app_role[])
);

create policy "relationship tenants can read advisor relationships"
on advisor_client_relationships for select
using (
  current_user_has_platform_admin()
  or current_user_has_tenant_access(advisor_tenant_id)
  or current_user_has_tenant_access(client_tenant_id)
);

create policy "relationship tenants can read broker relationships"
on broker_client_relationships for select
using (
  current_user_has_platform_admin()
  or current_user_has_tenant_access(broker_tenant_id)
  or current_user_has_tenant_access(client_tenant_id)
  or (mga_tenant_id is not null and current_user_has_tenant_access(mga_tenant_id))
);

create policy "tenant members can read audit events"
on audit_events for select
using (
  current_user_has_platform_admin()
  or (tenant_id is not null and current_user_has_tenant_access(tenant_id))
);

create policy "authenticated users can append audit events"
on audit_events for insert
with check (auth.uid() is not null);
