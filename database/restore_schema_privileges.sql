-- Restore schema-level privileges and sensible defaults for Supabase roles
-- Run this in Supabase SQL editor as the project owner (service_role) or via psql
-- It restores USAGE on schema `public` and grants basic table privileges.
-- RLS policies remain in effect and will continue to control row-level access.

-- 1) Inspect current schema ACL (diagnostic)
SELECT nspname, nspacl FROM pg_namespace WHERE nspname = 'public';

-- 2) Give schema USAGE to anon and authenticated roles so they can access objects
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- 3) Grant SELECT on all existing tables to anon (read-only for unauthenticated users)
--    and grant full DML privileges to authenticated role (RLS will still filter rows)
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;

-- 4) Ensure default privileges for future objects created by the DB owner
--    so that newly-created tables will inherit the same grants (optional but helpful)
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;

-- 5) Re-grant usage on sequences (if you use SERIAL/SEQUENCE) to authenticated
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO authenticated;

-- 6) Verify policy presence for a few critical tables (diagnostic)
SELECT tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public' AND tablename IN ('profiles','activities','mood_logs','sleep_logs')
ORDER BY tablename;

-- 7) Quick smoke tests (run from Supabase SQL editor as service_role -- these will succeed regardless of anon/auth roles)
-- Count rows to ensure tables exist
SELECT 'activities' AS tbl, COUNT(*) FROM public.activities;
SELECT 'mood_logs' AS tbl, COUNT(*) FROM public.mood_logs;
SELECT 'sleep_logs' AS tbl, COUNT(*) FROM public.sleep_logs;

-- Notes:
-- - Run these commands only if you are the project owner or have service_role access.
-- - RLS still applies: granting SELECT to anon/authenticated allows access to the table
--   objects but individual rows will only be returned if RLS policies permit them.
-- - If you previously revoked ALL on SCHEMA public from PUBLIC, the above GRANT USAGE will restore object visibility.
-- - If you prefer to be more restrictive, grant only USAGE on schema and rely exclusively on RLS policies for access control.

-- If you want me to also create an explicit set of RLS INSERT/UPDATE policies for `profiles`,
-- I can add those to a follow-up script.
