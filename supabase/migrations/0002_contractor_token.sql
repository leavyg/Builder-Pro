-- Per-contractor secret link: one stable token per contractor that powers their
-- /c/<token> page (lists only their own snags). Run in the Supabase SQL Editor.
alter table contractors
  add column if not exists response_token uuid not null default gen_random_uuid();

create index if not exists contractors_token_idx on contractors(response_token);
