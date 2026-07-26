-- ============================================================
-- Migration 2/2: Remove device_id-based RLS and RPCs
--
-- Apply ONLY after verifying the auth.uid() policies from
-- 20260726000000_auth_uid_rls.sql are working correctly in
-- production.
-- ============================================================

-- Step 1: Drop device_id-based policies from daniel_progress
drop policy if exists "device_id read access"   on public.daniel_progress;
drop policy if exists "device_id insert access"  on public.daniel_progress;
drop policy if exists "device_id update access"  on public.daniel_progress;

-- Step 2: Drop device_id-based policies from recent_activity
drop policy if exists "device_id read access"   on public.recent_activity;
drop policy if exists "device_id insert access"  on public.recent_activity;
drop policy if exists "device_id update access"  on public.recent_activity;
drop policy if exists "device_id delete access"  on public.recent_activity;

-- Step 3: Drop device_id-based policies from user_activity (legacy table)
drop policy if exists "device_id read access"   on public.user_activity;
drop policy if exists "device_id insert access"  on public.user_activity;

-- Step 4: Drop the RPC functions that set/read the session variable
drop function if exists public.set_app_device_id;
drop function if exists public.get_device_id;
