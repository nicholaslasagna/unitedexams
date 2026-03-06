# United Exams Security Operations Baseline

Last reviewed: 2026-03-06

This document defines the minimum operating baseline for United Exams on Next.js, Vercel, Supabase, MailerSend, and Cloudflare Turnstile.

## Shared Responsibility

### Application owner

The United Exams application owner is responsible for:

- application authorization logic
- Supabase RLS correctness
- account lifecycle controls
- environment variable hygiene
- data classification
- audit logging and investigation procedures
- key rotation for app-managed secrets
- dependency maintenance
- professor/admin access reviews
- legal retention decisions

### Vercel

Vercel is responsible for the managed platform components it controls, including:

- CDN and edge infrastructure
- managed TLS termination
- platform network perimeter
- platform encryption for managed services

### Supabase

Supabase is responsible for the managed database/auth/storage platform components it controls, including:

- managed Postgres infrastructure
- auth platform availability
- storage platform availability
- project-level platform controls

### Cloudflare and MailerSend

Cloudflare Turnstile and MailerSend are responsible for their own service availability and controls. United Exams remains responsible for correct integration, routing, rate limiting, and data minimization.

## Tenant Assumptions

Unless there is an enterprise contract for dedicated or isolated infrastructure:

- Vercel should be treated as multitenant
- Supabase should be treated as multitenant

That means the application must assume tenant isolation is vendor-managed and not equivalent to single-tenant deployment guarantees.

## Privileged Account Baseline

The following accounts are privileged:

- `profiles.role = 'professor'`
- `profiles.role = 'admin'`
- any internal operator with direct access to Vercel, Supabase, DNS, Cloudflare, or MailerSend

Minimum baseline:

- MFA required
- least-privilege access only
- quarterly access review
- no shared accounts
- all privileged writes must be auditable

## Required Audit Sources

The following systems must be available during investigations:

- `public.audit_log`
- Supabase Auth logs
- Supabase database logs
- Vercel deployment and runtime logs
- Cloudflare Turnstile and WAF signals
- MailerSend event history for delivery disputes

## Incident Response Baseline

### Severity levels

- `SEV-1`: active compromise, broad unauthorized access, grade tampering, professor/admin account takeover, or prolonged student-impacting outage
- `SEV-2`: confirmed vulnerability with limited exploitation or high-risk exposure
- `SEV-3`: contained issue, suspicious activity, or degraded non-critical control

### Initial response targets

- `SEV-1`: triage immediately, begin containment within 30 minutes
- `SEV-2`: triage within 4 hours
- `SEV-3`: triage within 1 business day

### Required first actions

- identify impacted surface and actor scope
- preserve logs and deployment identifiers
- revoke or rotate impacted secrets where applicable
- disable compromised accounts or sessions
- place affected professor/admin workflows behind manual approval if needed

### Containment examples

- rotate `SUPABASE_SECRET_KEY` / legacy service role secrets
- rotate `IP_COOKIE_SIGNING_SECRET`
- invalidate compromised sessions
- disable professor verification actions temporarily
- suspend affected sections, assignments, or exams if integrity is in question

## Backup and Recovery Expectations

The production owner must verify:

- Supabase backups are enabled
- restore procedures are documented
- at least one restore test is performed per quarter in a non-production environment

Backups are not enough without restore validation.

## Retention Baseline

Default retention guidance:

- security and audit logs: minimum 1 year
- professor/admin change records: minimum 1 year
- delivery logs for transactional academic notifications: minimum 90 days
- incident artifacts: retain until incident closure plus 1 year

Final retention periods should be reviewed against school policy and applicable law.

## Change Management

Security-sensitive changes include:

- RLS policy changes
- auth and middleware changes
- professor/admin authorization changes
- audit logging changes
- email verification and identity workflows
- grading and gradebook workflows

Minimum gate:

- pull request review
- passing typecheck and lint
- CI dependency audit
- CodeQL scan enabled

## Deployment Gate

Do not deploy if any of the following are true:

- privileged users can write directly to security-sensitive tables from the browser
- `audit_log` writes fail for privileged routes
- MFA enforcement for professor/admin accounts is bypassed
- environment configuration exposes a backend secret to the browser
- TLS/domain configuration is invalid
