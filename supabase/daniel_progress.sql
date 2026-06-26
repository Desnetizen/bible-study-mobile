create table if not exists public.daniel_progress (
  device_id text primary key,
  completed_chapters integer[] not null default '{}',
  updated_at timestamptz not null default now()
);

alter table public.daniel_progress enable row level security;

drop policy if exists "Allow anon read access to Daniel progress" on public.daniel_progress;
drop policy if exists "Allow anon insert access to Daniel progress" on public.daniel_progress;
drop policy if exists "Allow anon update access to Daniel progress" on public.daniel_progress;

create policy "device_id read access"
  on public.daniel_progress
  for select
  to anon
  using (device_id = nullif(current_setting('app.device_id', true), '')::text);

create policy "device_id insert access"
  on public.daniel_progress
  for insert
  to anon
  with check (device_id = nullif(current_setting('app.device_id', true), '')::text);

create policy "device_id update access"
  on public.daniel_progress
  for update
  to anon
  using (device_id = nullif(current_setting('app.device_id', true), '')::text)
  with check (device_id = nullif(current_setting('app.device_id', true), '')::text);
