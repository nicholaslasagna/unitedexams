-- ════════════════════════════════════════════════════════════════════
-- Access Model — Stage 2: Core access tables
-- ════════════════════════════════════════════════════════════════════
-- Adds the underlying tables that drive the access model:
--   - departments              (org layer between school and course)
--   - subscriptions            (Stripe-backed, individual)
--   - institution_licenses     (school covers access)
--   - entitlement_grants       (append-only journal of why coverage exists)
--   - entitlements             (resolved snapshot the frontend reads)
--   - feature_flags            (kill-switch / experiments / targeting)
--   - professor_verifications  (verification event log)
--
-- All tables get RLS enabled here but with NO policies — Stage 3 adds the
-- policies. Until Stage 3 lands, only the service role can touch these
-- (default-deny when RLS is on without policies for the role).
--
-- Universities is an existing table; we add a flag column for "officially
-- partnered school" so institution_verified can be derived.
-- ════════════════════════════════════════════════════════════════════

-- ── Mark schools as officially partnered ───────────────────────────

alter table public.universities
  add column if not exists is_verified boolean not null default false;

comment on column public.universities.is_verified is
  'True when the school is officially partnered with United Exams. Drives profiles.institution_verified.';

-- ── Departments ────────────────────────────────────────────────────

create table if not exists public.departments (
  id              uuid primary key default gen_random_uuid(),
  university_id   uuid not null references public.universities(id) on delete cascade,
  name            text not null,
  short_code      text,
  contact_email   text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (university_id, name)
);

create index if not exists idx_departments_university
  on public.departments(university_id);

drop trigger if exists trg_departments_updated_at on public.departments;
create trigger trg_departments_updated_at
  before update on public.departments
  for each row execute procedure public.set_updated_at();

comment on table public.departments is
  'Optional organizational layer between universities and courses/sections. Used by institution_licenses(scope=department).';

-- Class sections may belong to a department.
alter table public.class_sections
  add column if not exists department_id uuid references public.departments(id) on delete set null;

create index if not exists idx_class_sections_department
  on public.class_sections(department_id);

-- ── Subscriptions (Stripe-backed) ──────────────────────────────────

create table if not exists public.subscriptions (
  id                       uuid primary key default gen_random_uuid(),
  user_id                  uuid not null references public.profiles(id) on delete cascade,
  status                   text not null,
  plan                     text not null,
  stripe_customer_id       text,
  stripe_subscription_id   text,
  current_period_end       timestamptz,
  cancel_at_period_end     boolean not null default false,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now(),
  constraint subscriptions_status_check
    check (status in ('active', 'trialing', 'past_due', 'canceled', 'paused', 'incomplete')),
  constraint subscriptions_plan_check
    check (plan in ('monthly', 'yearly'))
);

create unique index if not exists ux_subscriptions_stripe_subscription_id
  on public.subscriptions(stripe_subscription_id)
  where stripe_subscription_id is not null;

create index if not exists idx_subscriptions_user_status
  on public.subscriptions(user_id, status);

drop trigger if exists trg_subscriptions_updated_at on public.subscriptions;
create trigger trg_subscriptions_updated_at
  before update on public.subscriptions
  for each row execute procedure public.set_updated_at();

comment on table public.subscriptions is
  'Stripe-backed individual subscription rows. Service-role write only — clients can never grant themselves Premium.';

-- ── Institution licenses ───────────────────────────────────────────

create table if not exists public.institution_licenses (
  id                  uuid primary key default gen_random_uuid(),
  university_id       uuid not null references public.universities(id) on delete cascade,
  department_id       uuid references public.departments(id) on delete set null,
  scope               text not null,
  scoped_section_ids  uuid[],
  email_domains       text[] not null default '{}',
  starts_at           timestamptz not null default now(),
  ends_at             timestamptz,
  seat_limit          int,
  seats_used          int not null default 0,
  contact_email       text,
  notes               text,
  active              boolean not null default true,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  constraint institution_licenses_scope_check
    check (scope in ('university', 'department', 'section')),
  constraint institution_licenses_seats_check
    check (seat_limit is null or seats_used <= seat_limit)
);

create index if not exists idx_institution_licenses_university_active
  on public.institution_licenses(university_id, active);

create index if not exists idx_institution_licenses_department_active
  on public.institution_licenses(department_id, active);

drop trigger if exists trg_institution_licenses_updated_at on public.institution_licenses;
create trigger trg_institution_licenses_updated_at
  before update on public.institution_licenses
  for each row execute procedure public.set_updated_at();

