-- Exclude professors/TAs from gradebook views and block grading/reviewing non-student targets.

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
    coalesce(s.graded_at, s.updated_at, s.created_at) as activity_at,
    row_number() over (
      partition by s.assignment_id, s.user_id
      order by coalesce(s.graded_at, s.updated_at, s.created_at) desc, s.created_at desc
    ) as rn
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
  ls.activity_at as submitted_at
from public.assignments a
join public.section_members sm
  on sm.section_id = a.section_id
 and coalesce(sm.role, sm.role_in_section, 'student') = 'student'
join public.profiles p
  on p.id = sm.user_id
 and p.role = 'student'
left join latest_submissions ls
  on ls.assignment_id = a.id
 and ls.user_id = p.id
 and ls.rn = 1
where a.section_id = section_id_input
  and exists (select 1 from allowed)
order by a.created_at desc, p.display_name asc;
$$;

grant execute on function public.get_section_gradebook(uuid) to authenticated;

drop function if exists public.upsert_manual_grade(uuid, uuid, text, numeric, text) cascade;
create function public.upsert_manual_grade(
  assignment_id_input uuid,
  student_id_input uuid,
  status_input text default 'graded',
  score_input numeric default null,
  feedback_input text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  assignment_row public.assignments%rowtype;
  target_submission_id uuid;
  normalized_status text := lower(trim(coalesce(status_input, 'graded')));
  normalized_feedback text := nullif(trim(coalesce(feedback_input, '')), '');
  normalized_score numeric := null;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  select *
  into assignment_row
  from public.assignments
  where id = assignment_id_input;

  if assignment_row.id is null then
    raise exception 'Assignment not found';
  end if;

  if normalized_status not in ('submitted', 'graded', 'needs_review') then
    raise exception 'Invalid status';
  end if;

  if not public.section_professor_exists(assignment_row.section_id, auth.uid()) then
    raise exception 'Only section professors can set grades';
  end if;

  if student_id_input = auth.uid() then
    raise exception 'Professors cannot grade themselves';
  end if;

  if not exists (
    select 1
    from public.section_members sm
    join public.profiles p on p.id = sm.user_id
    where sm.section_id = assignment_row.section_id
      and sm.user_id = student_id_input
      and coalesce(sm.role, sm.role_in_section, 'student') = 'student'
      and p.role = 'student'
  ) then
    raise exception 'Only enrolled students can be graded for this section';
  end if;

  if normalized_status = 'graded' then
    if score_input is null then
      raise exception 'Score is required when status is graded';
    end if;

    if score_input < 0 or score_input > 100 then
      raise exception 'Score must be between 0 and 100';
    end if;

    normalized_score := round(score_input, 2);
  end if;

  select s.id
  into target_submission_id
  from public.assignment_submissions s
  where s.assignment_id = assignment_id_input
    and s.user_id = student_id_input
  order by coalesce(s.graded_at, s.updated_at, s.created_at) desc, s.created_at desc, s.id desc
  limit 1
  for update;

  if target_submission_id is null then
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
      assignment_id_input,
      student_id_input,
      null,
      normalized_status,
      normalized_score,
      normalized_feedback,
      case when normalized_status = 'graded' then now() else null end
    )
    returning id into target_submission_id;
  else
    update public.assignment_submissions
    set status = normalized_status,
        score = normalized_score,
        feedback_md = normalized_feedback,
        graded_at = case when normalized_status = 'graded' then now() else null end,
        updated_at = now()
    where id = target_submission_id;
  end if;

  return target_submission_id;
end;
$$;

grant execute on function public.upsert_manual_grade(uuid, uuid, text, numeric, text) to authenticated;

