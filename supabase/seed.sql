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

insert into tenants (id, name, kind, slug, status)
values (
  '10000000-0000-4000-8000-000000000002',
  'Deloitte Canada Demo',
  'client',
  'deloitte-canada-demo',
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
  '20000000-0000-4000-8000-000000000002',
  '10000000-0000-4000-8000-000000000002',
  'Deloitte Canada Demo',
  'deloitte-canada-demo',
  'Consulting and assurance',
  '10,001+',
  'CA',
  'active'
)
on conflict (tenant_id, slug) do nothing;

insert into standard_domains (id, standard_id, code, name, sort_order)
select domain_id::uuid, standards.id, code, name, sort_order
from standards
join (
  values
    ('40000000-0000-4000-8000-000000000001', 'iso-30415', 'governance', 'Governance', 10),
    ('40000000-0000-4000-8000-000000000002', 'iso-30415', 'inclusive-culture', 'Inclusive Culture', 20),
    ('40000000-0000-4000-8000-000000000003', 'iso-30415', 'competence', 'Competence', 30),
    ('40000000-0000-4000-8000-000000000004', 'iso-30415', 'procurement', 'Procurement', 40),
    ('40000000-0000-4000-8000-000000000005', 'iso-30414', 'availability', 'Workforce Availability', 10),
    ('40000000-0000-4000-8000-000000000006', 'iso-30414', 'leadership', 'Leadership', 20),
    ('40000000-0000-4000-8000-000000000007', 'iso-30414', 'skills', 'Skills', 30),
    ('40000000-0000-4000-8000-000000000008', 'iso-30414', 'productivity', 'Productivity', 40),
    ('40000000-0000-4000-8000-000000000009', 'iso-37401', 'compliance-context', 'Compliance Context', 10),
    ('40000000-0000-4000-8000-000000000010', 'iso-37401', 'obligations', 'Obligations', 20),
    ('40000000-0000-4000-8000-000000000011', 'iso-37401', 'controls', 'Controls', 30),
    ('40000000-0000-4000-8000-000000000012', 'iso-37401', 'monitoring', 'Monitoring', 40),
    ('40000000-0000-4000-8000-000000000013', 'iso-30201', 'process-ownership', 'Process Ownership', 10),
    ('40000000-0000-4000-8000-000000000014', 'iso-30201', 'documented-information', 'Documented Information', 20),
    ('40000000-0000-4000-8000-000000000015', 'iso-30201', 'management-review', 'Management Review', 30),
    ('40000000-0000-4000-8000-000000000016', 'iso-30201', 'improvement', 'Improvement', 40)
) as domain_seed(domain_id, standard_code, code, name, sort_order)
  on standards.code = domain_seed.standard_code
on conflict (standard_id, code) do nothing;

insert into maturity_assessments (
  id,
  tenant_id,
  organization_id,
  name,
  status,
  assessment_period
)
values (
  '50000000-0000-4000-8000-000000000001',
  '10000000-0000-4000-8000-000000000002',
  '20000000-0000-4000-8000-000000000002',
  'Deloitte Canada Multi-Standard Maturity Review',
  'active',
  'Q3 readiness cycle'
)
on conflict (id) do nothing;

insert into maturity_scores (
  id,
  tenant_id,
  organization_id,
  maturity_assessment_id,
  standard_id,
  standard_domain_id,
  score,
  maturity_level,
  maturity_label,
  owner_name,
  evidence_status
)
select score_id::uuid,
  '10000000-0000-4000-8000-000000000002'::uuid,
  '20000000-0000-4000-8000-000000000002'::uuid,
  '50000000-0000-4000-8000-000000000001'::uuid,
  standards.id,
  standard_domains.id,
  score,
  maturity_level,
  maturity_label,
  owner_name,
  evidence_status
