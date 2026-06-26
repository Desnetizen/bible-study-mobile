-- ============================================================
-- STEP 1: Add user_id column (nullable at first — existing rows
-- stay accessible for now; we'll orphan them cleanly in step 6)
-- ============================================================
alter table public.user_activity
  add column if not exists user_id uuid
    references auth.users(id)
    default auth.uid();

-- ============================================================
-- STEP 2: Enforce the activity_type enum at the DB level.
-- The comment in the original schema was the only guard — not enough.
-- Includes timeline_event_read which is used in the codebase.
-- ============================================================
alter table public.user_activity
  drop constraint if exists activity_type_valid;

alter table public.user_activity
  add constraint activity_type_valid check (
    activity_type in (
      'chapter_completed',
      'note_saved',
      'bookmark_added',
      'verse_highlighted',
      'character_explored',
      'chapter_opened',
      'timeline_event_read'
    )
  );

-- ============================================================
-- STEP 3: Drop the dangerous open policies
-- ============================================================
drop policy if exists "Allow anon read access to user_activity"  on public.user_activity;
drop policy if exists "Allow anon insert access to user_activity" on public.user_activity;

-- ============================================================
-- STEP 4: Create properly scoped policies.
-- `to authenticated` covers anonymous-auth users (they have a real
-- session and are classified as authenticated, not anon).
-- `auth.uid() = user_id` is resolved from the signed JWT server-side
-- — the client cannot lie about this value.
-- ============================================================
create policy "Users read own activity"
  on public.user_activity
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users insert own activity"
  on public.user_activity
  for insert
  to authenticated
  with check (auth.uid() = user_id);

-- ============================================================
-- STEP 5: Replace the device_id index with a user_id index.
-- The old index is now unused for access-control queries.
-- Keep device_id column as nullable/informational if you need
-- it for debugging; drop it entirely if you don't.
-- ============================================================
drop index if exists idx_user_activity_device;

create index if not exists idx_user_activity_user
  on public.user_activity (user_id, created_at desc);

-- ============================================================
-- STEP 6: Orphan old rows safely.
-- Rows with user_id = null will not match any auth.uid() so they
-- are invisible to all users under the new policy. They are NOT
-- deleted — you can export/backfill them manually if needed.
-- This index lets you monitor/clean them up later.
-- ============================================================
create index if not exists idx_user_activity_null_user
  on public.user_activity (id)
  where user_id is null;
