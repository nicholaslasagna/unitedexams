-- ════════════════════════════════════════════════════════════════════
-- Access Model — Stage 9: Bypass-flag spoofing fix
-- ════════════════════════════════════════════════════════════════════
-- A normal client could (today via SQL injection / future via a
-- yet-to-be-written RPC) set the transaction-local config flag we
-- introduced in Stage 8:
--
--   select set_config('united_exams.bypass_profile_guard', 'on', true);
--
-- The Stage 8 guard, on top of that, was SECURITY DEFINER so its body
-- ran as `postgres` regardless of caller — meaning a `current_user`
-- check inside the trigger always saw `postgres`, not the actual
-- caller. Combined, the bypass was reachable by a regular user.
--
-- Two changes harden the guard:
--
--   1. The trigger function is no longer SECURITY DEFINER. It runs in
--      the caller's role context, so `current_user` reflects the real
--      execution chain.
--
--      - Normal user UPDATE → current_user = 'authenticated' → fail.
--      - Inside recompute_entitlements() (which IS SECURITY DEFINER,
--        owned by `postgres`) → current_user = 'postgres' → pass.
--      - service_role direct write → current_user = 'service_role' →
--        pass IF (and only if) the flag is also set.
--
--   2. Bypass requires BOTH:
--        a. the transaction-local flag = 'on'
--        b. current_user IN ('postgres', 'service_role', 'supabase_admin')
--
--      Either alone is insufficient.
--
-- The audit-log path still works because audit_record_event() is itself
-- SECURITY DEFINER — the called function's privileges are independent
-- of the caller's.
-- ════════════════════════════════════════════════════════════════════

-- ── Hardened guard ────────────────────────────────────────────────

create or replace function public.guard_profile_derived_columns()
returns trigger
language plpgsql
-- INVOKER (default) — current_user reflects the real caller chain.
-- Do NOT add `security definer` here; that would let a regular user
-- with a spoofed flag pass the privileged-role half of the check.
as $$
declare
  bypass_flag    text;
  is_privileged  boolean;
begin
  bypass_flag   := current_setting('united_exams.bypass_profile_guard', true);
  is_privileged := current_user in ('postgres', 'service_role', 'supabase_admin');

  -- BOTH conditions required. Either alone is not enough.
  if bypass_flag = 'on' and is_privileged then
    return new;
  end if;

  if tg_op = 'INSERT' then
    -- On INSERT (signup), do NOT raise — that would break account
    -- creation. Coerce derived columns to safe defaults regardless of
    -- what the client submitted. Coverage flips to true only after
    -- recompute_entitlements() runs server-side.
    new.premium_active            := false;
    new.premium_plan              := null;
    new.premium_renews_at         := null;
    new.institution_covered       := false;
    new.institution_verified      := false;
    new.professor_verified_at     := null;
    new.professor_verification_id := null;
    return new;
  end if;

  -- UPDATE: reject any change to a derived column from a non-privileged
  -- caller, regardless of what flag they set.
  if (new.premium_active            is distinct from old.premium_active)
  or (new.premium_plan              is distinct from old.premium_plan)
  or (new.premium_renews_at         is distinct from old.premium_renews_at)
  or (new.institution_covered       is distinct from old.institution_covered)
  or (new.institution_verified      is distinct from old.institution_verified)
  or (new.professor_verified_at     is distinct from old.professor_verified_at)
  or (new.professor_verification_id is distinct from old.professor_verification_id)
  or (new.professor_verified        is distinct from old.professor_verified)
  then
    -- audit_record_event() is SECURITY DEFINER, so it can write to
    -- audit_log even though this trigger is not. The BEGIN/EXCEPTION
    -- block keeps a missing audit trail from masking the real failure.
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
          'attempted_professor_verified',   new.professor_verified,
          'spoofed_flag',                   bypass_flag = 'on',
          'current_user',                   current_user
        )
      );
    exception when others then
      null;
    end;

    raise exception 'Derived access columns on profiles are read-only for clients.'
      using errcode = '42501';
  end if;

  return new;
end$$;

comment on function public.guard_profile_derived_columns is
  'INVOKER-context trigger that blocks client writes to derived access columns on profiles. Bypass requires BOTH the transaction-local flag and a privileged current_user — either alone is insufficient. Setting only the flag from a normal client cannot defeat this guard.';

-- The trigger registration from Stage 8 still points at the same
-- function name — no need to drop/recreate the trigger. Re-asserting
-- it here keeps the migration idempotent if Stage 8 was skipped.
drop trigger if exists trg_profiles_guard_derived on public.profiles;
create trigger trg_profiles_guard_derived
  before insert or update on public.profiles
  for each row execute function public.guard_profile_derived_columns();

-- ── Sanity: recompute_entitlements is unchanged from Stage 8 ──────
-- (left as-is — it sets the flag AND runs as postgres via SECDEF, so
-- both halves of the check pass when it writes the mirror columns.)
