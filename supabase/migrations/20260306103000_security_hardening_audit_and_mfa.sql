create table if not exists public.audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid null references public.profiles(id) on delete set null,
  action text not null,
  target_type text not null,
  target_id text null,
  outcome text not null default 'success',
  ip_hash text null,
  request_path text null,
  request_method text null,
  request_id text null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint audit_log_outcome_check check (outcome in ('success', 'denied', 'error'))
);

create index if not exists idx_audit_log_actor_created_at
  on public.audit_log(actor_user_id, created_at desc);

create index if not exists idx_audit_log_action_created_at
  on public.audit_log(action, created_at desc);

alter table public.audit_log enable row level security;

drop policy if exists audit_log_select_none on public.audit_log;
drop policy if exists audit_log_insert_none on public.audit_log;
drop policy if exists audit_log_update_none on public.audit_log;
drop policy if exists audit_log_delete_none on public.audit_log;

create policy audit_log_select_none
  on public.audit_log
  for select
  to authenticated
  using (false);

create policy audit_log_insert_none
  on public.audit_log
  for insert
  to authenticated
  with check (false);

create policy audit_log_update_none
  on public.audit_log
  for update
  to authenticated
  using (false)
  with check (false);

create policy audit_log_delete_none
  on public.audit_log
  for delete
  to authenticated
  using (false);

drop function if exists public.write_audit_log(
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  jsonb
);
create function public.write_audit_log(
  action_input text,
  target_type_input text,
  target_id_input text default null,
  outcome_input text default 'success',
  ip_hash_input text default null,
  request_path_input text default null,
  request_method_input text default null,
  request_id_input text default null,
  metadata_input jsonb default '{}'::jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  insert into public.audit_log (
    actor_user_id,
    action,
    target_type,
    target_id,
    outcome,
    ip_hash,
    request_path,
    request_method,
    request_id,
    metadata
  )
  values (
    auth.uid(),
    left(trim(coalesce(action_input, 'unknown')), 120),
    left(trim(coalesce(target_type_input, 'unknown')), 120),
    nullif(left(trim(coalesce(target_id_input, '')), 200), ''),
    case
      when lower(trim(coalesce(outcome_input, 'success'))) in ('success', 'denied', 'error')
        then lower(trim(coalesce(outcome_input, 'success')))
      else 'error'
    end,
    nullif(left(trim(coalesce(ip_hash_input, '')), 128), ''),
    nullif(left(trim(coalesce(request_path_input, '')), 400), ''),
    nullif(left(trim(coalesce(request_method_input, '')), 16), ''),
    nullif(left(trim(coalesce(request_id_input, '')), 200), ''),
    coalesce(metadata_input, '{}'::jsonb)
  );
end;
$$;

grant execute on function public.write_audit_log(
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  jsonb
) to authenticated;

drop function if exists public.sync_my_mfa_status(boolean);
create function public.sync_my_mfa_status(enabled_input boolean)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  perform set_config('ue.profile_system_write', '1', true);

  update public.profiles
  set mfa_enabled = coalesce(enabled_input, false),
      updated_at = now()
  where id = auth.uid();
end;
$$;

grant execute on function public.sync_my_mfa_status(boolean) to authenticated;

create or replace function public.guard_profile_security_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    if new.role = 'admin' then
      new.role := 'student';
    end if;

    if new.role = 'professor' and not coalesce(new.professor_verified, false) then
      new.role := 'student';
      new.professor_verified := false;
      new.professor_verified_at := null;
    end if;
    return new;
  end if;

  if auth.uid() = old.id then
    if old.role in ('professor', 'admin') and new.university_id is distinct from old.university_id then
      raise exception 'University changes for staff accounts require administrator approval';
    end if;
    if new.role is distinct from old.role then
      raise exception 'Role changes are restricted';
    end if;
    if new.professor_verified is distinct from old.professor_verified then
      raise exception 'Professor verification is managed by your university administrator';
    end if;
    if new.professor_verified_at is distinct from old.professor_verified_at then
      raise exception 'Professor verification timestamps are managed by your university administrator';
    end if;
    if new.mfa_enabled is distinct from old.mfa_enabled
      and coalesce(current_setting('ue.profile_system_write', true), '0') <> '1' then
      raise exception 'MFA state is managed by the authentication system';
    end if;
  end if;

  return new;
end;
$$;
