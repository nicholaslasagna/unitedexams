alter table public.class_sections
  add column if not exists assignment_weight integer not null default 40,
  add column if not exists exam_weight integer not null default 60;

update public.class_sections
set assignment_weight = coalesce(assignment_weight, 40),
    exam_weight = coalesce(exam_weight, 60)
where assignment_weight is null
   or exam_weight is null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'class_sections_assignment_weight_range'
  ) then
    alter table public.class_sections
      add constraint class_sections_assignment_weight_range
      check (assignment_weight >= 0 and assignment_weight <= 100);
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'class_sections_exam_weight_range'
  ) then
    alter table public.class_sections
      add constraint class_sections_exam_weight_range
      check (exam_weight >= 0 and exam_weight <= 100);
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'class_sections_grade_weight_total'
  ) then
    alter table public.class_sections
      add constraint class_sections_grade_weight_total
      check (assignment_weight + exam_weight = 100);
  end if;
end
$$;
