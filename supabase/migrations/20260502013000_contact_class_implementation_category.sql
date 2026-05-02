-- Add a first-class contact category for class/course implementation requests.

alter table public.contact_messages
  drop constraint if exists contact_messages_category_check;

alter table public.contact_messages
  add constraint contact_messages_category_check
  check (category in ('Bug', 'Content request', 'Account help', 'Class implementation', 'Other'));