from (
  values
    ('60000000-0000-4000-8000-000000000001', 'iso-30415', 'governance', 2.4, 2, 'Under Control', 'Executive Sponsor', 'submitted'),
    ('60000000-0000-4000-8000-000000000002', 'iso-30415', 'inclusive-culture', 2.0, 2, 'Under Control', 'People & Purpose', 'requested'),
    ('60000000-0000-4000-8000-000000000003', 'iso-30415', 'competence', 1.7, 1, 'Learning', 'Learning Lead', 'requested'),
    ('60000000-0000-4000-8000-000000000004', 'iso-30415', 'procurement', 2.1, 2, 'Under Control', 'Supplier Risk', 'submitted'),
    ('60000000-0000-4000-8000-000000000005', 'iso-30414', 'availability', 2.0, 2, 'Under Control', 'People Analytics', 'submitted'),
    ('60000000-0000-4000-8000-000000000006', 'iso-30414', 'leadership', 1.8, 1, 'Learning', 'HR Strategy', 'requested'),
    ('60000000-0000-4000-8000-000000000007', 'iso-30414', 'skills', 1.6, 1, 'Learning', 'Talent', 'requested'),
    ('60000000-0000-4000-8000-000000000008', 'iso-30414', 'productivity', 2.1, 2, 'Under Control', 'Operations', 'submitted'),
    ('60000000-0000-4000-8000-000000000009', 'iso-37401', 'compliance-context', 1.5, 1, 'Learning', 'Ethics Office', 'requested'),
    ('60000000-0000-4000-8000-000000000010', 'iso-37401', 'obligations', 1.7, 1, 'Learning', 'Legal', 'requested'),
    ('60000000-0000-4000-8000-000000000011', 'iso-37401', 'controls', 1.4, 1, 'Learning', 'Risk', 'requested'),
    ('60000000-0000-4000-8000-000000000012', 'iso-37401', 'monitoring', 1.8, 1, 'Learning', 'Compliance', 'requested'),
    ('60000000-0000-4000-8000-000000000013', 'iso-30201', 'process-ownership', 2.2, 2, 'Under Control', 'Transformation Office', 'submitted'),
    ('60000000-0000-4000-8000-000000000014', 'iso-30201', 'documented-information', 2.0, 2, 'Under Control', 'Compliance Lead', 'requested'),
    ('60000000-0000-4000-8000-000000000015', 'iso-30201', 'management-review', 1.8, 1, 'Learning', 'Executive Sponsor', 'requested'),
    ('60000000-0000-4000-8000-000000000016', 'iso-30201', 'improvement', 2.0, 2, 'Under Control', 'PMO', 'submitted')
) as score_seed(score_id, standard_code, domain_code, score, maturity_level, maturity_label, owner_name, evidence_status)
join standards on standards.code = score_seed.standard_code
join standard_domains on standard_domains.standard_id = standards.id and standard_domains.code = score_seed.domain_code
on conflict (id) do nothing;

insert into benchmark_groups (
  id,
  name,
  sector,
  industry,
  region,
  country,
  company_size,
  standard_id,
  maturity_domain
)
select
  '70000000-0000-4000-8000-000000000001'::uuid,
  'Canada consulting enterprise peer group',
  'Professional Services',
  'Consulting and assurance',
  'North America',
  'Canada',
  '10,001+',
  standards.id,
  'Governance'
from standards
where standards.code = 'iso-30415'
on conflict (id) do nothing;

insert into benchmark_results (
  id,
  benchmark_group_id,
  organization_id,
  client_score,
  peer_average,
  top_quartile,
  gap_to_top_quartile,
  recommended_next_actions
)
values (
  '80000000-0000-4000-8000-000000000001',
  '70000000-0000-4000-8000-000000000001',
  '20000000-0000-4000-8000-000000000002',
  2.1,
  1.8,
  2.7,
  0.6,
  array[
    'Approve workforce governance RACI and executive review cadence.',
    'Centralize evidence ownership for ISO 30415 and ISO 30201 controls.',
    'Move service request handling from regional practice to measured workflow.'
  ]
)
on conflict (id) do nothing;

insert into recommendations (
  id,
  tenant_id,
  organization_id,
  maturity_assessment_id,
  title,
  rationale,
  priority,
  source
)
values
  ('90000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000002', '20000000-0000-4000-8000-000000000002', '50000000-0000-4000-8000-000000000001', 'Create a multi-standard evidence register for all active standards.', 'Evidence reuse is the fastest path to multi-standard readiness.', 1, 'seed'),
  ('90000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000002', '20000000-0000-4000-8000-000000000002', '50000000-0000-4000-8000-000000000001', 'Prioritize governance, skills, monitoring, and documented information gaps.', 'These domains have the largest impact on certification readiness.', 2, 'seed'),
  ('90000000-0000-4000-8000-000000000003', '10000000-0000-4000-8000-000000000002', '20000000-0000-4000-8000-000000000002', '50000000-0000-4000-8000-000000000001', 'Assign owners and due dates to every roadmap item.', 'Ownerless work cannot support maturity improvement.', 3, 'seed'),
  ('90000000-0000-4000-8000-000000000004', '10000000-0000-4000-8000-000000000002', '20000000-0000-4000-8000-000000000002', '50000000-0000-4000-8000-000000000001', 'Use quarterly management review to prove controls are operating.', 'Management review moves documented controls into measured controls.', 4, 'seed'),
  ('90000000-0000-4000-8000-000000000005', '10000000-0000-4000-8000-000000000002', '20000000-0000-4000-8000-000000000002', '50000000-0000-4000-8000-000000000001', 'Prepare an advisor review package for certification readiness.', 'Advisor review can validate evidence sufficiency before certification.', 5, 'seed')
