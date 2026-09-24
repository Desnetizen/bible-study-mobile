-- Let RLS-owned rows derive their owner from the authenticated request.
-- This keeps browser clients from authoring user_id directly while preserving
-- existing WITH CHECK policies that require auth.uid() = user_id.
alter table public.daniel_progress
  alter column user_id set default auth.uid();

alter table public.recent_activity
  alter column user_id set default auth.uid();
