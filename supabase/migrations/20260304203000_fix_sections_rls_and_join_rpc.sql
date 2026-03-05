-- Fix class section policy recursion + join RPC compatibility on mixed schemas.

-- Normalize class_sections shape for environments that drifted to owner_id/section_name.
alter table public.class_sections
  add column if not exists created_by uuid references public.profiles(id) on delete cascade,
  add column if not exists owner_id uuid references public.profiles(id) on delete cascade,
  add column if not exists name text,
  add column if not exists section_name text,
  add column if not exists term text,
  add column if not exists join_code text;

alter table public.section_members
  add column if not exists role text default 'student';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'section_members_role_check'
      and conrelid = 'public.section_members'::regclass
  ) then
    alter table public.section_members
      add constraint section_members_role_check
      check (role in ('student', 'professor', 'ta'));
  end if;
end;
$$;

update public.class_sections
set created_by = owner_id
where created_by is null
  and owner_id is not null;

update public.class_sections
set owner_id = created_by
where owner_id is null
  and created_by is not null;

update public.class_sections
set name = coalesce(nullif(trim(name), ''), nullif(trim(section_name), ''), 'Untitled Section'),
    section_name = coalesce(nullif(trim(section_name), ''), nullif(trim(name), ''), 'Untitled Section');

create or replace function public.normalize_class_section_row()
returns trigger
language plpgsql
as $$
begin
  if new.created_by is null and new.owner_id is null and auth.uid() is not null then
    new.created_by := auth.uid();
    new.owner_id := auth.uid();
  end if;

  if new.created_by is null and new.owner_id is not null then
    new.created_by := new.owner_id;
  end if;

  if new.owner_id is null and new.created_by is not null then
    new.owner_id := new.created_by;
  end if;

  new.name := coalesce(nullif(trim(coalesce(new.name, '')), ''), nullif(trim(coalesce(new.section_name, '')), ''), 'Untitled Section');
  new.section_name := coalesce(nullif(trim(coalesce(new.section_name, '')), ''), new.name);

  if new.join_code is not null then
    new.join_code := upper(trim(new.join_code));
  end if;

  return new;
end;
$$;

drop trigger if exists trg_class_sections_normalize on public.class_sections;
create trigger trg_class_sections_normalize
before insert or update of created_by, owner_id, name, section_name, join_code
on public.class_sections
for each row execute procedure public.normalize_class_section_row();

-- Use owner-aware security definer helpers so policies do not recurse.
create or replace function public.section_member_exists(section_id_input uuid, user_id_input uuid)
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
        cs.created_by = user_id_input
        or cs.owner_id = user_id_input
        or exists (
          select 1
          from public.section_members sm
          where sm.section_id = cs.id
            and sm.user_id = user_id_input
        )
      )
  );
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
        cs.created_by = user_id_input
        or cs.owner_id = user_id_input
        or exists (
          select 1
          from public.section_members sm
          where sm.section_id = cs.id
            and sm.user_id = user_id_input
            and sm.role in ('professor', 'ta')
        )
      )
  );
$$;

-- Prevent RLS recursion while generating join codes.
create or replace function public.set_section_join_code()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.join_code is null or length(trim(new.join_code)) = 0 then
    loop
      new.join_code := public.generate_join_code();
      exit when not exists (
        select 1
        from public.class_sections
        where join_code = new.join_code
      );
    end loop;
  else
    new.join_code := upper(trim(new.join_code));
  end if;

  return new;
end;
$$;

drop trigger if exists trg_set_section_join_code on public.class_sections;
create trigger trg_set_section_join_code
before insert on public.class_sections
for each row execute procedure public.set_section_join_code();

-- Reconcile duplicate policies from older migrations and keep non-recursive forms.
drop policy if exists class_sections_select_member_or_owner on public.class_sections;
drop policy if exists class_sections_insert_professor on public.class_sections;
drop policy if exists class_sections_update_owner on public.class_sections;
drop policy if exists class_sections_delete_owner on public.class_sections;
drop policy if exists sections_select_owner_or_member on public.class_sections;
drop policy if exists sections_insert_professor_owner on public.class_sections;
drop policy if exists sections_update_owner on public.class_sections;
drop policy if exists sections_delete_owner on public.class_sections;

drop policy if exists section_members_select_member_or_owner on public.section_members;
drop policy if exists section_members_insert_own on public.section_members;
drop policy if exists section_members_delete_self_or_owner on public.section_members;
drop policy if exists section_members_update_owner on public.section_members;
drop policy if exists members_select_own_or_owner on public.section_members;
drop policy if exists members_insert_self_or_owner on public.section_members;
drop policy if exists members_update_owner_only on public.section_members;
drop policy if exists members_delete_self_or_owner on public.section_members;

create policy class_sections_select_member_or_owner
  on public.class_sections
  for select
  to authenticated
  using (public.section_member_exists(id, auth.uid()));

create policy class_sections_insert_professor
  on public.class_sections
  for insert
  to authenticated
  with check (
    public.is_professor_or_admin(auth.uid())
    and (
      created_by = auth.uid()
      or owner_id = auth.uid()
      or coalesce(created_by, owner_id) = auth.uid()
    )
  );

create policy class_sections_update_owner
  on public.class_sections
  for update
  to authenticated
  using (
    created_by = auth.uid()
    or owner_id = auth.uid()
    or coalesce(created_by, owner_id) = auth.uid()
  )
  with check (
    created_by = auth.uid()
    or owner_id = auth.uid()
    or coalesce(created_by, owner_id) = auth.uid()
  );

create policy class_sections_delete_owner
  on public.class_sections
  for delete
  to authenticated
  using (
    created_by = auth.uid()
    or owner_id = auth.uid()
    or coalesce(created_by, owner_id) = auth.uid()
  );

create policy section_members_select_member_or_owner
  on public.section_members
  for select
  to authenticated
  using (
    user_id = auth.uid()
    or public.section_professor_exists(section_id, auth.uid())
  );

create policy section_members_insert_own
  on public.section_members
  for insert
  to authenticated
  with check (
    user_id = auth.uid()
    or public.section_professor_exists(section_id, auth.uid())
  );

create policy section_members_delete_self_or_owner
  on public.section_members
  for delete
  to authenticated
  using (
    user_id = auth.uid()
    or public.section_professor_exists(section_id, auth.uid())
  );

create policy section_members_update_owner
  on public.section_members
  for update
  to authenticated
  using (public.section_professor_exists(section_id, auth.uid()))
  with check (public.section_professor_exists(section_id, auth.uid()));

-- Canonical join function argument name used by the app: join_code_input.
drop function if exists public.join_section_by_code(text);
create function public.join_section_by_code(join_code_input text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  target_section_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  select cs.id into target_section_id
  from public.class_sections cs
  where upper(cs.join_code) = upper(trim(join_code_input));

  if target_section_id is null then
    raise exception 'Section code not found';
  end if;

  insert into public.section_members (section_id, user_id, role)
  values (target_section_id, auth.uid(), 'student')
  on conflict (section_id, user_id) do nothing;

  return target_section_id;
end;
$$;

grant execute on function public.join_section_by_code(text) to authenticated;
