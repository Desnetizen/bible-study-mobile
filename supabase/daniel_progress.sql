create table if not exists public.daniel_progress (
  device_id text primary key,
  completed_chapters integer[] not null default '{}',
  updated_at timestamptz not null default now()
);

alter table public.daniel_progress enable row level security;

drop policy if exists "Allow anon read access to Daniel progress" on public.daniel_progress;
create policy "Allow anon read access to Daniel progress"
on public.daniel_progress
for select
to anon
using (true);

drop policy if exists "Allow anon insert access to Daniel progress" on public.daniel_progress;
create policy "Allow anon insert access to Daniel progress"
on public.daniel_progress
for insert
to anon
with check (true);

drop policy if exists "Allow anon update access to Daniel progress" on public.daniel_progress;
create policy "Allow anon update access to Daniel progress"
on public.daniel_progress
for update
to anon
using (true)
with check (true);
