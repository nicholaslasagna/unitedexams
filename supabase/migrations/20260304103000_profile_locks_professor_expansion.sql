-- Profile persistence hardening + identity lock policy + professor mode expansion

create extension if not exists pgcrypto;

-- Keep updated_at trigger helper resilient when attached to tables without updated_at.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new := jsonb_populate_record(new, to_jsonb(new) || jsonb_build_object('updated_at', now()));
  return new;
end;
$$;

-- =====================================================
-- Profiles: persistence + lock policy + legal acceptance tracking
-- =====================================================

alter table public.profiles
  add column if not exists display_name_locked boolean not null default false,
  add column if not exists real_name_locked boolean not null default false,
  add column if not exists privacy_version_accepted text,
  add column if not exists terms_version_accepted text;

update public.profiles
set display_name_locked = true
where display_name_locked = false
  and coalesce(trim(display_name), '') <> ''
  and lower(trim(display_name)) <> 'student';

update public.profiles
set real_name_locked = true
where real_name_locked = false
  and coalesce(trim(real_name), '') <> '';

create or replace function public.enforce_profile_identity_locks()
returns trigger
language plpgsql
as $$
declare
  next_display_name text;
  next_real_name text;
begin
  next_display_name := trim(coalesce(new.display_name, ''));
  next_real_name := trim(coalesce(new.real_name, ''));

  if tg_op = 'INSERT' then
    if new.display_name_locked is null then
      new.display_name_locked := false;
    end if;

    if new.real_name_locked is null then
      new.real_name_locked := false;
    end if;

    if next_display_name <> '' and lower(next_display_name) <> 'student' then
      new.display_name_locked := true;
    end if;

    if next_real_name <> '' then
      new.real_name_locked := true;
    end if;

    return new;
  end if;

  if old.display_name_locked and new.display_name is distinct from old.display_name then
    raise exception 'Display name is locked. Contact support to change it.';
  end if;

  if old.real_name_locked and coalesce(new.real_name, '') is distinct from coalesce(old.real_name, '') then
    raise exception 'Real name is locked. Contact support to change it.';
  end if;

  if not old.display_name_locked and new.display_name is distinct from old.display_name then
    if next_display_name <> '' and lower(next_display_name) <> 'student' then
      new.display_name_locked := true;
    end if;
  end if;

  if not old.real_name_locked and coalesce(new.real_name, '') is distinct from coalesce(old.real_name, '') then
    if next_real_name <> '' then
      new.real_name_locked := true;
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_profiles_identity_locks on public.profiles;
create trigger trg_profiles_identity_locks
before insert or update of display_name, real_name, display_name_locked, real_name_locked
on public.profiles
for each row execute procedure public.enforce_profile_identity_locks();

-- Make sure every auth user has a profile row.
insert into public.profiles (id, email, display_name)
select
  au.id,
  au.email,
  coalesce(au.raw_user_meta_data->>'display_name', split_part(coalesce(au.email, ''), '@', 1), 'Student')
from auth.users au
left join public.profiles p on p.id = au.id
where p.id is null;

-- Keep signup metadata in sync when auth user record is created.
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

  insert into public.profiles (
    id,
    email,
    display_name,
    real_name,
    show_real_name,
    role,
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

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

drop trigger if exists trg_profiles_sync_leaderboard on public.profiles;
create trigger trg_profiles_sync_leaderboard
after insert or update of display_name, real_name, show_real_name, show_university, university_id
on public.profiles
for each row execute procedure public.sync_leaderboard_profile();

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
before update on public.profiles
for each row execute procedure public.set_updated_at();

-- =====================================================
-- Theme preference model updates
-- =====================================================

alter table public.user_preferences
  add column if not exists accent_preset text not null default 'amethyst',
  add column if not exists accent_saturation int not null default 72,
  add column if not exists accent_lightness int not null default 60;

do $$
begin
  if exists (
    select 1 from pg_constraint
    where conname = 'user_preferences_accent_hue_check'
      and conrelid = 'public.user_preferences'::regclass
  ) then
    alter table public.user_preferences
      drop constraint user_preferences_accent_hue_check;
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'user_preferences_accent_hue_check'
      and conrelid = 'public.user_preferences'::regclass
  ) then
    alter table public.user_preferences
      add constraint user_preferences_accent_hue_check
      check (accent_hue between 0 and 359);
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'user_preferences_accent_saturation_check'
      and conrelid = 'public.user_preferences'::regclass
  ) then
    alter table public.user_preferences
      add constraint user_preferences_accent_saturation_check
      check (accent_saturation between 38 and 88);
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'user_preferences_accent_lightness_check'
      and conrelid = 'public.user_preferences'::regclass
  ) then
    alter table public.user_preferences
      add constraint user_preferences_accent_lightness_check
      check (accent_lightness between 38 and 76);
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'user_preferences_accent_preset_check'
      and conrelid = 'public.user_preferences'::regclass
  ) then
    alter table public.user_preferences
      add constraint user_preferences_accent_preset_check
      check (
        accent_preset in ('amethyst', 'nebula', 'aurora', 'indigo', 'rose', 'emerald', 'custom')
      );
  end if;
