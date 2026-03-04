-- United Exams initial schema + security (Supabase Postgres)

create extension if not exists pgcrypto;

-- =====================================
-- Core tables
-- =====================================

create table if not exists public.universities (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  country text,
  state text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text not null,
  real_name text,
  show_real_name boolean not null default false,
  university_id uuid references public.universities(id) on delete set null,
  show_university boolean not null default false,
  avatar_url text,
  role text not null default 'student',
  reset_required boolean not null default false,
  password_changed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_role_check check (role in ('student', 'professor', 'admin'))
);

create table if not exists public.user_preferences (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  theme_mode text not null default 'dark',
  accent_hue int not null default 265,
  accent_strength int not null default 60,
  reduce_motion boolean not null default false,
  dashboard_layout text not null default 'default',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint user_preferences_theme_check check (theme_mode in ('dark', 'light', 'system')),
  constraint user_preferences_accent_hue_check check (accent_hue between 220 and 295),
  constraint user_preferences_accent_strength_check check (accent_strength between 0 and 100)
);

create table if not exists public.courses (
  id text primary key,
  code text not null,
  title text not null,
  description text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.quiz_sets (
  id text primary key,
  course_id text not null references public.courses(id) on delete cascade,
  title text not null,
  description text not null,
  difficulty text not null,
  est_minutes int not null,
  tags text[] not null default '{}',
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  constraint quiz_sets_difficulty_check check (difficulty in ('intro', 'medium', 'hard'))
);

create table if not exists public.questions (
  id text primary key,
  quiz_set_id text not null references public.quiz_sets(id) on delete cascade,
  type text not null,
  prompt_md text not null,
  options jsonb,
  correct jsonb,
  explanation_md text not null,
  walkthrough_steps jsonb,
  references_data jsonb,
  created_at timestamptz not null default now(),
  constraint questions_type_check check (type in ('single', 'multi', 'free'))
);

create table if not exists public.attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  quiz_set_id text not null,
  started_at timestamptz,
  completed_at timestamptz,
  score numeric not null,
  correct_count int not null,
  total_count int not null,
  time_spent_seconds int not null,
  settings jsonb not null default '{}'::jsonb,
  points_awarded int not null default 0,
  created_at timestamptz not null default now(),
  constraint attempts_score_check check (score >= 0 and score <= 100)
);

create table if not exists public.attempt_answers (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null references public.attempts(id) on delete cascade,
  question_id text not null,
  selected jsonb,
  is_correct boolean,
  time_spent_seconds int,
  created_at timestamptz not null default now()
);

create table if not exists public.mastery_by_topic (
  user_id uuid not null references public.profiles(id) on delete cascade,
  course_id text not null references public.courses(id) on delete cascade,
  tag text not null,
  mastery numeric not null default 0,
  attempts_count int not null default 0,
  correct_count int not null default 0,
  updated_at timestamptz not null default now(),
  primary key (user_id, course_id, tag)
);

create table if not exists public.streaks (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  current_streak int not null default 0,
  best_streak int not null default 0,
  last_study_date date,
  updated_at timestamptz not null default now()
);

create table if not exists public.leaderboard_cache (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  display_name text not null,
  show_real_name boolean not null default false,
  real_name text,
  show_university boolean not null default false,
  university_name text,
  points int not null default 0,
  streak int not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  name text,
  message text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_quiz_sets_course_id on public.quiz_sets(course_id);
create index if not exists idx_questions_quiz_set_id on public.questions(quiz_set_id);
create index if not exists idx_attempts_user_id_created_at on public.attempts(user_id, created_at desc);
create index if not exists idx_attempts_quiz_set_user_score on public.attempts(quiz_set_id, user_id, score desc);
create index if not exists idx_attempt_answers_attempt_id on public.attempt_answers(attempt_id);
create index if not exists idx_mastery_by_topic_user_course on public.mastery_by_topic(user_id, course_id);
create index if not exists idx_leaderboard_points on public.leaderboard_cache(points desc, streak desc);

-- =====================================
-- Utility triggers/functions
-- =====================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_universities_updated_at
before update on public.universities
for each row execute procedure public.set_updated_at();

create trigger trg_profiles_updated_at
before update on public.profiles
for each row execute procedure public.set_updated_at();

create trigger trg_user_preferences_updated_at
before update on public.user_preferences
for each row execute procedure public.set_updated_at();

create or replace function public.sync_leaderboard_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  uni_name text;
begin
  select name into uni_name from public.universities where id = new.university_id;

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
  values (
    new.id,
    new.display_name,
    new.show_real_name,
    case when new.show_real_name then new.real_name else null end,
    new.show_university,
    case when new.show_university then uni_name else null end,
    0,
    0,
    now()
  )
  on conflict (user_id) do update set
    display_name = excluded.display_name,
    show_real_name = excluded.show_real_name,
    real_name = excluded.real_name,
    show_university = excluded.show_university,
    university_name = excluded.university_name,
    updated_at = now();

  return new;
end;
$$;

create trigger trg_profiles_sync_leaderboard
after insert or update of display_name, real_name, show_real_name, show_university, university_id
on public.profiles
for each row execute procedure public.sync_leaderboard_profile();

create or replace function public.sync_leaderboard_university_name()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.leaderboard_cache lc
  set university_name = case when p.show_university then new.name else null end,
      updated_at = now()
  from public.profiles p
  where p.id = lc.user_id
    and p.university_id = new.id;

  return new;
end;
$$;

create trigger trg_university_sync_leaderboard
after update of name on public.universities
for each row execute procedure public.sync_leaderboard_university_name();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  next_name text;
begin
  next_name := coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1), 'Student');

  insert into public.profiles (id, email, display_name)
  values (new.id, new.email, next_name)
  on conflict (id) do nothing;

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

