-- Adaptive onboarding, recommendations, and professor mode extensions

create extension if not exists pgcrypto;

-- =====================================================
-- User course enrollments (for onboarding + recommendations)
-- =====================================================

create table if not exists public.user_courses (
  user_id uuid not null references public.profiles(id) on delete cascade,
  course_id text not null references public.courses(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, course_id)
);

create index if not exists idx_user_courses_course_id on public.user_courses(course_id);

alter table public.user_courses enable row level security;

create policy user_courses_select_own
  on public.user_courses
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy user_courses_insert_own
  on public.user_courses
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy user_courses_delete_own
  on public.user_courses
  for delete
  to authenticated
  using (auth.uid() = user_id);

-- =====================================================
-- Recommendation RPC
-- =====================================================

create or replace function public.get_recommendations(limit_count int default 6)
returns table (
  quiz_set_id text,
  title text,
  course_id text,
  description text,
  difficulty text,
  est_minutes int,
  tags text[],
  reason text,
  recommendation_score numeric
)
language sql
stable
security definer
set search_path = public
as $$
with my_courses as (
  select uc.course_id
  from public.user_courses uc
  where uc.user_id = auth.uid()
),
weak_tags as (
  select mbt.tag,
         mbt.mastery,
         row_number() over (order by mbt.mastery asc, mbt.attempts_count desc) as rn
  from public.mastery_by_topic mbt
  where mbt.user_id = auth.uid()
),
weak_tag_list as (
  select coalesce(array_agg(tag), '{}'::text[]) as tags
  from weak_tags
  where rn <= 8
),
has_mastery as (
  select exists(select 1 from weak_tags) as present
),
candidate as (
  select
    qs.id,
    qs.title,
    qs.course_id,
    qs.description,
    qs.difficulty,
    qs.est_minutes,
    qs.tags,
    qs.created_at,
    (
      coalesce(
        (
          select count(*)::numeric
          from unnest(qs.tags) t
          where t = any((select tags from weak_tag_list))
        ),
        0
      ) * 25
      + greatest(0, 18 - qs.est_minutes)
      + case when (select present from has_mastery) then 0 else 8 end
    ) as recommendation_score,
    (
      case
        when (select present from has_mastery) then
          case
            when exists (
              select 1 from unnest(qs.tags) t where t = any((select tags from weak_tag_list))
            ) then
              'Targets weak topics: ' || coalesce(
                (
                  select string_agg(t, ', ' order by t)
                  from (
                    select distinct t
                    from unnest(qs.tags) t
                    where t = any((select tags from weak_tag_list))
                    limit 2
                  ) x
                ),
                'focused review'
              )
            else
              'Balanced reinforcement in enrolled courses'
          end
        else
          'Great next step for enrolled courses'
      end
    ) as reason
  from public.quiz_sets qs
  where qs.is_published = true
    and exists(select 1 from my_courses mc where mc.course_id = qs.course_id)
)
select
  c.id as quiz_set_id,
  c.title,
  c.course_id,
  c.description,
  c.difficulty,
  c.est_minutes,
  c.tags,
  c.reason,
  c.recommendation_score
from candidate c
order by c.recommendation_score desc, c.est_minutes asc, c.created_at desc nulls last
limit least(20, greatest(1, coalesce(limit_count, 6)));
$$;

grant execute on function public.get_recommendations(int) to authenticated;

-- =====================================================
-- Points + streak sync improvements
-- =====================================================

alter table public.attempts add column if not exists points_earned int not null default 0;

create or replace function public.sync_leaderboard_from_streak()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.leaderboard_cache
  set streak = new.current_streak,
      updated_at = now()
  where user_id = new.user_id;
  return new;
end;
$$;

drop trigger if exists trg_streak_sync_leaderboard on public.streaks;
create trigger trg_streak_sync_leaderboard
after update of current_streak, best_streak on public.streaks
for each row execute procedure public.sync_leaderboard_from_streak();

create or replace function public.apply_attempt_aggregates()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  prior_best numeric := 0;
  prior_date date;
  prior_current_streak int := 0;
  prior_best_streak int := 0;
  new_date date;
  next_current_streak int := 1;
  next_best_streak int := 1;
  streak_bonus int := 0;
  personal_best_bonus int := 0;
  points_total int := 0;
  topic_item record;
  topic_payload jsonb;
  topic_total int;
  topic_correct int;
  course_id_value text;
