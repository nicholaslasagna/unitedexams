-- ════════════════════════════════════════════════════════════════════
-- University-linked student account deletion — approval gate
-- ════════════════════════════════════════════════════════════════════
-- Students whose profile has a university_id cannot just self-delete
-- the account. They must submit a deletion request which a university
-- admin from their school approves or rejects.
--
-- Why: a class often depends on student attempts/submissions/grades
-- being attached to a real auth.users row. A student walking away
-- mid-term and nuking their account erases work the professor may
-- still need to grade, and orphans assignments. The university admin
-- approval is a soft compliance gate — same shape as the existing
-- profile_name_change_requests + professor_verification flows.
--
-- Out of scope (deliberately):
--   - Professors / admins / unaffiliated students keep self-delete.
--   - Existing data is unchanged. The gate only affects the RPC path.
-- ════════════════════════════════════════════════════════════════════

-- ── 1. Request table ────────────────────────────────────────────────

create table if not exists public.account_deletion_requests (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.profiles(id) on delete cascade,
  university_id   uuid not null references public.universities(id) on delete cascade,
  status          text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected', 'cancelled', 'fulfilled')),
  reason          text,
  reviewed_by     uuid references public.profiles(id) on delete set null,
  reviewed_at     timestamptz,
  rejection_reason text,
  approved_at     timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  constraint account_deletion_requests_reason_len_check
    check (reason is null or char_length(trim(reason)) <= 600)
);

create index if not exists idx_account_deletion_requests_user_created
  on public.account_deletion_requests(user_id, created_at desc);

create index if not exists idx_account_deletion_requests_university_status
  on public.account_deletion_requests(university_id, status, created_at desc);

-- One pending request per user at a time.
create unique index if not exists idx_account_deletion_requests_pending_unique
  on public.account_deletion_requests(user_id)
  where status = 'pending';

-- One approved-but-not-yet-fulfilled request per user at a time.
create unique index if not exists idx_account_deletion_requests_approved_unique
  on public.account_deletion_requests(user_id)
  where status = 'approved';

drop trigger if exists trg_account_deletion_requests_updated_at
  on public.account_deletion_requests;
create trigger trg_account_deletion_requests_updated_at
  before update on public.account_deletion_requests
  for each row execute procedure public.set_updated_at();

comment on table public.account_deletion_requests is
  'University-linked students must submit a deletion request and have it approved by a university admin from their school before delete_my_account() will succeed. Mirrors the profile_name_change_requests pattern.';

-- ── 2. RLS ──────────────────────────────────────────────────────────

alter table public.account_deletion_requests enable row level security;

-- Users can read their own request history.
drop policy if exists account_deletion_requests_select_own
  on public.account_deletion_requests;
create policy account_deletion_requests_select_own
  on public.account_deletion_requests
  for select
  to authenticated
  using (user_id = auth.uid());

-- University admins of the same school can read every request for it.
drop policy if exists account_deletion_requests_select_admin
  on public.account_deletion_requests;
create policy account_deletion_requests_select_admin
  on public.account_deletion_requests
  for select
  to authenticated
  using (public.is_university_admin(auth.uid(), university_id));

-- Users can insert their own pending request, and only their own.
-- The university_id must match their profile (so they can't request
-- deletion under a school they don't belong to).
drop policy if exists account_deletion_requests_insert_own
  on public.account_deletion_requests;
create policy account_deletion_requests_insert_own
  on public.account_deletion_requests
  for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and status = 'pending'
    and reviewed_by is null
    and reviewed_at is null
    and approved_at is null
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.university_id = university_id
    )
  );

-- Users can cancel their own pending request (sets status='cancelled').
-- They cannot mark it approved/rejected/fulfilled — those are admin-only.
drop policy if exists account_deletion_requests_update_own_cancel
  on public.account_deletion_requests;
create policy account_deletion_requests_update_own_cancel
  on public.account_deletion_requests
  for update
  to authenticated
  using (user_id = auth.uid() and status = 'pending')
  with check (user_id = auth.uid() and status in ('pending', 'cancelled'));

-- University admins can decide (approve / reject) requests for their
-- school. Cannot change user_id or university_id.
drop policy if exists account_deletion_requests_update_admin
  on public.account_deletion_requests;
create policy account_deletion_requests_update_admin
  on public.account_deletion_requests
  for update
  to authenticated
  using (public.is_university_admin(auth.uid(), university_id))
  with check (public.is_university_admin(auth.uid(), university_id));

-- ── 3. RPC: request_account_deletion(reason) ────────────────────────

drop function if exists public.request_account_deletion(text);
create function public.request_account_deletion(reason_input text default null)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  uni uuid;
  user_role text;
  existing_id uuid;
  new_id uuid;
