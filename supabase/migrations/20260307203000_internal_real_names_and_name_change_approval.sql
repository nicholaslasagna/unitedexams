-- Internal name resolution should prefer real names everywhere except the leaderboard.
-- Real-name changes after signup require university-admin approval.

create table if not exists public.profile_name_change_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  university_id uuid not null references public.universities(id) on delete cascade,
  current_real_name text,
  requested_real_name text not null,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected', 'cancelled')),
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  rejection_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profile_name_change_requests_requested_name_len_check
    check (char_length(trim(requested_real_name)) between 1 and 32)
);

create index if not exists idx_profile_name_change_requests_user_created
  on public.profile_name_change_requests(user_id, created_at desc);

create index if not exists idx_profile_name_change_requests_university_status
  on public.profile_name_change_requests(university_id, status, created_at desc);

create unique index if not exists idx_profile_name_change_requests_pending_unique
  on public.profile_name_change_requests(user_id)
  where status = 'pending';

alter table public.profile_name_change_requests enable row level security;

drop trigger if exists trg_profile_name_change_requests_updated_at on public.profile_name_change_requests;
create trigger trg_profile_name_change_requests_updated_at
before update on public.profile_name_change_requests
for each row execute procedure public.set_updated_at();

drop policy if exists profile_name_change_requests_select_own on public.profile_name_change_requests;
drop policy if exists profile_name_change_requests_select_admin on public.profile_name_change_requests;
drop policy if exists profile_name_change_requests_insert_own on public.profile_name_change_requests;
drop policy if exists profile_name_change_requests_update_admin on public.profile_name_change_requests;

create policy profile_name_change_requests_select_own
  on public.profile_name_change_requests
  for select
  to authenticated
  using (user_id = auth.uid());

create policy profile_name_change_requests_select_admin
  on public.profile_name_change_requests
  for select
  to authenticated
  using (public.is_university_admin(auth.uid(), university_id));

create policy profile_name_change_requests_insert_own
  on public.profile_name_change_requests
  for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and status = 'pending'
    and reviewed_by is null
    and reviewed_at is null
  );

create policy profile_name_change_requests_update_admin
  on public.profile_name_change_requests
  for update
  to authenticated
  using (public.is_university_admin(auth.uid(), university_id))
  with check (public.is_university_admin(auth.uid(), university_id));

drop function if exists public.resolve_internal_name(text, text, text);
create function public.resolve_internal_name(
  real_name_input text,
  display_name_input text,
  fallback_input text default null
)
returns text
language sql
immutable
set search_path = public
as $$
  select coalesce(
    nullif(trim(real_name_input), ''),
    nullif(trim(display_name_input), ''),
    nullif(trim(fallback_input), ''),
    'User'
  );
$$;

grant execute on function public.resolve_internal_name(text, text, text) to anon, authenticated, service_role;

