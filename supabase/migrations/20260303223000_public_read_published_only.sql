-- Restrict public curriculum reads to published quiz sets/questions

drop policy if exists quiz_sets_read_all on public.quiz_sets;
drop policy if exists questions_read_all on public.questions;
drop policy if exists quiz_sets_read_published on public.quiz_sets;
drop policy if exists questions_read_published_quiz_set on public.questions;

create policy quiz_sets_read_published
  on public.quiz_sets
  for select
  using (is_published = true);

create policy questions_read_published_quiz_set
  on public.questions
  for select
  using (
    exists (
      select 1
      from public.quiz_sets qs
      where qs.id = questions.quiz_set_id
        and qs.is_published = true
    )
  );
