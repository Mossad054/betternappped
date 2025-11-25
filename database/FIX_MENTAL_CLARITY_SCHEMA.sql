-- ========================================
-- FIX: Mental Clarity Schema Errors
-- ========================================
-- This script fixes the missing columns and tables for mental clarity tests
--
-- Errors being fixed:
-- 1. column mental_clarity_tests.timestamp does not exist
-- 2. column mental_clarity_tests.test_type does not exist
-- 3. Could not find the table 'public.clarity_index'
--
-- Instructions:
-- 1. Go to your Supabase Dashboard > SQL Editor
-- 2. Copy and paste this entire script
-- 3. Click "Run" to execute
-- ========================================

-- Drop the old mental_clarity_tests table (backs up data first)
DO $$
BEGIN
    -- Check if table exists
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'mental_clarity_tests') THEN
        -- Create backup table if it doesn't exist
        CREATE TABLE IF NOT EXISTS public.mental_clarity_tests_backup AS
        SELECT * FROM public.mental_clarity_tests;

        RAISE NOTICE 'Backup created: mental_clarity_tests_backup';

        -- Drop the old table
        DROP TABLE public.mental_clarity_tests CASCADE;

        RAISE NOTICE 'Old mental_clarity_tests table dropped';
    END IF;
END $$;

-- Create new mental_clarity_tests table with correct schema
CREATE TABLE IF NOT EXISTS public.mental_clarity_tests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  test_type TEXT NOT NULL CHECK (test_type IN ('focus', 'flexibility', 'speed', 'memory')),
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  date DATE NOT NULL,
  metrics JSONB NOT NULL DEFAULT '{}'::jsonb,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  synced BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create clarity_index table for combined scores
CREATE TABLE IF NOT EXISTS public.clarity_index (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  focus_score INTEGER NOT NULL DEFAULT 0 CHECK (focus_score >= 0 AND focus_score <= 100),
  flexibility_score INTEGER NOT NULL DEFAULT 0 CHECK (flexibility_score >= 0 AND flexibility_score <= 100),
  speed_score INTEGER NOT NULL DEFAULT 0 CHECK (speed_score >= 0 AND speed_score <= 100),
  memory_score INTEGER NOT NULL DEFAULT 0 CHECK (memory_score >= 0 AND memory_score <= 100),
  combined_score INTEGER NOT NULL DEFAULT 0 CHECK (combined_score >= 0 AND combined_score <= 100),
  date DATE NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_mental_clarity_tests_user_date
  ON public.mental_clarity_tests(user_id, date);

CREATE INDEX IF NOT EXISTS idx_mental_clarity_tests_user_timestamp
  ON public.mental_clarity_tests(user_id, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_mental_clarity_tests_user_type_date
  ON public.mental_clarity_tests(user_id, test_type, date);

CREATE INDEX IF NOT EXISTS idx_clarity_index_user_date
  ON public.clarity_index(user_id, date);

-- Enable Row Level Security
ALTER TABLE public.mental_clarity_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clarity_index ENABLE ROW LEVEL SECURITY;

-- Drop old policies if they exist
DROP POLICY IF EXISTS "Users can view own mental clarity tests" ON public.mental_clarity_tests;
DROP POLICY IF EXISTS "Users can insert own mental clarity tests" ON public.mental_clarity_tests;
DROP POLICY IF EXISTS "Users can update own mental clarity tests" ON public.mental_clarity_tests;
DROP POLICY IF EXISTS "Users can delete own mental clarity tests" ON public.mental_clarity_tests;

DROP POLICY IF EXISTS "Users can view own clarity index" ON public.clarity_index;
DROP POLICY IF EXISTS "Users can insert own clarity index" ON public.clarity_index;
DROP POLICY IF EXISTS "Users can update own clarity index" ON public.clarity_index;
DROP POLICY IF EXISTS "Users can delete own clarity index" ON public.clarity_index;

-- Create RLS policies for mental_clarity_tests
CREATE POLICY "Users can view own mental clarity tests" ON public.mental_clarity_tests
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own mental clarity tests" ON public.mental_clarity_tests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own mental clarity tests" ON public.mental_clarity_tests
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own mental clarity tests" ON public.mental_clarity_tests
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for clarity_index
CREATE POLICY "Users can view own clarity index" ON public.clarity_index
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own clarity index" ON public.clarity_index
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own clarity index" ON public.clarity_index
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own clarity index" ON public.clarity_index
  FOR DELETE USING (auth.uid() = user_id);

-- Grant permissions
GRANT ALL ON public.mental_clarity_tests TO authenticated;
GRANT ALL ON public.clarity_index TO authenticated;

-- Add helpful comments
COMMENT ON TABLE public.mental_clarity_tests IS 'Stores individual mental clarity test results (focus, flexibility, speed, memory)';
COMMENT ON TABLE public.clarity_index IS 'Stores combined daily mental clarity scores';

-- Verify the schema
DO $$
DECLARE
    test_type_exists boolean;
    timestamp_exists boolean;
    clarity_table_exists boolean;
BEGIN
    -- Check if test_type column exists
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'mental_clarity_tests'
        AND column_name = 'test_type'
    ) INTO test_type_exists;

    -- Check if timestamp column exists
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'mental_clarity_tests'
        AND column_name = 'timestamp'
    ) INTO timestamp_exists;

    -- Check if clarity_index table exists
    SELECT EXISTS (
        SELECT 1 FROM pg_tables
        WHERE schemaname = 'public'
        AND tablename = 'clarity_index'
    ) INTO clarity_table_exists;

    -- Report results
    IF test_type_exists AND timestamp_exists AND clarity_table_exists THEN
        RAISE NOTICE '✅ Schema fix successful!';
        RAISE NOTICE '   - test_type column: EXISTS';
        RAISE NOTICE '   - timestamp column: EXISTS';
        RAISE NOTICE '   - clarity_index table: EXISTS';
    ELSE
        RAISE WARNING '⚠️ Schema verification failed:';
        IF NOT test_type_exists THEN
            RAISE WARNING '   - test_type column: MISSING';
        END IF;
        IF NOT timestamp_exists THEN
            RAISE WARNING '   - timestamp column: MISSING';
        END IF;
        IF NOT clarity_table_exists THEN
            RAISE WARNING '   - clarity_index table: MISSING';
        END IF;
    END IF;
END $$;
