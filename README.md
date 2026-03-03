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
4. Configure email templates using:
   - `supabase/email-templates/confirm-signup.html`
   - `supabase/email-templates/reset-password.html`

## Routes
Public:
- `/`
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

## Folder Structure
- `app/` routes and layouts
- `components/` shared UI, auth, layout, charts
- `features/quiz/` quiz engine + interactions
- `features/progress/` streak/mastery metrics
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
- Shows only real user entries.
- Real name / university only shown when user toggles visibility in Account.

## Course + Quiz Seed Data
Seeded content lives in `data/seed/` and powers UI immediately:
- Software Engineering
- Differential Equations
- Computer Architecture
- Theory of Automata

Differential equations sets support free-response + guided hints + walkthrough structure.

## Add a Course or Quiz Set
1. Add course object in `data/seed/courses.ts`.
2. Add quiz sets in `data/seed/quiz-sets.ts` (or split files under `data/seed/`).
3. Add notes/cheat/resources in `data/seed/notes.ts`.
4. Ensure each quiz set `courseId` matches the course `id`.

## Contact + Ownership
- Contact route: `/contact`
- Support email: `support@unitedexams.com`
- Footer ownership across app: **© {year} Imagicast Studios**

