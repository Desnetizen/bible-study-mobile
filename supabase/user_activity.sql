-- User activity tracking table
-- Tracks all meaningful user actions per device for the activity feed.
create table if not exists public.user_activity (
  id bigint generated always as identity primary key,
  device_id text not null,
  activity_type text not null,  -- 'chapter_completed' | 'note_saved' | 'bookmark_added' | 'verse_highlighted' | 'character_explored' | 'chapter_opened'
  label text not null,          -- Human-readable label, e.g. "Completed Daniel 3"
  metadata jsonb default '{}',  -- Optional extra data (book, chapter, verse, character name, etc.)
  created_at timestamptz not null default now()
);

-- Index for efficient device-scoped queries ordered by recency
create index if not exists idx_user_activity_device
  on public.user_activity (device_id, created_at desc);

-- Enable Row Level Security
alter table public.user_activity enable row level security;

-- Allow anonymous read access (device_id scoped in queries, not policy)
drop policy if exists "Allow anon read access to user_activity" on public.user_activity;
create policy "Allow anon read access to user_activity"
on public.user_activity
for select
to anon
using (true);

-- Allow anonymous insert access (append-only activity log)
drop policy if exists "Allow anon insert access to user_activity" on public.user_activity;
create policy "Allow anon insert access to user_activity"
on public.user_activity
for insert
to anon
with check (true);
