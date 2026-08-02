create table registrations (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  event_id text not null,
  name text not null,
  email text not null,
  phone text not null,
  program text not null,          -- MBA / IPM / PhD
  notes text
);
-- RLS ON, no public policies; only the service key (server-side) writes.
