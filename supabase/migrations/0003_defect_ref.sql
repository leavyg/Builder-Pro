-- Human-friendly sequential reference number per defect (#001, #002, …).
-- bigserial backfills existing rows with incrementing values automatically.
-- Run in the Supabase SQL Editor.
alter table defects add column if not exists ref bigserial;
