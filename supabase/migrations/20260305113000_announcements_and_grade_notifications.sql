-- Section announcements + notification payload RPCs + gradebook latest submission id.

create table if not exists public.section_announcements (
  id uuid primary key default gen_random_uuid(),
  section_id uuid not null references public.class_sections(id) on delete cascade,
  posted_by uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  message_md text not null,
  send_email boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint section_announcements_title_len_check check (char_length(trim(title)) between 3 and 160),
  constraint section_announcements_message_len_check check (char_length(trim(message_md)) between 1 and 12000)
);

create index if not exists idx_section_announcements_section_created_at
  on public.section_announcements(section_id, created_at desc);

alter table public.section_announcements enable row level security;

drop policy if exists section_announcements_select_member on public.section_announcements;
drop policy if exists section_announcements_insert_professor on public.section_announcements;
drop policy if exists section_announcements_update_professor on public.section_announcements;
drop policy if exists section_announcements_delete_professor on public.section_announcements;

create policy section_announcements_select_member
  on public.section_announcements
  for select
  to authenticated
  using (public.section_member_exists(section_id, auth.uid()));

create policy section_announcements_insert_professor
  on public.section_announcements
  for insert
  to authenticated
  with check (
    posted_by = auth.uid()
    and public.section_professor_exists(section_id, auth.uid())
  );

create policy section_announcements_update_professor
  on public.section_announcements
  for update
  to authenticated
  using (public.section_professor_exists(section_id, auth.uid()))
  with check (public.section_professor_exists(section_id, auth.uid()));

create policy section_announcements_delete_professor
  on public.section_announcements
  for delete
  to authenticated
  using (public.section_professor_exists(section_id, auth.uid()));

drop trigger if exists trg_section_announcements_updated_at on public.section_announcements;
create trigger trg_section_announcements_updated_at
before update on public.section_announcements
for each row execute procedure public.set_updated_at();

-- Unified announcement feed for current user (students + professors).
drop function if exists public.get_my_announcements(integer);
create function public.get_my_announcements(limit_count int default 100)
returns table (
  announcement_id uuid,
  section_id uuid,
  section_name text,
  course_id text,
  title text,
  message_md text,
  created_at timestamptz,
  posted_by uuid,
  posted_by_name text
)
language sql
stable
security definer
set search_path = public
as $$
  select
    sa.id as announcement_id,
    sa.section_id,
    coalesce(nullif(trim(cs.name), ''), nullif(trim(cs.section_name), ''), 'Untitled Section') as section_name,
    cs.course_id,
    sa.title,
    sa.message_md,
    sa.created_at,
    sa.posted_by,
    coalesce(pp.display_name, 'Instructor') as posted_by_name
  from public.section_announcements sa
  join public.class_sections cs on cs.id = sa.section_id
  left join public.profiles pp on pp.id = sa.posted_by
  where public.section_member_exists(sa.section_id, auth.uid())
  order by sa.created_at desc
  limit least(300, greatest(1, coalesce(limit_count, 100)));
$$;

grant execute on function public.get_my_announcements(int) to authenticated;

-- Recipient list for section notifications (announcement broadcasts).
drop function if exists public.get_section_notification_recipients(uuid);
create function public.get_section_notification_recipients(section_id_input uuid)
returns table (
  user_id uuid,
  email text,
  display_name text
)
language sql
stable
security definer
set search_path = public, auth
as $$
  select
    sm.user_id,
    coalesce(au.email, p.email) as email,
    p.display_name
  from public.section_members sm
  join public.profiles p on p.id = sm.user_id
  left join auth.users au on au.id = sm.user_id
  where sm.section_id = section_id_input
    and sm.role = 'student'
    and public.section_professor_exists(section_id_input, auth.uid())
    and coalesce(au.email, p.email) is not null;
$$;

grant execute on function public.get_section_notification_recipients(uuid) to authenticated;

-- Grade-change payload for professor-triggered email notices.
drop function if exists public.get_grade_change_notification_payload(uuid);
create function public.get_grade_change_notification_payload(submission_id_input uuid)
returns table (
  submission_id uuid,
  section_id uuid,
  section_name text,
  course_id text,
  assignment_title text,
  student_user_id uuid,
  student_email text,
  student_display_name text,
  status text,
  score numeric,
  feedback_md text,
  graded_at timestamptz,
  updated_at timestamptz
)
language sql
stable
security definer
set search_path = public, auth
as $$
  select
    s.id as submission_id,
    cs.id as section_id,
    coalesce(nullif(trim(cs.name), ''), nullif(trim(cs.section_name), ''), 'Untitled Section') as section_name,
    cs.course_id,
    coalesce(a.title, 'Assignment') as assignment_title,
    s.user_id as student_user_id,
    coalesce(au.email, p.email) as student_email,
    p.display_name as student_display_name,
    s.status,
    s.score,
    s.feedback_md,
    s.graded_at,
    s.updated_at
  from public.assignment_submissions s
  join public.assignments a on a.id = s.assignment_id
  join public.class_sections cs on cs.id = a.section_id
  join public.profiles p on p.id = s.user_id
  left join auth.users au on au.id = s.user_id
  where s.id = submission_id_input
    and public.section_professor_exists(cs.id, auth.uid())
  limit 1;
$$;

grant execute on function public.get_grade_change_notification_payload(uuid) to authenticated;

-- Extend gradebook RPC to include latest submission id (for grade edit + email notifications).
drop function if exists public.get_section_gradebook(uuid) cascade;
create function public.get_section_gradebook(section_id_input uuid)
returns table (
  assignment_id uuid,
  assignment_title text,
  student_id uuid,
  display_name text,
  latest_submission_id uuid,
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
      or cs.owner_id = auth.uid()
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
    s.id as submission_id,
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
  ls.submission_id as latest_submission_id,
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
