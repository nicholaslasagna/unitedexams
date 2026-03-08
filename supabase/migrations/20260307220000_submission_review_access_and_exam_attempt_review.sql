-- Allow students to review their own submitted work and let professors inspect both assignments and exam attempts.

drop function if exists public.get_assignment_submission_review(uuid, uuid) cascade;
drop function if exists public.get_assignment_submission_review(uuid, uuid, uuid) cascade;
create function public.get_assignment_submission_review(
  assignment_id_input uuid,
  student_id_input uuid default null,
  submission_id_input uuid default null
)
returns jsonb
language plpgsql
security definer
set search_path = 'public'
as $$
declare
  assignment_row record;
  target_student_id uuid;
  target_name text;
  submission_row public.assignment_submissions%rowtype;
  attempt_row public.attempts%rowtype;
  submission_payload jsonb := null;
  attempt_payload jsonb := null;
  question_payload jsonb := '[]'::jsonb;
  history_payload jsonb := '[]'::jsonb;
  professor_access boolean := false;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  select
    a.*,
    cs.course_id,
    coalesce(nullif(trim(cs.name), ''), nullif(trim(cs.section_name), ''), 'Untitled Section') as resolved_section_name
  into assignment_row
  from public.assignments a
  join public.class_sections cs on cs.id = a.section_id
  where a.id = assignment_id_input;

  if assignment_row.id is null then
    raise exception 'Assignment not found';
  end if;

  target_student_id := coalesce(student_id_input, auth.uid());
  professor_access := public.section_professor_exists(assignment_row.section_id, auth.uid());

  if target_student_id <> auth.uid() and not professor_access then
    raise exception 'Professor access required';
  end if;

  if target_student_id = auth.uid() and not (
    public.section_member_exists(assignment_row.section_id, auth.uid())
    or exists (
      select 1
      from public.assignment_submissions s
      where s.assignment_id = assignment_id_input
        and s.user_id = auth.uid()
    )
  ) then
    raise exception 'You do not have access to this assignment';
  end if;

  if target_student_id <> auth.uid() and not exists (
    select 1
    from public.section_members sm
    join public.profiles p on p.id = sm.user_id
    where sm.section_id = assignment_row.section_id
      and sm.user_id = target_student_id
      and coalesce(sm.role, sm.role_in_section, 'student') = 'student'
      and p.role = 'student'
  ) then
    raise exception 'Only enrolled students are available in this gradebook';
  end if;

  select public.resolve_internal_name(p.real_name, p.display_name, 'Student')
  into target_name
  from public.profiles p
  where p.id = target_student_id;

  if target_name is null then
    raise exception 'Student not found';
  end if;

  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'id', s.id,
        'status', s.status,
        'score', s.score,
        'feedback', s.feedback_md,
        'gradedAt', s.graded_at,
        'createdAt', s.created_at,
        'updatedAt', s.updated_at,
        'attemptId', s.attempt_id
      )
      order by coalesce(s.graded_at, s.updated_at, s.created_at) desc, s.created_at desc, s.id desc
    ),
    '[]'::jsonb
  )
  into history_payload
  from public.assignment_submissions s
  where s.assignment_id = assignment_id_input
    and s.user_id = target_student_id;

  if submission_id_input is not null then
    select *
    into submission_row
    from public.assignment_submissions s
    where s.id = submission_id_input
      and s.assignment_id = assignment_id_input
      and s.user_id = target_student_id;
  end if;

  if submission_row.id is null then
    select *
    into submission_row
    from public.assignment_submissions s
    where s.assignment_id = assignment_id_input
      and s.user_id = target_student_id
    order by coalesce(s.graded_at, s.updated_at, s.created_at) desc, s.created_at desc, s.id desc
    limit 1;
  end if;

  if submission_row.id is null then
    return jsonb_build_object(
      'kind', 'assignment',
      'source', jsonb_build_object(
        'id', assignment_row.id,
        'title', coalesce(assignment_row.title, 'Assignment'),
        'sectionId', assignment_row.section_id,
        'sectionName', assignment_row.resolved_section_name,
      'courseId', assignment_row.course_id
      ),
      'studentId', target_student_id,
      'studentName', target_name,
      'solutionsVisible', (professor_access or target_student_id <> auth.uid()),
      'history', history_payload,
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
    'createdAt', submission_row.created_at,
    'updatedAt', submission_row.updated_at
  );

  if submission_row.attempt_id is not null then
    select *
    into attempt_row
    from public.attempts a
    where a.id = submission_row.attempt_id
      and a.user_id = target_student_id;
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
            'responseText', case
              when q.type in ('fill', 'free') then nullif((
                select string_agg(value, E'\n')
                from jsonb_array_elements_text(coalesce(aa.selected, '[]'::jsonb)) as elem(value)
              ), '')
              else null
            end,
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
    'kind', 'assignment',
    'source', jsonb_build_object(
      'id', assignment_row.id,
      'title', coalesce(assignment_row.title, 'Assignment'),
      'sectionId', assignment_row.section_id,
      'sectionName', assignment_row.resolved_section_name,
      'courseId', assignment_row.course_id
    ),
    'studentId', target_student_id,
    'studentName', target_name,
    'solutionsVisible', (professor_access or target_student_id <> auth.uid() or submission_row.status = 'graded'),
    'history', history_payload,
    'submission', submission_payload,
    'attempt', attempt_payload,
    'questions', question_payload
  );
