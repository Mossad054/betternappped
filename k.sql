-- database/diagnose_and_fix_users.sql
-- Run as the project owner (service_role) in the Supabase SQL editor.
-- Purpose: diagnose missing public.users rows for auth.users and (optionally) insert minimal user/profile rows to restore referential integrity.
-- IMPORTANT: This script contains two types of statements:
--  - Diagnostics (safe, read-only) - run these first and review output.
--  - Fix blocks (mutating) - commented or separated; run only after you confirm and have a backup.
--
-- Step 0: Backup reminder (run outside this script)
--   Use Supabase backups or pg_dump to export data before making changes.
--   Example (locally): pg_dump --schema=public --file=backup_public_schema.sql --dbname=<CONN_STRING>

----------------------------------------------------------------------
-- SECTION A: Basic environment & diagnostic checks (READ-ONLY)
----------------------------------------------------------------------

-- 1) Confirm we are running in the expected DB and list search_path
SELECT current_database() AS db, current_schema(), session_user, user;
SHOW search_path;

-- 2) Schema ACL for public
SELECT nspname, nspacl FROM pg_namespace WHERE nspname = 'public';

-- 3) Count rows in key tables (quick smoke test)
SELECT 'auth.users' AS src, COUNT(*) FROM auth.users;
SELECT 'public.users' AS src, COUNT(*) FROM public.users;
SELECT 'public.profiles' AS src, COUNT(*) FROM public.profiles;

-- 4) Show sample auth.users rows (most recent 50)
SELECT id, aud, role, email, raw_user_meta, created_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 50;

-- 5) Show sample public.users rows (most recent 50)
SELECT *
FROM public.users
ORDER BY COALESCE(created_at, now()) DESC
LIMIT 50;

-- 6) Find auth.users that are missing from public.users
WITH missing AS (
  SELECT a.id, a.email, a.raw_user_meta, a.created_at
  FROM auth.users a
  LEFT JOIN public.users p ON a.id = p.id
  WHERE p.id IS NULL
)
SELECT COUNT(*) AS missing_count FROM missing;

-- List up to 200 missing user ids/emails for inspection
WITH missing AS (
  SELECT a.id, a.email, a.raw_user_meta, a.created_at
  FROM auth.users a
  LEFT JOIN public.users p ON a.id = p.id
  WHERE p.id IS NULL
)
SELECT id, email, created_at, raw_user_meta
FROM missing
ORDER BY created_at DESC
LIMIT 200;

-- 7) Show DDL for candidate functions (look for handle_new_user and helpers)
SELECT proname, pg_get_functiondef(p.oid) AS definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE proname ILIKE '%handle_new_user%' OR proname ILIKE '%create_user%' OR proname ILIKE '%new_user%';

-- 8) Show triggers on auth.users and public.users (if any)
SELECT t.tgname, c.relname AS table_name, pg_get_triggerdef(t.oid, true) AS trigger_def
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE n.nspname IN ('auth','public') AND c.relname IN ('users','profiles');

-- 9) Show policies for critical tables (diagnostic)
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public' AND tablename IN ('users','profiles','user_preferences','mood_logs','sleep_logs')
ORDER BY tablename, policyname;

-- 10) Show columns for public.users and public.profiles (helpful to craft safe inserts)
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'users'
ORDER BY ordinal_position;

SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'profiles'
ORDER BY ordinal_position;

-- 11) Show constraints referencing public.users (FKs) so you can see impacted tables
SELECT con.oid::regclass AS constraint_name,
       rel_ns.nspname AS table_schema, rel_cl.relname AS table_name,
       att.attname AS column_name,
       conf_ns.nspname AS foreign_schema, conf_cl.relname AS foreign_table
FROM pg_constraint con
JOIN pg_class rel_cl ON con.conrelid = rel_cl.oid
JOIN pg_namespace rel_ns ON rel_cl.relnamespace = rel_ns.oid
JOIN pg_class conf_cl ON con.confrelid = conf_cl.oid
JOIN pg_namespace conf_ns ON conf_cl.relnamespace = conf_ns.oid
JOIN unnest(con.conkey) WITH ORDINALITY AS ck(attnum, ord) ON true
JOIN pg_attribute att ON att.attrelid = rel_cl.oid AND att.attnum = ck.attnum
WHERE con.contype = 'f' AND conf_cl.relname = 'users'
ORDER BY table_name;

