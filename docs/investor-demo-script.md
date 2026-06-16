# InclusionScore AI Agent Investor Demo Script

## Demo Client

Use the sample organization:

**Acme Workforce Demo**

Position it as a UK-based workforce risk client preparing for DISM maturity review, ISO 30415 readiness, and ISO 30201-style management system evidence review.

## Setup

1. Open the deployed app.
2. Go to **Client Portal**.
3. Sign in with the demo user.
4. In **AI DISM Advisor Demo**, create or select **Acme Workforce Demo**.
5. Click **Load investor demo answers**.

## Talk Track

### 1. Open With The Problem

“Most workforce governance tools stop at surveys or dashboards. InclusionScore AI Agent turns the advisory workflow into software. It asks the questions an expert DISM advisor would ask, maps the answers to standards, identifies evidence gaps, and creates implementation work.”

### 2. Show The Client Workspace

Point to the Client Portal dashboard.

“This is the client workspace. It combines the assessment, evidence, risk, AI advisor, and action plan in one operating layer. The client does not need to understand the standard line by line. The system translates business answers into readiness signals.”

### 3. Create Or Select The Organization

Create/select **Acme Workforce Demo**.

“We start by creating a tenant-isolated organization workspace. In production, each client’s data is protected by Supabase Row Level Security. Advisors only see clients they are explicitly assigned to.”

### 4. Start The Diagnostic

Scroll to **Workforce Risk / DISM diagnostic**.

“The AI advisor now asks structured questions across the workforce governance system. These are not generic chatbot prompts. Each question is tied to a DISM domain, ISO 30415 concept, ISO 30201 concept, and likely evidence.”

### 5. Load Investor Demo Answers

Click **Load investor demo answers**.

“For the investor demo, I’m loading a realistic set of answers for Acme Workforce Demo. This shows a common buyer situation: some governance exists, but evidence is fragmented, ownership is unclear, and readiness is blocked by documentation and operating proof.”

### 6. Walk Through Two Questions

Show:

- Governance and Accountability
- Workforce Service Requests

Say:

“Notice how the question is immediately mapped to ISO 30415 and ISO 30201 concepts. The system is already preparing the evidence model before the AI generates the action plan.”

### 7. Generate The AI Action Plan

Click **Generate AI action plan**.

“Now the server-side AI route calls OpenAI. The API key never touches the browser. The AI generates the maturity summary, top risks, next steps, evidence requests, and implementation tasks, then saves the assessment, conversation, evidence, tasks, and audit log to Supabase.”

### 8. Explain The Results

Point to:

- Maturity
- Readiness
- Tasks
- Evidence
- Top 3 Risks
- Recommended Next Steps

Say:

“This is the key shift: the agent converts a conversation into an operating plan. It does not just answer questions. It creates the work needed to move the organization toward readiness.”

### 9. Show Dashboard Update

Scroll back to the dashboard panel.

“The Client Dashboard now reflects the latest diagnostic. This gives executives a simple view of where they stand, what is risky, and what needs to happen next.”

### 10. Close With The Product Vision

“The MVP proves the core loop: diagnose, map to standards, identify maturity gaps, request evidence, create tasks, and report readiness. The next layer is advisor review, certification workflow, and insurance-facing workforce risk signals.”

## Expected Demo Output

The AI should produce:

- A maturity summary
- Top 3 workforce governance risks
- Recommended next steps
- Evidence requests
- Implementation tasks
- Certification readiness implications
- A written action plan

## Notes

- OpenAI is called only from server-side API routes.
- Supabase RLS protects organization data.
- Advisor and AI actions are audit logged.
- If OpenAI or Supabase env vars are missing, the demo will not complete the live persistence flow.
