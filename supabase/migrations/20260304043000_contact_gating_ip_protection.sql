-- Contact gating + new-IP verification foundations

create extension if not exists pgcrypto;

-- =====================================================
-- Preferences/profile controls for IP protection policy
-- =====================================================

alter table public.user_preferences
  add column if not exists extra_signin_protection boolean not null default false;

alter table public.profiles
  add column if not exists mfa_enabled boolean not null default false;

-- =====================================================
-- Contact messages v2
-- =====================================================

alter table public.contact_messages
  add column if not exists user_id uuid,
  add column if not exists subject text,
  add column if not exists category text default 'Other',
  add column if not exists meta jsonb not null default '{}'::jsonb,
  add column if not exists status text not null default 'open',
  add column if not exists updated_at timestamptz not null default now();

update public.contact_messages cm
set user_id = p.id
from public.profiles p
where cm.user_id is null
  and cm.email is not null
  and lower(cm.email) = lower(p.email);

delete from public.contact_messages
where user_id is null;

alter table public.contact_messages
  alter column user_id set not null,
  alter column category set not null,
  alter column category set default 'Other',
  alter column status set not null,
  alter column status set default 'open';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'contact_messages_user_id_fkey'
      and conrelid = 'public.contact_messages'::regclass
  ) then
    alter table public.contact_messages
      add constraint contact_messages_user_id_fkey
      foreign key (user_id) references public.profiles(id) on delete cascade;
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'contact_messages_category_check'
      and conrelid = 'public.contact_messages'::regclass
  ) then
    alter table public.contact_messages
      add constraint contact_messages_category_check
      check (category in ('Bug', 'Content request', 'Account help', 'Other'));
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'contact_messages_status_check'
      and conrelid = 'public.contact_messages'::regclass
  ) then
    alter table public.contact_messages
      add constraint contact_messages_status_check
      check (status in ('open', 'closed'));
  end if;
end;
$$;

create index if not exists idx_contact_messages_user_created_at
  on public.contact_messages(user_id, created_at desc);

drop trigger if exists trg_contact_messages_updated_at on public.contact_messages;
create trigger trg_contact_messages_updated_at
before update on public.contact_messages
for each row execute procedure public.set_updated_at();

alter table public.contact_messages enable row level security;

drop policy if exists contact_messages_insert_all on public.contact_messages;
drop policy if exists contact_messages_select_own on public.contact_messages;
drop policy if exists contact_messages_insert_own on public.contact_messages;
drop policy if exists contact_messages_update_own on public.contact_messages;
drop policy if exists contact_messages_delete_own on public.contact_messages;

create policy contact_messages_select_own
  on public.contact_messages
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy contact_messages_insert_own
  on public.contact_messages
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy contact_messages_update_own
  on public.contact_messages
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- =====================================================
-- Login IP allowlist + challenge tables
-- =====================================================

create table if not exists public.login_ip_allowlist (
  user_id uuid not null references public.profiles(id) on delete cascade,
  ip_hash text not null,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  approved boolean not null default false,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, ip_hash)
);

create table if not exists public.login_ip_challenges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  ip_hash text not null,
  token_hash text not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  used_at timestamptz
);

create index if not exists idx_login_ip_allowlist_user_approved
  on public.login_ip_allowlist(user_id, approved);

create index if not exists idx_login_ip_challenges_user_created
  on public.login_ip_challenges(user_id, created_at desc);

create index if not exists idx_login_ip_challenges_token_hash
  on public.login_ip_challenges(token_hash);

drop trigger if exists trg_login_ip_allowlist_updated_at on public.login_ip_allowlist;
create trigger trg_login_ip_allowlist_updated_at
before update on public.login_ip_allowlist
for each row execute procedure public.set_updated_at();

alter table public.login_ip_allowlist enable row level security;
alter table public.login_ip_challenges enable row level security;

drop policy if exists login_ip_allowlist_select_own on public.login_ip_allowlist;
drop policy if exists login_ip_allowlist_insert_own on public.login_ip_allowlist;
drop policy if exists login_ip_allowlist_update_own on public.login_ip_allowlist;
drop policy if exists login_ip_allowlist_delete_own on public.login_ip_allowlist;
drop policy if exists login_ip_challenges_select_own on public.login_ip_challenges;
drop policy if exists login_ip_challenges_insert_own on public.login_ip_challenges;
drop policy if exists login_ip_challenges_update_own on public.login_ip_challenges;
drop policy if exists login_ip_challenges_delete_own on public.login_ip_challenges;

create policy login_ip_allowlist_select_own
  on public.login_ip_allowlist
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy login_ip_allowlist_insert_own
  on public.login_ip_allowlist
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy login_ip_allowlist_update_own
  on public.login_ip_allowlist
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy login_ip_allowlist_delete_own
  on public.login_ip_allowlist
  for delete
  to authenticated
  using (auth.uid() = user_id);

create policy login_ip_challenges_select_own
  on public.login_ip_challenges
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy login_ip_challenges_insert_own
  on public.login_ip_challenges
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy login_ip_challenges_update_own
  on public.login_ip_challenges
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

