-- Professor timed exams + proctoring + same-network gating + suspicion scoring

create extension if not exists pgcrypto;

-- =====================================================
-- Core tables
-- =====================================================

create table if not exists public.exams (
  id uuid primary key default gen_random_uuid(),
  section_id uuid not null references public.class_sections(id) on delete cascade,
  title text not null,
  description text,
  quiz_set_id uuid references public.quiz_sets(id),
  mode text not null default 'timed',
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  duration_minutes int not null,
  attempt_limit int not null default 1,
  shuffle_questions boolean not null default true,
  shuffle_options boolean not null default true,
  show_results_after text not null default 'window_close',
  published boolean not null default false,
  created_by uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint exams_mode_check check (mode in ('timed', 'practice')),
  constraint exams_window_check check (ends_at > starts_at),
  constraint exams_duration_check check (duration_minutes between 1 and 360),
  constraint exams_attempt_limit_check check (attempt_limit between 1 and 20),
  constraint exams_show_results_after_check check (
    show_results_after in ('immediate', 'window_close', 'manual_release')
  )
);

create table if not exists public.exam_access_rules (
  exam_id uuid primary key references public.exams(id) on delete cascade,
  require_section_membership boolean not null default true,
  require_proctor_code boolean not null default true,
  proctor_code_hash text,
  require_network_allowlist boolean not null default false,
  allowed_ip_hashes text[] not null default '{}'::text[],
  allow_mobile_hotspot boolean not null default false,
  block_vpn boolean not null default false,
  lockdown_mode boolean not null default true,
  suspicion_threshold int not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint exam_access_rules_threshold_check check (suspicion_threshold between 20 and 500)
);

