-- ============================================================
-- Migration 1/2: Add user_id column and auth.uid()-based RLS
--
-- Moves from device_id session-variable RLS to JWT-backed
-- auth.uid() checks, fixing the connection-pooling bug where
-- set_config('app.device_id') could land on a different pooled
-- connection than the subsequent query.
-- ============================================================

-- Step 1: Add user_id column to daniel_progress
alter table public.daniel_progress
  add column if not exists user_id uuid
    references auth.users(id);

-- Step 2: Backfill daniel_progress rows.
-- For existing rows, user_id stays NULL — those rows were created
-- before we had a user identity. A follow-up cleanup script can
-- associate them later by matching device_id patterns.
-- New rows get user_id from the client (see progressService.ts).

-- Step 3: Add user_id column to recent_activity
alter table public.recent_activity
  add column if not exists user_id uuid
    references auth.users(id);

-- Step 4: Create new auth.uid()-based policies for daniel_progress
create policy "auth user_id select"
  on public.daniel_progress
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "auth user_id insert"
  on public.daniel_progress
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "auth user_id update"
  on public.daniel_progress
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Step 5: Create new auth.uid()-based policies for recent_activity
create policy "auth user_id select"
  on public.recent_activity
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "auth user_id insert"
  on public.recent_activity
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "auth user_id update"
  on public.recent_activity
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "auth user_id delete"
  on public.recent_activity
  for delete
  to authenticated
  using (auth.uid() = user_id);

-- Step 6: Create indexes for the new access pattern
create index if not exists idx_daniel_progress_user_id
  on public.daniel_progress (user_id);

create index if not exists idx_recent_activity_user_id
  on public.recent_activity (user_id, created_at desc);
