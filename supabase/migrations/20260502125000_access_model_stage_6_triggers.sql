-- ════════════════════════════════════════════════════════════════════
-- Access Model — Stage 6: Triggers
-- ════════════════════════════════════════════════════════════════════
-- Recompute the affected user's resolved entitlements automatically when
-- the underlying data changes:
--   - subscriptions          → that user
--   - entitlement_grants     → that user
--   - professor_verifications → that user
--   - section_members        → that user (in case institution flow
--                              depends on section membership later)
--   - institution_licenses   → bulk; large recompute. We mark this as a
--                              backfill candidate (see comment).
--
-- Each AFTER trigger calls recompute_entitlements(user_id). The function
-- is idempotent and safe to call repeatedly.
-- ════════════════════════════════════════════════════════════════════

-- ── subscriptions ─────────────────────────────────────────────────

create or replace function public.tg_subscription_changed()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (tg_op = 'DELETE') then
    perform public.recompute_entitlements(old.user_id);
  else
    perform public.recompute_entitlements(new.user_id);
  end if;
  return null;
end$$;

drop trigger if exists trg_subscriptions_recompute on public.subscriptions;
create trigger trg_subscriptions_recompute
  after insert or update or delete on public.subscriptions
  for each row execute function public.tg_subscription_changed();

-- ── entitlement_grants ────────────────────────────────────────────

create or replace function public.tg_entitlement_grant_changed()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (tg_op = 'DELETE') then
    perform public.recompute_entitlements(old.user_id);
  else
    perform public.recompute_entitlements(new.user_id);
  end if;
  return null;
end$$;

drop trigger if exists trg_entitlement_grants_recompute on public.entitlement_grants;
create trigger trg_entitlement_grants_recompute
  after insert or update or delete on public.entitlement_grants
  for each row execute function public.tg_entitlement_grant_changed();

-- ── professor_verifications ───────────────────────────────────────

create or replace function public.tg_professor_verification_changed()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (tg_op = 'DELETE') then
    perform public.recompute_entitlements(old.professor_user_id);
  else
    perform public.recompute_entitlements(new.professor_user_id);
  end if;
  return null;
end$$;

drop trigger if exists trg_professor_verifications_recompute on public.professor_verifications;
create trigger trg_professor_verifications_recompute
  after insert or update or delete on public.professor_verifications
  for each row execute function public.tg_professor_verification_changed();

-- ── section_members ───────────────────────────────────────────────
-- Joining/leaving a section is the canonical "I'm in an institution
-- flow" signal even before institution_licenses exist. Cheap recompute.

create or replace function public.tg_section_member_changed()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (tg_op = 'DELETE') then
    perform public.recompute_entitlements(old.user_id);
  else
    perform public.recompute_entitlements(new.user_id);
  end if;
  return null;
end$$;

drop trigger if exists trg_section_members_recompute on public.section_members;
create trigger trg_section_members_recompute
  after insert or update or delete on public.section_members
  for each row execute function public.tg_section_member_changed();

-- ── institution_licenses ──────────────────────────────────────────
-- A license change can affect thousands of users (every email-domain
-- match). We deliberately do NOT recompute everyone synchronously here
-- — that would block license edits indefinitely. The recommended path
-- is a scheduled job that:
--   1. enumerates profiles whose email domain matches the license's
--      email_domains[], OR who are in the license's department/sections
--   2. inserts/updates entitlement_grants for them with source='institution_license'
--   3. revokes grants for users no longer covered
-- The grant trigger above then takes care of the per-user recompute.
--
-- For completeness we still capture the change in audit_log (Stage 7).

comment on table public.institution_licenses is
  'Coverage agreements between United Exams and a school/department/section. Service-role write only. License changes do NOT synchronously recompute matching users — run the institution_license backfill job after creating or revoking a license.';