create table if not exists public.exam_attempts (
  id uuid primary key default gen_random_uuid(),
  exam_id uuid not null references public.exams(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  started_at timestamptz,
  submitted_at timestamptz,
  expires_at timestamptz,
  status text not null default 'created',
  score numeric,
  suspicion_score int not null default 0,
  ip_hash text,
  user_agent text,
  answers jsonb not null default '{}'::jsonb,
  graded_breakdown jsonb not null default '{}'::jsonb,
  last_heartbeat_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint exam_attempts_status_check check (
    status in ('created', 'in_progress', 'submitted', 'expired', 'voided')
  )
);

create table if not exists public.exam_events (
  id uuid primary key default gen_random_uuid(),
  exam_attempt_id uuid not null references public.exam_attempts(id) on delete cascade,
  event_type text not null,
  event_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.exam_attempt_sessions (
  exam_attempt_id uuid not null references public.exam_attempts(id) on delete cascade,
  session_id text not null,
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (exam_attempt_id, session_id)
);

create table if not exists public.exam_materials (
  id uuid primary key default gen_random_uuid(),
  section_id uuid not null references public.class_sections(id) on delete cascade,
  title text not null,
  storage_path text not null,
  visible_from timestamptz,
  visible_until timestamptz,
  created_by uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_exams_section on public.exams(section_id, starts_at desc);
create index if not exists idx_exams_published on public.exams(published, starts_at desc);
create index if not exists idx_exam_attempts_exam on public.exam_attempts(exam_id, created_at desc);
create index if not exists idx_exam_attempts_student on public.exam_attempts(student_id, created_at desc);
create index if not exists idx_exam_attempts_status on public.exam_attempts(status);
create unique index if not exists idx_exam_attempts_unique_start
  on public.exam_attempts(exam_id, student_id, started_at)
  where started_at is not null;
create index if not exists idx_exam_events_attempt on public.exam_events(exam_attempt_id, created_at desc);
create index if not exists idx_exam_materials_section on public.exam_materials(section_id, created_at desc);

drop trigger if exists trg_exams_updated_at on public.exams;
create trigger trg_exams_updated_at
before update on public.exams
for each row execute procedure public.set_updated_at();

drop trigger if exists trg_exam_access_rules_updated_at on public.exam_access_rules;
create trigger trg_exam_access_rules_updated_at
before update on public.exam_access_rules
for each row execute procedure public.set_updated_at();

drop trigger if exists trg_exam_attempts_updated_at on public.exam_attempts;
create trigger trg_exam_attempts_updated_at
before update on public.exam_attempts
for each row execute procedure public.set_updated_at();

drop trigger if exists trg_exam_attempt_sessions_updated_at on public.exam_attempt_sessions;
create trigger trg_exam_attempt_sessions_updated_at
before update on public.exam_attempt_sessions
for each row execute procedure public.set_updated_at();

drop trigger if exists trg_exam_materials_updated_at on public.exam_materials;
create trigger trg_exam_materials_updated_at
before update on public.exam_materials
for each row execute procedure public.set_updated_at();

-- =====================================================
-- Helper functions
-- =====================================================

create or replace function public.section_member_exists(section_id_input uuid, user_id_input uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.class_sections cs
    where cs.id = section_id_input
      and (
        cs.created_by = user_id_input
        or exists (
          select 1
          from public.section_members sm
          where sm.section_id = cs.id
            and sm.user_id = user_id_input
        )
      )
  );
$$;

create or replace function public.section_professor_exists(section_id_input uuid, user_id_input uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.class_sections cs
    where cs.id = section_id_input
      and (
        cs.created_by = user_id_input
        or exists (
          select 1
          from public.section_members sm
          where sm.section_id = cs.id
            and sm.user_id = user_id_input
            and sm.role in ('professor', 'ta')
        )
      )
  );
$$;

create or replace function public.hash_exam_proctor_code(code_input text)
returns text
language sql
immutable
set search_path = public
as $$
  select encode(extensions.digest(lower(trim(coalesce(code_input, ''))), 'sha256'::text), 'hex');
$$;

create or replace function public.jsonb_to_sorted_int_array(value_input jsonb)
returns int[]
language sql
immutable
as $$
  select coalesce(
    (
      select array_agg(v order by v)
      from (
        select (jsonb_array_elements_text(coalesce(value_input, '[]'::jsonb)))::int as v
      ) sorted
    ),
    '{}'::int[]
  );
$$;

create or replace function public.ensure_exam_access_rule()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.exam_access_rules (exam_id)
  values (new.id)
  on conflict (exam_id) do nothing;
  return new;
end;
$$;

drop trigger if exists trg_ensure_exam_access_rule on public.exams;
create trigger trg_ensure_exam_access_rule
after insert on public.exams
for each row execute procedure public.ensure_exam_access_rule();

create or replace function public.exam_event_points(event_type_input text)
returns int
language sql
immutable
as $$
  select case lower(coalesce(event_type_input, ''))
    when 'tab_blur' then 8
    when 'visibility_hidden' then 10
    when 'copy' then 18
    when 'paste' then 18
    when 'reconnect' then 6
    when 'ip_changed' then 25
    when 'devtools_suspected' then 25
    when 'multiple_sessions' then 40
    when 'timer_desync' then 20
    when 'submit_click' then 0
    when 'tab_focus' then 0
    else 4
  end;
$$;

create or replace function public.apply_exam_event_score()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  points_to_add int;
begin
  points_to_add := public.exam_event_points(new.event_type);
  if points_to_add > 0 then
    perform set_config('ue.exam_system_write', '1', true);
    update public.exam_attempts
    set suspicion_score = coalesce(suspicion_score, 0) + points_to_add,
        updated_at = now()
    where id = new.exam_attempt_id;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_exam_events_apply_score on public.exam_events;
create trigger trg_exam_events_apply_score
after insert on public.exam_events
for each row execute procedure public.apply_exam_event_score();

create or replace function public.block_student_exam_attempt_score_edits()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if auth.uid() = old.student_id
    and coalesce(current_setting('ue.exam_system_write', true), '0') <> '1' then
    if new.score is distinct from old.score then
      raise exception 'Students cannot directly modify exam scores.';
    end if;
    if new.suspicion_score is distinct from old.suspicion_score then
      raise exception 'Students cannot directly modify suspicion score.';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_block_student_exam_score_edits on public.exam_attempts;
create trigger trg_block_student_exam_score_edits
before update on public.exam_attempts
for each row execute procedure public.block_student_exam_attempt_score_edits();

-- =====================================================
-- RLS
-- =====================================================

alter table public.exams enable row level security;
alter table public.exam_access_rules enable row level security;
alter table public.exam_attempts enable row level security;
alter table public.exam_events enable row level security;
alter table public.exam_attempt_sessions enable row level security;
alter table public.exam_materials enable row level security;

drop policy if exists exams_select_professor on public.exams;
drop policy if exists exams_select_students_published on public.exams;
drop policy if exists exams_insert_professor on public.exams;
drop policy if exists exams_update_professor on public.exams;
drop policy if exists exams_delete_professor on public.exams;

create policy exams_select_professor
  on public.exams
  for select
  to authenticated
  using (public.section_professor_exists(section_id, auth.uid()));

create policy exams_select_students_published
  on public.exams
  for select
  to authenticated
  using (published = true and public.section_member_exists(section_id, auth.uid()));

create policy exams_insert_professor
  on public.exams
  for insert
  to authenticated
  with check (
    created_by = auth.uid()
    and public.section_professor_exists(section_id, auth.uid())
  );

create policy exams_update_professor
  on public.exams
  for update
  to authenticated
  using (public.section_professor_exists(section_id, auth.uid()))
  with check (public.section_professor_exists(section_id, auth.uid()));

create policy exams_delete_professor
  on public.exams
  for delete
  to authenticated
  using (public.section_professor_exists(section_id, auth.uid()));

drop policy if exists exam_access_rules_select_professor on public.exam_access_rules;
drop policy if exists exam_access_rules_insert_professor on public.exam_access_rules;
drop policy if exists exam_access_rules_update_professor on public.exam_access_rules;
drop policy if exists exam_access_rules_delete_professor on public.exam_access_rules;

create policy exam_access_rules_select_professor
  on public.exam_access_rules
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.exams e
      where e.id = exam_access_rules.exam_id
        and public.section_professor_exists(e.section_id, auth.uid())
    )
  );

create policy exam_access_rules_insert_professor
  on public.exam_access_rules
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.exams e
      where e.id = exam_access_rules.exam_id
        and public.section_professor_exists(e.section_id, auth.uid())
    )
  );