drop function if exists public.get_my_profile_name_change_requests();
create function public.get_my_profile_name_change_requests()
returns table (
  request_id uuid,
  current_real_name text,
  requested_real_name text,
  status text,
  reviewed_at timestamptz,
  rejection_reason text,
  created_at timestamptz,
  updated_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select
    r.id as request_id,
    r.current_real_name,
    r.requested_real_name,
    r.status,
    r.reviewed_at,
    r.rejection_reason,
    r.created_at,
    r.updated_at
  from public.profile_name_change_requests r
  where r.user_id = auth.uid()
  order by
    case when r.status = 'pending' then 0 else 1 end,
    r.created_at desc;
$$;

grant execute on function public.get_my_profile_name_change_requests() to authenticated;

drop function if exists public.get_managed_profile_name_change_requests();
create function public.get_managed_profile_name_change_requests()
returns table (
  request_id uuid,
  user_id uuid,
  account_role text,
  email text,
  display_name text,
  real_name text,
  current_name text,
  requested_real_name text,
  status text,
  reviewed_at timestamptz,
  rejection_reason text,
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
    r.id as request_id,
    p.id as user_id,
    p.role as account_role,
    coalesce(au.email, p.email) as email,
    p.display_name,
    p.real_name,
    public.resolve_internal_name(p.real_name, p.display_name, 'Account') as current_name,
    r.requested_real_name,
    r.status,
    r.reviewed_at,
    r.rejection_reason,
    r.created_at,
    r.updated_at
  from admin_scope a
  join public.profile_name_change_requests r on r.university_id = a.university_id
  join public.profiles p on p.id = r.user_id
  left join auth.users au on au.id = p.id
  order by
    case when r.status = 'pending' then 0 else 1 end,
    r.created_at desc;
$$;

grant execute on function public.get_managed_profile_name_change_requests() to authenticated;

drop function if exists public.request_profile_name_change(text);
create function public.request_profile_name_change(requested_real_name_input text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  actor_profile public.profiles%rowtype;
  normalized_requested_name text;
  existing_request_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  select *
  into actor_profile
  from public.profiles
  where id = auth.uid();

  if actor_profile.id is null then
    raise exception 'Profile not found';
  end if;

  if actor_profile.university_id is null then
    raise exception 'A university must be assigned before requesting a name change';
  end if;

  normalized_requested_name := nullif(trim(coalesce(requested_real_name_input, '')), '');
  if normalized_requested_name is null then
    raise exception 'Requested real name is required';
  end if;

  if not public.real_name_allowed(normalized_requested_name) then
    raise exception 'Requested real name is invalid';
  end if;

  if nullif(trim(coalesce(actor_profile.real_name, '')), '') = normalized_requested_name then
    raise exception 'Requested real name already matches your current name';
  end if;

  update public.profile_name_change_requests
  set university_id = actor_profile.university_id,
      current_real_name = actor_profile.real_name,
      requested_real_name = normalized_requested_name,
      rejection_reason = null,
      reviewed_by = null,
      reviewed_at = null,
      updated_at = now()
  where user_id = auth.uid()
    and status = 'pending'
  returning id into existing_request_id;

  if existing_request_id is null then
    insert into public.profile_name_change_requests (
      user_id,
      university_id,
      current_real_name,
      requested_real_name,
      status
    )
    values (
      auth.uid(),
      actor_profile.university_id,
      actor_profile.real_name,
      normalized_requested_name,
      'pending'
    )
    returning id into existing_request_id;
  end if;

  return existing_request_id;
end;
$$;

grant execute on function public.request_profile_name_change(text) to authenticated;

drop function if exists public.review_profile_name_change(uuid, boolean, text);
create function public.review_profile_name_change(
  request_id_input uuid,
  approved_input boolean,
  rejection_reason_input text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  admin_university_id uuid;
  request_row public.profile_name_change_requests%rowtype;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  select p.university_id
  into admin_university_id
  from public.profiles p
  where p.id = auth.uid()
    and p.role = 'admin';

  if admin_university_id is null then
    raise exception 'University-admin access required';
  end if;

  select *
  into request_row
  from public.profile_name_change_requests
  where id = request_id_input
  for update;

  if request_row.id is null then
    raise exception 'Name change request not found';
  end if;

  if request_row.university_id <> admin_university_id then
    raise exception 'You can only review requests for your university';
  end if;

  if request_row.status <> 'pending' then
    raise exception 'This name change request has already been reviewed';
  end if;

  if approved_input then
    update public.profiles
    set real_name = request_row.requested_real_name,
        updated_at = now()
    where id = request_row.user_id;

    update public.profile_name_change_requests
    set status = 'approved',
        reviewed_by = auth.uid(),
        reviewed_at = now(),
        rejection_reason = null,
        updated_at = now()
    where id = request_row.id;
  else
    update public.profile_name_change_requests
    set status = 'rejected',
        reviewed_by = auth.uid(),
        reviewed_at = now(),
        rejection_reason = nullif(trim(coalesce(rejection_reason_input, '')), ''),
        updated_at = now()
    where id = request_row.id;
  end if;

  return request_row.user_id;
end;
$$;

grant execute on function public.review_profile_name_change(uuid, boolean, text) to authenticated;

drop function if exists public.get_managed_professors();
create function public.get_managed_professors()
returns table (
  professor_id uuid,
  display_name text,
  real_name text,
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
    p.real_name,
    coalesce(au.email, p.email) as email,
    p.professor_verified,
    p.professor_verified_at,
    p.created_at
  from admin_scope a
  join public.profiles p on p.university_id = a.university_id
  left join auth.users au on au.id = p.id
  where p.role = 'professor'
  order by public.resolve_internal_name(p.real_name, p.display_name, 'Professor') asc;
$$;

grant execute on function public.get_managed_professors() to authenticated;

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
    public.resolve_internal_name(pp.real_name, pp.display_name, 'Instructor') as posted_by_name
  from public.section_announcements sa
  join public.class_sections cs on cs.id = sa.section_id
  left join public.profiles pp on pp.id = sa.posted_by
  where public.section_member_exists(sa.section_id, auth.uid())
  order by sa.created_at desc
  limit least(300, greatest(1, coalesce(limit_count, 100)));
$$;

grant execute on function public.get_my_announcements(int) to authenticated;

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
    public.resolve_internal_name(p.real_name, p.display_name, 'Student') as display_name
  from public.section_members sm
  join public.profiles p on p.id = sm.user_id
  left join auth.users au on au.id = sm.user_id
  where sm.section_id = section_id_input
    and sm.role = 'student'
    and public.section_professor_exists(section_id_input, auth.uid())
    and coalesce(au.email, p.email) is not null;
$$;

grant execute on function public.get_section_notification_recipients(uuid) to authenticated;

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
    public.resolve_internal_name(p.real_name, p.display_name, 'Student') as student_display_name,
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
  public.resolve_internal_name(p.real_name, p.display_name, 'Student') as display_name,
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
  and coalesce(p.role, 'student') = 'student'
  and exists (select 1 from allowed)
order by a.created_at desc, public.resolve_internal_name(p.real_name, p.display_name, 'Student') asc;
$$;

grant execute on function public.get_section_gradebook(uuid) to authenticated;

drop function if exists public.get_exam_monitor(uuid) cascade;
create function public.get_exam_monitor(exam_id_input uuid)
returns table (
  attempt_id uuid,
  student_id uuid,
  student_display_name text,
  started_at timestamptz,
  submitted_at timestamptz,
  expires_at timestamptz,
  status text,
  score numeric,
  suspicion_score integer,
  flagged boolean,
  time_remaining_seconds integer
)
language sql
stable
security definer
set search_path = public
as $$
  with exam_meta as (
    select
      e.id,
      e.section_id,
      e.ends_at,
      coalesce(ar.suspicion_threshold, 100) as threshold
    from public.exams e
    left join public.exam_access_rules ar on ar.exam_id = e.id
    where e.id = exam_id_input
  )
  select
    ea.id as attempt_id,
    ea.student_id,
    public.resolve_internal_name(p.real_name, p.display_name, 'Student') as student_display_name,
    ea.started_at,
    ea.submitted_at,
    ea.expires_at,
    ea.status,
    ea.score,
    ea.suspicion_score,
    (ea.suspicion_score >= em.threshold) as flagged,
    case
      when ea.status <> 'in_progress' then 0
      else greatest(
        0,
        floor(extract(epoch from (least(coalesce(ea.expires_at, em.ends_at), em.ends_at) - now())))::int
      )
    end as time_remaining_seconds
  from public.exam_attempts ea
  join exam_meta em on em.id = ea.exam_id
  join public.profiles p on p.id = ea.student_id
  where public.section_professor_exists(em.section_id, auth.uid())
  order by ea.started_at desc nulls last, ea.created_at desc;
$$;

grant execute on function public.get_exam_monitor(uuid) to authenticated;

drop function if exists public.get_exam_events(uuid, uuid) cascade;
create function public.get_exam_events(exam_id_input uuid, attempt_id_input uuid default null)
returns table (
  exam_attempt_id uuid,
  student_id uuid,
  student_display_name text,
  event_type text,
  event_payload jsonb,
  created_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select
    ee.exam_attempt_id,
    ea.student_id,
    public.resolve_internal_name(p.real_name, p.display_name, 'Student') as student_display_name,
    ee.event_type,
    ee.event_payload,
    ee.created_at
  from public.exam_events ee
  join public.exam_attempts ea on ea.id = ee.exam_attempt_id
  join public.exams e on e.id = ea.exam_id
  join public.profiles p on p.id = ea.student_id
  where e.id = exam_id_input
    and (attempt_id_input is null or ee.exam_attempt_id = attempt_id_input)
    and (
      public.section_professor_exists(e.section_id, auth.uid())
      or ea.student_id = auth.uid()
    )
  order by ee.created_at desc
  limit 1000;
$$;

grant execute on function public.get_exam_events(uuid, uuid) to authenticated;