----------------------------------------------------------------------
-- SECTION B: IDENTITY CHECK / BUILD A LIST (READ-ONLY)
-- Build a temporary table of missing auth users for review (not persisted)
----------------------------------------------------------------------

-- WARNING: this creates a temporary table visible only in this session for convenience.
DROP TABLE IF EXISTS tmp_missing_auth_users;
CREATE TEMP TABLE tmp_missing_auth_users AS
SELECT a.id::uuid AS id, a.email, a.raw_user_meta, a.created_at
FROM auth.users a
LEFT JOIN public.users p ON a.id = p.id
WHERE p.id IS NULL;

SELECT COUNT(*) AS tmp_missing_count FROM tmp_missing_auth_users;
-- Show a few rows
SELECT * FROM tmp_missing_auth_users ORDER BY created_at DESC LIMIT 200;

----------------------------------------------------------------------
-- SECTION C: SAFE, IDP (idempotent) INSERT INTO public.users
-- RUN THIS BLOCK ONLY AFTER YOU'VE REVIEWED THE DIAGNOSTICS AND BACKED UP
-- This block builds a dynamic INSERT that only writes columns that exist in public.users
-- It will insert rows for missing auth.users and is idempotent (uses WHERE NOT EXISTS or ON CONFLICT DO NOTHING).
----------------------------------------------------------------------

/*
UNCOMMENT and RUN the following block to insert missing public.users rows.
Run only if:
  - You have a DB backup,
  - tmp_missing_auth_users contains the rows you want to restore,
  - You understand that if public.users has non-null columns without defaults,
    the insert may fail. The dynamic builder below will only include common columns
    (id, email, created_at, raw_user_meta) if they exist.
*/

-- DO $$ ... $$; block inserted below is idempotent. Uncomment to execute.
-- BEGIN MUTATING BLOCK
-- ********************************************************************
-- DO $$ 
-- DECLARE
--   col_list text := '';
--   val_list text := '';
--   sep text := '';
-- BEGIN
--   -- Require id column
--   IF NOT EXISTS (
--     SELECT 1 FROM information_schema.columns
--     WHERE table_schema='public' AND table_name='users' AND column_name='id'
--   ) THEN
--     RAISE EXCEPTION 'public.users has no id column, aborting.';
--   END IF;
--
--   -- Start with id
--   col_list := 'id';
--   val_list := 'm.id';
--   sep := ', ';
--
--   IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='users' AND column_name='email') THEN
--     col_list := col_list || sep || 'email';
--     val_list := val_list || sep || 'm.email';
--   END IF;
--
--   IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='users' AND column_name='created_at') THEN
--     col_list := col_list || sep || 'created_at';
--     val_list := val_list || sep || 'm.created_at';
--   END IF;
--
--   IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='users' AND column_name='raw_user_meta') THEN
--     col_list := col_list || sep || 'raw_user_meta';
--     val_list := val_list || sep || 'm.raw_user_meta';
--   END IF;
--
--   -- Perform the insert from the temp table
--   EXECUTE format(
--     'INSERT INTO public.users (%s) SELECT %s FROM tmp_missing_auth_users m WHERE NOT EXISTS (SELECT 1 FROM public.users p WHERE p.id = m.id)',
--     col_list, val_list
--   );
--
--   RAISE NOTICE 'Inserted missing users into public.users (if any).';
-- END;
-- $$ LANGUAGE plpgsql;
-- ********************************************************************
-- END MUTATING BLOCK

----------------------------------------------------------------------
-- SECTION D: IDP INSERT FOR public.profiles (minimal)
-- After ensuring public.users rows exist, run a similar idempotent insert for profiles.
-- This inserts minimal profile rows with the user id; adapt to your schema if extra NOT NULL columns exist.
----------------------------------------------------------------------

/*
UNCOMMENT and RUN the following block after the user rows exist (or run it together with the users block),
only if profiles are missing and you want minimal placeholders created.
*/