create policy exam_access_rules_update_professor
  on public.exam_access_rules
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.exams e
      where e.id = exam_access_rules.exam_id
        and public.section_professor_exists(e.section_id, auth.uid())
    )
  )
  with check (
    exists (
      select 1
      from public.exams e
      where e.id = exam_access_rules.exam_id
        and public.section_professor_exists(e.section_id, auth.uid())
    )
  );

create policy exam_access_rules_delete_professor
  on public.exam_access_rules
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.exams e
      where e.id = exam_access_rules.exam_id
        and public.section_professor_exists(e.section_id, auth.uid())
    )
  );

drop policy if exists exam_attempts_select_scope on public.exam_attempts;
drop policy if exists exam_attempts_insert_own on public.exam_attempts;
drop policy if exists exam_attempts_update_scope on public.exam_attempts;

create policy exam_attempts_select_scope
  on public.exam_attempts
  for select
  to authenticated
  using (
    student_id = auth.uid()
    or exists (
      select 1
      from public.exams e
      where e.id = exam_attempts.exam_id
        and public.section_professor_exists(e.section_id, auth.uid())
    )
  );

create policy exam_attempts_insert_own
  on public.exam_attempts
  for insert
  to authenticated
  with check (
    student_id = auth.uid()
    and exists (
      select 1
      from public.exams e
      where e.id = exam_attempts.exam_id
        and public.section_member_exists(e.section_id, auth.uid())
    )
  );

create policy exam_attempts_update_scope
  on public.exam_attempts
  for update
  to authenticated
  using (
    student_id = auth.uid()
    or exists (
      select 1
      from public.exams e
      where e.id = exam_attempts.exam_id
        and public.section_professor_exists(e.section_id, auth.uid())
    )
  )
  with check (
    student_id = auth.uid()
    or exists (
      select 1
      from public.exams e
      where e.id = exam_attempts.exam_id
        and public.section_professor_exists(e.section_id, auth.uid())
    )
  );

drop policy if exists exam_events_select_scope on public.exam_events;
drop policy if exists exam_events_insert_own on public.exam_events;

create policy exam_events_select_scope
  on public.exam_events
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.exam_attempts ea
      join public.exams e on e.id = ea.exam_id
      where ea.id = exam_events.exam_attempt_id
        and (
          ea.student_id = auth.uid()
          or public.section_professor_exists(e.section_id, auth.uid())
        )
    )
  );

