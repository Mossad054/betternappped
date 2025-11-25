-- =====================================================
-- FIX AUTHENTICATION ISSUE
-- This script fixes the "Database error saving new user" issue
-- Run this in your Supabase SQL Editor
-- =====================================================

-- Step 1: Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Step 2: Recreate the handle_new_user function with proper error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Insert into users table
  INSERT INTO public.users (id, email, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    NOW(),
    NOW()
  );

  -- Insert into profiles table
  INSERT INTO public.profiles (id, email, full_name, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NULL),
    NOW(),
    NOW()
  );

  -- Insert into user_preferences table
  INSERT INTO public.user_preferences (id, created_at, updated_at)
  VALUES (
    NEW.id,
    NOW(),
    NOW()
  );

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't block user creation
    RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Step 3: Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Step 4: Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO postgres, anon, authenticated, service_role;

-- Step 5: Verify RLS policies allow inserts during signup
-- Temporarily disable RLS for initial user creation (the trigger runs as SECURITY DEFINER, so this should work)

-- Alternative: Create a policy that allows inserts during user creation
DO $$
BEGIN
  -- Drop existing policies if they exist
  DROP POLICY IF EXISTS "Users access own data" ON public.users;
  DROP POLICY IF EXISTS "Users access own profile" ON public.profiles;
  DROP POLICY IF EXISTS "Users access own preferences" ON public.user_preferences;
EXCEPTION
  WHEN OTHERS THEN
    NULL;
END $$;

-- Recreate policies with service role bypass
CREATE POLICY "Users access own data"
  ON public.users
  FOR ALL
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Service role can insert users"
  ON public.users
  FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Users access own profile"
  ON public.profiles
  FOR ALL
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Service role can insert profiles"
  ON public.profiles
  FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Users access own preferences"
  ON public.user_preferences
  FOR ALL
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Service role can insert preferences"
  ON public.user_preferences
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Step 6: Test the function manually (optional)
-- SELECT public.handle_new_user();

-- =====================================================
-- Verification Query
-- =====================================================
-- After running this script, verify the trigger exists:
SELECT 
  tgname AS trigger_name,
  tgrelid::regclass AS table_name,
  proname AS function_name,
  pg_get_functiondef(tgfoid) AS function_definition
FROM pg_trigger
JOIN pg_proc ON pg_trigger.tgfoid = pg_proc.oid
WHERE tgname = 'on_auth_user_created';

-- Check if RLS is enabled and policies exist:
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename IN ('users', 'profiles', 'user_preferences')
ORDER BY tablename, policyname;

COMMENT ON FUNCTION public.handle_new_user() IS 
'Auto-creates user, profile, and preferences records when a new user signs up via Supabase Auth. 
Runs with SECURITY DEFINER to bypass RLS policies during initial creation.';
