-- ============================================================
-- Revert auth_migration and return to device_id-based approach.
-- Consistent with how daniel_progress works in this codebase.
--
-- The auth migration assumed authenticated users with JWT tokens,
-- but the app has no authentication flow — it uses device_id as
-- the anonymous identity, matching the daniel_progress pattern.
-- ============================================================

-- Step 1: Drop auth-based policies
drop policy if exists "Users read own activity"  on public.user_activity;
drop policy if exists "Users insert own activity" on public.user_activity;

-- Step 2: Restore device-id-scoped policies
create policy "device_id read access"
  on public.user_activity
  for select
  to anon
  using (device_id = nullif(current_setting('app.device_id', true), '')::text);

create policy "device_id insert access"
  on public.user_activity
  for insert
  to anon
  with check (device_id = nullif(current_setting('app.device_id', true), '')::text);

-- Step 3: Remove user_id column and its indexes
drop index if exists idx_user_activity_user;
drop index if exists idx_user_activity_null_user;
alter table public.user_activity drop column if exists user_id;

-- Step 4: Restore device_id index (dropped by the auth migration)
create index if not exists idx_user_activity_device
  on public.user_activity (device_id, created_at desc);
