-- Allow professors to grade students even when no submission record exists yet.
drop function if exists public.upsert_manual_grade(uuid, uuid, text, numeric, text);

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

  if not exists (
    select 1
    from public.section_members sm
    where sm.section_id = assignment_row.section_id
      and sm.user_id = student_id_input
      and coalesce(sm.role, sm.role_in_section, 'student') = 'student'
  ) then
    raise exception 'Student is not enrolled in this section';
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
  order by s.created_at desc, s.id desc
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