begin
  if uid is null then
    raise exception 'Authentication required';
  end if;

  select p.university_id, p.role
    into uni, user_role
    from public.profiles p
   where p.id = uid;

  if uni is null then
    raise exception 'Account is not linked to a university — use delete_my_account directly.';
  end if;

  if user_role is distinct from 'student' then
    raise exception 'Only students need to request deletion. Other roles can delete directly.';
  end if;

  -- Don't pile on duplicate pending rows.
  select id into existing_id
    from public.account_deletion_requests
   where user_id = uid and status = 'pending'
   limit 1;
  if existing_id is not null then
    return existing_id;
  end if;

  insert into public.account_deletion_requests (user_id, university_id, reason)
  values (uid, uni, nullif(trim(coalesce(reason_input, '')), ''))
  returning id into new_id;

  return new_id;
end;
$$;

revoke all on function public.request_account_deletion(text) from public, anon;
grant execute on function public.request_account_deletion(text) to authenticated;

-- ── 4. RPC: cancel_my_account_deletion_request() ────────────────────

drop function if exists public.cancel_my_account_deletion_request();
create function public.cancel_my_account_deletion_request()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'Authentication required';
  end if;

  update public.account_deletion_requests
     set status = 'cancelled'
   where user_id = uid
     and status = 'pending';
end;
$$;

revoke all on function public.cancel_my_account_deletion_request() from public, anon;
grant execute on function public.cancel_my_account_deletion_request() to authenticated;

-- ── 5. RPC: decide_account_deletion_request(id, decision, reason) ───

drop function if exists public.decide_account_deletion_request(uuid, text, text);
create function public.decide_account_deletion_request(
  request_id uuid,
  decision text,
  rejection_reason_input text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  admin_uid uuid := auth.uid();
  req_uni uuid;
  req_status text;
begin
  if admin_uid is null then
    raise exception 'Authentication required';
  end if;

  if decision not in ('approved', 'rejected') then
    raise exception 'Decision must be either approved or rejected';
  end if;

  select university_id, status
    into req_uni, req_status
    from public.account_deletion_requests
   where id = request_id;

  if req_uni is null then
    raise exception 'Request not found';
  end if;

  if not public.is_university_admin(admin_uid, req_uni) then
    raise exception 'Only a university admin from this school can decide this request';
  end if;

  if req_status <> 'pending' then
    raise exception 'Request is no longer pending';
  end if;

  update public.account_deletion_requests
     set status = decision,
         reviewed_by = admin_uid,
         reviewed_at = now(),
         approved_at = case when decision = 'approved' then now() else approved_at end,
         rejection_reason = case
           when decision = 'rejected'
             then nullif(trim(coalesce(rejection_reason_input, '')), '')
           else null
         end
   where id = request_id;
end;
$$;

revoke all on function public.decide_account_deletion_request(uuid, text, text) from public, anon;
grant execute on function public.decide_account_deletion_request(uuid, text, text) to authenticated;

-- ── 6. Harden delete_my_account ─────────────────────────────────────
-- Re-define delete_my_account so it refuses to run for university-
-- linked students unless they have an approved deletion request.
-- Approving the request also marks it 'fulfilled' before the actual
-- delete fires (so admins can audit who actually went through with
-- the deletion vs. who only got approval).
--
-- Behavior preserved for everyone else:
--   - Unaffiliated students → delete immediately as before
--   - Professors            → delete immediately as before
--   - Admins                → delete immediately as before

create or replace function public.delete_my_account(confirmation_text text)
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  uid uuid := auth.uid();
  uni uuid;
  user_role text;
  approved_request_id uuid;
begin
  if uid is null then
    raise exception 'Authentication required';
  end if;

  if confirmation_text is distinct from 'DELETE' then
    raise exception 'Invalid confirmation text';
  end if;

  -- Fetch the role / university so we can branch on the gate.
  select p.university_id, p.role
    into uni, user_role
    from public.profiles p
   where p.id = uid;

  -- Gate: university-linked students require an approved request.
  if uni is not null and user_role = 'student' then
    select id into approved_request_id
      from public.account_deletion_requests
     where user_id = uid and status = 'approved'
     order by approved_at desc nulls last
     limit 1;

    if approved_request_id is null then
      raise exception 'University-linked student accounts require admin approval before deletion. Submit a deletion request and wait for your school to approve it.'
        using errcode = '42501';
    end if;

    -- Mark the request as fulfilled before the cascade nukes it.
    -- We persist it for the admin audit trail by also writing into
    -- audit_log if available (best-effort).
    update public.account_deletion_requests
       set status = 'fulfilled'
     where id = approved_request_id;

    begin
      perform public.audit_record_event(
        uid,
        'account.deleted_after_approval',
        'auth_user',
        uid::text,
        'success',
        jsonb_build_object('request_id', approved_request_id, 'university_id', uni)
      );
    exception when others then
      -- Audit infra may not exist in older snapshots; never block delete.
      null;
    end;
  end if;

  delete from auth.users
  where id = uid;
end;
$$;

grant execute on function public.delete_my_account(text) to authenticated;
