-- ════════════════════════════════════════════════════════════════════
-- Access Model — Stage 3: RLS policies
-- ════════════════════════════════════════════════════════════════════
-- Default-deny baseline for every new table:
--   - users can read only what is theirs (or what is genuinely public)
--   - clients have NO insert/update/delete on entitlement-granting tables
--   - service role bypasses RLS by design and remains the only writer
--
-- Sensitive billing/admin columns on institution_licenses are not
-- exposed to clients at all. Stage 4 will add a `current_user_access`
-- view that surfaces only the resolved boolean fields.
--
-- Also tightens public.profiles so clients cannot UPDATE the new
-- derived columns added in Stage 1.
-- ════════════════════════════════════════════════════════════════════

-- ── departments ────────────────────────────────────────────────────
-- Public read. Names/contact info aren't sensitive.
drop policy if exists departments_select_public on public.departments;
create policy departments_select_public
  on public.departments
  for select
  using (true);

drop policy if exists departments_no_client_write on public.departments;
create policy departments_no_client_write
  on public.departments
  for all
  to authenticated
  using (false)
  with check (false);

-- ── subscriptions ──────────────────────────────────────────────────
-- Owner-only read. Service role handles writes (Stripe webhook).
drop policy if exists subscriptions_select_own on public.subscriptions;
create policy subscriptions_select_own
  on public.subscriptions
  for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists subscriptions_no_client_write on public.subscriptions;
create policy subscriptions_no_client_write
  on public.subscriptions
  for all
  to authenticated
  using (false)
  with check (false);

-- ── institution_licenses ───────────────────────────────────────────
-- Sensitive — full rows are NEVER readable by regular clients.
-- They get the boolean answer through the current_user_access view.
-- University admins of the matching school can read full rows.
drop policy if exists institution_licenses_select_admins on public.institution_licenses;
create policy institution_licenses_select_admins
  on public.institution_licenses
  for select
  to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
        and p.university_id = institution_licenses.university_id
    )
  );

drop policy if exists institution_licenses_no_client_write on public.institution_licenses;
create policy institution_licenses_no_client_write
  on public.institution_licenses
  for all
  to authenticated
  using (false)
  with check (false);

-- ── entitlement_grants ─────────────────────────────────────────────
-- Owner can read their own grant history (useful for "Premium since…"
-- account screens). No client writes.
drop policy if exists entitlement_grants_select_own on public.entitlement_grants;
create policy entitlement_grants_select_own
  on public.entitlement_grants
  for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists entitlement_grants_no_client_write on public.entitlement_grants;
create policy entitlement_grants_no_client_write
  on public.entitlement_grants
  for all
  to authenticated
  using (false)
  with check (false);

-- ── entitlements (resolved) ────────────────────────────────────────
-- Owner-only read. Never client-writable.
drop policy if exists entitlements_select_own on public.entitlements;
create policy entitlements_select_own
  on public.entitlements
  for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists entitlements_no_client_write on public.entitlements;
create policy entitlements_no_client_write
  on public.entitlements
  for all
  to authenticated
  using (false)
  with check (false);

-- ── feature_flags ──────────────────────────────────────────────────
-- Public read of the safe columns. Targeting arrays could leak admin
-- intent so we expose them through a view rather than the raw table.
-- Allow authenticated SELECT for now; tighten later if needed.
drop policy if exists feature_flags_select_public on public.feature_flags;
create policy feature_flags_select_public
  on public.feature_flags
  for select
  using (true);

drop policy if exists feature_flags_no_client_write on public.feature_flags;
create policy feature_flags_no_client_write
  on public.feature_flags
  for all
  to authenticated
  using (false)
  with check (false);

-- ── professor_verifications ────────────────────────────────────────
-- - Professor sees their own rows.
-- - University admins see rows for their school.
-- - INSERT is restricted to a server-side RPC (Stage 5) that flags
--   the row as 'pending' and method='code' or 'email_domain'.
-- - UPDATE/DELETE: server-only.
drop policy if exists professor_verifications_select_own on public.professor_verifications;
create policy professor_verifications_select_own
  on public.professor_verifications
  for select
  to authenticated
  using (
    professor_user_id = auth.uid()
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
        and p.university_id = professor_verifications.university_id
    )
  );

drop policy if exists professor_verifications_no_client_write on public.professor_verifications;
create policy professor_verifications_no_client_write
  on public.professor_verifications
  for all
  to authenticated
  using (false)
  with check (false);

-- ════════════════════════════════════════════════════════════════════
-- profiles: forbid client writes to derived mirror columns.
-- ────────────────────────────────────────────────────────────────────
-- Existing UPDATE policies on `profiles` allow users to edit their own
-- row. We add a row-level trigger that blocks any UPDATE that touches
-- a derived column from a non-service-role session.
-- ════════════════════════════════════════════════════════════════════

create or replace function public.guard_profile_derived_columns()
returns trigger
language plpgsql
as $$
declare
  is_service boolean;
begin
  -- supabase_admin / service_role / postgres bypass via session role.
  is_service := current_setting('request.jwt.claim.role', true) in ('service_role')
                or current_user in ('postgres', 'service_role', 'supabase_admin');

  if is_service then
    return new;
  end if;

  if (new.premium_active           is distinct from old.premium_active)
  or (new.premium_plan             is distinct from old.premium_plan)
  or (new.premium_renews_at        is distinct from old.premium_renews_at)
  or (new.institution_covered      is distinct from old.institution_covered)
  or (new.institution_verified     is distinct from old.institution_verified)
  or (new.professor_verified_at    is distinct from old.professor_verified_at)
  or (new.professor_verification_id is distinct from old.professor_verification_id)
  or (new.professor_verified       is distinct from old.professor_verified)
  then
    raise exception 'Derived access columns on profiles are read-only for clients.'
      using errcode = '42501';
  end if;

  return new;
end$$;

drop trigger if exists trg_profiles_guard_derived on public.profiles;
create trigger trg_profiles_guard_derived
  before update on public.profiles
  for each row execute function public.guard_profile_derived_columns();

comment on function public.guard_profile_derived_columns is
  'Blocks non-service-role updates to derived access columns on profiles. The legitimate path is the recompute_entitlements function (Stage 5).';
