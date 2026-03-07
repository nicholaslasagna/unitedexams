# United Exams Security Posture

Last reviewed: 2026-03-06

## Status Update

On 2026-03-06, this repository implemented a first hardening pass:

- privileged professor and university-admin writes were moved behind server-controlled API routes
- append-only audit logging was added with `public.audit_log` and an RPC-backed writer
- professor/admin MFA enforcement was tightened in middleware
- Supabase env handling now prefers publishable/secret key naming with legacy fallbacks
- CI security automation was added with typecheck, lint, dependency audit, CodeQL, and Dependabot
- an operational baseline was added in [SECURITY_OPERATIONS.md](/Users/Nicholas/unitedexams/unitedexams/SECURITY_OPERATIONS.md)

The assessment below remains useful, but some items listed as gaps were addressed by that hardening pass and should now be treated as historical findings rather than current-open issues.

## Scope

This assessment is based on:

- the current application code in this repository
- current public documentation from NIST, Vercel, and Supabase
- the deployed architecture implied by the codebase: Next.js on Vercel, Supabase Auth/Postgres/Storage/Edge Functions, MailerSend, and Cloudflare Turnstile

This is a practical gap assessment, not a formal certification or attestation.

## Executive Summary

The application has a reasonable early-stage security baseline:

- HTTPS is vendor-managed
- Supabase Row Level Security is heavily used
- privileged secrets are not exposed to the browser
- high-risk flows such as exam start, contact support, and login-IP approval already use server routes or Supabase Edge Functions
- Cloudflare Turnstile is integrated for auth abuse reduction

The current posture is still below what I would call a strong NIST-aligned baseline for a platform handling student data, professor workflows, grades, and institution-linked accounts.

The main reasons are:

- the browser still talks directly to Supabase for a large amount of application data access and CRUD
- there is no consistent immutable audit log for privileged and security-relevant actions
- key management is still using legacy Supabase `anon` and `service_role` terminology in code and env wiring
- there is no evidence of security automation in CI/CD
- there is no documented incident response, retention, backup restore test, or system security plan
- the current deployment is likely multitenant unless you are paying for isolated enterprise infrastructure

## Direct Answers To The Questions You Raised

### 1. Which encryption algorithms are being used for data in transit?

At the application layer, the repo does not choose the TLS algorithms itself. That is vendor-managed by Vercel and Supabase.

Current evidence:

- Vercel documents support for TLS 1.2 and TLS 1.3.
- Vercel explicitly lists these TLS 1.3 ciphers:
  - `TLS_AES_128_GCM_SHA256`
  - `TLS_AES_256_GCM_SHA384`
  - `TLS_CHACHA20_POLY1305_SHA256`
- Vercel documents AES-256 for data at rest for services Vercel controls.

In your own code, the cryptography that is directly visible is:

- IP hashing: `SHA-256`
- signed trust-device and approved-IP cookies: `HMAC-SHA-256`

Observed in code:

- [lib/auth/ip-protection.ts](/Users/Nicholas/unitedexams/unitedexams/lib/auth/ip-protection.ts)

What is not currently true:

- you are not doing application-layer encryption for sensitive profile, grade, or contact-message content
- you are not pinning TLS ciphers
- you are not enforcing mutual TLS between services

### 2. Should the user IP even have access to the database?

Not to the raw Postgres service. Yes to a controlled public API surface, if you deliberately accept that architecture.

Your current design is:

- browser -> Supabase API gateway using the public low-privilege key and the user session JWT
- authorization -> Postgres RLS policies

That means end-user IP addresses do reach Supabase's public API endpoints. That is normal in a Supabase browser-client architecture. It does not mean the browser is opening a raw TCP connection to Postgres.

Observed in code:

- [lib/supabase/client.ts](/Users/Nicholas/unitedexams/unitedexams/lib/supabase/client.ts)
- [lib/supabase/server.ts](/Users/Nicholas/unitedexams/unitedexams/lib/supabase/server.ts)

My recommendation:

- keep direct browser access only for low-risk reads and tightly constrained user-self-service operations
- move professor, admin, grading, announcements, section management, contact submission, legal acceptance, and other security-relevant writes behind server-controlled routes or Edge Functions
- never allow raw database credentials or elevated keys to be usable from browsers