create policy exam_events_insert_own
  on public.exam_events
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.exam_attempts ea
      where ea.id = exam_events.exam_attempt_id
        and ea.student_id = auth.uid()
    )
  );

drop policy if exists exam_materials_select_member on public.exam_materials;
drop policy if exists exam_materials_insert_professor on public.exam_materials;
drop policy if exists exam_materials_update_professor on public.exam_materials;
drop policy if exists exam_materials_delete_professor on public.exam_materials;

create policy exam_materials_select_member
  on public.exam_materials
  for select
  to authenticated
  using (
    (
      public.section_member_exists(section_id, auth.uid())
      and (visible_from is null or now() >= visible_from)
      and (visible_until is null or now() <= visible_until)
    )
    or public.section_professor_exists(section_id, auth.uid())
  );

create policy exam_materials_insert_professor
  on public.exam_materials
  for insert
  to authenticated
  with check (
    created_by = auth.uid()
    and public.section_professor_exists(section_id, auth.uid())
  );

create policy exam_materials_update_professor
  on public.exam_materials
  for update
  to authenticated
  using (public.section_professor_exists(section_id, auth.uid()))
  with check (public.section_professor_exists(section_id, auth.uid()));

create policy exam_materials_delete_professor
  on public.exam_materials
  for delete
  to authenticated
  using (public.section_professor_exists(section_id, auth.uid()));

-- Session table is internal to heartbeat RPCs.
drop policy if exists exam_attempt_sessions_none on public.exam_attempt_sessions;
create policy exam_attempt_sessions_none
  on public.exam_attempt_sessions
  for all
  to authenticated
  using (false)
  with check (false);

-- =====================================================
-- Professor exam config helpers
-- =====================================================

