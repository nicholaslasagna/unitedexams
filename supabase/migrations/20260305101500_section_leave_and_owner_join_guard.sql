-- Prevent section owners from joining their own class via join code.

create or replace function public.join_section_by_code(join_code_input text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  target_section_id uuid;
  target_created_by uuid;
  target_owner_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  select cs.id, cs.created_by, cs.owner_id
  into target_section_id, target_created_by, target_owner_id
  from public.class_sections cs
  where upper(trim(cs.join_code)) = upper(trim(join_code_input))
  limit 1;

  if target_section_id is null then
    raise exception 'Section code not found';
  end if;

  if auth.uid() = target_created_by or auth.uid() = target_owner_id then
    raise exception 'You cannot join your own section';
  end if;

  insert into public.section_members (section_id, user_id, role)
  values (target_section_id, auth.uid(), 'student')
  on conflict (section_id, user_id) do nothing;

  return target_section_id;
end;
$$;

grant execute on function public.join_section_by_code(text) to authenticated;
