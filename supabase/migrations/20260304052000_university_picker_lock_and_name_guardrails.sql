-- Lock university creation for non-admin users + display name guardrails

-- =====================================================
-- Universities: read for authenticated users, insert only for admins
-- =====================================================

drop policy if exists universities_insert_authenticated on public.universities;
drop policy if exists universities_insert_admin_only on public.universities;

create policy universities_insert_admin_only
  on public.universities
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
  );

-- =====================================================
-- Display name validation
-- =====================================================

create or replace function public.display_name_allowed(name_input text)
returns boolean
language sql
immutable
as $$
  select
    name_input is not null
    and char_length(name_input) between 2 and 32
    and name_input ~ '^[A-Za-z0-9 ._''-]+$'
    and not (
      lower(name_input) like '%fuck%'
      or lower(name_input) like '%shit%'
      or lower(name_input) like '%bitch%'
      or lower(name_input) like '%asshole%'
      or lower(name_input) like '%dick%'
      or lower(name_input) like '%cunt%'
      or lower(name_input) like '%nigger%'
      or lower(name_input) like '%faggot%'
    );
$$;

update public.profiles
set display_name = left(regexp_replace(trim(display_name), '\s+', ' ', 'g'), 32)
where display_name is not null;

update public.profiles
set display_name = 'Student'
where not public.display_name_allowed(display_name);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'profiles_display_name_allowed_check'
      and conrelid = 'public.profiles'::regclass
  ) then
    alter table public.profiles
      add constraint profiles_display_name_allowed_check
      check (public.display_name_allowed(display_name));
  end if;
end;
$$;

