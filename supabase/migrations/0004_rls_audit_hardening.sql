create policy "assigned advisors can read client organizations"
on organizations for select
using (
  current_user_has_platform_admin()
  or exists (
    select 1
    from advisor_client_access
    where advisor_client_access.client_organization_id = organizations.id
      and advisor_client_access.status = 'active'
      and current_user_has_tenant_access(advisor_client_access.advisor_tenant_id)
  )
);

drop policy if exists "organization users can read ai conversations" on ai_conversations;
drop policy if exists "organization users can manage ai conversations" on ai_conversations;
drop policy if exists "organization users can read ai messages" on ai_messages;
drop policy if exists "organization users can manage ai messages" on ai_messages;

create policy "organization users can read ai conversations"
on ai_conversations for select
using (
  organization_id is not null
  and current_user_can_access_organization(organization_id)
);

create policy "organization users can manage ai conversations"
on ai_conversations for all
using (
  organization_id is not null
  and current_user_can_access_organization(organization_id)
)
with check (
  organization_id is not null
  and current_user_can_access_organization(organization_id)
);

create policy "organization users can read ai messages"
on ai_messages for select
using (
  organization_id is not null
  and current_user_can_access_organization(organization_id)
);

create policy "organization users can manage ai messages"
on ai_messages for all
using (
  organization_id is not null
  and current_user_can_access_organization(organization_id)
)
with check (
  organization_id is not null
  and current_user_can_access_organization(organization_id)
);

create or replace function audit_sensitive_workflow_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  new_state jsonb;
  old_state jsonb;
  audit_tenant_id uuid;
  audit_organization_id uuid;
  audit_resource_id uuid;
begin
  if tg_op = 'DELETE' then
    old_state := to_jsonb(old);
    new_state := null;
    audit_resource_id := old.id;
  elsif tg_op = 'UPDATE' then
    old_state := to_jsonb(old);
    new_state := to_jsonb(new);
    audit_resource_id := new.id;
  else
    old_state := null;
    new_state := to_jsonb(new);
    audit_resource_id := new.id;
  end if;

  audit_tenant_id := coalesce(
    nullif(coalesce(new_state ->> 'tenant_id', old_state ->> 'tenant_id'), '')::uuid,
    nullif(coalesce(new_state ->> 'client_tenant_id', old_state ->> 'client_tenant_id'), '')::uuid
  );

  audit_organization_id := coalesce(
    nullif(coalesce(new_state ->> 'organization_id', old_state ->> 'organization_id'), '')::uuid,
    nullif(coalesce(new_state ->> 'client_organization_id', old_state ->> 'client_organization_id'), '')::uuid
  );

  insert into audit_logs (
    tenant_id,
    organization_id,
    actor_user_id,
    action,
    resource_type,
    resource_id,
    summary,
    metadata
  )
  values (
    audit_tenant_id,
    audit_organization_id,
    auth.uid(),
    lower(tg_op),
    tg_table_name,
    audit_resource_id,
    format('%s %s recorded by database audit trigger.', tg_table_name, lower(tg_op)),
    jsonb_build_object(
      'table', tg_table_name,
      'operation', tg_op,
      'before', old_state,
      'after', new_state
    )
  );

  if tg_op = 'DELETE' then
    return old;
  end if;

  return new;
end;
$$;

create trigger advisor_client_access_audit_log
after insert or update or delete on advisor_client_access
for each row execute function audit_sensitive_workflow_change();

create trigger assessments_audit_log
after insert or update or delete on assessments
for each row execute function audit_sensitive_workflow_change();

create trigger evidence_audit_log
after insert or update or delete on evidence
for each row execute function audit_sensitive_workflow_change();

create trigger tasks_audit_log
after insert or update or delete on tasks
for each row execute function audit_sensitive_workflow_change();

create trigger ai_conversations_audit_log
after insert or update or delete on ai_conversations
for each row execute function audit_sensitive_workflow_change();

create trigger ai_messages_audit_log
after insert or update or delete on ai_messages
for each row execute function audit_sensitive_workflow_change();
