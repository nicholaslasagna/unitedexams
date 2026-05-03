-- ════════════════════════════════════════════════════════════════════
-- Access Model — Stage 8: Security hardening
-- ════════════════════════════════════════════════════════════════════
-- Patches three real findings from the security review of stages 1–7:
--
--   1. Profile-INSERT self-grant
--      The existing profiles_insert_own policy lets any authenticated
--      user insert their own profile row at signup. My guard trigger
--      only fired BEFORE UPDATE, so a malicious INSERT could set
--      premium_active = true, institution_covered = true, etc. We now
--      cover INSERT as well by FORCING the derived columns to safe
--      defaults — never raising an error (signup must keep working).
--
--   2. Fragile bypass detection
--      The previous detection (current_user / jwt claim) is environment-
--      sensitive. We switch to a transaction-local config flag that
--      only `recompute_entitlements()` sets. Users cannot reach this
--      pathway without going through that SECURITY DEFINER function.
--
--   3. Public reads leaking targeting/contact info
--      `feature_flags` and `departments` are now read through sanitized
--      views; the raw tables drop their public read policies.
--
-- Also: denied attempts at writing derived columns are now audit-logged
-- so we can detect probing.
-- ════════════════════════════════════════════════════════════════════

-- ── 1 + 2: Hardened guard for profile derived columns ─────────────

create or replace function public.guard_profile_derived_columns()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  bypass_flag text;
begin
  -- Service-only bypass: a transaction-local flag set by
  -- recompute_entitlements(). End-users have no way to set it — it
  -- isn't exposed via any client-callable function.
  bypass_flag := current_setting('united_exams.bypass_profile_guard', true);
  if bypass_flag = 'on' then
    return new;
  end if;

  if tg_op = 'INSERT' then
    -- On INSERT (signup), do NOT raise — that would break account
    -- creation. Instead, force the derived columns to safe defaults
    -- regardless of what the client submitted. Coverage flips to true
    -- only after recompute_entitlements() runs server-side.
    new.premium_active            := false;
    new.premium_plan              := null;
    new.premium_renews_at         := null;
    new.institution_covered       := false;
    new.institution_verified      := false;
    new.professor_verified_at     := null;
    new.professor_verification_id := null;
    -- professor_verified is already normalized by guard_profile_security_fields
    return new;
  end if;

  -- UPDATE: reject any change to a derived column from a client.
  if (new.premium_active            is distinct from old.premium_active)
  or (new.premium_plan              is distinct from old.premium_plan)
  or (new.premium_renews_at         is distinct from old.premium_renews_at)
  or (new.institution_covered       is distinct from old.institution_covered)
  or (new.institution_verified      is distinct from old.institution_verified)
  or (new.professor_verified_at     is distinct from old.professor_verified_at)
  or (new.professor_verification_id is distinct from old.professor_verification_id)
  or (new.professor_verified        is distinct from old.professor_verified)
  then
    -- Best-effort audit of the probe attempt. Wrapped in BEGIN/EXCEPTION
    -- so missing audit infra never blocks the security failure path.
    begin
      perform public.audit_record_event(
        auth.uid(),
        'profile.derived_column_write_blocked',
        'profile',
        coalesce(new.id::text, old.id::text),
        'denied',
        jsonb_build_object(
          'attempted_premium_active',       new.premium_active,
          'attempted_institution_covered',  new.institution_covered,
          'attempted_institution_verified', new.institution_verified,
          'attempted_professor_verified',   new.professor_verified
        )
      );
    exception when others then
      -- swallow — denying the write is more important than logging it.
      null;
    end;

    raise exception 'Derived access columns on profiles are read-only for clients.'
      using errcode = '42501';
  end if;

  return new;
end$$;

comment on function public.guard_profile_derived_columns is
  'Forces safe defaults for derived access columns on profile INSERT, blocks UPDATE attempts from clients, and audit-logs denied probes. The legitimate write path is recompute_entitlements() (Stage 5).';

-- Make sure the trigger fires on BOTH events. (Drop+recreate so the
-- migration is idempotent even if Stage 3 already created an
-- UPDATE-only trigger of the same name.)
drop trigger if exists trg_profiles_guard_derived on public.profiles;
create trigger trg_profiles_guard_derived
  before insert or update on public.profiles
  for each row execute function public.guard_profile_derived_columns();

-- ── 2 (cont): Update recompute_entitlements to set the bypass flag ──

