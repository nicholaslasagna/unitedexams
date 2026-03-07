create table if not exists public.section_quiz_sets (
  section_id uuid not null references public.class_sections(id) on delete cascade,
  quiz_set_id uuid not null references public.quiz_sets(id) on delete cascade,
  created_by uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (section_id, quiz_set_id)
);

create index if not exists idx_section_quiz_sets_quiz on public.section_quiz_sets (quiz_set_id);
create index if not exists idx_section_quiz_sets_created_by on public.section_quiz_sets (created_by, created_at desc);

alter table public.section_quiz_sets enable row level security;

drop policy if exists section_quiz_sets_select_scope on public.section_quiz_sets;
create policy section_quiz_sets_select_scope
  on public.section_quiz_sets
  for select
  to authenticated
  using (
    public.section_member_exists(section_id, auth.uid())
    or public.section_professor_exists(section_id, auth.uid())
  );

drop policy if exists section_quiz_sets_insert_professor on public.section_quiz_sets;
create policy section_quiz_sets_insert_professor
  on public.section_quiz_sets
  for insert
  to authenticated
  with check (
    created_by = auth.uid()
    and public.section_professor_exists(section_id, auth.uid())
  );

drop policy if exists section_quiz_sets_delete_professor on public.section_quiz_sets;
create policy section_quiz_sets_delete_professor
  on public.section_quiz_sets
  for delete
  to authenticated
  using (public.section_professor_exists(section_id, auth.uid()));

insert into public.section_quiz_sets (section_id, quiz_set_id, created_by)
select distinct
  a.section_id,
  a.quiz_set_id,
  coalesce(cs.created_by, cs.owner_id)
from public.assignments a
join public.class_sections cs on cs.id = a.section_id
where coalesce(cs.created_by, cs.owner_id) is not null
  and exists (
    select 1
    from public.questions q
    where q.quiz_set_id = a.quiz_set_id
      and coalesce(q.from_professor, false) = true
  )
on conflict (section_id, quiz_set_id) do nothing;

insert into public.section_quiz_sets (section_id, quiz_set_id, created_by)
select distinct
  e.section_id,
  e.quiz_set_id,
  coalesce(cs.created_by, cs.owner_id)
from public.exams e
join public.class_sections cs on cs.id = e.section_id
where e.quiz_set_id is not null
  and coalesce(cs.created_by, cs.owner_id) is not null
  and exists (
    select 1
    from public.questions q
    where q.quiz_set_id = e.quiz_set_id
      and coalesce(q.from_professor, false) = true
  )
on conflict (section_id, quiz_set_id) do nothing;