-- BEGIN PROFILES MUTATING BLOCK
-- ********************************************************************
-- DO $$
-- DECLARE
--   pcols text := '';
--   pvals text := '';
--   sep text := '';
-- BEGIN
--   -- Determine column to use for the profile PK that references users (commonly id)
--   IF NOT EXISTS (
--     SELECT 1 FROM information_schema.columns
--     WHERE table_schema='public' AND table_name='profiles' AND column_name='id'
--   ) THEN
--     RAISE NOTICE 'profiles table has no id column (expected). Aborting profile insert.';
--     RETURN;
--   END IF;
--
--   pcols := 'id';
--   pvals := 'm.id';
--   sep := ', ';
--
--   IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='created_at') THEN
--     pcols := pcols || sep || 'created_at';
--     pvals := pvals || sep || 'now()';
--   END IF;
--
--   IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='full_name') THEN
--     pcols := pcols || sep || 'full_name';
--     pvals := pvals || sep || 'COALESCE(m.email, ''user'')';
--   END IF;
--
--   EXECUTE format(
--     'INSERT INTO public.profiles (%s) SELECT %s FROM tmp_missing_auth_users m WHERE NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = m.id)',
--     pcols, pvals
--   );
--
--   RAISE NOTICE 'Inserted minimal profile rows for missing users (if any).';
-- END;
-- $$ LANGUAGE plpgsql;
-- ********************************************************************
-- END PROFILES MUTATING BLOCK

----------------------------------------------------------------------
-- SECTION E: TRIGGER / FUNCTION INSPECTION (READ-ONLY)
-- If handle_new_user trigger/function is missing or broken, consider restoring it from your newschema.sql
-- The following will show the trigger calls and referenced function bodies.
----------------------------------------------------------------------

-- List triggers again (more detail)
SELECT n.nspname AS trigger_schema,
       c.relname AS table_name,
       t.tgname AS trigger_name,
       pg_get_triggerdef(t.oid, true) AS trigger_definition
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE t.tgname ILIKE '%new_user%' OR pg_get_triggerdef(t.oid, true) ILIKE '%handle_new_user%' OR c.relname IN ('users','profiles');

-- Show function definitions again (for restore)
SELECT proname, pg_get_functiondef(p.oid) AS function_def
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE proname ILIKE '%handle_new_user%' OR proname ILIKE '%create_profile%';

-- If you have a local copy of your newschema.sql or original migration, use it to re-create the function/trigger.
-- Example trigger recreation (DO NOT RUN UNLESS YOU'VE VALIDATED the function body from your newschema.sql):
-- CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger
--   LANGUAGE plpgsql AS $$
-- BEGIN
--   -- your trigger logic here (copy from newschema.sql)
--   RETURN NEW;
-- END;
-- $$;
-- CREATE TRIGGER handle_new_user_trigger
--   AFTER INSERT ON auth.users
--   FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

----------------------------------------------------------------------
-- SECTION F: POST-FIX VERIFICATION (READ-ONLY)
-- After running any of the mutating blocks above, run these to verify there are no missing users.
----------------------------------------------------------------------

-- Recompute missing count
WITH missing AS (
  SELECT a.id
  FROM auth.users a
  LEFT JOIN public.users p ON a.id = p.id
  WHERE p.id IS NULL
)
SELECT COUNT(*) AS missing_count_after_fix FROM missing;

-- Show any remaining missing ids (should be zero)
WITH missing AS (
  SELECT a.id, a.email
  FROM auth.users a
  LEFT JOIN public.users p ON a.id = p.id
  WHERE p.id IS NULL
)
SELECT * FROM missing LIMIT 200;

-- Check core references still valid (examples)
SELECT 'mood_logs' AS tbl, COUNT(*) FROM public.mood_logs WHERE user_id IS NULL;
-- ensure FK referencing columns exist and are populated - this is a sanity check only
SELECT conname, conrelid::regclass AS table_name
FROM pg_constraint
WHERE contype = 'f' AND confrelid = 'public.users'::regclass;

----------------------------------------------------------------------

-- End of file.
-- Notes & next steps:
--  - If the dynamic inserts fail due to NOT NULL columns without defaults, inspect the failing DDL (data types and constraints) from the information_schema outputs above,
--    and decide whether to add temporary default values or to re-run the proper migration that creates those columns with defaults.
--  - If a trigger/function is missing, restore it from your `database/newschema.sql` or migration history, then re-run the trigger or re-run the insertions.
--  - After fixing DB rows, allow the client app to re-try the failing requests, or run a test script inserting a mood_log for a restored user to confirm FK resolution.