# Repository Audit

## Snapshot

- Repository: `InclusionScore/inclusionscore-ai-agent`
- Local app path: repository root
- Framework: Next.js 15 App Router with React 19 and TypeScript
- Backend target: Supabase Auth, Postgres, RLS, and storage
- AI target: OpenAI Agents SDK placeholder under `src/lib/agent`
- Current state: foundation scaffold with static module placeholders and one Supabase migration

## Current Strengths

- The repository is clean and does not track private source documents, archives, local environment files, or build artifacts.
- `.env.example` contains placeholders only.
- Supabase foundation migration already defines tenants, organizations, memberships, advisor and broker relationships, audit events, roles, helper functions, triggers, indexes, and baseline RLS.
- The app has a shared shell and route map for the intended modules: assessments, controls, evidence, service requests, risks, certification, insurance, reports, agent, and admin.
- `npm run typecheck` passes.

## Gaps

- The app now lives at the repository root so Vercel can deploy the production branch without a monorepo root override.
- `npm run lint` currently invokes deprecated interactive `next lint` without a committed ESLint config, so linting is not CI-safe yet.
- Routes are mostly placeholders and do not yet express client, advisor, certification, or insurance workflows.
- Supabase schema only covers tenancy and audit foundations; business entities for assessments, controls, evidence, tasks, service requests, reports, standards, certification reviews, and underwriting signals still need migrations.
- Authentication helpers exist, but the UI does not yet enforce route-level RBAC or tenant context.
- No CI workflow is committed yet for typecheck, lint, build, migration validation, or secret scanning.

## Immediate Risks

- Deployment risk: Vercel may build the wrong directory unless root settings are explicit.
- Access-control risk: UI routes can be viewed as static pages until middleware and server-side tenant checks are added.
- Migration drift risk: generated database types are present but no generation workflow is documented yet.
- Product-shape risk: module placeholders could become inconsistent unless shared data contracts are introduced early.
- Compliance risk: evidence, audit, and AI outputs must be versioned before real client data is used.

## Recommended Next Steps

- Keep the Next.js app at the repository root so Vercel production deployments serve `/` correctly.
- Replace deprecated `next lint` with ESLint CLI configuration in the foundation track.
- Build the Client Portal first with structured local data models, then connect to Supabase once core workflows are approved.
- Add Supabase migrations module by module, preserving RLS and audit conventions.
- Add GitHub branch protection and require typecheck/build before merge.
