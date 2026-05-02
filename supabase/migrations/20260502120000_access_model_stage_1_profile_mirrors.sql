-- ════════════════════════════════════════════════════════════════════
-- Access Model — Stage 1: Profile mirror columns
-- ════════════════════════════════════════════════════════════════════
-- Adds derived "mirror" columns to public.profiles so existing UI code
-- (and `lib/access.ts` on the frontend) can read coverage state from a
-- single profile fetch without joining tables on every request.
--
-- These columns are READ-MODEL ONLY:
--   - they are populated by triggers / scheduled jobs
--   - clients have no UPDATE permission on them (enforced in Stage 3)
--   - the source of truth lives in `entitlements` (Stage 2)
--
-- Defaults (`false`, `null`) are deliberately safe — if Stages 2-6 are
-- not yet applied, the frontend treats every authenticated user as a
-- free student.
-- ════════════════════════════════════════════════════════════════════

alter table public.profiles
  add column if not exists premium_active        boolean not null default false,
  add column if not exists premium_plan          text,
  add column if not exists premium_renews_at     timestamptz,
  add column if not exists institution_covered   boolean not null default false,
  add column if not exists institution_verified  boolean not null default false,
  add column if not exists professor_verified_at timestamptz,
  add column if not exists professor_verification_id uuid;

-- premium_plan is constrained to the known plan codes when present.
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'profiles_premium_plan_check'
      and conrelid = 'public.profiles'::regclass
  ) then
    alter table public.profiles
      add constraint profiles_premium_plan_check
      check (premium_plan is null or premium_plan in ('monthly', 'yearly'));
  end if;
end$$;

-- Light index used by background jobs that scan active premium users.
create index if not exists idx_profiles_premium_active
  on public.profiles(premium_active)
  where premium_active = true;

create index if not exists idx_profiles_institution_covered
  on public.profiles(institution_covered)
  where institution_covered = true;

-- ── Column-level comments documenting the read-model contract ──────

comment on column public.profiles.premium_active is
  'DERIVED. True when the user has an active or trialing subscription whose period has not expired. Set by triggers in Stage 6 — never write from a client.';

comment on column public.profiles.premium_plan is
  'DERIVED. ''monthly'' | ''yearly'' | null. Mirrors the most recent active subscription plan.';

comment on column public.profiles.premium_renews_at is
  'DERIVED. current_period_end of the active subscription, or null when not subscribed.';

comment on column public.profiles.institution_covered is
  'DERIVED. True when an active institution_license grants this user coverage. When true, the frontend hides every premium upgrade prompt.';

comment on column public.profiles.institution_verified is
  'DERIVED. True when the user belongs to a school United Exams has formally partnered with (universities.is_verified). Used for the "verified through your institution" badge.';

comment on column public.profiles.professor_verified_at is
  'DERIVED. Timestamp of the verification decision when professor_verified flipped to true.';

comment on column public.profiles.professor_verification_id is
  'DERIVED. Pointer to the professor_verifications row that produced the current verified state. Soft FK — set in Stage 2.';
