-- Two-level location: terraces (e.g. "T41") each with house addresses
-- (e.g. "6 Skylark Park Close"). Replaces the flat zones list. Run in SQL Editor.

create table if not exists terraces (
  id         uuid primary key default gen_random_uuid(),
  site_id    uuid not null references sites(id) on delete cascade,
  name       text not null,
  created_at timestamptz not null default now(),
  unique (site_id, name)
);

create table if not exists addresses (
  id          uuid primary key default gen_random_uuid(),
  terrace_id  uuid not null references terraces(id) on delete cascade,
  label       text not null,
  created_at  timestamptz not null default now()
);
create index if not exists addresses_terrace_idx on addresses(terrace_id);

-- The chosen house on a defect (its terrace is reached via the join).
alter table defects add column if not exists address_id uuid references addresses(id) on delete set null;
create index if not exists defects_address_idx on defects(address_id);

-- RLS: manager manages their own site's terraces + addresses. (Contractor pages
-- read via the service-role key, which bypasses RLS.)
alter table terraces  enable row level security;
alter table addresses enable row level security;

drop policy if exists "manager manages own terraces" on terraces;
create policy "manager manages own terraces" on terraces
  for all using (site_id in (select id from sites where manager_id = auth.uid()))
  with check (site_id in (select id from sites where manager_id = auth.uid()));

drop policy if exists "manager manages own addresses" on addresses;
create policy "manager manages own addresses" on addresses
  for all using (
    terrace_id in (
      select t.id from terraces t join sites s on s.id = t.site_id
      where s.manager_id = auth.uid()
    )
  )
  with check (
    terrace_id in (
      select t.id from terraces t join sites s on s.id = t.site_id
      where s.manager_id = auth.uid()
    )
  );
