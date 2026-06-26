-- ============================================================
-- Fix permissive RLS policies — use device_id-scoped checks
-- via a custom session variable instead of open anon access.
-- ============================================================

-- Step 1: Helper function to get the device_id from session
create or replace function public.get_device_id()
returns text
language sql
stable
as $$
  select nullif(current_setting('app.device_id', true), '')::text;
$$;

-- Step 2: Helper function to set the device_id in session
create or replace function public.set_app_device_id(device_id text)
returns void
language sql
security definer
as $$
  select set_config('app.device_id', device_id, false);
$$;

-- ============================================================
-- daniel_progress policies
-- ============================================================

drop policy if exists "Allow anon read access to Daniel progress" on public.daniel_progress;
drop policy if exists "Allow anon insert access to Daniel progress" on public.daniel_progress;
drop policy if exists "Allow anon update access to Daniel progress" on public.daniel_progress;

create policy "device_id read access"
  on public.daniel_progress
  for select
  to anon
  using (device_id = public.get_device_id());

create policy "device_id insert access"
  on public.daniel_progress
  for insert
  to anon
  with check (device_id = public.get_device_id());

create policy "device_id update access"
  on public.daniel_progress
  for update
  to anon
  using (device_id = public.get_device_id())
  with check (device_id = public.get_device_id());

-- ============================================================
-- user_activity policies
-- ============================================================

drop policy if exists "Allow anon read access to user_activity" on public.user_activity;
drop policy if exists "Allow anon insert access to user_activity" on public.user_activity;

create policy "device_id read access"
  on public.user_activity
  for select
  to anon
  using (device_id = public.get_device_id());

create policy "device_id insert access"
  on public.user_activity
  for insert
  to anon
  with check (device_id = public.get_device_id());