end;
$$;

-- =====================================================
-- Legal consent tracking
-- =====================================================

create table if not exists public.legal_consents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  doc_type text not null,
  doc_version text not null,
  consented_at timestamptz not null default now(),
  ip_hash text,
  user_agent text,
  created_at timestamptz not null default now()
);

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'legal_consents_doc_type_check'
      and conrelid = 'public.legal_consents'::regclass
  ) then
    alter table public.legal_consents
      add constraint legal_consents_doc_type_check
      check (doc_type in ('privacy', 'terms'));
  end if;
end;
$$;

create unique index if not exists idx_legal_consents_user_doc_version
  on public.legal_consents(user_id, doc_type, doc_version);

alter table public.legal_consents enable row level security;

drop policy if exists legal_consents_select_own on public.legal_consents;
drop policy if exists legal_consents_insert_own on public.legal_consents;
drop policy if exists legal_consents_update_none on public.legal_consents;
drop policy if exists legal_consents_delete_none on public.legal_consents;

create policy legal_consents_select_own
  on public.legal_consents
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy legal_consents_insert_own
  on public.legal_consents
  for insert
  to authenticated
  with check (auth.uid() = user_id);

-- =====================================================
-- Professor mode v1: materials + homework + gradebook
-- =====================================================

alter table public.assignments
  add column if not exists title text,
  add column if not exists instructions_md text,
  add column if not exists allow_late boolean not null default false,
  add column if not exists max_attempts int,
  add column if not exists grading_mode text not null default 'auto';

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'assignments_grading_mode_check'
      and conrelid = 'public.assignments'::regclass
  ) then
    alter table public.assignments
      add constraint assignments_grading_mode_check
      check (grading_mode in ('auto', 'manual', 'mixed'));
  end if;
end;
$$;

update public.assignments
set title = coalesce(title, 'Homework Assignment'),
    instructions_md = coalesce(instructions_md, ''),
    allow_late = coalesce(allow_late, false),
    grading_mode = coalesce(grading_mode, 'auto');

create table if not exists public.section_materials (
  id uuid primary key default gen_random_uuid(),
  section_id uuid not null references public.class_sections(id) on delete cascade,
  title text not null,
  body_md text not null default '',
  attachments jsonb not null default '[]'::jsonb,
  created_by uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_section_materials_section
  on public.section_materials(section_id, created_at desc);

create table if not exists public.assignment_submissions (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.assignments(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  attempt_id uuid references public.attempts(id) on delete set null,
  status text not null default 'submitted',
  score numeric,
  feedback_md text,
  graded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint assignment_submissions_status_check check (status in ('submitted', 'graded', 'needs_review'))
);

create index if not exists idx_assignment_submissions_assignment
  on public.assignment_submissions(assignment_id, created_at desc);

create index if not exists idx_assignment_submissions_user
  on public.assignment_submissions(user_id, created_at desc);

drop trigger if exists trg_section_materials_updated_at on public.section_materials;
create trigger trg_section_materials_updated_at
before update on public.section_materials
for each row execute procedure public.set_updated_at();

drop trigger if exists trg_assignment_submissions_updated_at on public.assignment_submissions;
create trigger trg_assignment_submissions_updated_at
before update on public.assignment_submissions
for each row execute procedure public.set_updated_at();

alter table public.section_materials enable row level security;
alter table public.assignment_submissions enable row level security;

drop policy if exists section_materials_select_member_or_owner on public.section_materials;
drop policy if exists section_materials_insert_owner on public.section_materials;
drop policy if exists section_materials_update_owner on public.section_materials;
drop policy if exists section_materials_delete_owner on public.section_materials;

create policy section_materials_select_member_or_owner
  on public.section_materials
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.class_sections cs
      where cs.id = section_materials.section_id
        and cs.created_by = auth.uid()
    )
    or exists (
      select 1
      from public.section_members sm
      where sm.section_id = section_materials.section_id
        and sm.user_id = auth.uid()
    )
  );

