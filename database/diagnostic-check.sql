-- =====================================================
-- DIAGNOSTIC: Check what's blocking user creation
-- Run this in Supabase SQL Editor
-- =====================================================

-- 1. Check if tables exist
SELECT 
  'Table Check' as test,
  table_name,
  CASE WHEN table_name IS NOT NULL THEN '✅ EXISTS' ELSE '❌ MISSING' END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'profiles', 'user_preferences')
ORDER BY table_name;

-- 2. Check table structure
SELECT 
  'Users Table Columns' as test,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'users'
ORDER BY ordinal_position;

-- 3. Check if trigger function exists and can be executed
SELECT 
  'Function Check' as test,
  proname as function_name,
  prosecdef as is_security_definer,
  provolatile as volatility
FROM pg_proc 
WHERE proname = 'handle_new_user';

-- 4. Check RLS policies
SELECT 
  'RLS Policies' as test,
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd as command,
  qual as using_expression
FROM pg_policies
WHERE tablename IN ('users', 'profiles', 'user_preferences')
ORDER BY tablename, policyname;

-- 5. Check if auth.users table is accessible
SELECT 
  'Auth Users Table' as test,
  COUNT(*) as user_count
FROM auth.users;

-- 6. Test the trigger function manually with a dummy user
-- This will show the exact error if the function fails
DO $$
DECLARE
  test_user_id UUID := gen_random_uuid();
  test_email TEXT := 'test_diagnostic@example.com';
BEGIN
  RAISE NOTICE 'Testing trigger function with test user ID: %', test_user_id;
  
  -- Try to insert directly
  BEGIN
    INSERT INTO public.users (id, email, created_at, updated_at, metadata)
    VALUES (test_user_id, test_email, NOW(), NOW(), '{}'::jsonb);
    RAISE NOTICE '✅ Insert into users succeeded';
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '❌ Insert into users failed: %', SQLERRM;
  END;
  
  BEGIN
    INSERT INTO public.profiles (id, email, created_at, updated_at)
    VALUES (test_user_id, test_email, NOW(), NOW());
    RAISE NOTICE '✅ Insert into profiles succeeded';
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '❌ Insert into profiles failed: %', SQLERRM;
  END;
  
  BEGIN
    INSERT INTO public.user_preferences (id, created_at, updated_at)
    VALUES (test_user_id, NOW(), NOW());
    RAISE NOTICE '✅ Insert into user_preferences succeeded';
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '❌ Insert into user_preferences failed: %', SQLERRM;
  END;
  
  -- Cleanup
  DELETE FROM public.user_preferences WHERE id = test_user_id;
  DELETE FROM public.profiles WHERE id = test_user_id;
  DELETE FROM public.users WHERE id = test_user_id;
  
  RAISE NOTICE 'Test completed and cleaned up';
END $$;

-- 7. Check trigger definition
SELECT 
  'Trigger Definition' as test,
  pg_get_triggerdef(oid) as trigger_definition
FROM pg_trigger
WHERE tgname = 'on_auth_user_created';