comment on table public.institution_licenses is
  'Coverage agreements between United Exams and a school/department/section. Service-role write only.';

-- ── Entitlement grants (append-only journal) ───────────────────────

create table if not exists public.entitlement_grants (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.profiles(id) on delete cascade,
  source          text not null,
  source_id       uuid,
  feature         text not null,
  granted_at      timestamptz not null default now(),
  expires_at      timestamptz,
  revoked_at      timestamptz,
  metadata        jsonb not null default '{}'::jsonb,
  created_at      timestamptz not null default now(),
  constraint entitlement_grants_source_check
    check (source in ('subscription', 'institution_license', 'grant', 'trial', 'manual_admin')),
  constraint entitlement_grants_feature_check
    check (feature in ('premium', 'institution_covered', 'professor_workspace'))
);

create index if not exists idx_entitlement_grants_user_feature_active
  on public.entitlement_grants(user_id, feature)
  where revoked_at is null;

comment on table public.entitlement_grants is
  'Append-only audit trail of every reason a user has (or had) coverage. Recompute reads this; never client-writable.';

-- ── Resolved entitlements (read-side cache) ────────────────────────

create table if not exists public.entitlements (
  user_id     uuid not null references public.profiles(id) on delete cascade,
  feature     text not null,
  active      boolean not null,
  source      text,
  expires_at  timestamptz,
  updated_at  timestamptz not null default now(),
  primary key (user_id, feature),
  constraint entitlements_feature_check
    check (feature in ('premium', 'institution_covered', 'professor_workspace'))
);

create index if not exists idx_entitlements_user_active
  on public.entitlements(user_id)
  where active = true;

comment on table public.entitlements is
  'Resolved per-user snapshot — one row per (user, feature). Recomputed by triggers in Stage 6. Frontend reads this through the current_user_access view (Stage 4).';

-- ── Feature flags ──────────────────────────────────────────────────

create table if not exists public.feature_flags (
  key                 text primary key,
  description         text,
  enabled_default     boolean not null default false,
  rollout_percent     int not null default 0,
  target_tiers        text[] not null default '{}',
  target_universities uuid[] not null default '{}',
  target_user_ids     uuid[] not null default '{}',
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  constraint feature_flags_rollout_check
    check (rollout_percent between 0 and 100)
);

drop trigger if exists trg_feature_flags_updated_at on public.feature_flags;
create trigger trg_feature_flags_updated_at
  before update on public.feature_flags
  for each row execute procedure public.set_updated_at();

comment on table public.feature_flags is
  'Server-evaluated feature flags. Clients can read the safe public columns; only service-role can write.';

-- ── Professor verifications ────────────────────────────────────────

create table if not exists public.professor_verifications (
  id                  uuid primary key default gen_random_uuid(),
  professor_user_id   uuid not null references public.profiles(id) on delete cascade,
  university_id       uuid not null references public.universities(id) on delete cascade,
  department_id       uuid references public.departments(id) on delete set null,
  status              text not null default 'pending',
  verified_by_user_id uuid references public.profiles(id) on delete set null,
  verification_method text not null,
  evidence            jsonb not null default '{}'::jsonb,
  created_at          timestamptz not null default now(),
  decided_at          timestamptz,
  expires_at          timestamptz,
  constraint professor_verifications_status_check
    check (status in ('pending', 'verified', 'rejected', 'expired')),
  constraint professor_verifications_method_check
    check (verification_method in ('code', 'email_domain', 'manual_admin', 'sso'))
);

create index if not exists idx_professor_verifications_user
  on public.professor_verifications(professor_user_id, status);

create index if not exists idx_professor_verifications_university
  on public.professor_verifications(university_id, status);

comment on table public.professor_verifications is
  'Per-professor verification events. The most recent verified row drives profiles.professor_verified.';

-- ── Soft FK on profiles.professor_verification_id ──────────────────

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'profiles_professor_verification_id_fkey'
      and conrelid = 'public.profiles'::regclass
  ) then
    alter table public.profiles
      add constraint profiles_professor_verification_id_fkey
      foreign key (professor_verification_id)
      references public.professor_verifications(id) on delete set null;
  end if;
end$$;

-- ── Enable RLS on every new table — policies arrive in Stage 3 ─────

alter table public.departments              enable row level security;
alter table public.subscriptions            enable row level security;
alter table public.institution_licenses     enable row level security;
alter table public.entitlement_grants       enable row level security;
alter table public.entitlements             enable row level security;
alter table public.feature_flags            enable row level security;
alter table public.professor_verifications  enable row level security;