end;
$$;

grant execute on function public.get_assignment_submission_review(uuid, uuid, uuid) to authenticated;

drop function if exists public.get_exam_attempt_review(uuid, uuid, uuid) cascade;
create function public.get_exam_attempt_review(
  exam_id_input uuid,
  student_id_input uuid default null,
  attempt_id_input uuid default null
)
returns jsonb
language plpgsql
security definer
set search_path = 'public'
as $$
declare
  exam_row record;
  target_student_id uuid;
  target_name text;
  attempt_row public.exam_attempts%rowtype;
  attempt_payload jsonb := null;
  question_payload jsonb := '[]'::jsonb;
  history_payload jsonb := '[]'::jsonb;
  professor_access boolean := false;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  select
    e.*,
    cs.course_id,
    coalesce(nullif(trim(cs.name), ''), nullif(trim(cs.section_name), ''), 'Untitled Section') as resolved_section_name
  into exam_row
  from public.exams e
  join public.class_sections cs on cs.id = e.section_id
  where e.id = exam_id_input;

  if exam_row.id is null then
    raise exception 'Exam not found';
  end if;

  target_student_id := coalesce(student_id_input, auth.uid());
  professor_access := public.section_professor_exists(exam_row.section_id, auth.uid());

  if target_student_id <> auth.uid() and not professor_access then
    raise exception 'Professor access required';
  end if;

  if target_student_id = auth.uid() and not (
    public.section_member_exists(exam_row.section_id, auth.uid())
    or exists (
      select 1
      from public.exam_attempts ea
      where ea.exam_id = exam_id_input
        and ea.student_id = auth.uid()
    )
  ) then
    raise exception 'You do not have access to this exam';
  end if;

  if target_student_id <> auth.uid() and not exists (
    select 1
    from public.section_members sm
    join public.profiles p on p.id = sm.user_id
    where sm.section_id = exam_row.section_id
      and sm.user_id = target_student_id
      and coalesce(sm.role, sm.role_in_section, 'student') = 'student'
      and p.role = 'student'
  ) then
    raise exception 'Only enrolled students are available in this gradebook';
  end if;

  select public.resolve_internal_name(p.real_name, p.display_name, 'Student')
  into target_name
  from public.profiles p
  where p.id = target_student_id;

  if target_name is null then
    raise exception 'Student not found';
  end if;

  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'id', ea.id,
        'status', ea.status,
        'score', ea.score,
        'startedAt', ea.started_at,
        'submittedAt', ea.submitted_at,
        'createdAt', ea.created_at,
        'updatedAt', ea.updated_at,
        'suspicionScore', ea.suspicion_score
      )
      order by coalesce(ea.submitted_at, ea.updated_at, ea.created_at) desc, ea.created_at desc, ea.id desc
    ),
    '[]'::jsonb
  )
  into history_payload
  from public.exam_attempts ea
  where ea.exam_id = exam_id_input
    and ea.student_id = target_student_id;

  if attempt_id_input is not null then
    select *
    into attempt_row
    from public.exam_attempts ea
    where ea.id = attempt_id_input
      and ea.exam_id = exam_id_input
      and ea.student_id = target_student_id;
  end if;

  if attempt_row.id is null then
    select *
    into attempt_row
    from public.exam_attempts ea
    where ea.exam_id = exam_id_input
      and ea.student_id = target_student_id
    order by coalesce(ea.submitted_at, ea.updated_at, ea.created_at) desc, ea.created_at desc, ea.id desc
    limit 1;
  end if;

  if attempt_row.id is null then
    return jsonb_build_object(
      'kind', 'exam',
      'source', jsonb_build_object(
        'id', exam_row.id,
        'title', exam_row.title,
        'sectionId', exam_row.section_id,
        'sectionName', exam_row.resolved_section_name,
      'courseId', exam_row.course_id
      ),
      'studentId', target_student_id,
      'studentName', target_name,
      'solutionsVisible', (professor_access or target_student_id <> auth.uid()),
      'history', history_payload,
      'submission', null,
      'attempt', null,
      'questions', '[]'::jsonb
    );
  end if;

  attempt_payload := jsonb_build_object(
    'id', attempt_row.id,
    'status', attempt_row.status,
    'score', attempt_row.score,
    'correctCount', case
      when attempt_row.graded_breakdown ? 'correct_count' then (attempt_row.graded_breakdown ->> 'correct_count')::int
      else null
    end,
    'totalCount', case
      when attempt_row.graded_breakdown ? 'total_count' then (attempt_row.graded_breakdown ->> 'total_count')::int
      else null
    end,
    'timeSpentSeconds', case
      when attempt_row.started_at is not null and attempt_row.submitted_at is not null
        then greatest(0, floor(extract(epoch from (attempt_row.submitted_at - attempt_row.started_at)))::int)
      else null
    end,
    'startedAt', attempt_row.started_at,
    'completedAt', attempt_row.submitted_at,
    'submittedAt', attempt_row.submitted_at,
    'createdAt', attempt_row.created_at,
    'updatedAt', attempt_row.updated_at,
    'suspicionScore', attempt_row.suspicion_score
  );

  if exam_row.quiz_set_id is not null then
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
          'isCorrect', case
            when q.type = 'free' then false
            when q.type = 'fill' then exists (
              select 1
              from jsonb_array_elements_text(coalesce(attempt_row.answers -> q.id::text, '[]'::jsonb)) as response(value)
              join jsonb_array_elements_text(coalesce(q.correct, '[]'::jsonb)) as expected(value)
                on lower(trim(response.value)) = lower(trim(expected.value))
            )
            else public.jsonb_to_sorted_int_array(coalesce(attempt_row.answers -> q.id::text, '[]'::jsonb)) = public.jsonb_to_sorted_int_array(coalesce(q.correct, '[]'::jsonb))
          end,
          'selected', coalesce(attempt_row.answers -> q.id::text, '[]'::jsonb),
          'responseText', case
            when q.type in ('fill', 'free') then nullif((
              select string_agg(value, E'\n')
              from jsonb_array_elements_text(coalesce(attempt_row.answers -> q.id::text, '[]'::jsonb)) as elem(value)
            ), '')
            else null
          end,
          'selfMarked', null
        )
        order by q.created_at, q.id
      ),
      '[]'::jsonb
    )
    into question_payload
    from public.questions q
    where q.quiz_set_id = exam_row.quiz_set_id;
  end if;

  return jsonb_build_object(
    'kind', 'exam',
    'source', jsonb_build_object(
      'id', exam_row.id,
      'title', exam_row.title,
      'sectionId', exam_row.section_id,
      'sectionName', exam_row.resolved_section_name,
      'courseId', exam_row.course_id
    ),
    'studentId', target_student_id,
    'studentName', target_name,
    'solutionsVisible', (
      professor_access
      or target_student_id <> auth.uid()
      or exam_row.show_results_after = 'immediate'
      or (exam_row.show_results_after = 'window_close' and now() >= exam_row.ends_at)
    ),
    'history', history_payload,
    'submission', null,
    'attempt', attempt_payload,
    'questions', question_payload
  );
end;
$$;

grant execute on function public.get_exam_attempt_review(uuid, uuid, uuid) to authenticated;
