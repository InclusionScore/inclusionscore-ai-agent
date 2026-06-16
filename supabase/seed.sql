insert into tenants (id, name, kind, slug, status)
values (
  '10000000-0000-4000-8000-000000000001',
  'Acme Workforce Demo',
  'client',
  'acme-workforce-demo',
  'active'
)
on conflict (slug) do nothing;

insert into organizations (
  id,
  tenant_id,
  name,
  slug,
  industry,
  employee_count_band,
  headquarters_country,
  status
)
values (
  '20000000-0000-4000-8000-000000000001',
  '10000000-0000-4000-8000-000000000001',
  'Acme Workforce Demo',
  'acme-workforce-demo',
  'UK financial services and operations',
  '1,001-5,000',
  'GB',
  'active'
)
on conflict (tenant_id, slug) do nothing;

insert into assessments (
  id,
  tenant_id,
  organization_id,
  name,
  standard_set,
  status,
  scope,
  current_domain,
  maturity_score,
  readiness_percent,
  risk_level
)
values (
  '30000000-0000-4000-8000-000000000001',
  '10000000-0000-4000-8000-000000000001',
  '20000000-0000-4000-8000-000000000001',
  'Workforce Risk / DISM Diagnostic',
  array['DISM', 'ISO 30415', 'ISO 30201'],
  'report_ready',
  'organization',
  'Workforce Risk',
  2.8,
  56,
  'watchlist'
)
on conflict (id) do nothing;

insert into evidence (
  tenant_id,
  organization_id,
  assessment_id,
  title,
  description,
  evidence_type,
  mapped_concepts,
  mapped_standards,
  owner_name,
  status,
  freshness
)
values
  (
    '10000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000001',
    '30000000-0000-4000-8000-000000000001',
    'Governance charter and RACI',
    'Approved accountability model for workforce inclusion governance.',
    'document',
    array['ISO 30415: leadership accountability', 'ISO 30201: management-system ownership'],
    array['DISM', 'ISO 30415', 'ISO 30201'],
    'Executive Sponsor',
    'requested',
    'draft'
  ),
  (
    '10000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000001',
    '30000000-0000-4000-8000-000000000001',
    'Manager training completion export',
    'Current completion record by business unit and location.',
    'report',
    array['ISO 30415: competence', 'ISO 30201: training record control'],
    array['DISM', 'ISO 30415', 'ISO 30201'],
    'HR Operations',
    'requested',
    'stale'
  );

insert into tasks (
  tenant_id,
  organization_id,
  assessment_id,
  title,
  description,
  domain,
  mapped_concepts,
  owner_name,
  status,
  priority,
  implementation_phase,
  required_evidence,
  risk_implication,
  readiness_impact
)
values
  (
    '10000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000001',
    '30000000-0000-4000-8000-000000000001',
    'Create unified workforce service request workflow',
    'Document intake, escalation, closure, and evidence rules for accommodation and employee relations requests.',
    'Workforce Service Requests',
    array['ISO 30415: inclusive employee experience', 'ISO 30201: service workflow control'],
    'People Operations',
    'open',
    'high',
    'plan',
    array['Intake form', 'Escalation path', 'Closure log'],
    'Inconsistent handling may increase employee relations and EPL exposure.',
    'Blocks readiness until workflow and operating evidence are approved.'
  ),
  (
    '10000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000001',
    '30000000-0000-4000-8000-000000000001',
    'Build workforce evidence register',
    'Centralize evidence ownership, freshness, mapped standards, and sufficiency status.',
    'Evidence Management',
    array['ISO 30415: evidence of implementation', 'ISO 30201: documented information'],
    'Compliance Lead',
    'open',
    'high',
    'plan',
    array['Evidence register', 'Owner matrix', 'Review cadence'],
    'Fragmented evidence creates certification and advisory review risk.',
    'Required before the client can support a readiness claim.'
  );
