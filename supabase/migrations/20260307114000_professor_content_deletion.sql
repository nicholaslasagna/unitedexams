create or replace function public.delete_professor_quiz_set(quiz_set_id_input uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  own_link_count int := 0;
  foreign_link_count int := 0;
  reference_count int := 0;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if not exists (
    select 1
    from public.quiz_sets qs
    where qs.id = quiz_set_id_input
  ) then
    raise exception 'Quiz set not found';
  end if;

  if not exists (
    select 1
    from public.questions q
    where q.quiz_set_id = quiz_set_id_input
      and coalesce(q.from_professor, false) = true
  ) then
    raise exception 'Only professor-built sets can be deleted here.';
  end if;

  if to_regclass('public.section_quiz_sets') is not null then
    select
      count(*) filter (where sqs.created_by = auth.uid()),
      count(*) filter (where sqs.created_by <> auth.uid())
    into own_link_count, foreign_link_count
    from public.section_quiz_sets sqs
    where sqs.quiz_set_id = quiz_set_id_input;
  end if;

  if own_link_count = 0 then
    select count(*)
    into reference_count
    from (
      select distinct a.section_id
      from public.assignments a
      where a.quiz_set_id = quiz_set_id_input
      union
      select distinct e.section_id
      from public.exams e
      where e.quiz_set_id = quiz_set_id_input
    ) refs;

    if reference_count = 0 then
      raise exception 'This set is missing section ownership metadata. Apply the latest migration, then recreate or re-link it.';
    end if;

    if exists (
      select 1
      from (
        select distinct a.section_id
        from public.assignments a
        where a.quiz_set_id = quiz_set_id_input
        union
        select distinct e.section_id
        from public.exams e
        where e.quiz_set_id = quiz_set_id_input
      ) refs
      where not public.section_professor_exists(refs.section_id, auth.uid())
    ) then
      raise exception 'Only the professor managing every linked section can delete this set.';
    end if;
  else
    if foreign_link_count > 0 then
      raise exception 'This set is linked by another professor and cannot be deleted automatically.';
    end if;
  end if;

  delete from public.exams
  where quiz_set_id = quiz_set_id_input;

  delete from public.quiz_sets
  where id = quiz_set_id_input;
end;
$$;

grant execute on function public.delete_professor_quiz_set(uuid) to authenticated;
