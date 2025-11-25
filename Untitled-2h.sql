-- database/diagnose_and_fix_users.sql
-- Updated: uses actual auth.users JSON column `raw_user_meta_data` found in your handle_new_user() func.
-- Run as project owner (service_role). Run diagnostics first, then the mutating blocks only after backup.

----------------------------------------------------------------------
-- SECTION A: Basic environment & diagnostic checks (READ-ONLY)
----------------------------------------------------------------------

SELECT current_database() AS db, current_schema(), session_user, user;
SHOW search_path;

SELECT nspname, nspacl FROM pg_namespace WHERE nspname = 'public';

SELECT 'auth.users' AS src, COUNT(*) FROM auth.users;
SELECT 'public.users' AS src, COUNT(*) FROM public.users;
SELECT 'public.profiles' AS src, COUNT(*) FROM public.profiles;

-- Show recent auth.users (updated to avoid referencing a column that may not exist)
-- Use raw_user_meta_data (JSON) if present; otherwise, just show available columns.
SELECT id, aud, role, email, created_at,
       (CASE WHEN (SELECT 1 FROM information_schema.columns WHERE table_schema='auth' AND table_name='users' AND column_name='raw_user_meta_data')=1
             THEN raw_user_meta_data
             ELSE NULL END) AS raw_user_meta_data
FROM auth.users
ORDER BY created_at DESC
LIMIT 50;

SELECT *
FROM public.users
ORDER BY COALESCE(created_at, now()) DESC
LIMIT 50;

-- Count missing public.users for auth.users
WITH missing AS (
  SELECT a.id, a.email, a.created_at
  FROM auth.users a
  LEFT JOIN public.users p ON a.id = p.id
  WHERE p.id IS NULL
)
SELECT COUNT(*) AS missing_count FROM missing;

WITH missing AS (
  SELECT a.id, a.email, a.created_at
  FROM auth.users a
  LEFT JOIN public.users p ON a.id = p.id
  WHERE p.id IS NULL
)
SELECT id, email, created_at
FROM missing
ORDER BY created_at DESC
LIMIT 200;

-- Show DDL for candidate functions (handle_new_user etc.)
SELECT proname, pg_get_functiondef(p.oid) AS definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE proname ILIKE '%handle_new_user%' OR proname ILIKE '%create_user%' OR proname ILIKE '%new_user%';

-- Triggers on auth.users and public.users/profiles
SELECT t.tgname, c.relname AS table_name, pg_get_triggerdef(t.oid, true) AS trigger_def
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE n.nspname IN ('auth','public') AND c.relname IN ('users','profiles');

-- Policies for critical tables (diagnostic)
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public' AND tablename IN ('users','profiles','user_preferences','mood_logs','sleep_logs')
ORDER BY tablename, policyname;

-- Show columns for public.users and public.profiles
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'users'
ORDER BY ordinal_position;

SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'profiles'
ORDER BY ordinal_position;

-- FK constraints referencing public.users
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
-- SECTION B: BUILD A TEMP LIST (READ-ONLY)
----------------------------------------------------------------------

DROP TABLE IF EXISTS tmp_missing_auth_users;
CREATE TEMP TABLE tmp_missing_auth_users AS
SELECT a.id::uuid AS id, a.email, a.created_at,
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='auth' AND table_name='users' AND column_name='raw_user_meta_data')
            THEN a.raw_user_meta_data
            ELSE NULL END AS raw_user_meta_data
FROM auth.users a
LEFT JOIN public.users p ON a.id = p.id
WHERE p.id IS NULL;

SELECT COUNT(*) AS tmp_missing_count FROM tmp_missing_auth_users;
SELECT * FROM tmp_missing_auth_users ORDER BY created_at DESC LIMIT 200;

----------------------------------------------------------------------
-- SECTION C: SAFE ID (minimal) INSERT INTO public.users (MUTATING)
-- Recommended: mirrors your handle_new_user function which only inserts id,email into public.users.
-- Run only after backup. This is idempotent.
----------------------------------------------------------------------

/*
UNCOMMENT AND RUN if you have a backup and want to restore minimal public.users rows.
This block inserts only the minimal columns (id, email). It will skip any rows that already exist.
*/

