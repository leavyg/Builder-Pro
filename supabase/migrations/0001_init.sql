-- Builder-Pro initial schema
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New query → paste → Run).
-- Safe to re-run: uses "if not exists" / "create or replace" where possible.

-- =============================================================
-- Tables
-- =============================================================

-- A building site. For the pilot there is exactly one row, owned by Dad.
create table if not exists sites (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  manager_id  uuid not null references auth.users(id) on delete cascade,
  created_at  timestamptz not null default now()
);

-- Contractors are CONTACT RECORDS the manager sets up. They have NO login.
create table if not exists contractors (
  id       uuid primary key default gen_random_uuid(),
  site_id  uuid not null references sites(id) on delete cascade,
  name     text not null,
  trade    text,                         -- e.g. "Electrician"
  phone    text,                         -- for SMS / WhatsApp
  email    text,                         -- for email notifications
  created_at timestamptz not null default now()
);

-- Tappable location list so the manager taps a place instead of typing it.
create table if not exists zones (
  id       uuid primary key default gen_random_uuid(),
  site_id  uuid not null references sites(id) on delete cascade,
  label    text not null,                -- e.g. "Block A / Floor 2 / Unit 14"
  created_at timestamptz not null default now()
);

-- The core entity: one defect = one problem assigned to one contractor.
create table if not exists defects (
  id                uuid primary key default gen_random_uuid(),
  site_id           uuid not null references sites(id) on delete cascade,
  contractor_id     uuid not null references contractors(id) on delete restrict,
  zone_id           uuid references zones(id) on delete set null,
  problem_photo_url text not null,       -- storage path of the "what's wrong" photo
  description       text not null,       -- the one-line voice-to-text note
  location_text     text,               -- optional free-text fallback
  gps_lat           double precision,
  gps_lng           double precision,
  status            text not null default 'open'
                      check (status in ('open','fixed_pending','approved')),
  fixed_photo_url   text,               -- storage path of the "fixed" photo
  fixed_at          timestamptz,
  approved_at       timestamptz,
  -- unguessable token that powers the contractor's no-login /fix/<token> link
  response_token    uuid not null default gen_random_uuid(),
  created_by        uuid not null references auth.users(id),
  created_at        timestamptz not null default now()
);

create index if not exists defects_site_idx on defects(site_id);
create index if not exists defects_token_idx on defects(response_token);
create index if not exists defects_status_idx on defects(status);

-- Append-only audit log: every state change. This IS the permanent record.
create table if not exists defect_events (
  id         uuid primary key default gen_random_uuid(),
  defect_id  uuid not null references defects(id) on delete cascade,
  type       text not null,             -- 'created' | 'fixed_submitted' | 'approved' | 'rejected'
  actor      text not null,             -- 'manager' | 'contractor'
  note       text,
  created_at timestamptz not null default now()
);

create index if not exists defect_events_defect_idx on defect_events(defect_id);

-- =============================================================
-- Row Level Security (RLS)
-- The contractor flow runs server-side with the service-role key (which BYPASSES
-- RLS), so we do NOT create any public policies. These policies only grant the
-- logged-in manager access to their own site's data. Everything else is denied.
-- =============================================================

alter table sites          enable row level security;
alter table contractors    enable row level security;
alter table zones          enable row level security;
alter table defects        enable row level security;
alter table defect_events  enable row level security;

-- Manager owns their site row.
drop policy if exists "manager manages own sites" on sites;
create policy "manager manages own sites" on sites
  for all using (manager_id = auth.uid()) with check (manager_id = auth.uid());

-- Helper predicate reused below: the row's site belongs to the current manager.
drop policy if exists "manager manages own contractors" on contractors;
create policy "manager manages own contractors" on contractors
  for all using (site_id in (select id from sites where manager_id = auth.uid()))
  with check (site_id in (select id from sites where manager_id = auth.uid()));

drop policy if exists "manager manages own zones" on zones;
create policy "manager manages own zones" on zones
  for all using (site_id in (select id from sites where manager_id = auth.uid()))
  with check (site_id in (select id from sites where manager_id = auth.uid()));

drop policy if exists "manager manages own defects" on defects;
create policy "manager manages own defects" on defects
  for all using (site_id in (select id from sites where manager_id = auth.uid()))
  with check (site_id in (select id from sites where manager_id = auth.uid()));

drop policy if exists "manager reads own defect events" on defect_events;
create policy "manager reads own defect events" on defect_events
  for all using (defect_id in (
    select d.id from defects d
    join sites s on s.id = d.site_id
    where s.manager_id = auth.uid()
  ));

-- =============================================================
-- Storage bucket for photos (private; access via server-signed URLs)
-- =============================================================
insert into storage.buckets (id, name, public)
values ('defect-photos', 'defect-photos', false)
on conflict (id) do nothing;
