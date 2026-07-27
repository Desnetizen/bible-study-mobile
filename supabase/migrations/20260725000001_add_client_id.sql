-- Add client_id column for idempotent upsert retries.
-- Each locally-created activity gets a client-generated UUID so that
-- the same item can be retried safely without creating duplicates.
-- The unique constraint on client_id makes logActivity(idempotent).

alter table public.recent_activity
  add column if not exists client_id text;

-- Backfill existing rows with a UUID so the constraint can be added.
update public.recent_activity
  set client_id = gen_random_uuid()::text
  where client_id is null;

-- Now make it non-null and unique.
alter table public.recent_activity
  alter column client_id set not null;

alter table public.recent_activity
  add constraint recent_activity_client_id_key unique (client_id);

create index if not exists idx_recent_activity_client_id
  on public.recent_activity (client_id);