on conflict (id) do nothing;

insert into standard_toggles (tenant_id, organization_id, standard_id, is_enabled)
select
  '10000000-0000-4000-8000-000000000002'::uuid,
  '20000000-0000-4000-8000-000000000002'::uuid,
  standards.id,
  true
from standards
where standards.code in ('iso-30415', 'iso-30414', 'iso-37401', 'iso-30201')
on conflict (organization_id, standard_id) do nothing;

insert into roadmap_items (
  id,
  tenant_id,
  organization_id,
  maturity_assessment_id,
  standard_id,
  standard_domain_id,
  current_level,
  next_level,
  required_tasks,
  evidence_needed,
  owner_name,
  due_date,
  ai_recommendation,
  status
)
select
  roadmap_id::uuid,
  '10000000-0000-4000-8000-000000000002'::uuid,
  '20000000-0000-4000-8000-000000000002'::uuid,
  '50000000-0000-4000-8000-000000000001'::uuid,
  standards.id,
  standard_domains.id,
  current_level,
  next_level,
  required_tasks,
  evidence_needed,
  owner_name,
  due_date::date,
  ai_recommendation,
  'open'
from (
  values
    ('91000000-0000-4000-8000-000000000001', 'iso-30415', 'governance', '2 Under Control', '3 Measured', array['Approve governance charter', 'Schedule quarterly management review'], array['Signed RACI', 'Executive review minutes'], 'Executive Sponsor', '2026-07-15', 'Move governance from documented accountability to measurable review cadence.'),
    ('91000000-0000-4000-8000-000000000002', 'iso-30414', 'skills', '1 Learning', '2 Under Control', array['Refresh skills taxonomy', 'Map training completion by region'], array['Skills report', 'LMS export'], 'Talent Lead', '2026-07-22', 'Use skills evidence to connect workforce reporting to measurable capability risk.'),
    ('91000000-0000-4000-8000-000000000003', 'iso-37401', 'monitoring', '1 Learning', '2 Under Control', array['Define compliance monitoring cadence', 'Assign control reviewers'], array['Monitoring plan', 'Reviewer assignment log'], 'Compliance', '2026-08-02', 'Create a compliance monitoring loop before certification readiness review.'),
    ('91000000-0000-4000-8000-000000000004', 'iso-30201', 'documented-information', '2 Under Control', '3 Measured', array['Centralize evidence register', 'Add freshness and sufficiency scoring'], array['Evidence register', 'Monthly sufficiency review'], 'Compliance Lead', '2026-07-29', 'Treat evidence management as the backbone for multi-standard readiness.')
) as roadmap_seed(roadmap_id, standard_code, domain_code, current_level, next_level, required_tasks, evidence_needed, owner_name, due_date, ai_recommendation)
join standards on standards.code = roadmap_seed.standard_code
join standard_domains on standard_domains.standard_id = standards.id and standard_domains.code = roadmap_seed.domain_code
on conflict (id) do nothing;

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

insert into insurance_profiles (
  id,
  tenant_id,
  organization_id,
  employee_count,
  country,
  region,
  industry,
  sector,
  revenue_band,
  workforce_maturity_score,
  iso_30415_readiness,
  iso_30201_readiness,
  harassment_risk,
  discrimination_risk,
  retaliation_risk,
  training_completion,
  evidence_completeness,
  advisor_review_status
)
values (
  'a0000000-0000-4000-8000-000000000001',
  '10000000-0000-4000-8000-000000000002',
  '20000000-0000-4000-8000-000000000002',
  4500,
  'Canada',
  'North America',
  'Consulting and assurance',
  'Professional Services',
  '$1B-$5B',
  2.1,
  71,
  64,
  'medium',
  'medium',
  'low',
  82,
  68,
  'in_review'
)
on conflict (organization_id) do nothing;

insert into premium_estimates (
  id,
  tenant_id,
  organization_id,
  insurance_profile_id,
  estimated_annual_premium,
  low_range,
  expected_range,
  high_range,
  confidence_level,
  renewal_risk_indicator,
  peer_benchmark_premium,
  potential_savings_low,
  potential_savings_high,
  model_version
)
values (
  'a0000000-0000-4000-8000-000000000002',
  '10000000-0000-4000-8000-000000000002',
  '20000000-0000-4000-8000-000000000002',
  'a0000000-0000-4000-8000-000000000001',
  97338,
  79817,
  97338,
  124593,
  'Medium',
  'Elevated',
  87261,
  13627,
  28228,
  'mock-epl-v1'
)
on conflict (id) do nothing;