create or replace function public.request_password_reset(target_email text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles
  set reset_required = true,
      updated_at = now()
  where lower(email) = lower(target_email);
end;
$$;

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

  if prior_date is null or prior_date <= new_date then
    update public.streaks
    set current_streak = next_current_streak,
        best_streak = next_best_streak,
        last_study_date = greatest(coalesce(prior_date, new_date), new_date),
        updated_at = now()
    where user_id = new.user_id;
  end if;

  if new.score > prior_best then
    personal_best_bonus := 10;
  end if;

  points_total := round(coalesce(new.score, 0))::int + personal_best_bonus + streak_bonus;

  update public.attempts
  set points_awarded = points_total,
      settings = coalesce(settings, '{}'::jsonb) || jsonb_build_object(
        'points_awarded', points_total,
        'personal_best_bonus', personal_best_bonus,
        'streak_bonus', streak_bonus,
        'streak_day_maintained', (streak_bonus > 0)
      )
  where id = new.id;

  topic_payload := coalesce(new.settings -> 'topic_breakdown', '{}'::jsonb);

  for topic_item in
    select key, value from jsonb_each(topic_payload)
  loop
    topic_total := coalesce((topic_item.value ->> 'total')::int, 0);
    topic_correct := coalesce((topic_item.value ->> 'correct')::int, 0);

    if topic_total > 0 then
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
        coalesce(new.settings ->> 'course_id', 'unknown-course'),
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

create trigger trg_attempts_apply_aggregates
after insert on public.attempts
for each row execute procedure public.apply_attempt_aggregates();

drop function if exists public.get_leaderboard(integer, integer) cascade;
create function public.get_leaderboard(limit_count int default 25, offset_count int default 0)
returns table (
  rank bigint,
  user_id uuid,
  display_name text,
  real_name text,
  university_name text,
  points int,
  streak int,
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

create or replace view public.public_profiles_for_leaderboard as
select
  p.id as user_id,
  p.display_name,
  case when p.show_real_name then p.real_name else null end as real_name,
  p.show_real_name,
  case when p.show_university then u.name else null end as university_name,
  p.show_university
from public.profiles p
left join public.universities u on u.id = p.university_id;

-- =====================================
-- RLS + grants
-- =====================================

alter table public.universities enable row level security;
alter table public.profiles enable row level security;
alter table public.user_preferences enable row level security;
alter table public.courses enable row level security;
alter table public.quiz_sets enable row level security;
alter table public.questions enable row level security;
alter table public.attempts enable row level security;
alter table public.attempt_answers enable row level security;
alter table public.mastery_by_topic enable row level security;
alter table public.streaks enable row level security;
alter table public.leaderboard_cache enable row level security;
alter table public.contact_messages enable row level security;

drop policy if exists universities_read_authenticated on public.universities;
drop policy if exists universities_insert_authenticated on public.universities;
drop policy if exists profiles_select_own on public.profiles;
drop policy if exists profiles_insert_own on public.profiles;
drop policy if exists profiles_update_own on public.profiles;
drop policy if exists user_preferences_select_own on public.user_preferences;
drop policy if exists user_preferences_insert_own on public.user_preferences;
drop policy if exists user_preferences_update_own on public.user_preferences;
drop policy if exists courses_read_all on public.courses;
drop policy if exists quiz_sets_read_all on public.quiz_sets;
drop policy if exists questions_read_all on public.questions;
drop policy if exists attempts_select_own on public.attempts;
drop policy if exists attempts_insert_own on public.attempts;
drop policy if exists attempts_update_own on public.attempts;
drop policy if exists attempt_answers_select_own on public.attempt_answers;
drop policy if exists attempt_answers_insert_own on public.attempt_answers;
drop policy if exists attempt_answers_update_own on public.attempt_answers;
drop policy if exists mastery_by_topic_select_own on public.mastery_by_topic;
drop policy if exists mastery_by_topic_insert_own on public.mastery_by_topic;
drop policy if exists mastery_by_topic_update_own on public.mastery_by_topic;
drop policy if exists streaks_select_own on public.streaks;
drop policy if exists streaks_insert_own on public.streaks;
drop policy if exists streaks_update_own on public.streaks;
drop policy if exists leaderboard_cache_read_authenticated on public.leaderboard_cache;
drop policy if exists contact_messages_insert_all on public.contact_messages;

-- Universities
create policy universities_read_authenticated
  on public.universities
  for select
  to authenticated
  using (true);

create policy universities_insert_authenticated
  on public.universities
  for insert
  to authenticated
  with check (true);

-- Profiles
create policy profiles_select_own
  on public.profiles
  for select
  to authenticated
  using (auth.uid() = id);

create policy profiles_insert_own
  on public.profiles
  for insert
  to authenticated
  with check (auth.uid() = id);

create policy profiles_update_own
  on public.profiles
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- User preferences
create policy user_preferences_select_own
  on public.user_preferences
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy user_preferences_insert_own
  on public.user_preferences
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy user_preferences_update_own
  on public.user_preferences
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Public curriculum tables
create policy courses_read_all
  on public.courses
  for select
  using (true);

create policy quiz_sets_read_all
  on public.quiz_sets
  for select
  using (true);

create policy questions_read_all
  on public.questions
  for select
  using (true);

-- Attempts
create policy attempts_select_own
  on public.attempts
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy attempts_insert_own
  on public.attempts
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy attempts_update_own
  on public.attempts
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Attempt answers
create policy attempt_answers_select_own
  on public.attempt_answers
  for select
  to authenticated
  using (
    exists (
      select 1 from public.attempts a
      where a.id = attempt_answers.attempt_id
        and a.user_id = auth.uid()
    )
  );

create policy attempt_answers_insert_own
  on public.attempt_answers
  for insert
  to authenticated
  with check (
    exists (
      select 1 from public.attempts a
      where a.id = attempt_answers.attempt_id
        and a.user_id = auth.uid()
    )
  );

create policy attempt_answers_update_own
  on public.attempt_answers
  for update
  to authenticated
  using (
    exists (
      select 1 from public.attempts a
      where a.id = attempt_answers.attempt_id
        and a.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.attempts a
      where a.id = attempt_answers.attempt_id
        and a.user_id = auth.uid()
    )
  );

-- Mastery + streaks
create policy mastery_by_topic_select_own
  on public.mastery_by_topic
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy mastery_by_topic_insert_own
  on public.mastery_by_topic
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy mastery_by_topic_update_own
  on public.mastery_by_topic
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy streaks_select_own
  on public.streaks
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy streaks_insert_own
  on public.streaks
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy streaks_update_own
  on public.streaks
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Leaderboard cache
create policy leaderboard_cache_read_authenticated
  on public.leaderboard_cache
  for select
  to authenticated
  using (true);

-- Contact messages
create policy contact_messages_insert_all
  on public.contact_messages
  for insert
  to anon, authenticated
  with check (true);

grant execute on function public.request_password_reset(text) to anon, authenticated;
grant execute on function public.get_leaderboard(int, int) to anon, authenticated;
grant select on public.public_profiles_for_leaderboard to authenticated;

-- =====================================
-- Seed core courses + starter universities
-- =====================================

insert into public.courses (id, code, title, description)
values
  ('software-engineering', 'SE-301', 'Software Engineering', 'Design, architecture, testing, and delivery systems for modern software.'),
  ('differential-equations', 'MATH-241', 'Differential Equations', 'Solve initial value and boundary value problems with rigorous step-by-step methods.'),
  ('computer-architecture', 'CE-230', 'Computer Architecture', 'RISC-V, pipelining, memory hierarchy, and performance reasoning.'),
  ('theory-of-automata', 'CS-340', 'Theory of Automata', 'Finite automata, regular languages, grammars, and computability foundations.')
on conflict (id) do nothing;

insert into public.universities (name, country)
values
  ('Westbridge University', 'US'),
  ('University of Texas at Austin', 'US'),
  ('Texas A&M University', 'US'),
  ('University of California, Berkeley', 'US'),
  ('Massachusetts Institute of Technology', 'US')
on conflict (name) do nothing;

-- Quiz set/question seeding should be done via script so content can be sourced from /data/seed safely.
