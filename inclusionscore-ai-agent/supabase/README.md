# Supabase Backend

This directory contains the database foundation for InclusionScore AI Agent.

## Module 2: Tenancy, Roles, and Audit

The initial migration creates:

- Tenant records for clients, advisors, brokers, MGAs, certification bodies, and platform operations
- Organizations and organizational hierarchy
- Role-based memberships tied to Supabase Auth users
- Advisor-client and broker-client relationship tables
- Immutable audit event storage
- Row-level security policies for tenant isolation

## Apply Locally

```bash
supabase db reset
```

or apply `supabase/migrations/0001_foundation.sql` to a Supabase Postgres project.