drop function if exists public.get_assignment_submission_review(uuid, uuid) cascade;
create function public.get_assignment_submission_review(assignment_id_input uuid, student_id_input uuid)
returns jsonb
language plpgsql
security definer
set search_path = 'public'
as $$
declare
  assignment_row public.assignments%rowtype;
  submission_row public.assignment_submissions%rowtype;
  attempt_row public.attempts%rowtype;
  submission_payload jsonb;
  attempt_payload jsonb := null;
  question_payload jsonb := '[]'::jsonb;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  select *
  into assignment_row
  from public.assignments
  where id = assignment_id_input;

  if assignment_row.id is null then
    raise exception 'Assignment not found';
  end if;

  if not (
    exists (
      select 1
      from public.class_sections cs
      where cs.id = assignment_row.section_id
        and (
          cs.owner_id = auth.uid()
          or cs.created_by = auth.uid()
        )
    )
    or exists (
      select 1
      from public.section_members sm
      where sm.section_id = assignment_row.section_id
        and sm.user_id = auth.uid()
        and sm.role in ('professor', 'ta')
    )
  ) then
    raise exception 'Professor access required';
  end if;

  if student_id_input = auth.uid() then
    raise exception 'Professors cannot review themselves in the gradebook';
  end if;

  if not exists (
    select 1
    from public.section_members sm
    join public.profiles p on p.id = sm.user_id
    where sm.section_id = assignment_row.section_id
      and sm.user_id = student_id_input
      and coalesce(sm.role, sm.role_in_section, 'student') = 'student'
      and p.role = 'student'
  ) then
    raise exception 'Only enrolled students are available in this gradebook';
  end if;

  select *
  into submission_row
  from public.assignment_submissions s
  where s.assignment_id = assignment_id_input
    and s.user_id = student_id_input
  order by
    coalesce(s.graded_at, s.updated_at, s.created_at) desc,
    s.created_at desc
  limit 1;

  if submission_row.id is null then
    return jsonb_build_object(
      'submission', null,
      'attempt', null,
      'questions', '[]'::jsonb
    );
  end if;

  submission_payload := jsonb_build_object(
    'id', submission_row.id,
    'assignmentId', submission_row.assignment_id,
    'studentId', submission_row.user_id,
    'attemptId', submission_row.attempt_id,
    'status', submission_row.status,
    'score', submission_row.score,
    'feedback', submission_row.feedback_md,
    'gradedAt', submission_row.graded_at,
    'createdAt', submission_row.created_at
  );

  if submission_row.attempt_id is not null then
    select *
    into attempt_row
    from public.attempts a
    where a.id = submission_row.attempt_id
      and a.user_id = student_id_input;
  end if;

  if attempt_row.id is not null then
    attempt_payload := jsonb_build_object(
      'id', attempt_row.id,
      'score', attempt_row.score,
      'correctCount', attempt_row.correct_count,
      'totalCount', attempt_row.total_count,
      'timeSpentSeconds', attempt_row.time_spent_seconds,
      'completedAt', attempt_row.completed_at,
      'startedAt', attempt_row.started_at
    );

    if jsonb_typeof(coalesce(attempt_row.settings -> 'per_question_results', 'null'::jsonb)) = 'array' then
      select coalesce(
        jsonb_agg(
          jsonb_build_object(
            'questionId', coalesce(q.id::text, item.value ->> 'questionId'),
            'questionType', coalesce(item.value ->> 'questionType', q.type),
            'prompt', coalesce(q.prompt_md, ''),
            'options', coalesce(q.options, '[]'::jsonb),
            'correct', coalesce(q.correct, '[]'::jsonb),
            'explanation', coalesce(q.explanation_md, ''),
            'solutionMd', q.solution_md,
            'tags', coalesce(to_jsonb(q.tags), '[]'::jsonb),
            'isCorrect', coalesce((item.value ->> 'isCorrect')::boolean, false),
            'selected', coalesce(item.value -> 'selected', '[]'::jsonb),
            'responseText', nullif(item.value ->> 'responseText', ''),
            'selfMarked', case
              when item.value ? 'selfMarked' then (item.value ->> 'selfMarked')::boolean
              else null
            end
          )
          order by item.ordinality
        ),
        '[]'::jsonb
      )
      into question_payload
      from jsonb_array_elements(attempt_row.settings -> 'per_question_results') with ordinality as item(value, ordinality)
      left join public.questions q
        on q.id = nullif(item.value ->> 'questionId', '')::uuid;
    else
      select coalesce(
        jsonb_agg(
          jsonb_build_object(
            'questionId', q.id::text,
            'questionType', q.type,
            'prompt', q.prompt_md,
            'options', coalesce(q.options, '[]'::jsonb),
            'correct', coalesce(q.correct, '[]'::jsonb),
            'explanation', coalesce(q.explanation_md, ''),
            'solutionMd', q.solution_md,
            'tags', coalesce(to_jsonb(q.tags), '[]'::jsonb),
            'isCorrect', coalesce(aa.is_correct, false),
            'selected', coalesce(aa.selected, '[]'::jsonb),
            'responseText', null,
            'selfMarked', null
          )
          order by q.created_at, aa.created_at
        ),
        '[]'::jsonb
      )
      into question_payload
      from public.attempt_answers aa
      join public.questions q on q.id = aa.question_id
      where aa.attempt_id = attempt_row.id;
    end if;
  end if;

  return jsonb_build_object(
    'submission', submission_payload,
    'attempt', attempt_payload,
    'questions', question_payload
  );
end;
$$;

grant execute on function public.get_assignment_submission_review(uuid, uuid) to authenticated;
