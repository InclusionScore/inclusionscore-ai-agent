# InclusionScore AI Agent

ServiceNow-style workforce risk management platform for DISM consulting, standards readiness, certification evidence, and EPL underwriting signals.

## Module 1: Foundation

- Next.js app router scaffold
- Supabase client/server helpers
- Role-based access model
- Portal navigation shell
- OpenAI Agents adapter placeholder

## MVP Workflow Slice

- Auth panel with Supabase magic-link support and mocked role fallback
- Organization workspace profile for the client audit
- Client dashboard for readiness, evidence, service requests, and reports
- Interactive DISM assessment workflow
- Evidence request and sufficiency table
- Advisor access queue
- Mocked AI DISM Advisor chat
- Mocked report draft generator

## Backend Foundation

- Supabase auth helpers for browser and server contexts
- Tables for profiles, organizations, advisor-client access, assessments, evidence, tasks, audit logs, AI conversations, and AI messages
- RLS policies built around tenant membership and advisor-client access
- Organization data is tenant-isolated by default
- Advisors can read client organizations only through explicit `advisor_client_access` assignments
- Database audit triggers log advisor access changes, assessments, evidence, tasks, AI conversations, and AI messages
- Server-only AI DISM Advisor route at `/api/ai/dism-advisor`
- OpenAI is called only from the API route; the browser never receives `OPENAI_API_KEY`

The AI route uses OpenAI when `OPENAI_API_KEY` is configured and falls back to structured mocked advisor output when it is not.

## Local Setup

```bash
npm install
npm run dev
```

Copy `.env.example` to `.env.local` and provide Supabase/OpenAI credentials.

Required production environment variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4.1-mini
```
