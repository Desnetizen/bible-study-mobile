-- ============================================================
-- PROFILES TABLE
-- ============================================================

create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  display_name text,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users read own profile"
  on public.profiles for select
  to authenticated
  using (auth.uid() = id);

create policy "Users update own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- ============================================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- ============================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- MIGRATE user_activity RLS FROM device_id TO auth.uid()
-- NOTE: Existing device_id-linked data becomes inaccessible.
-- Acceptable for pre-launch app with no production users.
-- ============================================================

alter table public.user_activity
  add column if not exists user_id uuid references auth.users(id);

drop policy if exists "device_id read access" on public.user_activity;
drop policy if exists "device_id insert access" on public.user_activity;
drop policy if exists "Users read own activity" on public.user_activity;
drop policy if exists "Users insert own activity" on public.user_activity;

create policy "Users read own activity"
  on public.user_activity for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users insert own activity"
  on public.user_activity for insert
  to authenticated
  with check (auth.uid() = user_id);

-- ============================================================
-- MIGRATE daniel_progress RLS FROM device_id TO auth.uid()
-- ============================================================

alter table public.daniel_progress
  add column if not exists user_id uuid references auth.users(id);

drop policy if exists "device_id read access" on public.daniel_progress;
drop policy if exists "device_id insert access" on public.daniel_progress;
drop policy if exists "device_id update access" on public.daniel_progress;

create policy "Users read own progress"
  on public.daniel_progress for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users insert own progress"
  on public.daniel_progress for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users update own progress"
  on public.daniel_progress for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