create policy section_materials_insert_owner
  on public.section_materials
  for insert
  to authenticated
  with check (
    created_by = auth.uid()
    and (
      exists (
        select 1
        from public.class_sections cs
        where cs.id = section_materials.section_id
          and cs.created_by = auth.uid()
      )
      or exists (
        select 1
        from public.section_members sm
        where sm.section_id = section_materials.section_id
          and sm.user_id = auth.uid()
          and sm.role in ('professor', 'ta')
      )
    )
  );

create policy section_materials_update_owner
  on public.section_materials
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.class_sections cs
      where cs.id = section_materials.section_id
        and cs.created_by = auth.uid()
    )
    or exists (
      select 1
      from public.section_members sm
      where sm.section_id = section_materials.section_id
        and sm.user_id = auth.uid()
        and sm.role in ('professor', 'ta')
    )
  )
  with check (
    exists (
      select 1
      from public.class_sections cs
      where cs.id = section_materials.section_id
        and cs.created_by = auth.uid()
    )
    or exists (
      select 1
      from public.section_members sm
      where sm.section_id = section_materials.section_id
        and sm.user_id = auth.uid()
        and sm.role in ('professor', 'ta')
    )
  );

create policy section_materials_delete_owner
  on public.section_materials
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.class_sections cs
      where cs.id = section_materials.section_id
        and cs.created_by = auth.uid()
    )
    or exists (
      select 1
      from public.section_members sm
      where sm.section_id = section_materials.section_id
        and sm.user_id = auth.uid()
        and sm.role in ('professor', 'ta')
    )
  );

drop policy if exists assignment_submissions_select_scope on public.assignment_submissions;
drop policy if exists assignment_submissions_insert_own on public.assignment_submissions;
drop policy if exists assignment_submissions_update_owner on public.assignment_submissions;
drop policy if exists assignment_submissions_delete_owner_or_self on public.assignment_submissions;

create policy assignment_submissions_select_scope
  on public.assignment_submissions
  for select
  to authenticated
  using (
    user_id = auth.uid()
    or exists (
      select 1
      from public.assignments a
      join public.class_sections cs on cs.id = a.section_id
      where a.id = assignment_submissions.assignment_id
        and cs.created_by = auth.uid()
    )
    or exists (
      select 1
      from public.assignments a
      join public.section_members sm on sm.section_id = a.section_id
      where a.id = assignment_submissions.assignment_id
        and sm.user_id = auth.uid()
        and sm.role in ('professor', 'ta')
    )
  );

create policy assignment_submissions_insert_own
  on public.assignment_submissions
  for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and exists (
      select 1
      from public.assignments a
      join public.section_members sm on sm.section_id = a.section_id
      where a.id = assignment_submissions.assignment_id
        and sm.user_id = auth.uid()
    )
  );

create policy assignment_submissions_update_owner
  on public.assignment_submissions
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.assignments a
      join public.class_sections cs on cs.id = a.section_id
      where a.id = assignment_submissions.assignment_id
        and cs.created_by = auth.uid()
    )
    or exists (
      select 1
      from public.assignments a
      join public.section_members sm on sm.section_id = a.section_id
      where a.id = assignment_submissions.assignment_id
        and sm.user_id = auth.uid()
        and sm.role in ('professor', 'ta')
    )
  )
  with check (
    exists (
      select 1
      from public.assignments a
      join public.class_sections cs on cs.id = a.section_id
      where a.id = assignment_submissions.assignment_id
        and cs.created_by = auth.uid()
    )
    or exists (
      select 1
      from public.assignments a
      join public.section_members sm on sm.section_id = a.section_id
      where a.id = assignment_submissions.assignment_id
        and sm.user_id = auth.uid()
        and sm.role in ('professor', 'ta')
    )
  );

create policy assignment_submissions_delete_owner_or_self
  on public.assignment_submissions
  for delete
  to authenticated
  using (
    user_id = auth.uid()
    or exists (
      select 1
      from public.assignments a
      join public.class_sections cs on cs.id = a.section_id
      where a.id = assignment_submissions.assignment_id
        and cs.created_by = auth.uid()
    )
  );

