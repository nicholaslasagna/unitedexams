-- Email change request tracking + profile email mirror sync

create table if not exists public.email_change_requests (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  new_email text not null,
  requested_at timestamptz not null default now(),
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.email_change_requests
  add column if not exists user_id uuid,
  add column if not exists new_email text,
  add column if not exists requested_at timestamptz default now(),
  add column if not exists status text default 'pending',
  add column if not exists created_at timestamptz default now(),
  add column if not exists updated_at timestamptz default now();

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'email_change_requests'
      and column_name = 'user_id'
  ) then
    alter table public.email_change_requests
      alter column user_id set not null;
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'email_change_requests'
      and column_name = 'new_email'
  ) then
    alter table public.email_change_requests
      alter column new_email set not null;
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'email_change_requests'
      and column_name = 'requested_at'
  ) then
    alter table public.email_change_requests
      alter column requested_at set not null,
      alter column requested_at set default now();
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'email_change_requests'
      and column_name = 'status'
  ) then
    alter table public.email_change_requests
      alter column status set not null,
      alter column status set default 'pending';
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'email_change_requests'
      and column_name = 'created_at'
  ) then
    alter table public.email_change_requests
      alter column created_at set not null,
      alter column created_at set default now();
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'email_change_requests'
      and column_name = 'updated_at'
  ) then
    alter table public.email_change_requests
      alter column updated_at set not null,
      alter column updated_at set default now();
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'email_change_requests_status_check'
      and conrelid = 'public.email_change_requests'::regclass
  ) then
    alter table public.email_change_requests
      add constraint email_change_requests_status_check
      check (status in ('pending', 'confirmed', 'cancelled'));
  end if;
end;
$$;

create index if not exists idx_email_change_requests_requested_at
  on public.email_change_requests(requested_at desc);

create index if not exists idx_email_change_requests_lower_new_email
  on public.email_change_requests(lower(new_email));

alter table public.email_change_requests enable row level security;

drop policy if exists email_change_requests_select_own on public.email_change_requests;
drop policy if exists email_change_requests_insert_own on public.email_change_requests;
drop policy if exists email_change_requests_update_own on public.email_change_requests;
drop policy if exists email_change_requests_delete_own on public.email_change_requests;

create policy email_change_requests_select_own
  on public.email_change_requests
  for select
  using (auth.uid() = user_id);

create policy email_change_requests_insert_own
  on public.email_change_requests
  for insert
  with check (auth.uid() = user_id);

create policy email_change_requests_update_own
  on public.email_change_requests
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy email_change_requests_delete_own
  on public.email_change_requests
  for delete
  using (auth.uid() = user_id);

create or replace function public.sync_profile_email()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  auth_email text;
begin
  select u.email
  into auth_email
  from auth.users u
  where u.id = auth.uid();

  if auth_email is null then
    return;
  end if;

  update public.profiles
  set
    email = auth_email,
    updated_at = now()
  where id = auth.uid()
    and email is distinct from auth_email;
end;
$$;

grant execute on function public.sync_profile_email() to authenticated;