create or replace function public.create_professor_quiz_set(
  section_id_input uuid,
  title_input text,
  description_input text default '',
  difficulty_input text default 'medium',
  est_minutes_input int default 20,
  mode_input text default 'quiz',
  tags_input text[] default '{}'::text[],
  questions_input jsonb default '[]'::jsonb
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
  question_item record;
  normalized_question_type text;
  normalized_prompt text;
  normalized_options text[];
  normalized_correct_indexes int[];
  normalized_correct_answers text[];
  normalized_explanation text;
  normalized_question_tags text[];
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

  if jsonb_typeof(coalesce(questions_input, '[]'::jsonb)) <> 'array' then
    raise exception 'questions_input must be a JSON array';
  end if;

  if coalesce(jsonb_array_length(coalesce(questions_input, '[]'::jsonb)), 0) = 0 then
    raise exception 'At least one question is required';
  end if;

  normalized_difficulty := lower(trim(coalesce(difficulty_input, 'medium')));
  if normalized_difficulty not in ('intro', 'medium', 'hard') then
    normalized_difficulty := 'medium';
  end if;

  normalized_mode := lower(trim(coalesce(mode_input, 'quiz')));
  if normalized_mode not in ('quiz', 'exam', 'homework') then
    normalized_mode := 'quiz';
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
    greatest(1, jsonb_array_length(coalesce(questions_input, '[]'::jsonb))),
    (normalized_mode = 'exam')
  )
  returning id into new_quiz_set_id;

  insert into public.section_quiz_sets (section_id, quiz_set_id, created_by)
  values (section_id_input, new_quiz_set_id, auth.uid())
  on conflict (section_id, quiz_set_id) do nothing;

  for question_item in
    select value, ordinality
    from jsonb_array_elements(coalesce(questions_input, '[]'::jsonb)) with ordinality
  loop
    normalized_question_type := lower(trim(coalesce(question_item.value ->> 'type', 'single')));
    if normalized_question_type not in ('single', 'multi', 'fill', 'free') then
      raise exception 'Question % has unsupported type: %', question_item.ordinality, normalized_question_type;
    end if;

    normalized_prompt := trim(coalesce(question_item.value ->> 'prompt', ''));
    if normalized_prompt = '' then
      raise exception 'Question % is missing a prompt', question_item.ordinality;
    end if;

    normalized_explanation := coalesce(question_item.value ->> 'explanation', '');

    normalized_question_tags := coalesce(
      (
        select array_agg(tag_value)
        from (
          select trim(value)::text as tag_value
          from jsonb_array_elements_text(coalesce(question_item.value -> 'tags', '[]'::jsonb))
        ) t
        where tag_value <> ''
      ),
      coalesce(tags_input, '{}'::text[])
    );

    if normalized_question_type in ('single', 'multi') then
      normalized_options := coalesce(
        (
          select array_agg(option_value)
          from (
            select trim(value)::text as option_value
            from jsonb_array_elements_text(coalesce(question_item.value -> 'options', '[]'::jsonb))
          ) o
          where option_value <> ''
        ),
        '{}'::text[]
      );

      if coalesce(array_length(normalized_options, 1), 0) < 2 then
        raise exception 'Question % needs at least 2 options', question_item.ordinality;
      end if;

      normalized_correct_indexes := coalesce(
        (
          select array_agg(distinct idx order by idx)
          from (
            select
              case
                when value ~ '^-?[0-9]+$' then value::int
                else null
              end as idx
            from jsonb_array_elements_text(coalesce(question_item.value -> 'correct_indexes', '[]'::jsonb))
          ) idx_rows
          where idx is not null
        ),
        '{}'::int[]
      );

      if normalized_question_type = 'single' and coalesce(array_length(normalized_correct_indexes, 1), 0) > 1 then
        normalized_correct_indexes := array[normalized_correct_indexes[1]];
      end if;

      if coalesce(array_length(normalized_correct_indexes, 1), 0) = 0 then
        raise exception 'Question % needs at least one correct option', question_item.ordinality;
      end if;

      if exists (
        select 1
        from unnest(normalized_correct_indexes) as idx
        where idx < 0 or idx >= coalesce(array_length(normalized_options, 1), 0)
      ) then
        raise exception 'Question % has a correct option index out of range', question_item.ordinality;
      end if;

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
        normalized_question_type,
        normalized_prompt,
        to_jsonb(normalized_options),
        to_jsonb(normalized_correct_indexes),
        normalized_explanation,
        true,
        coalesce(normalized_question_tags, '{}'::text[]),
        case normalized_difficulty
          when 'intro' then 'easy'
          when 'medium' then 'med'
          else 'hard'
        end
      );
    elsif normalized_question_type = 'fill' then
      normalized_correct_answers := coalesce(
        (
          select array_agg(distinct answer_value order by answer_value)
          from (
            select lower(trim(value))::text as answer_value
            from jsonb_array_elements_text(coalesce(question_item.value -> 'acceptable_answers', '[]'::jsonb))
          ) answers
          where answer_value <> ''
        ),
        '{}'::text[]
      );

      if coalesce(array_length(normalized_correct_answers, 1), 0) = 0 then
        raise exception 'Question % needs at least one acceptable answer', question_item.ordinality;
      end if;

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
        'fill',
        normalized_prompt,
        '[]'::jsonb,
        to_jsonb(normalized_correct_answers),
        normalized_explanation,
        true,
        coalesce(normalized_question_tags, '{}'::text[]),
        case normalized_difficulty
          when 'intro' then 'easy'
          when 'medium' then 'med'
          else 'hard'
        end
      );
    else
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
        'free',
        normalized_prompt,
        '[]'::jsonb,
        '[]'::jsonb,
        normalized_explanation,
        true,
        coalesce(normalized_question_tags, '{}'::text[]),
        case normalized_difficulty
          when 'intro' then 'easy'
          when 'medium' then 'med'
          else 'hard'
        end
      );
    end if;
  end loop;

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
  jsonb
) to authenticated;
