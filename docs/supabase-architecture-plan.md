# Supabase Architecture Plan

## Core Principles

- Supabase Auth owns identity.
- Postgres owns tenant-scoped business state.
- Row Level Security is enabled for every tenant table.
- Service role usage is limited to trusted server-only jobs.
- All user-visible mutations create audit events.
- Standards, controls, and workflow definitions are data, not hard-coded product behavior.

## Existing Foundation

The first migration defines:

- `tenants`
- `organizations`
- `memberships`
- `advisor_client_relationships`
- `broker_client_relationships`
- `audit_events`
- Role enum and tenant type enum
- RLS helper functions for tenant access, platform admin access, and tenant role checks

## Planned Domains

### Standards And Controls

- `standards`
- `standard_requirements`
- `common_controls`
- `control_requirement_mappings`
- `control_tasks`
- `control_evidence_requirements`
- `maturity_levels`

### Client Workflows

- `assessments`
- `assessment_sections`
- `assessment_responses`
- `evidence_items`
- `evidence_reviews`
- `tasks`
- `service_requests`
- `service_request_events`
- `risk_indicators`
- `risk_register_items`

### Certification

- `certification_programs`
- `certification_readiness_reviews`
- `certification_findings`
- `corrective_actions`
- `audit_packages`

### Insurance

- `underwriting_models`
- `workforce_risk_scores`
- `underwriting_factors`
- `insurance_submissions`
- `broker_reviews`
- `mga_reviews`

### AI Agent

- `agent_threads`
- `agent_messages`
- `agent_runs`
- `agent_recommendations`
- `agent_memory_items`
- `agent_action_approvals`

## Storage Buckets

- `tenant-evidence`: private evidence uploads with tenant-scoped access.
- `report-exports`: generated readiness, risk, and executive reports.
- `audit-packages`: certification package exports.
- `insurance-submissions`: broker and MGA package artifacts.

## RLS Pattern

- Every tenant-owned table includes `tenant_id`.
- Organization-specific tables include `organization_id` when relevant.
- Read policies allow active tenant members and approved related advisor, broker, MGA, certification, or auditor roles.
- Write policies are role-specific and action-specific.
- Cross-tenant advisor and insurance workflows are mediated by relationship tables.

## Migration Strategy

- Keep one migration per product domain or feature milestone.
- Generate database types after migrations change.
- Include indexes with each new workflow table rather than backfilling after performance issues.
- Add audit triggers or explicit audit write paths before production tenant data is used.
