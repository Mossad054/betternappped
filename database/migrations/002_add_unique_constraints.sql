-- Migration: Add unique constraints to prevent duplicate data entries
-- This migration adds unique constraints to ensure data is not logged multiple times for the same day

-- Add unique constraint on activities table (user_id + date + name + category)
-- This prevents logging the same activity twice on the same date
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'activities_user_date_name_category_unique'
    ) THEN
        ALTER TABLE public.activities 
        ADD CONSTRAINT activities_user_date_name_category_unique 
        UNIQUE (user_id, date, name, category);
    END IF;
END $$;

-- Note: experiment_logs already has UNIQUE(experiment_id, date) constraint
-- Note: mood_logs already has UNIQUE(user_id, date) constraint
-- Note: sleep_logs already has UNIQUE(user_id, date) constraint
-- Note: productivity_logs already has UNIQUE(user_id, date) constraint
-- Note: intimacy_logs already has UNIQUE(user_id, date) constraint

-- Create index for better query performance on activities
CREATE INDEX IF NOT EXISTS idx_activities_user_date 
ON public.activities(user_id, date);

CREATE INDEX IF NOT EXISTS idx_activities_date_name 
ON public.activities(date, name);

-- Migration completed successfully
