-- Require university-admin approval or an admin-issued code before a user can
-- become affiliated with a university.

create table if not exists public.university_affiliation_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  university_id uuid not null references public.universities(id) on delete cascade,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected', 'canceled')),
  requested_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references public.profiles(id) on delete set null,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists university_affiliation_requests_one_pending
  on public.university_affiliation_requests(user_id)
  where status = 'pending';

create index if not exists university_affiliation_requests_university_status_idx
  on public.university_affiliation_requests(university_id, status, requested_at desc);

alter table public.university_affiliation_requests enable row level security;

drop trigger if exists trg_university_affiliation_requests_updated_at
  on public.university_affiliation_requests;
create trigger trg_university_affiliation_requests_updated_at
before update on public.university_affiliation_requests
for each row execute procedure public.set_updated_at();

create table if not exists public.university_affiliation_codes (
  id uuid primary key default gen_random_uuid(),
  university_id uuid not null references public.universities(id) on delete cascade,
  code_hash text not null unique,
  assigned_email text,
  assigned_user_id uuid references public.profiles(id) on delete cascade,
  max_uses integer not null default 1 check (max_uses between 1 and 500),
  used_count integer not null default 0 check (used_count >= 0 and used_count <= max_uses),
  expires_at timestamptz,
  created_by uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_redeemed_at timestamptz
);

create index if not exists university_affiliation_codes_university_idx
  on public.university_affiliation_codes(university_id, created_at desc);

alter table public.university_affiliation_codes enable row level security;

drop trigger if exists trg_university_affiliation_codes_updated_at
  on public.university_affiliation_codes;
create trigger trg_university_affiliation_codes_updated_at
before update on public.university_affiliation_codes
for each row execute procedure public.set_updated_at();

