# United Exams (UnitedExams.com)

Premium-feeling college study platform built with **Next.js + TypeScript + Tailwind CSS**.

## Stack
- Next.js App Router
- TypeScript (strict)
- Tailwind CSS
- Local-first persistence layer (repository abstraction)
- React Markdown + KaTeX + syntax highlighting

## Quick Start
1. Install dependencies:
   - `npm install`
2. Run development server:
   - `npm run dev`
3. Open:
   - [http://localhost:3000](http://localhost:3000)

## Routes
- `/` marketing landing page
- `/app/dashboard`
- `/app/courses`
- `/app/courses/[courseId]`
- `/app/quiz/[quizId]`
- `/app/notes/[courseId]`
- `/app/leaderboard`
- `/app/settings`

## Folder Structure
- `app/` route + layout system
- `components/` shared UI and layout components
- `features/quiz/` quiz engine + quiz-specific UI
- `features/progress/` streak, mastery, and metrics helpers
- `data/seed/` seeded courses, quiz sets, notes, resources, leaderboard
- `lib/storage/` persistence abstraction + local repository implementation

## Seeded Content
Initial dataset includes:
- 4 courses:
  - Software Engineering
  - Differential Equations
  - Computer Architecture
  - Theory of Automata
- 8 quiz sets (2 per course)
- 64 seeded questions total (8 per set)
- mix of single-answer and multi-select
- walkthrough-enabled questions with step-by-step reasoning
- markdown + math + code block examples

## Quiz Features
- Single-answer and multi-select questions
- Walkthrough steps (on-demand after submit)
- Optional timer
- Randomize question order toggle
- Explanation timing mode (`afterEach` vs `end`)
- Keyboard controls:
  - `A/B/C/D...` pick options
  - `Enter` submit/next
  - `ArrowLeft/ArrowRight` navigation
- Missed-question review mode
- Result analytics with topic breakdown

## Progress & Persistence
Data is stored locally via `lib/storage/local-repository.ts`:
- attempts (`score`, `time`, per-question outcome, topic breakdown)
- user profile (`name`, optional `school`)
- preferences (`theme`, reduced motion, confetti)

Repository contract is defined in:
- `lib/storage/repository.ts`

This makes backend migration straightforward: add a new repository implementing the same interface (e.g., Supabase/Firebase/Prisma) and swap provider wiring.

## Adding a New Course
1. Add course object to `data/seed/courses.ts`.
2. Add two or more quiz sets in `data/seed/quiz-sets.ts` using the `QuizSet` model.
3. Add note/cheat/resource content in `data/seed/notes.ts`.
4. Ensure `courseId` in quiz sets matches the new course `id`.

## Quiz Data Model
`Question` supports:
- `type: "single" | "multi"`
- `prompt` (markdown/math/code)
- `options[]`
- `correct[]`
- `explanation` (markdown)
- `walkthroughSteps[]` (optional)
- `references[]` (optional)
- `tags[]`

## Accessibility + UX
- Focus-visible styles on interactive controls
- Keyboard-friendly quiz interactions
- High-contrast color tokens
- Reduced motion support via system preference and settings
- Skeleton loading and empty-state guidance

## Notes
- Authentication is local-first MVP (profile + preferences) with backend-ready architecture.
- Confetti is subtle and only used for personal-best wins (and can be disabled in settings).
