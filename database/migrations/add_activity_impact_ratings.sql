-- ========================================
-- Enhanced Activity Impact Ratings
-- ========================================
-- Add 1-5 scale ratings for mood, sleep, and clarity
-- to enable better correlation analysis
--
-- This migration adds:
-- 1. mood_rating (1-5): How user felt during/after activity
-- 2. sleep_rating (1-5): Expected sleep quality impact
-- 3. clarity_rating (1-5): Mental clarity during/after activity
-- 4. energy_rating (1-5): Energy level during/after activity
-- ========================================

-- Add rating columns to activities table
DO $$
BEGIN
    -- Add mood_rating column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'activities'
        AND column_name = 'mood_rating'
    ) THEN
        ALTER TABLE public.activities
        ADD COLUMN mood_rating INTEGER CHECK (mood_rating >= 1 AND mood_rating <= 5);

        COMMENT ON COLUMN public.activities.mood_rating IS 'User mood during/after activity (1-5 scale)';

        RAISE NOTICE '✅ Added mood_rating column';
    ELSE
        RAISE NOTICE '⏭️  mood_rating column already exists';
    END IF;

    -- Add sleep_rating column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'activities'
        AND column_name = 'sleep_rating'
    ) THEN
        ALTER TABLE public.activities
        ADD COLUMN sleep_rating INTEGER CHECK (sleep_rating >= 1 AND sleep_rating <= 5);

        COMMENT ON COLUMN public.activities.sleep_rating IS 'Expected sleep quality impact from activity (1-5 scale)';

        RAISE NOTICE '✅ Added sleep_rating column';
    ELSE
        RAISE NOTICE '⏭️  sleep_rating column already exists';
    END IF;

    -- Add clarity_rating column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'activities'
        AND column_name = 'clarity_rating'
    ) THEN
        ALTER TABLE public.activities
        ADD COLUMN clarity_rating INTEGER CHECK (clarity_rating >= 1 AND clarity_rating <= 5);

        COMMENT ON COLUMN public.activities.clarity_rating IS 'Mental clarity during/after activity (1-5 scale)';

        RAISE NOTICE '✅ Added clarity_rating column';
    ELSE
        RAISE NOTICE '⏭️  clarity_rating column already exists';
    END IF;

    -- Add energy_rating column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'activities'
        AND column_name = 'energy_rating'
    ) THEN
        ALTER TABLE public.activities
        ADD COLUMN energy_rating INTEGER CHECK (energy_rating >= 1 AND energy_rating <= 5);

        COMMENT ON COLUMN public.activities.energy_rating IS 'Energy level during/after activity (1-5 scale)';

        RAISE NOTICE '✅ Added energy_rating column';
    ELSE
        RAISE NOTICE '⏭️  energy_rating column already exists';
    END IF;
END $$;

-- Create index for faster queries on ratings
CREATE INDEX IF NOT EXISTS idx_activities_ratings
ON public.activities(user_id, date, mood_rating, sleep_rating, clarity_rating, energy_rating);

-- Add comment to table explaining the ratings system
COMMENT ON TABLE public.activities IS
'User activities with impact ratings. Ratings (1-5 scale):
- mood_rating: Immediate mood impact
- sleep_rating: Expected sleep quality impact
- clarity_rating: Mental clarity impact
- energy_rating: Energy level impact';

-- Create a view for easy analysis
CREATE OR REPLACE VIEW public.activities_with_ratings AS
SELECT
    id,
    user_id,
    date,
    category,
    name,
    emoji,
    duration,
    post_activity_feeling,
    mood_rating,
    sleep_rating,
    clarity_rating,
    energy_rating,
    -- Calculate average impact score (0-100)
    CASE
        WHEN (mood_rating IS NOT NULL OR sleep_rating IS NOT NULL OR clarity_rating IS NOT NULL OR energy_rating IS NOT NULL)
        THEN ROUND(
            (COALESCE(mood_rating, 0) + COALESCE(sleep_rating, 0) + COALESCE(clarity_rating, 0) + COALESCE(energy_rating, 0)) * 100.0 /
            (
                (CASE WHEN mood_rating IS NOT NULL THEN 5 ELSE 0 END) +
                (CASE WHEN sleep_rating IS NOT NULL THEN 5 ELSE 0 END) +
                (CASE WHEN clarity_rating IS NOT NULL THEN 5 ELSE 0 END) +
                (CASE WHEN energy_rating IS NOT NULL THEN 5 ELSE 0 END)
            )
        )
        ELSE NULL
    END as avg_impact_score,
    created_at
FROM public.activities
WHERE mood_rating IS NOT NULL
   OR sleep_rating IS NOT NULL
   OR clarity_rating IS NOT NULL
   OR energy_rating IS NOT NULL;

COMMENT ON VIEW public.activities_with_ratings IS 'Activities with ratings and calculated average impact score (0-100)';

-- Verification
DO $$
DECLARE
    mood_exists boolean;
    sleep_exists boolean;
    clarity_exists boolean;
    energy_exists boolean;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'activities'
        AND column_name = 'mood_rating'
    ) INTO mood_exists;

    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'activities'
        AND column_name = 'sleep_rating'
    ) INTO sleep_exists;

    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'activities'
        AND column_name = 'clarity_rating'
    ) INTO clarity_exists;

    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'activities'
        AND column_name = 'energy_rating'
    ) INTO energy_exists;

    IF mood_exists AND sleep_exists AND clarity_exists AND energy_exists THEN
        RAISE NOTICE '';
        RAISE NOTICE '========================================';
        RAISE NOTICE '✅ MIGRATION SUCCESSFUL!';
        RAISE NOTICE '========================================';
        RAISE NOTICE 'Added rating columns to activities table:';
        RAISE NOTICE '  ✓ mood_rating (1-5)';
        RAISE NOTICE '  ✓ sleep_rating (1-5)';
        RAISE NOTICE '  ✓ clarity_rating (1-5)';
        RAISE NOTICE '  ✓ energy_rating (1-5)';
        RAISE NOTICE '';
        RAISE NOTICE 'Created view: activities_with_ratings';
        RAISE NOTICE 'Created index: idx_activities_ratings';
        RAISE NOTICE '========================================';
    ELSE
        RAISE WARNING '⚠️  Migration incomplete - some columns missing';
    END IF;
END $$;