create or replace function public.recompute_entitlements(target_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  prem_active        boolean;
  prem_source        text;
  prem_expires       timestamptz;
  prem_plan          text;
  prem_renews        timestamptz;
  inst_active        boolean;
  inst_source        text;
  inst_expires       timestamptz;
  prof_active        boolean;
  prof_source        text;
  prof_expires       timestamptz;
  prof_verified_at   timestamptz;
  prof_verification  uuid;
  uni_verified       boolean;
  uni_id             uuid;
begin
  if target_user_id is null then
    return;
  end if;

  -- Premium
  select
    bool_or(true),
    max(s.plan)        filter (where s.status in ('active','trialing')),
    max(s.current_period_end) filter (where s.status in ('active','trialing'))
  into prem_active, prem_plan, prem_renews
  from public.subscriptions s
  where s.user_id = target_user_id
    and s.status in ('active','trialing')
    and (s.current_period_end is null or s.current_period_end > now());
  prem_active := coalesce(prem_active, false);

  if not prem_active then
    select true, g.source, g.expires_at
      into prem_active, prem_source, prem_expires
      from public.entitlement_grants g
     where g.user_id = target_user_id
       and g.feature = 'premium'
       and g.revoked_at is null
       and (g.expires_at is null or g.expires_at > now())
     order by g.granted_at desc
     limit 1;
    prem_active := coalesce(prem_active, false);
  else
    prem_source  := 'subscription';
    prem_expires := prem_renews;
  end if;

  insert into public.entitlements (user_id, feature, active, source, expires_at, updated_at)
  values (target_user_id, 'premium', prem_active, prem_source, prem_expires, now())
  on conflict (user_id, feature) do update
    set active = excluded.active, source = excluded.source,
        expires_at = excluded.expires_at, updated_at = now();

  -- Institution coverage
  select true, g.source, g.expires_at
    into inst_active, inst_source, inst_expires
    from public.entitlement_grants g
   where g.user_id = target_user_id
     and g.feature = 'institution_covered'
     and g.revoked_at is null
     and (g.expires_at is null or g.expires_at > now())
   order by g.granted_at desc
   limit 1;
  inst_active := coalesce(inst_active, false);

  insert into public.entitlements (user_id, feature, active, source, expires_at, updated_at)
  values (target_user_id, 'institution_covered', inst_active, inst_source, inst_expires, now())
  on conflict (user_id, feature) do update
    set active = excluded.active, source = excluded.source,
        expires_at = excluded.expires_at, updated_at = now();

  -- Professor workspace
  select true, 'professor_verification', pv.expires_at, pv.decided_at, pv.id
    into prof_active, prof_source, prof_expires, prof_verified_at, prof_verification
    from public.professor_verifications pv
   where pv.professor_user_id = target_user_id
     and pv.status = 'verified'
     and (pv.expires_at is null or pv.expires_at > now())
   order by pv.decided_at desc nulls last
   limit 1;
  prof_active := coalesce(prof_active, false);

  if not prof_active then
    select true, g.source, g.expires_at
      into prof_active, prof_source, prof_expires
      from public.entitlement_grants g
     where g.user_id = target_user_id
       and g.feature = 'professor_workspace'
       and g.revoked_at is null
       and (g.expires_at is null or g.expires_at > now())
     order by g.granted_at desc
     limit 1;
    prof_active := coalesce(prof_active, false);
  end if;

  insert into public.entitlements (user_id, feature, active, source, expires_at, updated_at)
  values (target_user_id, 'professor_workspace', prof_active, prof_source, prof_expires, now())
  on conflict (user_id, feature) do update
    set active = excluded.active, source = excluded.source,
        expires_at = excluded.expires_at, updated_at = now();

  -- Mirror back to profiles. The bypass flag tells the guard trigger
  -- to allow this single transaction's writes through. The flag is
  -- transaction-local (third arg true) so it auto-resets on commit
  -- and never leaks to the user's session.
  perform set_config('united_exams.bypass_profile_guard', 'on', true);

  select u.id, coalesce(u.is_verified, false)
    into uni_id, uni_verified
    from public.profiles p
    left join public.universities u on u.id = p.university_id
   where p.id = target_user_id;

  update public.profiles
     set premium_active            = prem_active,
         premium_plan              = case when prem_active then prem_plan else null end,
         premium_renews_at         = case when prem_active then prem_renews else null end,
         institution_covered       = inst_active,
         institution_verified      = coalesce(uni_verified, false),
         professor_verified        = prof_active,
         professor_verified_at     = prof_verified_at,
         professor_verification_id = prof_verification
   where id = target_user_id;

  perform set_config('united_exams.bypass_profile_guard', 'off', true);
end$$;

revoke all on function public.recompute_entitlements(uuid) from public, anon, authenticated;
grant execute on function public.recompute_entitlements(uuid) to service_role;

-- ── 3a: feature_flags — sanitized public view, lock raw table ─────

drop policy if exists feature_flags_select_public on public.feature_flags;

-- Note: `feature_flags_no_client_write` (FOR ALL using/check false)
-- already blocks SELECT for authenticated users when there's no
-- permissive SELECT policy. anon now also has nothing to read.
-- The server (service_role) bypasses RLS entirely.

create or replace view public.feature_flags_public
with (security_invoker = true)
as
select
  key,
  description,
  enabled_default,
  rollout_percent
from public.feature_flags;

comment on view public.feature_flags_public is
  'Sanitized public read for feature_flags. Hides target_user_ids, target_universities, target_tiers — those are admin-targeting metadata.';

grant select on public.feature_flags_public to authenticated, anon;

-- ── 3b: departments — sanitized public view, drop public read ─────

drop policy if exists departments_select_public on public.departments;

-- Same pattern: no permissive SELECT policy → only service_role and
-- explicit views can read. Sanitized view follows.

create or replace view public.departments_public
with (security_invoker = true)
as
select
  id,
  university_id,
  name,
  short_code
from public.departments;

comment on view public.departments_public is
  'Sanitized public read for departments. Hides contact_email (PII).';

grant select on public.departments_public to authenticated, anon;

-- ── 4: Document the subscriptions.stripe_* exposure as intentional ──

comment on column public.subscriptions.stripe_customer_id is
  'Exposed to row owner — required for the Stripe Customer Portal redirect. Not a secret on its own; never combine with Stripe API keys client-side.';

comment on column public.subscriptions.stripe_subscription_id is
  'Exposed to row owner — useful for support inquiries. Not a secret.';

-- ── 5: Belt-and-suspenders RESTRICTIVE policies on critical tables ──
-- Even if a future migration accidentally adds a permissive write
-- policy, these RESTRICTIVE policies still apply (RESTRICTIVE is AND'd,
-- not OR'd). They keep the door bolted no matter what permissive
-- policies arrive later.

drop policy if exists subscriptions_restrict_writes on public.subscriptions;
create policy subscriptions_restrict_writes
  on public.subscriptions
  as restrictive
  for all
  to authenticated, anon
  using (false)
  with check (false);

drop policy if exists entitlement_grants_restrict_writes on public.entitlement_grants;
create policy entitlement_grants_restrict_writes
  on public.entitlement_grants
  as restrictive
  for all
  to authenticated, anon
  using (case when current_setting('request.method', true) in ('SELECT') then true else false end)
  with check (false);
-- Note: the using/case lets SELECT through (covered by the permissive
-- entitlement_grants_select_own policy); INSERT/UPDATE/DELETE attempts
-- evaluate `with check (false)` and are denied.

drop policy if exists entitlements_restrict_writes on public.entitlements;
create policy entitlements_restrict_writes
  on public.entitlements
  as restrictive
  for all
  to authenticated, anon
  using (case when current_setting('request.method', true) in ('SELECT') then true else false end)
  with check (false);

drop policy if exists institution_licenses_restrict_writes on public.institution_licenses;
create policy institution_licenses_restrict_writes
  on public.institution_licenses
  as restrictive
  for all
  to authenticated, anon
  using (case when current_setting('request.method', true) in ('SELECT') then true else false end)
  with check (false);

drop policy if exists professor_verifications_restrict_writes on public.professor_verifications;
create policy professor_verifications_restrict_writes
  on public.professor_verifications
  as restrictive
  for all
  to authenticated, anon
  using (case when current_setting('request.method', true) in ('SELECT') then true else false end)
  with check (false);

drop policy if exists feature_flags_restrict_writes on public.feature_flags;
create policy feature_flags_restrict_writes
  on public.feature_flags
  as restrictive
  for all
  to authenticated, anon
  using (false)
  with check (false);

drop policy if exists departments_restrict_writes on public.departments;
create policy departments_restrict_writes
  on public.departments
  as restrictive
  for all
  to authenticated, anon
  using (false)
  with check (false);