begin
  if new.completed_at is null then
    return new;
  end if;

  select coalesce(max(a.score), 0)
  into prior_best
  from public.attempts a
  where a.user_id = new.user_id
    and a.quiz_set_id = new.quiz_set_id
    and a.id <> new.id;

  insert into public.streaks (user_id)
  values (new.user_id)
  on conflict (user_id) do nothing;

  select s.last_study_date, s.current_streak, s.best_streak
  into prior_date, prior_current_streak, prior_best_streak
  from public.streaks s
  where s.user_id = new.user_id
  for update;

  new_date := (new.completed_at at time zone 'UTC')::date;

  if prior_date is null then
    next_current_streak := 1;
    streak_bonus := 5;
  elsif prior_date = new_date then
    next_current_streak := prior_current_streak;
    streak_bonus := 0;
  elsif prior_date = (new_date - 1) then
    next_current_streak := greatest(prior_current_streak, 0) + 1;
    streak_bonus := 5;
  elsif prior_date < (new_date - 1) then
    next_current_streak := 1;
    streak_bonus := 5;
  else
    next_current_streak := prior_current_streak;
    streak_bonus := 0;
  end if;

  next_best_streak := greatest(prior_best_streak, next_current_streak);

  update public.streaks
  set current_streak = next_current_streak,
      best_streak = next_best_streak,
      last_study_date = greatest(coalesce(prior_date, new_date), new_date),
      updated_at = now()
  where user_id = new.user_id;

  if new.score > prior_best then
    personal_best_bonus := 10;
  end if;

  points_total := round(coalesce(new.score, 0))::int + personal_best_bonus + streak_bonus;

  update public.attempts
  set points_awarded = points_total,
      points_earned = points_total,
      settings = coalesce(settings, '{}'::jsonb) || jsonb_build_object(
        'points_earned', points_total,
        'personal_best_bonus', personal_best_bonus,
        'streak_bonus', streak_bonus,
        'streak_day_maintained', (streak_bonus > 0)
      )
  where id = new.id;

  course_id_value := coalesce(new.settings ->> 'course_id', (select qs.course_id from public.quiz_sets qs where qs.id = new.quiz_set_id));
  topic_payload := coalesce(new.settings -> 'topic_breakdown', '{}'::jsonb);

  for topic_item in
    select key, value from jsonb_each(topic_payload)
  loop
    topic_total := coalesce((topic_item.value ->> 'total')::int, 0);
    topic_correct := coalesce((topic_item.value ->> 'correct')::int, 0);

    if topic_total > 0 and course_id_value is not null then
      insert into public.mastery_by_topic (
        user_id,
        course_id,
        tag,
        mastery,
        attempts_count,
        correct_count,
        updated_at
      )
      values (
        new.user_id,
        course_id_value,
        topic_item.key,
        (topic_correct::numeric / topic_total::numeric),
        topic_total,
        topic_correct,
        now()
      )
      on conflict (user_id, course_id, tag)
      do update set
        attempts_count = public.mastery_by_topic.attempts_count + excluded.attempts_count,
        correct_count = public.mastery_by_topic.correct_count + excluded.correct_count,
        mastery =
          (public.mastery_by_topic.correct_count + excluded.correct_count)::numeric /
          greatest(1, public.mastery_by_topic.attempts_count + excluded.attempts_count),
        updated_at = now();
    end if;
  end loop;

  insert into public.leaderboard_cache (
    user_id,
    display_name,
    show_real_name,
    real_name,
    show_university,
    university_name,
    points,
    streak,
    updated_at
  )
  select
    p.id,
    p.display_name,
    p.show_real_name,
    case when p.show_real_name then p.real_name else null end,
    p.show_university,
    case when p.show_university then u.name else null end,
    points_total,
    coalesce(s.current_streak, 0),
    now()
  from public.profiles p
  left join public.universities u on u.id = p.university_id
  left join public.streaks s on s.user_id = p.id
  where p.id = new.user_id
  on conflict (user_id)
  do update set
    display_name = excluded.display_name,
    show_real_name = excluded.show_real_name,
    real_name = excluded.real_name,
    show_university = excluded.show_university,
    university_name = excluded.university_name,
    points = public.leaderboard_cache.points + points_total,
    streak = excluded.streak,
    updated_at = now();

  return new;
