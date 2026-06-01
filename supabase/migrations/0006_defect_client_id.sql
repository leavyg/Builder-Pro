-- Idempotency key for offline-queued captures: a client-generated id so a
-- retried upload can't create a duplicate defect. Run in the Supabase SQL Editor.
alter table defects add column if not exists client_id uuid;

create unique index if not exists defects_client_id_key
  on defects(client_id)
  where client_id is not null;
