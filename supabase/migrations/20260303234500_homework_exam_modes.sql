-- Add quiz/exam/homework mode support + richer question metadata

alter table public.quiz_sets
  add column if not exists mode text not null default 'quiz',
  add column if not exists question_count_target int,
  add column if not exists is_exam_simulation boolean not null default false;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'quiz_sets_mode_check'
      and conrelid = 'public.quiz_sets'::regclass
  ) then
    alter table public.quiz_sets
      add constraint quiz_sets_mode_check check (mode in ('quiz', 'exam', 'homework'));
  end if;
end;
$$;

create index if not exists idx_quiz_sets_mode on public.quiz_sets(mode);

alter table public.questions
  add column if not exists external_id text,
  add column if not exists difficulty text,
  add column if not exists homework_format text,
  add column if not exists from_professor boolean not null default false,
  add column if not exists solution_md text,
  add column if not exists tags text[] default '{}'::text[];

create unique index if not exists idx_questions_external_id_unique
  on public.questions(external_id)
  where external_id is not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'questions_difficulty_check'
      and conrelid = 'public.questions'::regclass
  ) then
    alter table public.questions
      add constraint questions_difficulty_check check (
        difficulty is null or difficulty in ('easy', 'med', 'hard')
      );
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'questions_homework_format_check'
      and conrelid = 'public.questions'::regclass
  ) then
    alter table public.questions
      add constraint questions_homework_format_check check (
        homework_format is null or homework_format in ('short', 'multi-step', 'proof', 'calc')
      );
  end if;
end;
$$;

update public.quiz_sets
set mode = 'exam',
    is_exam_simulation = true,
    question_count_target = coalesce(question_count_target, 42)
where mode = 'quiz'
  and (
    lower(id::text) like '%exam%'
    or lower(id::text) like '%test%'
    or lower(title) like '%exam%'
    or lower(title) like '%test review%'
    or exists (
      select 1
      from unnest(tags) tag
      where lower(tag) like '%exam%'
         or lower(tag) like '%test-review%'
    )
  );

update public.quiz_sets
set mode = 'homework',
    is_exam_simulation = false,
    question_count_target = null
where mode <> 'homework'
  and (
    lower(id::text) like '%hw%'
    or lower(title) like '%homework%'
    or exists (
      select 1
      from unnest(tags) tag
      where lower(tag) like '%homework%'
    )
  );
