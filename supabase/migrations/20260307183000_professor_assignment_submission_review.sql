-- Allow verified professors/TAs to inspect the latest student work attached to an assignment.

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
