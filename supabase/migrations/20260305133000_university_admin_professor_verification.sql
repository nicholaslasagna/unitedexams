-- University-scoped professor verification and school-admin controls.

alter table public.profiles
  add column if not exists professor_verified boolean not null default false,
  add column if not exists professor_verified_at timestamptz;

-- Keep existing professors functional while enforcing university binding going forward.
update public.profiles
set professor_verified = true,
    professor_verified_at = coalesce(professor_verified_at, now())
where role = 'professor'
  and university_id is not null
  and coalesce(professor_verified, false) = false;

-- Professors without a university cannot remain professor role.
update public.profiles
set role = 'student',
    professor_verified = false,
    professor_verified_at = null
where role = 'professor'
  and university_id is null;

create table if not exists public.university_professor_verification_codes (
  university_id uuid primary key references public.universities(id) on delete cascade,
  code_hash text not null,
  created_by uuid not null references public.profiles(id) on delete cascade,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.university_professor_verification_codes enable row level security;

drop trigger if exists trg_university_professor_verification_codes_updated_at on public.university_professor_verification_codes;
create trigger trg_university_professor_verification_codes_updated_at
before update on public.university_professor_verification_codes
for each row execute procedure public.set_updated_at();

-- Use CREATE OR REPLACE rather than DROP + CREATE: by the time this
-- migration is replayed on a database that already had the function,
-- RLS policies on university_professor_verification_codes,
-- profile_name_change_requests, and account_deletion_requests depend
-- on it, and a DROP would fail with "cannot drop function ... because
-- other objects depend on it". The signature hasn't changed across
-- versions, so REPLACE is safe.
create or replace function public.is_university_admin(uid uuid, university_id_input uuid default null)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = uid
      and p.role = 'admin'
      and p.university_id is not null
      and (university_id_input is null or p.university_id = university_id_input)
  );
$$;

drop policy if exists university_professor_verification_codes_select_admin on public.university_professor_verification_codes;
drop policy if exists university_professor_verification_codes_insert_admin on public.university_professor_verification_codes;
drop policy if exists university_professor_verification_codes_update_admin on public.university_professor_verification_codes;
drop policy if exists university_professor_verification_codes_delete_admin on public.university_professor_verification_codes;

create policy university_professor_verification_codes_select_admin
  on public.university_professor_verification_codes
  for select
  to authenticated
  using (public.is_university_admin(auth.uid(), university_id));

create policy university_professor_verification_codes_insert_admin
  on public.university_professor_verification_codes
  for insert
  to authenticated
  with check (
    created_by = auth.uid()
    and public.is_university_admin(auth.uid(), university_id)
  );

create policy university_professor_verification_codes_update_admin
  on public.university_professor_verification_codes
  for update
  to authenticated
  using (public.is_university_admin(auth.uid(), university_id))
  with check (
    created_by = auth.uid()
    and public.is_university_admin(auth.uid(), university_id)
  );

create policy university_professor_verification_codes_delete_admin
  on public.university_professor_verification_codes
  for delete
  to authenticated
  using (public.is_university_admin(auth.uid(), university_id));

drop function if exists public.hash_professor_verification_code(text);
create function public.hash_professor_verification_code(code_input text)
returns text
language sql
immutable
set search_path = public
as $$
  select encode(extensions.digest(lower(trim(coalesce(code_input, ''))), 'sha256'::text), 'hex');
$$;

drop function if exists public.validate_professor_verification_code(uuid, text);
create function public.validate_professor_verification_code(university_id_input uuid, code_input text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.university_professor_verification_codes c
    where c.university_id = university_id_input
      and c.code_hash = public.hash_professor_verification_code(code_input)
      and (c.expires_at is null or c.expires_at > now())
  );
$$;

grant execute on function public.validate_professor_verification_code(uuid, text) to anon, authenticated;

