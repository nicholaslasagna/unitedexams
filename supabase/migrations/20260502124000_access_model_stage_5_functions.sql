-- ════════════════════════════════════════════════════════════════════
-- Access Model — Stage 5: Functions
-- ════════════════════════════════════════════════════════════════════
-- Server-side helpers that the access model relies on:
--   - public.recompute_entitlements(target_user_id)
--       Resolves grants → entitlements → mirrors onto profiles.
--       Idempotent. Safe to call from triggers and admin RPCs.
--
--   - public.user_has_entitlement(uid, feature)
--       Cheap inline check usable in RLS, RPCs, or app code.
--
--   - public.feature_flag_enabled(key, uid)
--       Server-evaluated flag check.
--
-- All are SECURITY DEFINER + locked search_path. Execute is granted to
-- authenticated where it makes sense (read-only helpers); recompute is
-- service-role only (callable by triggers via SECURITY DEFINER).
-- ════════════════════════════════════════════════════════════════════

-- ── Resolve a single user's entitlements from grants ───────────────

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

  -- ── Premium ───────────────────────────────────────────────────
  -- Active when (a) any grant says so, OR (b) a subscription row says so.
  -- We take the strictest definition: status in active/trialing AND
  -- (current_period_end is null or > now()).
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

  -- Or fall back to a manual/trial grant.
  if not prem_active then
    select true,
           g.source,
           g.expires_at
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
    prem_source := 'subscription';
    prem_expires := prem_renews;
  end if;

  insert into public.entitlements (user_id, feature, active, source, expires_at, updated_at)
  values (target_user_id, 'premium', prem_active, prem_source, prem_expires, now())
  on conflict (user_id, feature) do update
    set active = excluded.active,
        source = excluded.source,
        expires_at = excluded.expires_at,
        updated_at = now();

  -- ── Institution coverage ──────────────────────────────────────
  select true,
         g.source,
         g.expires_at
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
    set active = excluded.active,
        source = excluded.source,
        expires_at = excluded.expires_at,
        updated_at = now();

  -- ── Professor workspace ───────────────────────────────────────
  -- Active when there is a verified, non-expired professor_verifications row.
  select true,
         'professor_verification' as src,
         pv.expires_at,
         pv.decided_at,
         pv.id
    into prof_active, prof_source, prof_expires, prof_verified_at, prof_verification
    from public.professor_verifications pv
   where pv.professor_user_id = target_user_id
     and pv.status = 'verified'
     and (pv.expires_at is null or pv.expires_at > now())
   order by pv.decided_at desc nulls last
   limit 1;
  prof_active := coalesce(prof_active, false);

  -- A manual_admin grant can also unlock the professor workspace.
  if not prof_active then
    select true,
           g.source,
           g.expires_at
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
    set active = excluded.active,
        source = excluded.source,
        expires_at = excluded.expires_at,
        updated_at = now();

  -- ── Mirror to profiles (legacy/UI compatibility) ──────────────
  -- Resolve institution_verified from the user's university record.
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
end$$;

comment on function public.recompute_entitlements(uuid) is
  'Resolves a user''s entitlement state from grants/subscriptions/verifications and mirrors the result onto profiles. Idempotent.';

revoke all on function public.recompute_entitlements(uuid) from public, anon, authenticated;
grant execute on function public.recompute_entitlements(uuid) to service_role;

-- ── Cheap inline check ────────────────────────────────────────────

create or replace function public.user_has_entitlement(uid uuid, feature text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select active from public.entitlements e
      where e.user_id = uid and e.feature = feature),
    false
  );
$$;

comment on function public.user_has_entitlement(uuid, text) is
  'Returns true when the user has an active entitlement for the given feature. Safe to call from RLS, RPCs, or app code.';

grant execute on function public.user_has_entitlement(uuid, text) to authenticated, service_role;

-- ── Feature flag evaluation ───────────────────────────────────────

create or replace function public.feature_flag_enabled(flag_key text, uid uuid default auth.uid())
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  ff public.feature_flags%rowtype;
  uni uuid;
begin
  select * into ff from public.feature_flags where key = flag_key;
  if not found then
    return false;
  end if;

  if uid is not null and uid = any(ff.target_user_ids) then
    return true;
  end if;

  if uid is not null then
    select university_id into uni from public.profiles where id = uid;
    if uni is not null and uni = any(ff.target_universities) then
      return true;
    end if;
  end if;

  -- (rollout_percent / target_tiers can be added later — kept simple here.)
  return ff.enabled_default;
end$$;

comment on function public.feature_flag_enabled(text, uuid) is
  'Server-side flag evaluation. Returns false when the flag does not exist.';

grant execute on function public.feature_flag_enabled(text, uuid) to authenticated, anon, service_role;

-- ── Service-role-only grant/revoke helpers ────────────────────────

create or replace function public.grant_entitlement(
  target_user_id uuid,
  feature_input  text,
  source_input   text default 'manual_admin',
  source_id_input uuid default null,
  expires_at_input timestamptz default null,
  metadata_input jsonb default '{}'::jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_id uuid;
begin
  insert into public.entitlement_grants (user_id, source, source_id, feature, granted_at, expires_at, metadata)
  values (target_user_id, source_input, source_id_input, feature_input, now(), expires_at_input, metadata_input)
  returning id into new_id;

  perform public.recompute_entitlements(target_user_id);
  return new_id;
end$$;

revoke all on function public.grant_entitlement(uuid, text, text, uuid, timestamptz, jsonb) from public, anon, authenticated;
grant execute on function public.grant_entitlement(uuid, text, text, uuid, timestamptz, jsonb) to service_role;

create or replace function public.revoke_entitlement_grant(grant_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  affected_user uuid;
begin
  update public.entitlement_grants
     set revoked_at = now()
   where id = grant_id and revoked_at is null
  returning user_id into affected_user;

  if affected_user is not null then
    perform public.recompute_entitlements(affected_user);
  end if;
end$$;

revoke all on function public.revoke_entitlement_grant(uuid) from public, anon, authenticated;
grant execute on function public.revoke_entitlement_grant(uuid) to service_role;
