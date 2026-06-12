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

The app deploys without Supabase or OpenAI keys. When Supabase keys are configured, the browser client is available and the migrations define the MVP tables and RLS policies.

## Local Setup

```bash
npm install
npm run dev
```

Copy `.env.example` to `.env.local` and provide Supabase/OpenAI credentials.