end;
$$;

-- keep trigger in place even if previously created

drop trigger if exists trg_attempts_apply_aggregates on public.attempts;
create trigger trg_attempts_apply_aggregates
after insert on public.attempts
for each row execute procedure public.apply_attempt_aggregates();

-- ensure profile->leaderboard sync trigger exists

drop trigger if exists trg_profiles_sync_leaderboard on public.profiles;
create trigger trg_profiles_sync_leaderboard
after insert or update of display_name, real_name, show_real_name, show_university, university_id
on public.profiles
for each row execute procedure public.sync_leaderboard_profile();

-- =====================================================
-- Professor mode tables and RPC
-- =====================================================

create table if not exists public.class_sections (
  id uuid primary key default gen_random_uuid(),
  course_id text not null references public.courses(id) on delete cascade,
  name text not null,
  term text,
  join_code text not null unique,
  created_by uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.section_members (
  section_id uuid not null references public.class_sections(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'student',
  joined_at timestamptz not null default now(),
  primary key (section_id, user_id),
  constraint section_members_role_check check (role in ('student', 'professor', 'ta'))
);

create table if not exists public.assignments (
  id uuid primary key default gen_random_uuid(),
  section_id uuid not null references public.class_sections(id) on delete cascade,
  quiz_set_id text not null,
  due_at timestamptz,
  created_by uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_class_sections_created_by on public.class_sections(created_by);
create index if not exists idx_section_members_user on public.section_members(user_id);
create index if not exists idx_assignments_section on public.assignments(section_id);

create trigger trg_class_sections_updated_at
before update on public.class_sections
for each row execute procedure public.set_updated_at();

create trigger trg_assignments_updated_at
before update on public.assignments
for each row execute procedure public.set_updated_at();

alter table public.class_sections enable row level security;
alter table public.section_members enable row level security;
alter table public.assignments enable row level security;

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
      and p.role in ('professor', 'admin')
  );
$$;

create or replace function public.generate_join_code()
returns text
language plpgsql
volatile
as $$
declare
  chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  out_code text := '';
  i int;
begin
  for i in 1..8 loop
    out_code := out_code || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  end loop;
  return out_code;
end;
$$;

create or replace function public.set_section_join_code()
returns trigger
language plpgsql
as $$
begin
  if new.join_code is null or length(trim(new.join_code)) = 0 then
    loop
      new.join_code := public.generate_join_code();
      exit when not exists (select 1 from public.class_sections where join_code = new.join_code);
    end loop;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_set_section_join_code on public.class_sections;
create trigger trg_set_section_join_code
before insert on public.class_sections
for each row execute procedure public.set_section_join_code();

create policy class_sections_select_member_or_owner
  on public.class_sections
  for select
  to authenticated
  using (
    created_by = auth.uid()
    or exists (
      select 1
      from public.section_members sm
      where sm.section_id = class_sections.id
        and sm.user_id = auth.uid()
    )
  );

create policy class_sections_insert_professor
  on public.class_sections
  for insert
  to authenticated
  with check (auth.uid() = created_by and public.user_is_professor(auth.uid()));

create policy class_sections_update_owner
  on public.class_sections
  for update
  to authenticated
  using (created_by = auth.uid())
  with check (created_by = auth.uid());

create policy class_sections_delete_owner
  on public.class_sections
  for delete
  to authenticated
  using (created_by = auth.uid());

create policy section_members_select_member_or_owner
  on public.section_members
  for select
  to authenticated
  using (
    user_id = auth.uid()
    or exists (
      select 1
      from public.class_sections cs
      where cs.id = section_members.section_id
        and cs.created_by = auth.uid()
    )
  );

create policy section_members_insert_own
  on public.section_members
  for insert
  to authenticated
  with check (user_id = auth.uid());

create policy section_members_delete_self_or_owner
  on public.section_members
  for delete
  to authenticated
  using (
    user_id = auth.uid()
    or exists (
      select 1
      from public.class_sections cs
      where cs.id = section_members.section_id
        and cs.created_by = auth.uid()
    )
  );

create policy assignments_select_member_or_owner
  on public.assignments
  for select
  to authenticated
  using (
    exists (
      select 1 from public.class_sections cs
      where cs.id = assignments.section_id
        and cs.created_by = auth.uid()
    )
    or exists (
      select 1
      from public.section_members sm
      where sm.section_id = assignments.section_id
        and sm.user_id = auth.uid()
    )
  );

create policy assignments_insert_owner
  on public.assignments
  for insert
  to authenticated
  with check (
    created_by = auth.uid()
    and exists (
      select 1 from public.class_sections cs
      where cs.id = assignments.section_id
        and cs.created_by = auth.uid()
    )
  );

create policy assignments_update_owner
  on public.assignments
  for update
  to authenticated
  using (
    exists (
      select 1 from public.class_sections cs
      where cs.id = assignments.section_id
        and cs.created_by = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.class_sections cs
      where cs.id = assignments.section_id
        and cs.created_by = auth.uid()
    )
  );

create policy assignments_delete_owner
  on public.assignments
  for delete
  to authenticated
  using (
    exists (
      select 1 from public.class_sections cs
      where cs.id = assignments.section_id
        and cs.created_by = auth.uid()
    )
  );

create or replace function public.join_section_by_code(join_code_input text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  target_section_id uuid;
begin
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

create or replace function public.regenerate_section_join_code(section_id_input uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  next_code text;
begin
  if not exists (
    select 1 from public.class_sections cs
    where cs.id = section_id_input
      and cs.created_by = auth.uid()
  ) then
    raise exception 'Only section owner can regenerate join code';
  end if;

  loop
    next_code := public.generate_join_code();
    exit when not exists (select 1 from public.class_sections where join_code = next_code);
  end loop;

  update public.class_sections
  set join_code = next_code,
      updated_at = now()
  where id = section_id_input;

  return next_code;
end;
$$;

grant execute on function public.regenerate_section_join_code(uuid) to authenticated;

create or replace function public.get_section_analytics(section_id_input uuid)
returns table (
  avg_score numeric,
  completion_count bigint,
  score_buckets jsonb,
  weak_tags jsonb
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
    and cs.created_by = auth.uid()
),
members as (
  select sm.user_id
  from public.section_members sm
  where sm.section_id = section_id_input
),
section_assignments as (
  select a.quiz_set_id
  from public.assignments a
  where a.section_id = section_id_input
),
relevant_attempts as (
  select a.*
  from public.attempts a
  where a.user_id in (select user_id from members)
    and (
      not exists(select 1 from section_assignments)
      or a.quiz_set_id in (select quiz_set_id from section_assignments)
    )
),
bucketed as (
  select
    count(*) filter (where score >= 90) as b90,
    count(*) filter (where score >= 80 and score < 90) as b80,
    count(*) filter (where score >= 60 and score < 80) as b60,
    count(*) filter (where score < 60) as b0
  from relevant_attempts
),
weak as (
  select
    tag,
    sum(greatest(total - correct, 0)) as misses
  from (
    select
      key as tag,
      coalesce((value ->> 'total')::int, 0) as total,
      coalesce((value ->> 'correct')::int, 0) as correct
    from relevant_attempts,
    lateral jsonb_each(coalesce(relevant_attempts.settings -> 'topic_breakdown', '{}'::jsonb))
  ) x
  group by tag
  order by misses desc
  limit 8
)
select
  coalesce((select avg(score) from relevant_attempts), 0) as avg_score,
  coalesce((select count(*) from relevant_attempts), 0) as completion_count,
  jsonb_build_object(
    '90_plus', coalesce((select b90 from bucketed), 0),
    '80_89', coalesce((select b80 from bucketed), 0),
    '60_79', coalesce((select b60 from bucketed), 0),
    'below_60', coalesce((select b0 from bucketed), 0)
  ) as score_buckets,
  coalesce(
    (
      select jsonb_agg(jsonb_build_object('tag', weak.tag, 'misses', weak.misses))
      from weak
    ),
    '[]'::jsonb
  ) as weak_tags
where exists (select 1 from allowed);
$$;

grant execute on function public.get_section_analytics(uuid) to authenticated;

-- =====================================================
-- Self-service account deletion (settings danger zone)
-- =====================================================

create or replace function public.delete_my_account(confirmation_text text)
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if confirmation_text is distinct from 'DELETE' then
    raise exception 'Invalid confirmation text';
  end if;

  delete from auth.users
  where id = auth.uid();
end;
$$;

grant execute on function public.delete_my_account(text) to authenticated;
