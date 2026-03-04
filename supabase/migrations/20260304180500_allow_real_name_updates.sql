-- Allow real name edits while keeping display name lock policy.

alter table public.profiles
  add column if not exists real_name_locked boolean not null default false;

update public.profiles
set real_name_locked = false
where real_name_locked is distinct from false;

create or replace function public.enforce_profile_identity_locks()
returns trigger
language plpgsql
as $$
declare
  next_display_name text;
begin
  next_display_name := trim(coalesce(new.display_name, ''));

  if tg_op = 'INSERT' then
    if new.display_name_locked is null then
      new.display_name_locked := false;
    end if;
    new.real_name_locked := false;

    if next_display_name <> '' and lower(next_display_name) <> 'student' then
      new.display_name_locked := true;
    end if;

    return new;
  end if;

  if old.display_name_locked and new.display_name is distinct from old.display_name then
    raise exception 'Display name is locked. Contact support to change it.';
  end if;

  if not old.display_name_locked and new.display_name is distinct from old.display_name then
    if next_display_name <> '' and lower(next_display_name) <> 'student' then
      new.display_name_locked := true;
    end if;
  end if;

  new.real_name_locked := false;
  return new;
end;
$$;
