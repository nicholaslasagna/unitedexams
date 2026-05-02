-- ════════════════════════════════════════════════════════════════════
-- Access Model — Stage 7: Audit logging
-- ════════════════════════════════════════════════════════════════════
-- Captures access-related state changes into the existing public.audit_log
-- table. The actor for trigger-driven writes is recorded as the row's
-- user_id when known (e.g. subscription change → that subscriber). This
-- gives us a complete "why does X have this entitlement?" trail without
-- adding any new tables.
--
-- Notes:
--   - These triggers run as SECURITY DEFINER so they bypass RLS on
--     audit_log (which is locked down to "no client access").
--   - We never log secret content from `evidence` blobs — only the
--     decision metadata.
-- ════════════════════════════════════════════════════════════════════

create or replace function public.audit_record_event(
  actor_user_id_input uuid,
  action_input        text,
  target_type_input   text,
  target_id_input     text,
  outcome_input       text default 'success',
  metadata_input      jsonb default '{}'::jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.audit_log (
    actor_user_id, action, target_type, target_id, outcome, metadata
  ) values (
    actor_user_id_input,
    left(trim(coalesce(action_input, 'unknown')), 120),
    left(trim(coalesce(target_type_input, 'unknown')), 120),
    nullif(left(trim(coalesce(target_id_input, '')), 200), ''),
    case
      when lower(trim(coalesce(outcome_input, 'success'))) in ('success','denied','error')
        then lower(trim(coalesce(outcome_input, 'success')))
      else 'error'
    end,
    coalesce(metadata_input, '{}'::jsonb)
  );
end$$;

revoke all on function public.audit_record_event(uuid, text, text, text, text, jsonb) from public, anon, authenticated;
grant execute on function public.audit_record_event(uuid, text, text, text, text, jsonb) to service_role;

-- ── subscriptions audit ───────────────────────────────────────────

create or replace function public.tg_audit_subscription_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  meta jsonb;
  uid  uuid;
  act  text;
begin
  if tg_op = 'INSERT' then
    uid := new.user_id;
    act := 'subscription.created';
    meta := jsonb_build_object('plan', new.plan, 'status', new.status, 'period_end', new.current_period_end);
  elsif tg_op = 'UPDATE' then
    uid := new.user_id;
    act := 'subscription.updated';
    meta := jsonb_build_object(
      'plan', new.plan, 'status', new.status,
      'old_status', old.status, 'period_end', new.current_period_end,
      'cancel_at_period_end', new.cancel_at_period_end
    );
  else
    uid := old.user_id;
    act := 'subscription.deleted';
    meta := jsonb_build_object('plan', old.plan, 'last_status', old.status);
  end if;

  perform public.audit_record_event(uid, act, 'subscription', coalesce(new.id::text, old.id::text), 'success', meta);
  return null;
end$$;

drop trigger if exists trg_audit_subscriptions on public.subscriptions;
create trigger trg_audit_subscriptions
  after insert or update or delete on public.subscriptions
  for each row execute function public.tg_audit_subscription_change();

-- ── institution_licenses audit ────────────────────────────────────

create or replace function public.tg_audit_institution_license_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  meta jsonb;
  act  text;
begin
  if tg_op = 'INSERT' then
    act := 'license.created';
    meta := jsonb_build_object(
      'university_id', new.university_id, 'department_id', new.department_id,
      'scope', new.scope, 'starts_at', new.starts_at, 'ends_at', new.ends_at,
      'seat_limit', new.seat_limit
    );
  elsif tg_op = 'UPDATE' then
    if old.active = true and new.active = false then
      act := 'license.revoked';
    else
      act := 'license.updated';
    end if;
    meta := jsonb_build_object(
      'old_active', old.active, 'new_active', new.active,
      'scope', new.scope, 'ends_at', new.ends_at
    );
  else
    act := 'license.deleted';
    meta := jsonb_build_object('scope', old.scope, 'university_id', old.university_id);
  end if;

  -- No specific actor for system-driven license events; admin RPCs
  -- should call write_audit_log() with the real actor too.
  perform public.audit_record_event(null, act, 'institution_license', coalesce(new.id::text, old.id::text), 'success', meta);
  return null;
end$$;

drop trigger if exists trg_audit_institution_licenses on public.institution_licenses;
create trigger trg_audit_institution_licenses
  after insert or update or delete on public.institution_licenses
  for each row execute function public.tg_audit_institution_license_change();

-- ── entitlement_grants audit ──────────────────────────────────────

create or replace function public.tg_audit_entitlement_grant_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  meta jsonb;
  act  text;
  uid  uuid;
begin
  if tg_op = 'INSERT' then
    uid := new.user_id;
    act := 'entitlement.granted';
    meta := jsonb_build_object('feature', new.feature, 'source', new.source, 'expires_at', new.expires_at);
  elsif tg_op = 'UPDATE' then
    uid := new.user_id;
    act := case when old.revoked_at is null and new.revoked_at is not null
                then 'entitlement.revoked'
                else 'entitlement.grant_updated' end;
    meta := jsonb_build_object('feature', new.feature, 'source', new.source, 'revoked_at', new.revoked_at);
  else
    uid := old.user_id;
    act := 'entitlement.grant_deleted';
    meta := jsonb_build_object('feature', old.feature, 'source', old.source);
  end if;

  perform public.audit_record_event(uid, act, 'entitlement_grant', coalesce(new.id::text, old.id::text), 'success', meta);
  return null;
end$$;

drop trigger if exists trg_audit_entitlement_grants on public.entitlement_grants;
create trigger trg_audit_entitlement_grants
  after insert or update or delete on public.entitlement_grants
  for each row execute function public.tg_audit_entitlement_grant_change();

-- ── professor_verifications audit ─────────────────────────────────

create or replace function public.tg_audit_professor_verification_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  meta jsonb;
  act  text;
  uid  uuid;
begin
  if tg_op = 'INSERT' then
    uid := new.professor_user_id;
    act := 'professor.verification_started';
    meta := jsonb_build_object('university_id', new.university_id, 'method', new.verification_method, 'status', new.status);
  elsif tg_op = 'UPDATE' then
    uid := new.professor_user_id;
    act := case
      when old.status <> new.status and new.status = 'verified'  then 'professor.verified'
      when old.status <> new.status and new.status = 'rejected'  then 'professor.rejected'
      when old.status <> new.status and new.status = 'expired'   then 'professor.verification_expired'
      else 'professor.verification_updated'
    end;
    meta := jsonb_build_object(
      'old_status', old.status, 'new_status', new.status,
      'verified_by', new.verified_by_user_id
    );
  else
    uid := old.professor_user_id;
    act := 'professor.verification_deleted';
    meta := jsonb_build_object('last_status', old.status);
  end if;

  perform public.audit_record_event(uid, act, 'professor_verification', coalesce(new.id::text, old.id::text), 'success', meta);
  return null;
end$$;

drop trigger if exists trg_audit_professor_verifications on public.professor_verifications;
create trigger trg_audit_professor_verifications
  after insert or update or delete on public.professor_verifications
  for each row execute function public.tg_audit_professor_verification_change();

-- ── feature_flags audit ───────────────────────────────────────────

create or replace function public.tg_audit_feature_flag_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  meta jsonb;
  act  text;
begin
  if tg_op = 'INSERT' then
    act := 'feature_flag.created';
    meta := jsonb_build_object('key', new.key, 'enabled_default', new.enabled_default, 'rollout_percent', new.rollout_percent);
  elsif tg_op = 'UPDATE' then
    act := 'feature_flag.updated';
    meta := jsonb_build_object(
      'key', new.key,
      'old_enabled_default', old.enabled_default, 'new_enabled_default', new.enabled_default,
      'old_rollout_percent', old.rollout_percent, 'new_rollout_percent', new.rollout_percent
    );
  else
    act := 'feature_flag.deleted';
    meta := jsonb_build_object('key', old.key);
  end if;

  perform public.audit_record_event(null, act, 'feature_flag', coalesce(new.key, old.key), 'success', meta);
  return null;
end$$;

drop trigger if exists trg_audit_feature_flags on public.feature_flags;
create trigger trg_audit_feature_flags
  after insert or update or delete on public.feature_flags
  for each row execute function public.tg_audit_feature_flag_change();