drop function if exists public.rotate_professor_verification_code(text, timestamptz);
create function public.rotate_professor_verification_code(code_input text, expires_at_input timestamptz default null)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  admin_university_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  select p.university_id into admin_university_id
  from public.profiles p
  where p.id = auth.uid()
    and p.role = 'admin';

  if admin_university_id is null then
    raise exception 'Only university admin accounts can rotate professor verification codes';
  end if;

  if char_length(trim(coalesce(code_input, ''))) < 8 then
    raise exception 'Code must be at least 8 characters';
  end if;

  insert into public.university_professor_verification_codes (
    university_id,
    code_hash,
    created_by,
    expires_at
  )
  values (
    admin_university_id,
    public.hash_professor_verification_code(code_input),
    auth.uid(),
    expires_at_input
  )
  on conflict (university_id)
  do update set
    code_hash = excluded.code_hash,
    created_by = excluded.created_by,
    expires_at = excluded.expires_at,
    updated_at = now();
end;
$$;

grant execute on function public.rotate_professor_verification_code(text, timestamptz) to authenticated;

drop function if exists public.get_professor_verification_code_status();
create function public.get_professor_verification_code_status()
returns table (
  university_id uuid,
  university_name text,
  has_active_code boolean,
  expires_at timestamptz,
  updated_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  with admin_scope as (
    select p.university_id
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
      and p.university_id is not null
    limit 1
  )
  select
    u.id as university_id,
    u.name as university_name,
    (c.code_hash is not null and (c.expires_at is null or c.expires_at > now())) as has_active_code,
    c.expires_at,
    c.updated_at
  from admin_scope a
  join public.universities u on u.id = a.university_id
  left join public.university_professor_verification_codes c on c.university_id = a.university_id;
$$;

grant execute on function public.get_professor_verification_code_status() to authenticated;

drop function if exists public.get_managed_professors();
create function public.get_managed_professors()
returns table (
  professor_id uuid,
  display_name text,
  email text,
  professor_verified boolean,
  professor_verified_at timestamptz,
  created_at timestamptz
)
language sql
stable
security definer
set search_path = public, auth
as $$
  with admin_scope as (
    select p.university_id
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
      and p.university_id is not null
    limit 1
  )
  select
    p.id as professor_id,
    p.display_name,
    coalesce(au.email, p.email) as email,
    p.professor_verified,
    p.professor_verified_at,
    p.created_at
  from admin_scope a
  join public.profiles p on p.university_id = a.university_id
  left join auth.users au on au.id = p.id
  where p.role = 'professor'
  order by p.display_name asc;
$$;

grant execute on function public.get_managed_professors() to authenticated;

drop function if exists public.set_managed_professor_verification_status(uuid, boolean);
create function public.set_managed_professor_verification_status(
  professor_id_input uuid,
  approved_input boolean
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  admin_university_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  select p.university_id into admin_university_id
  from public.profiles p
  where p.id = auth.uid()
    and p.role = 'admin';

  if admin_university_id is null then
    raise exception 'Only university admin accounts can manage professor verification';
  end if;

  update public.profiles p
  set professor_verified = approved_input,
      professor_verified_at = case when approved_input then now() else null end,
      updated_at = now()
  where p.id = professor_id_input
    and p.role = 'professor'
    and p.university_id = admin_university_id;

  if not found then
    raise exception 'Professor not found for this university';
  end if;
end;
$$;

grant execute on function public.set_managed_professor_verification_status(uuid, boolean) to authenticated;

-- CREATE OR REPLACE for the same reason as is_university_admin above:
-- the trg_profiles_guard_security_fields trigger on public.profiles
-- depends on this function, so a DROP would fail when this migration
-- is replayed against a database that already has it. Signature is
-- unchanged across versions so REPLACE produces an identical end state.
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
  end if;

  return new;
end;
$$;

drop trigger if exists trg_profiles_guard_security_fields on public.profiles;
create trigger trg_profiles_guard_security_fields
before insert or update on public.profiles
for each row execute procedure public.guard_profile_security_fields();

create or replace function public.user_is_professor(uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists(
    select 1
    from public.profiles p
    where p.id = uid
      and p.role = 'professor'
      and p.university_id is not null
      and coalesce(p.professor_verified, false) = true
  );
$$;

create or replace function public.is_professor_or_admin(uid uuid)
returns boolean
language sql
stable
set search_path = public
as $$
  select public.user_is_professor(uid);
$$;

create or replace function public.section_professor_exists(section_id_input uuid, user_id_input uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.class_sections cs
    where cs.id = section_id_input
      and (
        (
          coalesce(cs.created_by, cs.owner_id) = user_id_input
          and public.user_is_professor(user_id_input)
        )
        or exists (
          select 1
          from public.section_members sm
          where sm.section_id = cs.id
            and sm.user_id = user_id_input
            and sm.role in ('professor', 'ta')
            and public.user_is_professor(user_id_input)
        )
      )
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  next_name text;
  next_real_name text;
  next_role text;
  next_show_real_name boolean;
  next_university_id uuid;
  professor_code text;
  professor_code_valid boolean := false;
  next_professor_verified boolean := false;
begin
  next_name := trim(coalesce(new.raw_user_meta_data->>'display_name', split_part(coalesce(new.email, ''), '@', 1), 'Student'));
  if next_name = '' then
    next_name := 'Student';
  end if;

  next_real_name := nullif(trim(coalesce(new.raw_user_meta_data->>'real_name', '')), '');
  next_show_real_name := coalesce((new.raw_user_meta_data->>'show_real_name')::boolean, false);
  next_role := lower(coalesce(new.raw_user_meta_data->>'role', 'student'));
  if next_role = 'teacher' then
    next_role := 'professor';
  end if;
  if next_role not in ('student', 'professor', 'admin') then
    next_role := 'student';
  end if;

  begin
    next_university_id := nullif(trim(coalesce(new.raw_user_meta_data->>'university_id', '')), '')::uuid;
  exception when others then
    next_university_id := null;
  end;

  professor_code := nullif(trim(coalesce(new.raw_user_meta_data->>'professor_code', '')), '');

  if next_role = 'professor' then
    if next_university_id is not null and professor_code is not null then
      select public.validate_professor_verification_code(next_university_id, professor_code)
      into professor_code_valid;
    end if;

    if professor_code_valid then
      next_professor_verified := true;
    else
      next_role := 'student';
      next_professor_verified := false;
    end if;
  elsif next_role = 'admin' then
    if next_university_id is null then
      next_role := 'student';
    end if;
  end if;

  insert into public.profiles (
    id,
    email,
    display_name,
    real_name,
    show_real_name,
    role,
    university_id,
    professor_verified,
    professor_verified_at,
    display_name_locked,
    real_name_locked
  )
  values (
    new.id,
    new.email,
    next_name,
    next_real_name,
    next_show_real_name,
    next_role,
    next_university_id,
    next_professor_verified,
    case when next_professor_verified then now() else null end,
    (lower(next_name) <> 'student'),
    (next_real_name is not null)
  )
  on conflict (id) do update
  set email = excluded.email;

  insert into public.user_preferences (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  insert into public.streaks (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  insert into public.leaderboard_cache (user_id, display_name)
  values (new.id, next_name)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

create or replace function public.get_leaderboard(limit_count integer default 25, offset_count integer default 0)
returns table (
  rank bigint,
  user_id uuid,
  display_name text,
  real_name text,
  university_name text,
  points integer,
  streak integer,
  is_current_user boolean
)
language sql
stable
security definer
set search_path = public
as $$
with ranked as (
  select
    row_number() over (order by lc.points desc, lc.streak desc, lc.updated_at asc, lc.display_name asc) as rank,
    lc.user_id,
    lc.display_name,
    case when lc.show_real_name then lc.real_name else null end as real_name,
    case when lc.show_university then lc.university_name else null end as university_name,
    lc.points,
    lc.streak
  from public.leaderboard_cache lc
  join public.profiles p on p.id = lc.user_id
  where p.role = 'student'
),
scoped as (
  select *
  from ranked
  order by rank
  limit case
    when auth.uid() is null then least(5, greatest(1, coalesce(limit_count, 5)))
    else least(100, greatest(1, coalesce(limit_count, 25)))
  end
  offset case
    when auth.uid() is null then 0
    else greatest(0, coalesce(offset_count, 0))
  end
)
select
  rank,
  user_id,
  display_name,
  real_name,
  university_name,
  points,
  streak,
  (user_id = auth.uid()) as is_current_user
from scoped;
$$;

grant execute on function public.get_leaderboard(integer, integer) to anon, authenticated;
