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
  attempt_settings jsonb;
  has_points_earned boolean := false;
  has_points_awarded boolean := false;
  update_sql text;
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
  attempt_settings := coalesce(new.settings, '{}'::jsonb) || jsonb_build_object(
    'points_earned', points_total,
    'points_awarded', points_total,
    'personal_best_bonus', personal_best_bonus,
    'streak_bonus', streak_bonus,
    'streak_day_maintained', (streak_bonus > 0)
  );

  select exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'attempts'
      and column_name = 'points_earned'
  ) into has_points_earned;

  select exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'attempts'
      and column_name = 'points_awarded'
  ) into has_points_awarded;

  update_sql := 'update public.attempts set settings = $1';
  if has_points_earned then
    update_sql := update_sql || ', points_earned = $2';
  end if;
  if has_points_awarded then
    update_sql := update_sql || ', points_awarded = $2';
  end if;
  update_sql := update_sql || ' where id = $3';

  execute update_sql using attempt_settings, points_total, new.id;

  course_id_value := coalesce(
    new.settings ->> 'course_id',
    (select qs.course_id from public.quiz_sets qs where qs.id = new.quiz_set_id)
  );
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

drop trigger if exists trg_attempts_apply_aggregates on public.attempts;
create trigger trg_attempts_apply_aggregates
after insert on public.attempts
for each row execute procedure public.apply_attempt_aggregates();
