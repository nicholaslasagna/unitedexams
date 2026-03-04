-- Remove legacy university seed reference from existing environments.
do $$
declare
  ttu_id uuid;
  westbridge_id uuid;
begin
  select id into ttu_id from public.universities where lower(name) = lower('Texas' || ' Tech University') limit 1;
  select id into westbridge_id from public.universities where lower(name) = lower('Westbridge University') limit 1;

  if ttu_id is null then
    if westbridge_id is null then
      insert into public.universities (name, country) values ('Westbridge University', 'US');
    end if;
    return;
  end if;

  if westbridge_id is null then
    update public.universities
    set name = 'Westbridge University'
    where id = ttu_id;
  else
    -- Keep one canonical record to avoid duplicate names.
    delete from public.universities where id = ttu_id;
  end if;
end $$;
