-- ============================================================
-- Create recent_activity table for device-scoped activity log
-- ============================================================

create table if not exists public.recent_activity (
  id bigint generated always as identity primary key,
  device_id text not null,
  activity_type text not null,
  label text not null,
  metadata jsonb default '{}',
  created_at timestamptz not null default now()
);

create index if not exists idx_recent_activity_device
  on public.recent_activity (device_id, created_at desc);

alter table public.recent_activity enable row level security;

create policy "device_id read access"
  on public.recent_activity
  for select
  to authenticated
  using (device_id = public.get_device_id());

create policy "device_id insert access"
  on public.recent_activity
  for insert
  to authenticated
  with check (device_id = public.get_device_id());

create policy "device_id delete access"
  on public.recent_activity
  for delete
  to authenticated
  using (device_id = public.get_device_id());