### 3. Have Vercel's security attestations and shared responsibility model been reviewed?

They have now been reviewed at a high level.

Key findings from Vercel's public docs:

- Vercel has a public Trust Center and documents SOC 2 Type 2 and ISO 27001.
- Vercel's shared responsibility model is explicit: the customer is responsible for data classification, application security, user access, integrations, environment variables, and long-term log retention.
- Vercel is responsible for the infrastructure, networking, storage, and encryption for the services Vercel controls.
- Vercel says 99.99% uptime SLA on Enterprise pages. Do not assume that SLA applies unless you are actually on the Enterprise plan/contract.

Implication:

- if something happens in your app because of weak authorization logic, leaked env vars, broken RLS, or insecure third-party integrations, that burden is on you, not Vercel
- if something happens because Vercel's managed platform fails inside the scope they control, that burden shifts toward Vercel under their contract and applicable service terms

### 4. Are you in a multitenant or single-tenant environment?

Based on the repo and public deployment model, you should assume:

- Vercel: multitenant unless you are on Enterprise features such as isolated build infrastructure or Secure Compute
- Supabase: managed multitenant platform unless you have dedicated/private offerings under a specific contract

The current repo contains no evidence that you are using:

- Vercel Secure Compute
- dedicated static egress for backend allowlisting
- private networking between Vercel and Supabase
- isolated enterprise build infrastructure

That matters because a stronger NIST-aligned posture generally prefers:

- smaller public attack surface
- stronger tenant isolation for high-sensitivity systems
- private service-to-service networking where feasible

## What The Codebase Is Doing Well

### Access control and authorization

- Extensive Supabase RLS usage is present across major tables.
- Role-gated routes exist in middleware.
- A number of sensitive actions are already server-mediated instead of being pure browser writes.

Observed in code:

- [middleware.ts](/Users/Nicholas/unitedexams/unitedexams/middleware.ts)
- [supabase/migrations/20260303170000_united_exams_init.sql](/Users/Nicholas/unitedexams/unitedexams/supabase/migrations/20260303170000_united_exams_init.sql)
- [supabase/migrations/20260304043000_contact_gating_ip_protection.sql](/Users/Nicholas/unitedexams/unitedexams/supabase/migrations/20260304043000_contact_gating_ip_protection.sql)

### Secret handling

- There is no evidence that a service-role key is bundled into browser code.
- Elevated secrets are used only in backend-controlled components and Supabase Edge Functions.

Observed in code:

- [supabase/functions/contact-support/index.ts](/Users/Nicholas/unitedexams/unitedexams/supabase/functions/contact-support/index.ts)
- [supabase/functions/approve-login-ip/index.ts](/Users/Nicholas/unitedexams/unitedexams/supabase/functions/approve-login-ip/index.ts)

### Abuse resistance

- Turnstile is wired into signup, login, forgot-password, reset-password, and exam start.
- Login IP approval uses hashed IPs rather than storing raw IPs.
- Trusted device/IP cookies are signed.

Observed in code:

- [lib/security/turnstile.ts](/Users/Nicholas/unitedexams/unitedexams/lib/security/turnstile.ts)
- [app/api/security/turnstile/verify/route.ts](/Users/Nicholas/unitedexams/unitedexams/app/api/security/turnstile/verify/route.ts)
- [lib/auth/ip-protection.ts](/Users/Nicholas/unitedexams/unitedexams/lib/auth/ip-protection.ts)

## High-Value Gaps

### 1. Browser exposure to Supabase is still too broad for the data sensitivity

The repo uses a browser Supabase client with the public key and makes a large number of direct client-side table and RPC calls.

Observed in code:

- [lib/supabase/client.ts](/Users/Nicholas/unitedexams/unitedexams/lib/supabase/client.ts)
- [features/professor/api.ts](/Users/Nicholas/unitedexams/unitedexams/features/professor/api.ts)
- [features/admin/api.ts](/Users/Nicholas/unitedexams/unitedexams/features/admin/api.ts)
- [features/exams/api.ts](/Users/Nicholas/unitedexams/unitedexams/features/exams/api.ts)

Risk:

- RLS becomes your primary perimeter
- mistakes in policy, schema, or RPC design become high impact
- detection, throttling, and fine-grained auditability are weaker than a server-mediated pattern

Recommended direction:

- use a backend-for-frontend pattern for all privileged and institution-scoped writes
- reserve direct browser access for public content and low-risk self-scoped reads

### 2. There is no reliable immutable security audit trail

The code references `audit_log` as optional, but there is no evidence in migrations that it exists as a required table with immutable write semantics.

Observed in code:

- [app/auth/change-email/route.ts](/Users/Nicholas/unitedexams/unitedexams/app/auth/change-email/route.ts)
- [supabase/functions/approve-login-ip/index.ts](/Users/Nicholas/unitedexams/unitedexams/supabase/functions/approve-login-ip/index.ts)

Risk:

- grade changes, professor verification decisions, admin approvals, section deletions, auth-sensitive changes, and incident investigations are harder to prove and reconstruct

Recommended direction:

- create an append-only `audit_log`
- log actor, action, target type, target id, timestamp, IP hash, request id, and outcome
- deny update/delete to all non-system actors

### 3. Key management should move away from legacy Supabase key patterns

The code currently expects `NEXT_PUBLIC_SUPABASE_ANON_KEY` and service role language.

Observed in code:

- [lib/supabase/env.ts](/Users/Nicholas/unitedexams/unitedexams/lib/supabase/env.ts)
- [README.md](/Users/Nicholas/unitedexams/unitedexams/README.md)

Supabase's current guidance is to prefer:

- `sb_publishable_...` for public/browser use
- `sb_secret_...` for backend use

Recommended direction:

- support `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- support secret-key naming for server-side elevated usage
- treat legacy `anon` and `service_role` keys as transitional, not the long-term baseline

### 4. MFA is available, but not part of a strong privileged-user control baseline

The product has MFA UI and profile tracking, but the app does not currently present a complete privileged-user control story equivalent to a NIST-style high-confidence authentication baseline.

Observed in code:

- [app/app/settings/page.tsx](/Users/Nicholas/unitedexams/unitedexams/app/app/settings/page.tsx)
- [middleware.ts](/Users/Nicholas/unitedexams/unitedexams/middleware.ts)

Risk:

- professor and admin accounts are high-value targets
- email compromise + password reuse becomes too dangerous when grade, section, and professor verification actions are in scope

Recommended direction:

- require MFA for all admin and professor accounts
- require MFA for internal operator accounts
- add break-glass procedures and recovery controls

### 5. No evidence of CI/CD security automation

This was true before the 2026-03-06 hardening pass. The repository now includes GitHub Actions for lint, typecheck, dependency audit, Dependabot, and a conditional CodeQL workflow. CodeQL publishing still depends on GitHub code scanning being enabled and available for the repository plan.

Risk:

- vulnerabilities and secret leaks rely on manual discovery
- dependency drift and supply-chain exposure go unmonitored

Recommended direction:

- add dependency review and automated update handling
- add secret scanning
- add SAST
- add typed migration checks and database linting

### 6. No documented incident response, data retention, or recovery baseline

The repo does not contain a system security plan, incident response runbook, vendor inventory, data retention schedule, or backup restore procedure.

Risk:

- security events will be harder to triage
- retention may exceed what is necessary
- recovery expectations will be unclear during outage or breach response

Recommended direction:

- create a minimal SSP
- create IR and breach notification runbooks
- create a data retention and deletion schedule
- document Supabase backup/restore responsibilities and test restores

## NIST-Oriented Assessment

### Use 800-53 as the design catalog

For this application, NIST SP 800-53 Rev. 5 is the better architectural control catalog.

Relevant families:

- AC: Access Control
- AU: Audit and Accountability
- CA: Assessment, Authorization, and Monitoring
- CM: Configuration Management
- IA: Identification and Authentication
- IR: Incident Response
- PL: Planning
- RA: Risk Assessment
- SA: System and Services Acquisition
- SC: System and Communications Protection
- SI: System and Information Integrity

### Use 800-171 when you need a contractual minimum set

NIST SP 800-171 Rev. 3 is aimed at protecting CUI in nonfederal systems. If you are not handling CUI, it is still useful as a disciplined minimum baseline for confidentiality-centric controls.

For United Exams, the most useful 800-171 families are:

- 3.1 Access Control
- 3.3 Audit and Accountability
- 3.4 Configuration Management
- 3.5 Identification and Authentication
- 3.11 Risk Assessment
- 3.12 Security Assessment, Monitoring, and Maintenance
- 3.13 System and Communications Protection
- 3.14 System and Information Integrity

### Practical control status

#### AC / 3.1 Access Control

Status: Partial

Strengths:

- RLS is widely used
- professor/admin/student roles exist
- app route protection exists

Gaps:

- too many sensitive operations are still directly callable from browsers through Supabase client APIs

#### IA / 3.5 Identification and Authentication

Status: Partial

Strengths:

- Supabase Auth is in place
- MFA support exists in product UX
- Turnstile is integrated for key auth flows

Gaps:

- MFA is not yet a hard requirement for all privileged roles
- no formal admin/operator access policy is documented

#### AU / 3.3 Audit and Accountability

Status: Weak

Strengths:

- legal consent records are immutable

Gaps:

- no mandatory platform-wide audit log for privileged/security events
- no documented log retention/export strategy

#### SC / 3.13 System and Communications Protection

Status: Partial

Strengths:

- vendor-managed HTTPS/TLS
- hashed IP storage
- signed cookies

Gaps:

- no app-layer encryption for especially sensitive fields
- no private network path between Vercel and backend is evident
- public browser access to Supabase APIs increases attack surface

#### SI / 3.14 System and Information Integrity

Status: Partial

Strengths:

- Turnstile
- exam integrity event collection

Gaps:

- no evidence of central security monitoring
- no evidence of automated vuln scanning or dependency governance

#### CA / CM / RA / PL / IR

Status: Weak

Reason:

- no visible SSP
- no visible risk register
- no visible change-control/security automation pipeline
- no visible incident response and recovery documentation

## Priority Remediation Plan

### Priority 0

- Move professor/admin/grading/announcement/verification/security-sensitive writes behind server routes or Edge Functions only.
- Add an immutable `audit_log` and wire all privileged actions into it.
- Require MFA for professors, school admins, and platform operators.
- Add a documented vendor inventory and shared-responsibility matrix for Vercel, Supabase, Cloudflare, and MailerSend.
- Migrate toward Supabase publishable and secret keys instead of legacy naming.

### Priority 1

- Add CI security automation: dependency review, secret scanning, SAST, migration linting.
- Create an incident response runbook and retention policy.
- Review all RLS policies for browser-callable professor/admin RPCs and tables.
- Minimize direct browser CRUD where institutional or grading data is involved.
- Review whether any direct Postgres access is enabled outside tightly controlled admin paths.

### Priority 2

- If this system becomes materially more sensitive, evaluate Vercel Enterprise features such as Secure Compute and isolated infrastructure.
- Evaluate whether some sensitive data should be tokenized or encrypted at the application layer before storage.
- Add centralized logging/SIEM export and alerting for security events.

## Bottom Line

If you want a credible answer to "are we secure enough for student, professor, and university-linked data?" the answer today is:

- good enough for an actively developed startup application
- not yet mature enough for a strong NIST-style posture without additional control work

The biggest architectural decision still in front of this project is whether you want to keep the Supabase browser-client model as the primary application data path, or whether you want to move to a stricter backend-for-frontend model for anything beyond low-risk self-service data.

If the product is going to handle grades, institutional verification, security-sensitive professor workflows, and potentially regulated student records, I would move further toward the server-mediated model.

## Source Notes

Official references reviewed:

- NIST SP 800-53 Rev. 5: https://csrc.nist.gov/pubs/sp/800/53/r5/final
- NIST SP 800-171 Rev. 3: https://csrc.nist.gov/pubs/sp/800/171/r3/final
- Vercel shared responsibility: https://vercel.com/docs/security/shared-responsibility
- Vercel encryption: https://vercel.com/docs/encryption
- Vercel security and compliance: https://vercel.com/docs/security/compliance
- Vercel Trust Center: https://security.vercel.com/
- Vercel Secure Compute: https://vercel.com/docs/secure-compute
- Supabase API keys: https://supabase.com/docs/guides/api/api-keys
- Supabase RLS: https://supabase.com/docs/guides/database/postgres/row-level-security
- Supabase JWT/auth model: https://supabase.com/docs/learn/auth-deep-dive/auth-deep-dive-jwts
- Supabase encryption-at-rest note: https://supabase.com/docs/guides/database/column-encryption
