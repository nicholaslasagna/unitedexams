# United Exams (UnitedExams.com)

Premium-feeling college study platform built with **Next.js + TypeScript + Tailwind CSS** and now wired for **Supabase Auth + Postgres**.

## Stack
- Next.js App Router
- TypeScript (strict)
- Tailwind CSS + custom premium UI components
- Supabase (`@supabase/supabase-js`, `@supabase/ssr`)
- React Markdown + KaTeX + syntax highlighting

## Quick Start
1. Install dependencies
   - `npm install`
2. Add environment variables
   - Copy `.env.example` to `.env.local`
   - Set:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `NEXT_PUBLIC_SITE_URL` (for auth callback links, e.g. `https://unitedexams.com`)
     - `NEXT_PUBLIC_TURNSTILE_SITE_KEY` (Cloudflare Turnstile)
     - `TURNSTILE_SECRET_KEY` (server-side Turnstile verify secret)
     - `IP_COOKIE_SIGNING_SECRET` (HMAC secret for trusted-device/IP cookies)
3. Run development server
   - `npm run dev`
4. Open
   - [http://localhost:3000](http://localhost:3000)

## Supabase Setup
1. Create a Supabase project.
2. In Supabase Dashboard:
   - Auth > URL Configuration:
     - Site URL: `https://unitedexams.com`
     - Redirect URLs:
       - `https://unitedexams.com/reset-password`
       - `https://unitedexams.com/app/*`
3. Run SQL migration:
   - `supabase/migrations/20260303170000_united_exams_init.sql`
   - `supabase/migrations/20260303200000_adaptive_onboarding_professor.sql`
   - `supabase/migrations/20260303223000_public_read_published_only.sql`
   - `supabase/migrations/20260303234500_homework_exam_modes.sql`
   - `supabase/migrations/20260304002000_homework_mode_backfill.sql`
   - `supabase/migrations/20260304013000_remove_ttu_reference.sql`
   - `supabase/migrations/20260304021000_email_change_flow.sql`
   - `supabase/migrations/20260304023500_fix_get_recommendations_uuid_and_tags.sql`
   - `supabase/migrations/20260304030000_fix_security_definer_views.sql`
   - `supabase/migrations/20260304043000_contact_gating_ip_protection.sql`
   - `supabase/migrations/20260304052000_university_picker_lock_and_name_guardrails.sql`
   - `supabase/migrations/20260304090000_expand_university_catalog_and_name_rules.sql`
   - `supabase/migrations/20260304103000_profile_locks_professor_expansion.sql`
4. Optional content import (service role key required):
   - `npm run content:generate:se-exam`
   - `npm run content:import:supabase`
5. Configure email templates using:
   - `supabase/email-templates/confirm-signup.html`
   - `supabase/email-templates/reset-password.html`
6. Auth URL configuration:
   - Site URL: `https://unitedexams.com`
   - Redirect URLs:
     - `https://unitedexams.com/reset-password`
     - `https://unitedexams.com/auth/callback`
     - `https://unitedexams.com/app/*`

## Routes
Public:
- `/`
- `/courses`
- `/courses/[courseId]`
- `/quiz/[quizSetId]`
- `/homework`
- `/homework/[setId]`
- `/leaderboard` (public top 5 + locked preview)
- `/contact`
- `/login`
- `/signup`
- `/forgot-password`
- `/reset-password`

Protected (`/app/*`, middleware guarded):
- `/app/dashboard`
- `/app/courses` (canonical redirect to `/courses`)
- `/app/courses/[courseId]` (canonical redirect to `/courses/[courseId]`)
- `/app/quiz/[quizId]` (canonical redirect to `/quiz/[quizSetId]`)
- `/app/homework` (canonical redirect to `/homework`)
- `/app/homework/[setId]` (canonical redirect to `/homework/[setId]`)
- `/app/notes/[courseId]`
- `/app/leaderboard`
- `/app/account`
- `/app/settings`
- `/app/professor`
- `/app/professor/sections/[id]`
- `/app/sections`
- `/app/sections/[sectionId]`
- `/app/sections/[sectionId]/materials`
- `/app/sections/[sectionId]/analytics`
- `/app/sections/[sectionId]/gradebook`

Public leaderboard:
- `/leaderboard` (top 5 for signed-out users, full paginated list for signed-in users)

## Folder Structure
- `app/` routes and layouts
- `components/` shared UI, auth, layout, charts
- `features/quiz/` quiz engine + interactions
- `features/progress/` streak/mastery metrics
- `features/account/` profile/university/course onboarding flows
- `features/leaderboard/` RPC-backed leaderboard API + UI
- `features/recommendations/` recommendation RPC + fallback scoring
- `features/professor/` professor sections/assignments/analytics
- `data/seed/` seeded courses, quiz sets, notes
- `lib/storage/` repository abstraction (`local` + `supabase`)
- `lib/supabase/` env/client/server/middleware helpers
- `supabase/migrations/` schema + RLS + RPC + triggers
- `supabase/email-templates/` branded auth email HTML

## Auth + Security Implemented
- Email/password sign up + sign in + sign out
- Email verification flow
- Forgot-password flow with non-enumerating UX
- Reset-password page with strong password validation
- Forced reset support via `profiles.reset_required`
- Change password with current-password re-auth in settings
- Change email flow with re-auth + inbox verification + pending/resend/cancel UX
- 2FA TOTP enroll/verify/manage UI (uses Supabase MFA API when enabled)
- Cloudflare Turnstile on:
  - `/signup`
  - `/login`
  - `/forgot-password`
  - `/reset-password`
  with server-side verification at `/api/security/turnstile/verify`
- Middleware protection for `/app/*` routes
- Explicit guest mode for public study routes (`/courses`, `/quiz`)
- `/login` and `/signup` now show signed-in state with dashboard/sign-out actions

## Data Persistence
App data is stored through repository abstraction:
- `lib/storage/repository.ts` (contract)
- `lib/storage/local-repository.ts` (fallback/local-first)
- `lib/storage/supabase-repository.ts` (authenticated persistence)

Persisted entities include:
- profile (`display_name`, optional `real_name`, privacy toggles, university)
- preferences (`theme`, `accent_preset`, `accent_hue`, `accent_saturation`, `accent_lightness`, `accent_strength`, `reduce_motion`)
- attempts + answers
- derived streak/mastery/leaderboard cache (via DB triggers)

## Leaderboard
- Uses Supabase RPC:
  - `rpc('get_leaderboard', { limit_count, offset_count })`
- Signed-out users only receive top 5 (RPC-enforced).
- Signed-in users can paginate through full rankings.
- Shows only real user entries.
- Real name / university only shown when user toggles visibility in Account.

## Guest Mode
- Guests can browse catalog + take quizzes from public routes.
- Guest attempts are stored locally.
- On account sign-in, guest attempts are migrated to Supabase automatically via:
  - `lib/storage/guest-migration.ts`
  - `migrateGuestAttemptsToAccount(userId, ...)`
- Quiz start/results include account encouragement CTAs without intrusive modal spam.

## Onboarding + Recommendations
- New users are redirected to `/app/account?onboarding=1` until they select:
  - `university_id`
  - at least one `user_courses` entry
- Dashboard recommendations call `rpc('get_recommendations', { limit_count })`.
- If onboarding is incomplete, recommendations are blocked with a clear CTA.

## Professor Mode
- Professors/admins can access:
  - `/app/sections`
  - `/app/sections/[sectionId]`
  - `/app/sections/[sectionId]/materials`
  - `/app/sections/[sectionId]/analytics`
  - `/app/sections/[sectionId]/gradebook`
- Includes:
  - section creation by course/term
  - join code generation + regeneration
  - section materials (markdown + optional PDF upload URL/storage)
  - homework assignment configuration (`title`, `instructions`, `due_at`, `allow_late`, `max_attempts`, `grading_mode`)
  - assignment submission + autograding bridge (`submit_assignment`)
  - gradebook RPC (`get_section_gradebook`)
  - analytics summary via `rpc('get_section_analytics')`
- Students can join sections using join codes.
- Role mapping:
  - UI label `Teacher` is stored as `profiles.role = 'professor'`.

## Account + Settings Highlights
- Account page:
  - profile fields
  - university searchable combobox from accredited list
  - enrolled courses multi-select
  - privacy toggles for real name/university leaderboard visibility
  - identity lock states for display name + real name
  - masked user ID with reveal/copy controls
- Settings page:
  - theme + accent presets + custom color picker + reduced-motion controls
  - richer live preview (buttons/tags/progress/input/link/card)
  - email change section with pending verification state + resend/cancel
  - password change with re-auth
  - 2FA TOTP enroll/verify/manage
  - export/import data
  - danger-zone account deletion via `rpc('delete_my_account')`

## Legal Consent
- Public routes:
  - `/privacy`
  - `/terms`
  - `/legal/accept`
- Signup requires policy acceptance checkbox before submit.
- Accepted version is stored in:
  - `profiles.privacy_version_accepted`
  - `profiles.terms_version_accepted`
  - immutable `legal_consents` audit table.
- Middleware redirects authenticated users to `/legal/accept` until required versions are accepted.

## Course + Quiz Seed Data
Seeded content lives in `data/seed/` and powers UI immediately:
- Software Engineering
- Differential Equations
- Computer Architecture
- Theory of Automata

Differential equations sets support free-response + guided hints + walkthrough structure.

## Homework + Exam Modes
- `quiz_sets.mode` supports `quiz | exam | homework`.
- Course page tabs now separate Quizzes, Exams, and Homework.
- Homework runs one question at a time with hints, full solution reveal, flagging, and resume support.
- Exam simulation supports full-length banks with target count (e.g. 42), one-by-one flow, and optional free-response inclusion.

## Content Pipeline
- Source JSON files can live in `content/{courseId}/{setId}.json`.
- Software Engineering full exam source is included at:
  - `content/software-engineering/se-exam1-full-practice.json`
- Importer script upserts `quiz_sets` and `questions` by stable IDs:
  - `npm run content:import:supabase`
- Question stability:
  - `questions.external_id` is used for idempotent upserts and duplicate prevention.

## Supabase Email Templates
Use the provided HTML templates in `supabase/email-templates/`:
- Confirm signup
- Reset password

They include:
- United Exams branding
- dark-accent + light-content compatibility
- support email (`support@unitedexams.com`)
- Imagicast Studios ownership link

## QA Checklist
Validate these before production:
1. Sign up, verify email, login, logout.
2. Forgot-password sends reset flow without account enumeration.
3. Reset-password link opens `/reset-password` and forces new password.
4. RLS blocks cross-user reads for attempts/answers/preferences.
5. `/leaderboard` signed-out returns max 5 rows; signed-in paginates.
6. Account privacy toggles update leaderboard visibility immediately.
7. Onboarding blocks recommendations until enrolled courses are set.
8. Professor section creation/assignment/analytics works for professor role.
9. Display name + real name lock after first set and cannot be changed via normal profile update.
10. Student section submission returns graded score for auto-grade sets and `needs_review` for manual/mixed free-response cases.
11. Data export includes profile/preferences/user_courses/attempt summary/mastery.
12. Turnstile challenge blocks auth form submission when invalid/missing token.
13. Profile persistence check:
  - edit display name / real name / university, refresh page, and confirm values persist.
  - leaderboard row reflects profile changes on next load.

## Add a Course or Quiz Set
1. Add course object in `data/seed/courses.ts`.
2. Add quiz sets in `data/seed/quiz-sets.ts` (or split files under `data/seed/`).
3. Add notes/cheat/resources in `data/seed/notes.ts`.
4. Ensure each quiz set `courseId` matches the course `id`.

## Contact + Ownership
- Contact route: `/contact`
- Support email: `support@unitedexams.com`
- Footer ownership across app: **© {year} Imagicast Studios**