drop function if exists public.upsert_exam_access_rules(uuid, boolean, boolean, text, boolean, boolean, boolean, boolean, boolean, int) cascade;
create function public.upsert_exam_access_rules(
  exam_id_input uuid,
  require_section_membership_input boolean default true,
  require_proctor_code_input boolean default true,
  proctor_code_input text default null,
  clear_proctor_code_input boolean default false,
  require_network_allowlist_input boolean default false,
  allow_mobile_hotspot_input boolean default false,
  block_vpn_input boolean default false,
  lockdown_mode_input boolean default true,
  suspicion_threshold_input int default 100
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
    suspicion_threshold = excluded.suspicion_threshold,
    updated_at = now();
end;
$$;

grant execute on function public.upsert_exam_access_rules(uuid, boolean, boolean, text, boolean, boolean, boolean, boolean, boolean, int) to authenticated;

drop function if exists public.add_exam_allowed_network(uuid, text) cascade;
create function public.add_exam_allowed_network(exam_id_input uuid, ip_hash_input text)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  target_exam public.exams%rowtype;
  existing_hashes text[];
  next_hashes text[];
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if coalesce(trim(ip_hash_input), '') = '' then
    raise exception 'Network hash is required';
  end if;

  select * into target_exam
  from public.exams
  where id = exam_id_input;

  if target_exam.id is null then
    raise exception 'Exam not found';
  end if;

  if not public.section_professor_exists(target_exam.section_id, auth.uid()) then
    raise exception 'Only section professors can add networks';
  end if;

  insert into public.exam_access_rules (exam_id)
  values (exam_id_input)
  on conflict (exam_id) do nothing;

  select allowed_ip_hashes into existing_hashes
  from public.exam_access_rules
  where exam_id = exam_id_input
  for update;

  next_hashes := (
    select array_agg(distinct x order by x)
    from unnest(array_append(coalesce(existing_hashes, '{}'::text[]), ip_hash_input)) as x
  );

  update public.exam_access_rules
  set allowed_ip_hashes = coalesce(next_hashes, '{}'::text[]),
      require_network_allowlist = true,
      updated_at = now()
  where exam_id = exam_id_input;

  return coalesce(array_length(next_hashes, 1), 0);
end;
$$;

grant execute on function public.add_exam_allowed_network(uuid, text) to authenticated;

drop function if exists public.remove_exam_allowed_network(uuid, text) cascade;
create function public.remove_exam_allowed_network(exam_id_input uuid, ip_hash_input text)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  target_exam public.exams%rowtype;
  remaining_count int := 0;
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
    raise exception 'Only section professors can remove networks';
  end if;

  update public.exam_access_rules
  set allowed_ip_hashes = array_remove(coalesce(allowed_ip_hashes, '{}'::text[]), ip_hash_input),
      updated_at = now()
  where exam_id = exam_id_input;

  select coalesce(array_length(allowed_ip_hashes, 1), 0)
  into remaining_count
  from public.exam_access_rules
  where exam_id = exam_id_input;

  return coalesce(remaining_count, 0);
end;
$$;

grant execute on function public.remove_exam_allowed_network(uuid, text) to authenticated;

-- =====================================================
-- Student exam runtime RPCs
-- =====================================================

drop function if exists public.get_exam_start_config(uuid) cascade;
create function public.get_exam_start_config(exam_id_input uuid)
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
  require_network_allowlist boolean
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
    coalesce(ar.require_network_allowlist, false) as require_network_allowlist
  from public.exams e
  left join public.exam_access_rules ar on ar.exam_id = e.id
  where e.id = exam_id_input
    and (
      public.section_professor_exists(e.section_id, auth.uid())
      or (e.published = true and public.section_member_exists(e.section_id, auth.uid()))
    );
$$;

grant execute on function public.get_exam_start_config(uuid) to authenticated;

drop function if exists public.start_exam(uuid, text, text, text, text) cascade;
create function public.start_exam(
  exam_id_input uuid,
  proctor_code_input text default null,
  turnstile_token_input text default null,
  ip_hash_input text default null,
  user_agent_input text default null
)
returns table (
  attempt_id uuid,
  expires_at timestamptz,
  exam_ends_at timestamptz,
  duration_minutes int,
  status text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  target_exam public.exams%rowtype;
  rules_row public.exam_access_rules%rowtype;
  active_attempt public.exam_attempts%rowtype;
  attempts_used int := 0;
  start_time timestamptz;
  calculated_expiry timestamptz;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if trim(coalesce(turnstile_token_input, '')) <> '' then
    -- token is validated in API route; keep for audit compatibility.
    perform 1;
  end if;

  select * into target_exam
  from public.exams
  where id = exam_id_input;

  if target_exam.id is null then
    raise exception 'Exam not found';
  end if;

  if not target_exam.published then
    raise exception 'Exam is not published';
  end if;

  select * into rules_row
  from public.exam_access_rules
  where exam_id = exam_id_input;

  if coalesce(rules_row.require_section_membership, true) then
    if not public.section_member_exists(target_exam.section_id, auth.uid()) then
      raise exception 'You are not enrolled in this section';
    end if;
  end if;

  if now() < target_exam.starts_at or now() > target_exam.ends_at then
    raise exception 'Exam can only be started during its scheduled window';
  end if;

  if coalesce(rules_row.require_proctor_code, true) then
    if coalesce(trim(proctor_code_input), '') = '' then
      raise exception 'Proctor code is required';
    end if;
    if rules_row.proctor_code_hash is null
      or public.hash_exam_proctor_code(proctor_code_input) <> rules_row.proctor_code_hash then
      raise exception 'Invalid proctor code';
    end if;
  end if;

  if coalesce(rules_row.require_network_allowlist, false) then
    if coalesce(trim(ip_hash_input), '') = '' then
      raise exception 'Unable to verify network';
    end if;
    if not (ip_hash_input = any(coalesce(rules_row.allowed_ip_hashes, '{}'::text[]))) then
      raise exception 'This exam is restricted to approved networks';
    end if;
  end if;

  select *
  into active_attempt
  from public.exam_attempts ea
  where ea.exam_id = exam_id_input
    and ea.student_id = auth.uid()
    and ea.status = 'in_progress'
  order by ea.started_at desc nulls last
  limit 1;

  if active_attempt.id is not null then
    if active_attempt.expires_at is not null
      and now() > least(active_attempt.expires_at, target_exam.ends_at) then
      update public.exam_attempts
      set status = 'expired',
          updated_at = now()
      where id = active_attempt.id;
    else
      return query
      select
        active_attempt.id,
        active_attempt.expires_at,
        target_exam.ends_at,
        target_exam.duration_minutes,
        active_attempt.status;
      return;
    end if;
  end if;

  select count(*)
  into attempts_used
  from public.exam_attempts ea
  where ea.exam_id = exam_id_input
    and ea.student_id = auth.uid()
    and ea.status <> 'voided';

  if attempts_used >= target_exam.attempt_limit then
    raise exception 'Attempt limit reached for this exam';
  end if;

  start_time := now();
  calculated_expiry := least(
    start_time + make_interval(mins => target_exam.duration_minutes),
    target_exam.ends_at
  );

  insert into public.exam_attempts (
    exam_id,
    student_id,
    started_at,
    expires_at,
    status,
    ip_hash,
    user_agent,
    last_heartbeat_at
  )
  values (
    exam_id_input,
    auth.uid(),
    start_time,
    calculated_expiry,
    'in_progress',
    nullif(trim(coalesce(ip_hash_input, '')), ''),
    nullif(trim(coalesce(user_agent_input, '')), ''),
    now()
  )
  returning * into active_attempt;

  return query
  select
    active_attempt.id,
    active_attempt.expires_at,
    target_exam.ends_at,
    target_exam.duration_minutes,
    active_attempt.status;
end;
$$;

grant execute on function public.start_exam(uuid, text, text, text, text) to authenticated;

drop function if exists public.submit_exam(uuid, jsonb) cascade;
create function public.submit_exam(
  attempt_id_input uuid,
  answers_input jsonb default '{}'::jsonb
)
returns table (
  score numeric,
  correct_count int,
  total_count int,
  suspicion_score int,
  results_available boolean,
  show_results_after text,
  status text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  attempt_row record;
  computed_total int := 0;
  computed_correct int := 0;
  computed_score numeric := 0;
  computed_suspicion int := 0;
  release_mode text := 'window_close';
  final_status text := 'submitted';
  is_late boolean := false;
  deadline timestamptz;
  can_show_results boolean := false;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  select
    ea.*,
    e.quiz_set_id,
    e.ends_at as exam_ends_at,
    e.show_results_after
  into attempt_row
  from public.exam_attempts ea
  join public.exams e on e.id = ea.exam_id
  where ea.id = attempt_id_input;

  if attempt_row.id is null then
    raise exception 'Exam attempt not found';
  end if;

  if attempt_row.student_id <> auth.uid() then
    raise exception 'You can only submit your own attempt';
  end if;

  if attempt_row.status not in ('in_progress', 'created') then
    raise exception 'This attempt cannot be submitted';
  end if;

  deadline := least(coalesce(attempt_row.expires_at, attempt_row.exam_ends_at), attempt_row.exam_ends_at);
  is_late := now() > deadline;

  with question_rows as (
    select
      q.id,
      q.type,
      coalesce(q.correct, '[]'::jsonb) as correct_json
    from public.questions q
    where q.quiz_set_id = attempt_row.quiz_set_id
  ),
  graded as (
    select
      qr.id,
      case
        when qr.type = 'free' then false
        else
          public.jsonb_to_sorted_int_array(coalesce(answers_input -> qr.id::text, '[]'::jsonb))
          = public.jsonb_to_sorted_int_array(qr.correct_json)
      end as is_correct
    from question_rows qr
  )
  select
    count(*)::int as total_count,
    count(*) filter (where is_correct)::int as correct_count
  into computed_total, computed_correct
  from graded;

  if computed_total > 0 then
    computed_score := round((computed_correct::numeric * 100.0) / computed_total::numeric, 2);
  else
    computed_score := 0;
  end if;

  final_status := case when is_late then 'expired' else 'submitted' end;

  perform set_config('ue.exam_system_write', '1', true);
  update public.exam_attempts
  set answers = coalesce(answers_input, '{}'::jsonb),
      graded_breakdown = jsonb_build_object(
        'correct_count', computed_correct,
        'total_count', computed_total
      ),
      score = computed_score,
      submitted_at = now(),
      status = final_status,
      updated_at = now()
  where id = attempt_id_input;

  select ea.suspicion_score into computed_suspicion
  from public.exam_attempts ea
  where ea.id = attempt_id_input;

  release_mode := coalesce(attempt_row.show_results_after, 'window_close');
  can_show_results := case
    when release_mode = 'immediate' then true
    when release_mode = 'window_close' then now() >= attempt_row.exam_ends_at
    else false
  end;

  return query
  select
    computed_score,
    computed_correct,
    computed_total,
    computed_suspicion,
    can_show_results,
    release_mode,
    final_status;
end;
$$;

grant execute on function public.submit_exam(uuid, jsonb) to authenticated;

drop function if exists public.log_exam_event(uuid, text, jsonb) cascade;
create function public.log_exam_event(
  attempt_id_input uuid,
  event_type_input text,
  payload_input jsonb default '{}'::jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  owner_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  select student_id into owner_id
  from public.exam_attempts
  where id = attempt_id_input;

  if owner_id is null then
    raise exception 'Attempt not found';
  end if;

  if owner_id <> auth.uid() then
    raise exception 'You can only log events for your own attempt';
  end if;

  if exists (
    select 1
    from public.exam_events ee
    where ee.exam_attempt_id = attempt_id_input
      and ee.event_type = lower(trim(event_type_input))
      and ee.created_at >= now() - interval '3 seconds'
  ) then
    return;
  end if;

  insert into public.exam_events (exam_attempt_id, event_type, event_payload)
  values (
    attempt_id_input,
    lower(trim(event_type_input)),
    coalesce(payload_input, '{}'::jsonb)
  );
end;
$$;

grant execute on function public.log_exam_event(uuid, text, jsonb) to authenticated;

drop function if exists public.heartbeat_exam_attempt(uuid, text, text, text, text) cascade;
create function public.heartbeat_exam_attempt(
  attempt_id_input uuid,
  session_id_input text,
  ip_hash_input text default null,
  user_agent_input text default null,
  visibility_state_input text default null
)
returns table (
  time_remaining_seconds int,
  status text,
  suspicion_score int,
  flagged boolean,
  active_sessions int,
  expires_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  attempt_row record;
  normalized_session text;
  deadline timestamptz;
  remaining_seconds int := 0;
  threshold_value int := 100;
  active_count int := 0;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  select
    ea.*,
    e.ends_at as exam_ends_at,
    coalesce(ar.suspicion_threshold, 100) as threshold_value
  into attempt_row
  from public.exam_attempts ea
  join public.exams e on e.id = ea.exam_id
  left join public.exam_access_rules ar on ar.exam_id = ea.exam_id
  where ea.id = attempt_id_input;

  if attempt_row.id is null then
    raise exception 'Attempt not found';
  end if;

  if attempt_row.student_id <> auth.uid() then
    raise exception 'Unauthorized attempt heartbeat';
  end if;

  normalized_session := nullif(trim(coalesce(session_id_input, '')), '');
  if normalized_session is null then
    normalized_session := 'session-' || substr(gen_random_uuid()::text, 1, 12);
  end if;

  insert into public.exam_attempt_sessions (exam_attempt_id, session_id, last_seen_at)
  values (attempt_id_input, normalized_session, now())
  on conflict (exam_attempt_id, session_id)
  do update set
    last_seen_at = excluded.last_seen_at,
    updated_at = now();

  delete from public.exam_attempt_sessions
  where exam_attempt_id = attempt_id_input
    and last_seen_at < now() - interval '45 seconds';

  select count(*)
  into active_count
  from public.exam_attempt_sessions eas
  where eas.exam_attempt_id = attempt_id_input
    and eas.last_seen_at >= now() - interval '30 seconds';

  if active_count > 1 then
    perform public.log_exam_event(
      attempt_id_input,
      'multiple_sessions',
      jsonb_build_object('active_sessions', active_count)
    );
  end if;

  if coalesce(trim(ip_hash_input), '') <> '' then
    if attempt_row.ip_hash is not null and attempt_row.ip_hash <> ip_hash_input then
      perform public.log_exam_event(
        attempt_id_input,
        'ip_changed',
        jsonb_build_object('from', attempt_row.ip_hash, 'to', ip_hash_input)
      );
    end if;
  end if;

  if lower(coalesce(visibility_state_input, '')) = 'hidden' then
    perform public.log_exam_event(
      attempt_id_input,
      'visibility_hidden',
      jsonb_build_object('source', 'heartbeat')
    );
  end if;

  update public.exam_attempts
  set ip_hash = coalesce(exam_attempts.ip_hash, nullif(trim(coalesce(ip_hash_input, '')), '')),
      user_agent = coalesce(nullif(trim(coalesce(user_agent_input, '')), ''), exam_attempts.user_agent),
      last_heartbeat_at = now(),
      updated_at = now()
  where id = attempt_id_input;

  deadline := least(coalesce(attempt_row.expires_at, attempt_row.exam_ends_at), attempt_row.exam_ends_at);

  if attempt_row.status = 'in_progress' and now() > deadline then
    update public.exam_attempts
    set status = 'expired',
        updated_at = now()
    where id = attempt_id_input;
  end if;

  select
    ea.status,
    ea.suspicion_score,
    ea.expires_at
  into attempt_row.status, attempt_row.suspicion_score, attempt_row.expires_at
  from public.exam_attempts ea
  where ea.id = attempt_id_input;

  remaining_seconds := greatest(0, floor(extract(epoch from (deadline - now())))::int);
  threshold_value := coalesce(attempt_row.threshold_value, 100);

  return query
  select
    remaining_seconds,
    attempt_row.status::text,
    coalesce(attempt_row.suspicion_score, 0)::int,
    (coalesce(attempt_row.suspicion_score, 0) >= threshold_value),
    active_count,
    attempt_row.expires_at;
end;
$$;

grant execute on function public.heartbeat_exam_attempt(uuid, text, text, text, text) to authenticated;

-- =====================================================
-- Professor monitor RPCs
-- =====================================================

drop function if exists public.get_exam_monitor(uuid) cascade;
create function public.get_exam_monitor(exam_id_input uuid)
returns table (
  attempt_id uuid,
  student_id uuid,
  student_display_name text,
  started_at timestamptz,
  submitted_at timestamptz,
  expires_at timestamptz,
  status text,
  score numeric,
  suspicion_score int,
  flagged boolean,
  time_remaining_seconds int
)
language sql
stable
security definer
set search_path = public
as $$
  with exam_meta as (
    select
      e.id,
      e.section_id,
      e.ends_at,
      coalesce(ar.suspicion_threshold, 100) as threshold
    from public.exams e
    left join public.exam_access_rules ar on ar.exam_id = e.id
    where e.id = exam_id_input
  )
  select
    ea.id as attempt_id,
    ea.student_id,
    p.display_name as student_display_name,
    ea.started_at,
    ea.submitted_at,
    ea.expires_at,
    ea.status,
    ea.score,
    ea.suspicion_score,
    (ea.suspicion_score >= em.threshold) as flagged,
    case
      when ea.status <> 'in_progress' then 0
      else greatest(
        0,
        floor(extract(epoch from (least(coalesce(ea.expires_at, em.ends_at), em.ends_at) - now())))::int
      )
    end as time_remaining_seconds
  from public.exam_attempts ea
  join exam_meta em on em.id = ea.exam_id
  join public.profiles p on p.id = ea.student_id
  where public.section_professor_exists(em.section_id, auth.uid())
  order by ea.started_at desc nulls last, ea.created_at desc;
$$;

grant execute on function public.get_exam_monitor(uuid) to authenticated;

drop function if exists public.get_exam_events(uuid, uuid) cascade;
create function public.get_exam_events(exam_id_input uuid, attempt_id_input uuid default null)
returns table (
  exam_attempt_id uuid,
  student_id uuid,
  student_display_name text,
  event_type text,
  event_payload jsonb,
  created_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select
    ee.exam_attempt_id,
    ea.student_id,
    p.display_name as student_display_name,
    ee.event_type,
    ee.event_payload,
    ee.created_at
  from public.exam_events ee
  join public.exam_attempts ea on ea.id = ee.exam_attempt_id
  join public.exams e on e.id = ea.exam_id
  join public.profiles p on p.id = ea.student_id
  where e.id = exam_id_input
    and (attempt_id_input is null or ee.exam_attempt_id = attempt_id_input)
    and (
      public.section_professor_exists(e.section_id, auth.uid())
      or ea.student_id = auth.uid()
    )
  order by ee.created_at desc
  limit 1000;
$$;

grant execute on function public.get_exam_events(uuid, uuid) to authenticated;