drop function if exists public.submit_assignment(uuid, uuid) cascade;
create function public.submit_assignment(assignment_id_input uuid, attempt_id_input uuid default null)
returns table (
  submission_id uuid,
  status text,
  score numeric
)
language plpgsql
security definer
set search_path = public
as $$
declare
  assignment_row public.assignments%rowtype;
  chosen_attempt_id uuid;
  attempt_row public.attempts%rowtype;
  submission_status text := 'submitted';
  submission_score numeric := null;
  feedback_text text := null;
  has_manual_question boolean := false;
  submissions_count int := 0;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  select *
  into assignment_row
  from public.assignments
  where id = assignment_id_input;

  if not found then
    raise exception 'Assignment not found';
  end if;

  if not exists (
    select 1
    from public.section_members sm
    where sm.section_id = assignment_row.section_id
      and sm.user_id = auth.uid()
  ) then
    raise exception 'You are not enrolled in this section';
  end if;

  if assignment_row.due_at is not null and assignment_row.allow_late = false and now() > assignment_row.due_at then
    raise exception 'Assignment is past due';
  end if;

  if assignment_row.max_attempts is not null then
    select count(*)::int
    into submissions_count
    from public.assignment_submissions s
    where s.assignment_id = assignment_row.id
      and s.user_id = auth.uid();

    if submissions_count >= assignment_row.max_attempts then
      raise exception 'Maximum attempts reached';
    end if;
  end if;

  if attempt_id_input is not null then
    chosen_attempt_id := attempt_id_input;
  else
    select a.id
    into chosen_attempt_id
    from public.attempts a
    where a.user_id = auth.uid()
      and a.quiz_set_id::text = assignment_row.quiz_set_id::text
      and a.completed_at is not null
    order by a.completed_at desc nulls last, a.created_at desc
    limit 1;
  end if;

  if chosen_attempt_id is null then
    raise exception 'Complete the assigned quiz before submitting';
  end if;

  select *
  into attempt_row
  from public.attempts a
  where a.id = chosen_attempt_id
    and a.user_id = auth.uid()
    and a.quiz_set_id::text = assignment_row.quiz_set_id::text
    and a.completed_at is not null;

  if not found then
    raise exception 'A completed attempt for this assignment is required';
  end if;

  select exists (
    select 1
    from public.questions q
    where q.quiz_set_id::text = assignment_row.quiz_set_id::text
      and q.type in ('free', 'fill')
  )
  into has_manual_question;

  if assignment_row.grading_mode = 'manual' or (assignment_row.grading_mode = 'mixed' and has_manual_question) then
    submission_status := 'needs_review';
    feedback_text := 'Waiting for instructor review.';
    submission_score := null;
  elsif has_manual_question then
    submission_status := 'needs_review';
    feedback_text := 'Contains free-response items requiring review.';
    submission_score := null;
  else
    submission_status := 'graded';
    submission_score := attempt_row.score;
    feedback_text := 'Auto-graded from your completed attempt.';
  end if;

  insert into public.assignment_submissions (
    assignment_id,
    user_id,
    attempt_id,
    status,
    score,
    feedback_md,
    graded_at
  )
  values (
    assignment_row.id,
    auth.uid(),
    attempt_row.id,
    submission_status,
    submission_score,
    feedback_text,
    case when submission_status = 'graded' then now() else null end
  )
  returning id, assignment_submissions.status, assignment_submissions.score
  into submission_id, status, score;

  return next;
end;
$$;

grant execute on function public.submit_assignment(uuid, uuid) to authenticated;

drop function if exists public.get_section_gradebook(uuid) cascade;
create function public.get_section_gradebook(section_id_input uuid)
returns table (
  assignment_id uuid,
  assignment_title text,
  student_id uuid,
  display_name text,
  latest_status text,
  latest_score numeric,
  submitted_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
with allowed as (
  select 1
  from public.class_sections cs
  where cs.id = section_id_input
    and (
      cs.created_by = auth.uid()
      or exists (
        select 1 from public.section_members sm
        where sm.section_id = cs.id
          and sm.user_id = auth.uid()
          and sm.role in ('professor', 'ta')
      )
    )
),
latest_submissions as (
  select
    s.assignment_id,
    s.user_id,
    s.status,
    s.score,
    s.created_at,
    row_number() over (partition by s.assignment_id, s.user_id order by s.created_at desc) as rn
  from public.assignment_submissions s
  join public.assignments a on a.id = s.assignment_id
  where a.section_id = section_id_input
)
select
  a.id as assignment_id,
  coalesce(a.title, 'Homework Assignment') as assignment_title,
  p.id as student_id,
  p.display_name,
  ls.status as latest_status,
  ls.score as latest_score,
  ls.created_at as submitted_at
from public.assignments a
join public.section_members sm on sm.section_id = a.section_id and sm.role = 'student'
join public.profiles p on p.id = sm.user_id
left join latest_submissions ls
  on ls.assignment_id = a.id
 and ls.user_id = p.id
 and ls.rn = 1
where a.section_id = section_id_input
  and exists (select 1 from allowed)
order by a.created_at desc, p.display_name asc;
$$;

grant execute on function public.get_section_gradebook(uuid) to authenticated;
