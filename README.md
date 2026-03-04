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
4. Configure email templates using:
   - `supabase/email-templates/confirm-signup.html`
   - `supabase/email-templates/reset-password.html`
5. Auth URL configuration:
   - Site URL: `https://unitedexams.com`
   - Redirect URLs:
     - `https://unitedexams.com/reset-password`
     - `https://unitedexams.com/app/*`

## Routes
Public:
- `/`
- `/courses`
- `/courses/[courseId]`
- `/quiz/[quizSetId]`
- `/leaderboard` (public top 5 + locked preview)
- `/contact`
- `/login`
- `/signup`
- `/forgot-password`
- `/reset-password`

Protected (`/app/*`, middleware guarded):
- `/app/dashboard`
- `/app/courses`
- `/app/courses/[courseId]`
- `/app/quiz/[quizId]`
- `/app/notes/[courseId]`
- `/app/leaderboard`
- `/app/account`
- `/app/settings`
- `/app/professor`
- `/app/professor/sections/[id]`

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
- 2FA TOTP enroll/verify/manage UI (uses Supabase MFA API when enabled)
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
- preferences (`theme`, `accent_hue`, `accent_strength`, `reduce_motion`)
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
  - `/app/professor`
  - `/app/professor/sections/[id]`
- Includes:
  - section creation by course/term
  - join code generation + regeneration
  - quiz assignment creation
  - analytics summary via `rpc('get_section_analytics')`
- Students can join sections using join codes.

## Account + Settings Highlights
- Account page:
  - profile fields
  - university searchable combobox (+ add university flow)
  - enrolled courses multi-select
  - privacy toggles for real name/university leaderboard visibility
- Settings page:
  - theme + accent + reduced-motion controls
  - password change with re-auth
  - 2FA TOTP enroll/verify/manage
  - export/import data
  - danger-zone account deletion via `rpc('delete_my_account')`

## Course + Quiz Seed Data
Seeded content lives in `data/seed/` and powers UI immediately:
- Software Engineering
- Differential Equations
- Computer Architecture
- Theory of Automata

Differential equations sets support free-response + guided hints + walkthrough structure.

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
9. Data export includes profile/preferences/user_courses/attempt summary/mastery.

## Add a Course or Quiz Set
1. Add course object in `data/seed/courses.ts`.
2. Add quiz sets in `data/seed/quiz-sets.ts` (or split files under `data/seed/`).
3. Add notes/cheat/resources in `data/seed/notes.ts`.
4. Ensure each quiz set `courseId` matches the course `id`.

## Contact + Ownership
- Contact route: `/contact`
- Support email: `support@unitedexams.com`
- Footer ownership across app: **© {year} Imagicast Studios**
