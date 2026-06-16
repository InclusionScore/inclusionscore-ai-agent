# Production Readiness

## Required Environment Variables

Set these in Vercel production and preview environments:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4.1-mini
```

Do not expose `SUPABASE_SERVICE_ROLE_KEY` or `OPENAI_API_KEY` to the browser.

## Launch Checklist

1. Apply Supabase migrations in order from `supabase/migrations`.
2. Optionally load demo data from `supabase/seed.sql`.
3. Confirm Supabase email magic-link auth is enabled.
4. Confirm Vercel production env vars are present.
5. Confirm `/api/diagnostics/dism-demo` is a dynamic server route.
6. Confirm OpenAI requests are made only from server-side API routes.
7. Sign in through the Client Portal.
8. Create/select `Acme Workforce Demo`.
9. Run the guided AI DISM diagnostic.
10. Confirm Supabase records are created for assessment, AI conversation, AI messages, evidence, tasks, and audit logs.
11. Confirm a user without tenant membership cannot query another organization.
12. Confirm an advisor cannot access a client organization without an active `advisor_client_access` record.

## RLS Model

Organization data is tenant-isolated. Client users access organizations through active tenant memberships. Advisors access client organizations only through explicit `advisor_client_access` assignments. Platform admins are the only global exception.

The following workflow tables are protected by RLS:

- `organizations`
- `profiles`
- `assessments`
- `evidence`
- `tasks`
- `audit_logs`
- `ai_conversations`
- `ai_messages`
- `advisor_client_access`

## Audit Logging

The app records audit activity in two ways:

- API routes insert explicit audit logs for organization bootstrap, diagnostic completion, and AI failures.
- Database triggers log changes to advisor access, assessments, evidence, tasks, AI conversations, and AI messages.

## OpenAI Security

OpenAI is called only from Next.js API routes:

- `/api/ai/dism-advisor`
- `/api/diagnostics/dism-demo`

The browser never receives the OpenAI key. Failed or malformed AI responses are handled with user-safe error messages and audit logs.

## Demo Flow

Use the investor demo script at `docs/investor-demo-script.md`.

Recommended demo organization:

**Acme Workforce Demo**

Use **Load investor demo answers** in the Client Portal to prefill realistic answers before generating the AI action plan.