-- DO $$
-- BEGIN
--   -- Ensure id column exists in public.users
--   IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='users' AND column_name='id') THEN
--     RAISE EXCEPTION 'public.users missing id column; aborting.';
--   END IF;
--   -- Insert minimal rows (id, email) if those columns exist
--   IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='users' AND column_name='email') THEN
--     INSERT INTO public.users (id, email)
--     SELECT m.id, m.email FROM tmp_missing_auth_users m
--     WHERE NOT EXISTS (SELECT 1 FROM public.users p WHERE p.id = m.id);
--   ELSE
--     -- If email column doesn't exist, insert id only (rare)
--     INSERT INTO public.users (id)
--     SELECT m.id FROM tmp_missing_auth_users m
--     WHERE NOT EXISTS (SELECT 1 FROM public.users p WHERE p.id = m.id);
--   END IF;
--   RAISE NOTICE 'Minimal public.users insert completed.';
-- END;
-- $$ LANGUAGE plpgsql;

----------------------------------------------------------------------
-- SECTION D: OPTIONAL: INSERT minimal profiles (MUTATING)
-- Mirror handle_new_user: create profile row with id, email, full_name extracted from JSON.
-- Run only after you created public.users or if profiles are missing and you have a backup.
----------------------------------------------------------------------

/*
UNCOMMENT AND RUN if you want placeholder profiles created for the missing users.
This observes presence of columns and only inserts columns that exist.
*/

-- DO $$
-- BEGIN
--   IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='id') THEN
--     RAISE NOTICE 'public.profiles does not have id column; aborting profile inserts.';
--     RETURN;
--   END IF;
--
--   -- Build insert selecting available columns
--   INSERT INTO public.profiles (id, email, full_name, created_at)
--   SELECT
--     m.id,
--     CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='email') THEN m.email ELSE NULL END,
--     CASE
--       WHEN m.raw_user_meta_data IS NOT NULL AND m.raw_user_meta_data::text <> 'null'
--            AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='full_name')
--       THEN (m.raw_user_meta_data->>'full_name')
--       ELSE NULL
--     END,
--     CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='created_at') THEN now() ELSE NULL END
--   FROM tmp_missing_auth_users m
--   WHERE NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = m.id);
--
--   RAISE NOTICE 'Inserted minimal profiles for missing users (if any).';
-- END;
-- $$ LANGUAGE plpgsql;

----------------------------------------------------------------------
-- SECTION E: TRIGGER / FUNCTION INSPECTION (READ-ONLY)
-- Your earlier output shows a handle_new_user function; show it again for convenience.
----------------------------------------------------------------------

SELECT proname, pg_get_functiondef(p.oid) AS function_def
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE proname ILIKE '%handle_new_user%' OR proname ILIKE '%create_profile%';

SELECT n.nspname AS trigger_schema,
       c.relname AS table_name,
       t.tgname AS trigger_name,
       pg_get_triggerdef(t.oid, true) AS trigger_definition
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE t.tgname ILIKE '%new_user%' OR pg_get_triggerdef(t.oid, true) ILIKE '%handle_new_user%' OR c.relname IN ('users','profiles');

-- If trigger exists on auth.users but seems not firing, inspect its security/owner and policy interactions.
-- You can also re-create the trigger if you confirm the function body (from newschema.sql).

----------------------------------------------------------------------
-- SECTION F: POST-FIX VERIFICATION (READ-ONLY)
----------------------------------------------------------------------

WITH missing_after AS (
  SELECT a.id
  FROM auth.users a
  LEFT JOIN public.users p ON a.id = p.id
  WHERE p.id IS NULL
)
SELECT COUNT(*) AS missing_count_after_fix FROM missing_after;

WITH missing_after AS (
  SELECT a.id, a.email
  FROM auth.users a
  LEFT JOIN public.users p ON a.id = p.id
  WHERE p.id IS NULL
)
SELECT * FROM missing_after LIMIT 200;

SELECT 'mood_logs' AS tbl, COUNT(*) FROM public.mood_logs WHERE user_id IS NULL;
SELECT conname, conrelid::regclass AS table_name
FROM pg_constraint
WHERE contype = 'f' AND confrelid = 'public.users'::regclass;

-- End of file.