insert into underwriting_factors (
  id,
  tenant_id,
  organization_id,
  premium_estimate_id,
  label,
  factor_value,
  explanation
)
values
  ('a0000000-0000-4000-8000-000000000003', '10000000-0000-4000-8000-000000000002', '20000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000002', 'Base premium', 81000.00, '4,500 employees multiplied by workforce exposure rate.'),
  ('a0000000-0000-4000-8000-000000000004', '10000000-0000-4000-8000-000000000002', '20000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000002', 'Industry factor', 1.05, 'Consulting and assurance professional services exposure.'),
  ('a0000000-0000-4000-8000-000000000005', '10000000-0000-4000-8000-000000000002', '20000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000002', 'Region factor', 0.95, 'Canada / North America region adjustment.'),
  ('a0000000-0000-4000-8000-000000000006', '10000000-0000-4000-8000-000000000002', '20000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000002', 'Claims factor', 1.12, 'One minor prior EPL claim in the lookback period.'),
  ('a0000000-0000-4000-8000-000000000007', '10000000-0000-4000-8000-000000000002', '20000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000002', 'Maturity factor', 0.98, 'Workforce maturity score is 2.1 out of 3.'),
  ('a0000000-0000-4000-8000-000000000008', '10000000-0000-4000-8000-000000000002', '20000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000002', 'Readiness factor', 0.98, 'Average ISO 30415 and ISO 30201 readiness is 68%.'),
  ('a0000000-0000-4000-8000-000000000009', '10000000-0000-4000-8000-000000000002', '20000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000002', 'Evidence factor', 1.00, 'Evidence completeness is 68%.')
on conflict (id) do nothing;

insert into claims_history (
  id,
  tenant_id,
  organization_id,
  claim_type,
  claim_count,
  severity,
  lookback_period,
  notes
)
values
  ('a0000000-0000-4000-8000-000000000010', '10000000-0000-4000-8000-000000000002', '20000000-0000-4000-8000-000000000002', 'Employment practices', 1, 'minor', '3 years', 'Resolved matter; underwriting impact reduced by documented remediation.'),
  ('a0000000-0000-4000-8000-000000000011', '10000000-0000-4000-8000-000000000002', '20000000-0000-4000-8000-000000000002', 'Harassment', 0, 'none', '3 years', 'No reported harassment claims in seeded demo profile.'),
  ('a0000000-0000-4000-8000-000000000012', '10000000-0000-4000-8000-000000000002', '20000000-0000-4000-8000-000000000002', 'Retaliation', 0, 'none', '3 years', 'No reported retaliation claims in seeded demo profile.')
on conflict (id) do nothing;

insert into premium_recommendations (
  id,
  tenant_id,
  organization_id,
  premium_estimate_id,
  recommendation_type,
  title,
  rationale,
  potential_premium_impact,
  priority,
  source
)
values
  ('a0000000-0000-4000-8000-000000000013', '10000000-0000-4000-8000-000000000002', '20000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000002', 'maturity_action', 'Complete ISO 30415 governance evidence package', 'Improves leadership accountability and certification readiness signal.', 'May reduce renewal concern by improving underwriting confidence.', 1, 'seed'),
  ('a0000000-0000-4000-8000-000000000014', '10000000-0000-4000-8000-000000000002', '20000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000002', 'training_step', 'Raise manager training completion above 90%', 'Improves prevention evidence for harassment, discrimination, and retaliation risk.', 'May support preferred EPL risk tier.', 2, 'seed'),
  ('a0000000-0000-4000-8000-000000000015', '10000000-0000-4000-8000-000000000002', '20000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000002', 'evidence_request', 'Centralize workforce risk evidence register', 'Improves evidence sufficiency, claim defensibility, and advisor review status.', 'Planning savings $13,627-$28,228.', 3, 'seed'),
  ('a0000000-0000-4000-8000-000000000016', '10000000-0000-4000-8000-000000000002', '20000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000002', 'policy_update', 'Refresh anti-harassment, discrimination, retaliation, accommodation, and escalation policies', 'Aligns operating procedures with workforce risk controls and readiness evidence.', 'May reduce perceived control weakness at renewal.', 4, 'seed')
on conflict (id) do nothing;
