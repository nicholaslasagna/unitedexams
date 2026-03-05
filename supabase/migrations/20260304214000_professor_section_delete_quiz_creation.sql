-- Professor-only section deletion and professor-authored quiz set creation.

alter table public.class_sections
  add column if not exists created_by uuid references public.profiles(id) on delete cascade,
  add column if not exists owner_id uuid references public.profiles(id) on delete cascade;

create or replace function public.is_professor_or_admin(uid uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = uid
      and p.role in ('professor', 'admin')
  );
$$;

-- Ensure section deletion is limited to professor owners.
drop policy if exists class_sections_delete_owner on public.class_sections;
drop policy if exists sections_delete_owner on public.class_sections;

create policy class_sections_delete_owner
  on public.class_sections
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'professor'
    )
    and (
      created_by = auth.uid()
      or owner_id = auth.uid()
      or coalesce(created_by, owner_id) = auth.uid()
    )
  );

-- Professor RPC to create a course quiz set with at least one starter question.
drop function if exists public.create_professor_quiz_set(
  uuid,
  text,
  text,
  text,
  int,
  text,
  text[],
  text,
  text[],
  int[],
  text
);

create function public.create_professor_quiz_set(
  section_id_input uuid,
  title_input text,
  description_input text default '',
  difficulty_input text default 'medium',
  est_minutes_input int default 20,
  mode_input text default 'quiz',
  tags_input text[] default '{}'::text[],
  question_prompt_input text default '',
  question_options_input text[] default array['Option A', 'Option B']::text[],
  correct_option_indexes_input int[] default array[0]::int[],
  explanation_input text default ''
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  section_course_id text;
  new_quiz_set_id uuid;
  normalized_difficulty text;
  normalized_mode text;
  normalized_title text;
  normalized_prompt text;
  normalized_options text[];
  normalized_correct int[];
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if not public.section_professor_exists(section_id_input, auth.uid()) then
    raise exception 'Only section professors can create quiz sets';
  end if;

  normalized_title := trim(coalesce(title_input, ''));
  if normalized_title = '' then
    raise exception 'Quiz set title is required';
  end if;

  normalized_prompt := trim(coalesce(question_prompt_input, ''));
  if normalized_prompt = '' then
    raise exception 'Starter question prompt is required';
  end if;

  normalized_difficulty := lower(trim(coalesce(difficulty_input, 'medium')));
  if normalized_difficulty not in ('intro', 'medium', 'hard') then
    normalized_difficulty := 'medium';
  end if;

  normalized_mode := lower(trim(coalesce(mode_input, 'quiz')));
  if normalized_mode not in ('quiz', 'exam', 'homework') then
    normalized_mode := 'quiz';
  end if;

  normalized_options := coalesce(
    (
      select array_agg(value)
      from (
        select trim(opt) as value
        from unnest(coalesce(question_options_input, '{}'::text[])) as opt
      ) cleaned
      where value <> ''
    ),
    '{}'::text[]
  );

  if coalesce(array_length(normalized_options, 1), 0) < 2 then
    raise exception 'At least two answer options are required';
  end if;

  normalized_correct := coalesce(correct_option_indexes_input, array[0]::int[]);
  if coalesce(array_length(normalized_correct, 1), 0) = 0 then
    normalized_correct := array[0]::int[];
  end if;

  if exists (
    select 1
    from unnest(normalized_correct) as idx
    where idx < 0 or idx >= coalesce(array_length(normalized_options, 1), 0)
  ) then
    raise exception 'Correct answer index is out of range';
  end if;

  select cs.course_id
  into section_course_id
  from public.class_sections cs
  where cs.id = section_id_input;

  if section_course_id is null then
    raise exception 'Section not found';
  end if;

  insert into public.quiz_sets (
    course_id,
    title,
    description,
    difficulty,
    est_minutes,
    tags,
    is_published,
    mode,
    question_count_target,
    is_exam_simulation
  )
  values (
    section_course_id,
    normalized_title,
    coalesce(description_input, ''),
    normalized_difficulty,
    greatest(1, least(240, coalesce(est_minutes_input, 20))),
    coalesce(tags_input, '{}'::text[]),
    true,
    normalized_mode,
    coalesce(array_length(normalized_options, 1), 2),
    (normalized_mode = 'exam')
  )
  returning id into new_quiz_set_id;

  insert into public.questions (
    quiz_set_id,
    type,
    prompt_md,
    options,
    correct,
    explanation_md,
    from_professor,
    tags,
    difficulty
  )
  values (
    new_quiz_set_id,
    'single',
    normalized_prompt,
    to_jsonb(normalized_options),
    to_jsonb(normalized_correct),
    coalesce(explanation_input, ''),
    true,
    coalesce(tags_input, '{}'::text[]),
    case normalized_difficulty
      when 'intro' then 'easy'
      when 'medium' then 'med'
      else 'hard'
    end
  );

  return new_quiz_set_id;
end;
$$;

grant execute on function public.create_professor_quiz_set(
  uuid,
  text,
  text,
  text,
  int,
  text,
  text[],
  text,
  text[],
  int[],
  text
) to authenticated;
