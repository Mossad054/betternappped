-- Fix user_preferences Schema
-- Date: 2025-11-14
-- Purpose: Ensure user_preferences uses 'id' as primary key (not user_id)
--
-- This migration aligns the user_preferences table with the newschema.sql design:
-- - Uses 'id' as the primary key that directly references auth.users(id)
-- - Removes any 'user_id' column if it exists
-- - Updates RLS policies to use auth.uid() = id

-- Drop user_id column if it exists
ALTER TABLE public.user_preferences DROP COLUMN IF EXISTS user_id CASCADE;

-- Ensure id is the primary key
ALTER TABLE public.user_preferences
  DROP CONSTRAINT IF EXISTS user_preferences_pkey CASCADE;

ALTER TABLE public.user_preferences
  ADD CONSTRAINT user_preferences_pkey PRIMARY KEY (id);

-- Ensure id references auth.users
ALTER TABLE public.user_preferences
  DROP CONSTRAINT IF EXISTS user_preferences_id_fkey CASCADE;

ALTER TABLE public.user_preferences
  ADD CONSTRAINT user_preferences_id_fkey
  FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Drop any old RLS policies
DROP POLICY IF EXISTS "Users can view own preferences" ON public.user_preferences;
DROP POLICY IF EXISTS "Users can insert own preferences" ON public.user_preferences;
DROP POLICY IF EXISTS "Users can update own preferences" ON public.user_preferences;
DROP POLICY IF EXISTS "Users can delete own preferences" ON public.user_preferences;
DROP POLICY IF EXISTS "Users access own preferences" ON public.user_preferences;

-- Create unified RLS policy using 'id' column
CREATE POLICY "Users access own preferences"
  ON public.user_preferences
  FOR ALL
  USING (auth.uid() = id);

-- Ensure RLS is enabled
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Drop any old indexes on user_id
DROP INDEX IF EXISTS idx_user_preferences_user_id;

-- Create index on id for better query performance (if not already created by PRIMARY KEY)
-- Note: PRIMARY KEY automatically creates an index, but we include this for clarity
CREATE INDEX IF NOT EXISTS idx_user_preferences_id ON public.user_preferences(id);

-- Verify the schema
DO $$
BEGIN
  -- Check if user_id column still exists (it shouldn't)
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'user_preferences'
    AND column_name = 'user_id'
  ) THEN
    RAISE EXCEPTION 'user_id column still exists in user_preferences table!';
  END IF;

  -- Check if id is the primary key
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
      ON tc.constraint_name = kcu.constraint_name
    WHERE tc.table_name = 'user_preferences'
    AND tc.constraint_type = 'PRIMARY KEY'
    AND kcu.column_name = 'id'
  ) THEN
    RAISE EXCEPTION 'id is not the primary key of user_preferences table!';
  END IF;

  RAISE NOTICE 'user_preferences schema verification passed!';
END $$;