create table if not exists public.university_affiliation_code_redemptions (
  id uuid primary key default gen_random_uuid(),
  code_id uuid not null references public.university_affiliation_codes(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  university_id uuid not null references public.universities(id) on delete cascade,
  redeemed_at timestamptz not null default now(),
  unique (code_id, user_id)
);

create index if not exists university_affiliation_redemptions_user_idx
  on public.university_affiliation_code_redemptions(user_id, redeemed_at desc);

alter table public.university_affiliation_code_redemptions enable row level security;

drop policy if exists university_affiliation_requests_select_scoped
  on public.university_affiliation_requests;
create policy university_affiliation_requests_select_scoped
  on public.university_affiliation_requests
  for select
  to authenticated
  using (
    user_id = auth.uid()
    or public.is_university_admin(auth.uid(), university_id)
  );

drop policy if exists university_affiliation_codes_select_admin
  on public.university_affiliation_codes;
create policy university_affiliation_codes_select_admin
  on public.university_affiliation_codes
  for select
  to authenticated
  using (public.is_university_admin(auth.uid(), university_id));

drop policy if exists university_affiliation_redemptions_select_scoped
  on public.university_affiliation_code_redemptions;
create policy university_affiliation_redemptions_select_scoped
  on public.university_affiliation_code_redemptions
  for select
  to authenticated
  using (
    user_id = auth.uid()
    or public.is_university_admin(auth.uid(), university_id)
  );

grant select on public.university_affiliation_requests to authenticated;
grant select on public.university_affiliation_codes to authenticated;
grant select on public.university_affiliation_code_redemptions to authenticated;

create or replace function public.hash_university_affiliation_code(code_input text)
returns text
language sql
immutable
set search_path = public
as $$
  select encode(extensions.digest(lower(trim(coalesce(code_input, ''))), 'sha256'::text), 'hex');
$$;

create table if not exists public.university_professor_invite_codes (
  id uuid primary key default gen_random_uuid(),
  university_id uuid not null references public.universities(id) on delete cascade,
  code_hash text not null unique,
  assigned_email text not null,
  expires_at timestamptz,
  created_by uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  used_by uuid references public.profiles(id) on delete set null,
  used_at timestamptz
);

create index if not exists university_professor_invite_codes_university_idx
  on public.university_professor_invite_codes(university_id, created_at desc);

create index if not exists university_professor_invite_codes_email_idx
  on public.university_professor_invite_codes(university_id, assigned_email);

alter table public.university_professor_invite_codes enable row level security;

drop trigger if exists trg_university_professor_invite_codes_updated_at
  on public.university_professor_invite_codes;
create trigger trg_university_professor_invite_codes_updated_at
before update on public.university_professor_invite_codes
for each row execute procedure public.set_updated_at();

drop policy if exists university_professor_invite_codes_select_admin
  on public.university_professor_invite_codes;
create policy university_professor_invite_codes_select_admin
  on public.university_professor_invite_codes
  for select
  to authenticated
  using (public.is_university_admin(auth.uid(), university_id));

grant select on public.university_professor_invite_codes to authenticated;

create or replace function public.validate_professor_verification_code(
  university_id_input uuid,
  code_input text,
  email_input text
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.university_professor_invite_codes c
    where c.university_id = university_id_input
      and c.code_hash = public.hash_professor_verification_code(code_input)
      and c.assigned_email = lower(trim(coalesce(email_input, '')))
      and c.used_at is null
      and (c.expires_at is null or c.expires_at > now())
  );
$$;

grant execute on function public.validate_professor_verification_code(uuid, text, text)
  to anon, authenticated;

create or replace function public.create_professor_verification_invite(
  code_input text,
  assigned_email_input text,
  expires_at_input timestamptz default null
)
returns table (
  invite_id uuid,
  university_id uuid,
  assigned_email text,
  expires_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  actor_id uuid := auth.uid();
  admin_university_id uuid;
  normalized_email text;
  inserted_invite_id uuid;
begin
  if actor_id is null then
    raise exception 'Authentication required';
  end if;

  select p.university_id
  into admin_university_id
  from public.profiles p
  where p.id = actor_id
    and p.role = 'admin';

  if admin_university_id is null then
    raise exception 'Only university admin accounts can create professor invites';
  end if;

  if char_length(trim(coalesce(code_input, ''))) < 8 then
    raise exception 'Code must be at least 8 characters';
  end if;

  normalized_email := lower(nullif(trim(coalesce(assigned_email_input, '')), ''));
  if normalized_email is null or normalized_email !~* '^[A-Z0-9._%+\-]+@[A-Z0-9.\-]+\.[A-Z]{2,}$' then
    raise exception 'A valid assigned email is required';
  end if;

  update public.university_professor_invite_codes c
  set expires_at = now(),
      updated_at = now()
  where c.university_id = admin_university_id
    and c.assigned_email = normalized_email
    and c.used_at is null
    and (c.expires_at is null or c.expires_at > now());

  insert into public.university_professor_invite_codes (
    university_id,
    code_hash,
    assigned_email,
    expires_at,
    created_by
  )
  values (
    admin_university_id,
    public.hash_professor_verification_code(code_input),
    normalized_email,
    expires_at_input,
    actor_id
  )
  returning id into inserted_invite_id;

  return query
  select
    inserted_invite_id,
    admin_university_id,
    normalized_email,
    expires_at_input;
end;
$$;

grant execute on function public.create_professor_verification_invite(text, text, timestamptz)
  to authenticated;

create or replace function public.claim_professor_verification_code(
  university_id_input uuid,
  code_input text,
  email_input text,
  professor_user_id_input uuid
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  invite_record public.university_professor_invite_codes%rowtype;
  verification_id uuid;
  normalized_email text := lower(trim(coalesce(email_input, '')));
begin
  select c.*
  into invite_record
  from public.university_professor_invite_codes c
  where c.university_id = university_id_input
    and c.code_hash = public.hash_professor_verification_code(code_input)
    and c.assigned_email = normalized_email
    and c.used_at is null
    and (c.expires_at is null or c.expires_at > now())
  for update;

  if not found then
    raise exception 'Invalid or expired professor verification code';
  end if;

  update public.university_professor_invite_codes c
  set used_by = professor_user_id_input,
      used_at = now(),
      updated_at = now()
  where c.id = invite_record.id;

  insert into public.professor_verifications (
    professor_user_id,
    university_id,
    status,
    verified_by_user_id,
    verification_method,
    evidence,
    decided_at,
    expires_at
  )
  values (
    professor_user_id_input,
    university_id_input,
    'verified',
    invite_record.created_by,
    'code',
    jsonb_build_object(
      'invite_id', invite_record.id,
      'assigned_email', invite_record.assigned_email
    ),
    now(),
    invite_record.expires_at
  )
  returning id into verification_id;

  begin
    perform public.recompute_entitlements(professor_user_id_input);
  exception
    when undefined_function then
      null;
  end;

  return verification_id;
end;
$$;

grant execute on function public.claim_professor_verification_code(uuid, text, text, uuid)
  to anon, authenticated;

create or replace function public.get_professor_verification_invites(status_input text default 'active')
returns table (
  invite_id uuid,
  university_id uuid,
  assigned_email text,
  used_by uuid,
  used_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select
    c.id as invite_id,
    c.university_id,
    c.assigned_email,
    c.used_by,
    c.used_at,
    c.expires_at,
    c.created_at
  from public.university_professor_invite_codes c
  where public.is_university_admin(auth.uid(), c.university_id)
    and (
      status_input is null
      or status_input = 'all'
      or (
        status_input = 'active'
        and c.used_at is null
        and (c.expires_at is null or c.expires_at > now())
      )
      or (
        status_input = 'used'
        and c.used_at is not null
      )
      or (
        status_input = 'expired'
        and c.used_at is null
        and c.expires_at is not null
        and c.expires_at <= now()
      )
    )
  order by c.created_at desc;
$$;

grant execute on function public.get_professor_verification_invites(text)
  to authenticated;

create or replace function public.get_university_admin_members()
returns table (
  user_id uuid,
  email text,
  display_name text,
  real_name text,
  role text,
  professor_verified boolean,
  professor_verified_at timestamptz,
  created_at timestamptz,
  updated_at timestamptz
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
    p.id as user_id,
    coalesce(au.email, p.email) as email,
    p.display_name,
    p.real_name,
    p.role,
    coalesce(p.professor_verified, false) as professor_verified,
    p.professor_verified_at,
    p.created_at,
    p.updated_at
  from admin_scope a
  join public.profiles p on p.university_id = a.university_id
  left join auth.users au on au.id = p.id
  where p.role in ('student', 'professor', 'admin')
  order by
    case p.role when 'admin' then 0 when 'professor' then 1 else 2 end,
    coalesce(p.real_name, p.display_name, au.email, p.email) asc;
$$;

grant execute on function public.get_university_admin_members() to authenticated;

create or replace function public.remove_managed_university_member(member_id_input uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  actor_id uuid := auth.uid();
  admin_university_id uuid;
  target_role text;
begin
  if actor_id is null then
    raise exception 'Authentication required';
  end if;

  select p.university_id
  into admin_university_id
  from public.profiles p
  where p.id = actor_id
    and p.role = 'admin';

  if admin_university_id is null then
    raise exception 'Only university admin accounts can manage university members';
  end if;

  if member_id_input = actor_id then
    raise exception 'University admins cannot remove their own university assignment';
  end if;

  select p.role
  into target_role
  from public.profiles p
  where p.id = member_id_input
    and p.university_id = admin_university_id;

  if target_role is null then
    raise exception 'Member not found for this university';
  end if;

  update public.professor_verifications pv
  set status = 'rejected',
      decided_at = coalesce(pv.decided_at, now())
  where pv.professor_user_id = member_id_input
    and pv.university_id = admin_university_id
    and pv.status = 'verified';

  perform set_config('united_exams.bypass_profile_guard', 'on', true);

  update public.profiles p
  set university_id = null,
      show_university = false,
      role = case when p.role = 'professor' then 'student' else p.role end,
      professor_verified = false,
      professor_verified_at = null,
      professor_verification_id = null,
      updated_at = now()
  where p.id = member_id_input
    and p.university_id = admin_university_id;

  perform set_config('united_exams.bypass_profile_guard', 'off', true);

  update public.university_affiliation_requests r
  set status = 'canceled',
      updated_at = now(),
      note = coalesce(r.note, 'University affiliation removed by university admin.')
  where r.user_id = member_id_input
    and r.university_id = admin_university_id
    and r.status = 'pending';

  begin
    perform public.recompute_entitlements(member_id_input);
  exception
    when undefined_function then
      null;
  end;
end;
$$;

grant execute on function public.remove_managed_university_member(uuid) to authenticated;

create or replace function public.set_managed_professor_verification_status(
  professor_id_input uuid,
  approved_input boolean
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  actor_id uuid := auth.uid();
  admin_university_id uuid;
begin
  if actor_id is null then
    raise exception 'Authentication required';
  end if;

  select p.university_id into admin_university_id
  from public.profiles p
  where p.id = actor_id
    and p.role = 'admin';

  if admin_university_id is null then
    raise exception 'Only university admin accounts can manage professor verification';
  end if;

  if not exists (
    select 1
    from public.profiles p
    where p.id = professor_id_input
      and p.role = 'professor'
      and p.university_id = admin_university_id
  ) then
    raise exception 'Professor not found for this university';
  end if;

  if approved_input then
    insert into public.professor_verifications (
      professor_user_id,
      university_id,
      status,
      verified_by_user_id,
      verification_method,
      evidence,
      decided_at
    )
    values (
      professor_id_input,
      admin_university_id,
      'verified',
      actor_id,
      'manual_admin',
      jsonb_build_object('source', 'university_admin_page'),
      now()
    );
  else
    update public.professor_verifications pv
    set status = 'rejected',
        decided_at = coalesce(pv.decided_at, now())
    where pv.professor_user_id = professor_id_input
      and pv.university_id = admin_university_id
      and pv.status = 'verified';
  end if;

  begin
    perform public.recompute_entitlements(professor_id_input);
  exception
    when undefined_function then
      perform set_config('united_exams.bypass_profile_guard', 'on', true);

      update public.profiles p
      set professor_verified = approved_input,
          professor_verified_at = case when approved_input then now() else null end,
          updated_at = now()
      where p.id = professor_id_input
        and p.role = 'professor'
        and p.university_id = admin_university_id;

      perform set_config('united_exams.bypass_profile_guard', 'off', true);
  end;
end;
$$;

grant execute on function public.set_managed_professor_verification_status(uuid, boolean)
  to authenticated;

create or replace function public.request_university_affiliation(university_id_input uuid)
returns table (
  request_id uuid,
  status text,
  university_id uuid,
  university_name text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  actor_id uuid := auth.uid();
  current_university_id uuid;
  target_university_name text;
  inserted_request_id uuid;
begin
  if actor_id is null then
    raise exception 'Authentication required';
  end if;

  select p.university_id
  into current_university_id
  from public.profiles p
  where p.id = actor_id;

  if not found then
    raise exception 'Profile not found';
  end if;

  select u.name
  into target_university_name
  from public.universities u
  where u.id = university_id_input;

  if target_university_name is null then
    raise exception 'University not found';
  end if;

  if current_university_id = university_id_input then
    return query
    select
      null::uuid,
      'already_verified'::text,
      university_id_input,
      target_university_name;
    return;
  end if;

  update public.university_affiliation_requests r
  set status = 'canceled',
      updated_at = now(),
      note = coalesce(r.note, 'Superseded by a newer university affiliation request.')
  where r.user_id = actor_id
    and r.status = 'pending';

  insert into public.university_affiliation_requests (
    user_id,
    university_id,
    status
  )
  values (
    actor_id,
    university_id_input,
    'pending'
  )
  returning id into inserted_request_id;

  return query
  select
    inserted_request_id,
    'pending'::text,
    university_id_input,
    target_university_name;
end;
$$;

grant execute on function public.request_university_affiliation(uuid) to authenticated;

create or replace function public.get_university_affiliation_requests(status_input text default 'pending')
returns table (
  request_id uuid,
  user_id uuid,
  email text,
  display_name text,
  real_name text,
  university_id uuid,
  university_name text,
  status text,
  requested_at timestamptz,
  reviewed_at timestamptz,
  reviewed_by uuid,
  note text
)
language sql
stable
security definer
set search_path = public, auth
as $$
  select
    r.id as request_id,
    r.user_id,
    coalesce(au.email, p.email) as email,
    p.display_name,
    p.real_name,
    r.university_id,
    u.name as university_name,
    r.status,
    r.requested_at,
    r.reviewed_at,
    r.reviewed_by,
    r.note
  from public.university_affiliation_requests r
  join public.profiles p on p.id = r.user_id
  join public.universities u on u.id = r.university_id
  left join auth.users au on au.id = p.id
  where public.is_university_admin(auth.uid(), r.university_id)
    and (
      status_input is null
      or status_input = 'all'
      or r.status = status_input
    )
  order by
    case when r.status = 'pending' then 0 else 1 end,
    r.requested_at desc;
$$;

grant execute on function public.get_university_affiliation_requests(text) to authenticated;

create or replace function public.review_university_affiliation_request(
  request_id_input uuid,
  approved_input boolean,
  note_input text default null
)
returns table (
  request_id uuid,
  status text,
  user_id uuid,
  university_id uuid
)
language plpgsql
security definer
set search_path = public
as $$
declare
  actor_id uuid := auth.uid();
  request_record public.university_affiliation_requests%rowtype;
  next_status text;
begin
  if actor_id is null then
    raise exception 'Authentication required';
  end if;

  select *
  into request_record
  from public.university_affiliation_requests r
  where r.id = request_id_input
  for update;

  if not found then
    raise exception 'Affiliation request not found';
  end if;

  if not public.is_university_admin(actor_id, request_record.university_id) then
    raise exception 'Only this university''s admin can review affiliation requests';
  end if;

  if request_record.status <> 'pending' then
    raise exception 'Affiliation request has already been reviewed';
  end if;

  next_status := case when approved_input then 'approved' else 'rejected' end;

  update public.university_affiliation_requests r
  set status = next_status,
      reviewed_at = now(),
      reviewed_by = actor_id,
      note = nullif(trim(coalesce(note_input, '')), '')
  where r.id = request_record.id;

  if approved_input then
    perform set_config('united_exams.bypass_profile_guard', 'on', true);

    update public.profiles p
    set university_id = request_record.university_id,
        show_university = true,
        updated_at = now()
    where p.id = request_record.user_id;

    perform set_config('united_exams.bypass_profile_guard', 'off', true);

    begin
      perform public.recompute_entitlements(request_record.user_id);
    exception
      when undefined_function then
        null;
    end;
  end if;

  return query
  select
    request_record.id,
    next_status,
    request_record.user_id,
    request_record.university_id;
end;
$$;

grant execute on function public.review_university_affiliation_request(uuid, boolean, text)
  to authenticated;

create or replace function public.create_university_affiliation_code(
  code_input text,
  assigned_email_input text default null,
  expires_at_input timestamptz default null,
  max_uses_input integer default 1
)
returns table (
  code_id uuid,
  university_id uuid,
  assigned_email text,
  expires_at timestamptz,
  max_uses integer
)
language plpgsql
security definer
set search_path = public
as $$
declare
  actor_id uuid := auth.uid();
  admin_university_id uuid;
  normalized_email text;
  inserted_code_id uuid;
  normalized_max_uses integer := coalesce(max_uses_input, 1);
begin
  if actor_id is null then
    raise exception 'Authentication required';
  end if;

  select p.university_id
  into admin_university_id
  from public.profiles p
  where p.id = actor_id
    and p.role = 'admin';

  if admin_university_id is null then
    raise exception 'Only university admin accounts can create affiliation codes';
  end if;

  if char_length(trim(coalesce(code_input, ''))) < 8 then
    raise exception 'Code must be at least 8 characters';
  end if;

  if normalized_max_uses <> 1 then
    raise exception 'University affiliation verification codes must be single-use';
  end if;

  normalized_email := lower(nullif(trim(coalesce(assigned_email_input, '')), ''));

  insert into public.university_affiliation_codes (
    university_id,
    code_hash,
    assigned_email,
    max_uses,
    expires_at,
    created_by
  )
  values (
    admin_university_id,
    public.hash_university_affiliation_code(code_input),
    normalized_email,
    normalized_max_uses,
    expires_at_input,
    actor_id
  )
  returning id into inserted_code_id;

  return query
  select
    inserted_code_id,
    admin_university_id,
    normalized_email,
    expires_at_input,
    normalized_max_uses;
end;
$$;

grant execute on function public.create_university_affiliation_code(text, text, timestamptz, integer)
  to authenticated;

create or replace function public.redeem_university_affiliation_code(code_input text)
returns table (
  code_id uuid,
  university_id uuid,
  university_name text
)
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  actor_id uuid := auth.uid();
  code_record public.university_affiliation_codes%rowtype;
  actor_email text;
  target_university_name text;
begin
  if actor_id is null then
    raise exception 'Authentication required';
  end if;

  select c.*
  into code_record
  from public.university_affiliation_codes c
  where c.code_hash = public.hash_university_affiliation_code(code_input)
    and (c.expires_at is null or c.expires_at > now())
  for update;

  if not found then
    raise exception 'Invalid or expired university verification code';
  end if;

  if code_record.used_count >= code_record.max_uses then
    raise exception 'University verification code has already been used';
  end if;

  if code_record.assigned_user_id is not null
    and code_record.assigned_user_id <> actor_id then
    raise exception 'University verification code is assigned to another account';
  end if;

  select lower(coalesce(au.email, p.email))
  into actor_email
  from public.profiles p
  left join auth.users au on au.id = p.id
  where p.id = actor_id;

  if actor_email is null then
    raise exception 'Profile email not found';
  end if;

  if code_record.assigned_email is not null
    and code_record.assigned_email <> actor_email then
    raise exception 'University verification code is assigned to another email';
  end if;

  select u.name
  into target_university_name
  from public.universities u
  where u.id = code_record.university_id;

  insert into public.university_affiliation_code_redemptions (
    code_id,
    user_id,
    university_id
  )
  values (
    code_record.id,
    actor_id,
    code_record.university_id
  );

  update public.university_affiliation_codes c
  set used_count = c.used_count + 1,
      last_redeemed_at = now(),
      updated_at = now()
  where c.id = code_record.id;

  update public.university_affiliation_requests r
  set status = 'canceled',
      updated_at = now(),
      note = coalesce(r.note, 'Superseded by university verification code redemption.')
  where r.user_id = actor_id
    and r.status = 'pending';

  insert into public.university_affiliation_requests (
    user_id,
    university_id,
    status,
    reviewed_at,
    reviewed_by,
    note
  )
  values (
    actor_id,
    code_record.university_id,
    'approved',
    now(),
    code_record.created_by,
    'Verified by university-issued code.'
  );

  perform set_config('united_exams.bypass_profile_guard', 'on', true);

  update public.profiles p
  set university_id = code_record.university_id,
      show_university = true,
      updated_at = now()
  where p.id = actor_id;

  perform set_config('united_exams.bypass_profile_guard', 'off', true);

  begin
    perform public.recompute_entitlements(actor_id);
  exception
    when undefined_function then
      null;
  end;

  return query
  select
    code_record.id,
    code_record.university_id,
    target_university_name;
end;
$$;

grant execute on function public.redeem_university_affiliation_code(text) to authenticated;

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
      select public.validate_professor_verification_code(next_university_id, professor_code, coalesce(new.email, ''))
      into professor_code_valid;
    end if;

    if professor_code_valid then
      next_professor_verified := true;
    else
      next_role := 'student';
      next_university_id := null;
      next_professor_verified := false;
    end if;
  elsif next_role = 'admin' then
    -- Admin-university assignment is a backend operation, never signup metadata.
    next_role := 'student';
    next_university_id := null;
  else
    next_university_id := null;
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

  if next_professor_verified and next_university_id is not null and professor_code is not null then
    perform public.claim_professor_verification_code(
      next_university_id,
      professor_code,
      coalesce(new.email, ''),
      new.id
    );
  end if;

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

create or replace function public.guard_profile_security_fields()
returns trigger
language plpgsql
-- SECURITY INVOKER intentionally: the bypass flag is honored only when
-- the real executing role is privileged.
as $$
declare
  bypass_flag text := current_setting('united_exams.bypass_profile_guard', true);
  is_privileged boolean := current_user in ('postgres', 'service_role', 'supabase_admin');
begin
  if bypass_flag = 'on' and is_privileged then
    return new;
  end if;

  if tg_op = 'INSERT' then
    if new.role = 'admin' then
      new.role := 'student';
      new.university_id := null;
    end if;

    if new.role = 'student' then
      new.university_id := null;
    end if;

    if new.role = 'professor' and not coalesce(new.professor_verified, false) then
      new.role := 'student';
      new.university_id := null;
      new.professor_verified := false;
      new.professor_verified_at := null;
    end if;
    return new;
  end if;

  if auth.uid() = old.id then
    if new.university_id is distinct from old.university_id then
      raise exception 'University affiliation requires university-admin approval or a verification code';
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
