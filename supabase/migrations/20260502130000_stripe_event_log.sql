-- ════════════════════════════════════════════════════════════════════
-- Stripe billing — event-log table for webhook idempotency
-- ════════════════════════════════════════════════════════════════════
-- Stripe retries webhook deliveries on any 5xx and on network errors.
-- This table lets the webhook route record each event id exactly once
-- and short-circuit duplicate deliveries with a 200.
--
-- Locked down: no client may read or write this table. Service role
-- (the webhook handler) bypasses RLS and is the only writer.
-- ════════════════════════════════════════════════════════════════════

create table if not exists public.stripe_event_log (
  event_id     text primary key,
  event_type   text not null,
  received_at  timestamptz not null default now()
);

create index if not exists idx_stripe_event_log_received_at
  on public.stripe_event_log(received_at desc);

comment on table public.stripe_event_log is
  'Webhook idempotency log. The webhook handler INSERTs each event id ON CONFLICT DO NOTHING and skips processing if the row already existed. Service-role write only.';

alter table public.stripe_event_log enable row level security;

-- Default-deny: no permissive policy + a RESTRICTIVE belt-and-suspenders.
drop policy if exists stripe_event_log_no_client_write on public.stripe_event_log;
create policy stripe_event_log_no_client_write
  on public.stripe_event_log
  for all
  to authenticated, anon
  using (false)
  with check (false);

drop policy if exists stripe_event_log_restrict on public.stripe_event_log;
create policy stripe_event_log_restrict
  on public.stripe_event_log
  as restrictive
  for all
  to authenticated, anon
  using (false)
  with check (false);
