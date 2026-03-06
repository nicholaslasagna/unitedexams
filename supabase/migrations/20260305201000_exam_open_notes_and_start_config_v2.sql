-- Open-notes exam mode + start config v2 support.

alter table if exists public.exam_access_rules
  add column if not exists open_notes_allowed boolean not null default false;

create or replace function public.upsert_exam_access_rules(
  exam_id_input uuid,
  require_section_membership_input boolean default true,
  require_proctor_code_input boolean default true,
  proctor_code_input text default null,
  clear_proctor_code_input boolean default false,
  require_network_allowlist_input boolean default false,
  allow_mobile_hotspot_input boolean default false,
  block_vpn_input boolean default false,
  lockdown_mode_input boolean default true,
  suspicion_threshold_input integer default 100,
  open_notes_allowed_input boolean default false
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  target_exam public.exams%rowtype;
  current_rules public.exam_access_rules%rowtype;
  next_hash text;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  select * into target_exam
  from public.exams
  where id = exam_id_input;

  if target_exam.id is null then
    raise exception 'Exam not found';
  end if;

  if not public.section_professor_exists(target_exam.section_id, auth.uid()) then
    raise exception 'Only section professors can modify exam access rules';
  end if;

  select * into current_rules
  from public.exam_access_rules
  where exam_id = exam_id_input;

  if clear_proctor_code_input then
    next_hash := null;
  elsif coalesce(trim(proctor_code_input), '') <> '' then
    next_hash := public.hash_exam_proctor_code(proctor_code_input);
  else
    next_hash := current_rules.proctor_code_hash;
  end if;

  insert into public.exam_access_rules (
    exam_id,
    require_section_membership,
    require_proctor_code,
    proctor_code_hash,
    require_network_allowlist,
    allow_mobile_hotspot,
    block_vpn,
    lockdown_mode,
    open_notes_allowed,
    suspicion_threshold
  )
  values (
    exam_id_input,
    coalesce(require_section_membership_input, true),
    coalesce(require_proctor_code_input, true),
    next_hash,
    coalesce(require_network_allowlist_input, false),
    coalesce(allow_mobile_hotspot_input, false),
    coalesce(block_vpn_input, false),
    coalesce(lockdown_mode_input, true),
    coalesce(open_notes_allowed_input, false),
    greatest(20, least(500, coalesce(suspicion_threshold_input, 100)))
  )
  on conflict (exam_id)
  do update set
    require_section_membership = excluded.require_section_membership,
    require_proctor_code = excluded.require_proctor_code,
    proctor_code_hash = excluded.proctor_code_hash,
    require_network_allowlist = excluded.require_network_allowlist,
    allow_mobile_hotspot = excluded.allow_mobile_hotspot,
    block_vpn = excluded.block_vpn,
    lockdown_mode = excluded.lockdown_mode,
    open_notes_allowed = excluded.open_notes_allowed,
    suspicion_threshold = excluded.suspicion_threshold,
    updated_at = now();
end;
$$;

grant execute on function public.upsert_exam_access_rules(
  uuid,
  boolean,
  boolean,
  text,
  boolean,
  boolean,
  boolean,
  boolean,
  boolean,
  integer,
  boolean
) to authenticated;

drop function if exists public.get_exam_start_config_v2(uuid) cascade;
create function public.get_exam_start_config_v2(exam_id_input uuid)
returns table (
  exam_id uuid,
  section_id uuid,
  quiz_set_id uuid,
  title text,
  description text,
  starts_at timestamptz,
  ends_at timestamptz,
  duration_minutes int,
  attempt_limit int,
  shuffle_questions boolean,
  shuffle_options boolean,
  show_results_after text,
  mode text,
  published boolean,
  lockdown_mode boolean,
  require_proctor_code boolean,
  require_network_allowlist boolean,
  open_notes_allowed boolean
)
language sql
stable
security definer
set search_path = public
as $$
  select
    e.id as exam_id,
    e.section_id,
    e.quiz_set_id,
    e.title,
    e.description,
    e.starts_at,
    e.ends_at,
    e.duration_minutes,
    e.attempt_limit,
    e.shuffle_questions,
    e.shuffle_options,
    e.show_results_after,
    e.mode,
    e.published,
    coalesce(ar.lockdown_mode, true) as lockdown_mode,
    coalesce(ar.require_proctor_code, true) as require_proctor_code,
    coalesce(ar.require_network_allowlist, false) as require_network_allowlist,
    coalesce(ar.open_notes_allowed, false) as open_notes_allowed
  from public.exams e
  left join public.exam_access_rules ar on ar.exam_id = e.id
  where e.id = exam_id_input
    and (
      public.section_professor_exists(e.section_id, auth.uid())
      or (e.published = true and public.section_member_exists(e.section_id, auth.uid()))
    );
$$;

grant execute on function public.get_exam_start_config_v2(uuid) to authenticated;
