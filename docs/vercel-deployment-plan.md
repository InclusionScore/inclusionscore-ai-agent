# Vercel Deployment Plan

## Project Setup

- Vercel project name: `inclusionscore-ai-agent`
- GitHub repository: `InclusionScore/inclusionscore-ai-agent`
- Root directory: `inclusionscore-ai-agent`
- Framework preset: Next.js
- Production branch: `main`
- Preview deployments: enabled for pull requests

## Build Settings

- Install command: `npm install`
- Build command: `npm run build`
- Output directory: managed by Next.js
- Node version: Vercel default LTS unless package constraints require pinning

## Environment Variables

Set these in Vercel Project Settings:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` for server-only administrative jobs, never exposed to client components
- `OPENAI_API_KEY`
- `OPENAI_AGENT_MODEL`
- `NEXT_PUBLIC_APP_ENV`

Production and preview values should point to separate Supabase projects or separate Supabase branches when available.

## Deployment Gates

- Pull requests should run typecheck, lint, and build before merge.
- Production deploys should only occur from `main`.
- Preview deploys should be used for module review by product owners before merge.
- No private DISM source documents, insurance policies, or standards PDFs should be uploaded into the repo or Vercel build output.

## Observability

- Use Vercel build logs for CI failures.
- Add application-level request IDs once API routes are introduced.
- Add Supabase audit events for tenant-visible mutations.
- Add AI run logging for agent prompts, structured outputs, user approvals, and tool calls, with sensitive content scoped by tenant.

## Deployment Risks

- Nested app path requires explicit Vercel root configuration.
- Supabase environment mismatches can silently point previews at production data if variables are reused.
- AI features must not be enabled in production until tenant scoping, logging, and human approval points are implemented.
