-- Migration: Add sleep_target field to sleep_logs table
-- Date: 2025-11-04
-- Description: Adds optional sleep_target field to track user's individual sleep goals

-- Add sleep_target column (optional, defaults to 8.0 hours)
ALTER TABLE public.sleep_logs 
ADD COLUMN IF NOT EXISTS sleep_target DECIMAL(3,1) DEFAULT 8.0;

-- Add comment to explain the column
COMMENT ON COLUMN public.sleep_logs.sleep_target IS 'User''s target sleep duration in hours (default: 8.0)';

-- Optional: Add a check constraint to ensure reasonable values
ALTER TABLE public.sleep_logs 
ADD CONSTRAINT sleep_target_range CHECK (sleep_target >= 4.0 AND sleep_target <= 12.0);

-- Update existing rows to have the default value if NULL
UPDATE public.sleep_logs 
SET sleep_target = 8.0 
WHERE sleep_target IS NULL;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_sleep_logs_date_user 
ON public.sleep_logs(user_id, date DESC);

CREATE INDEX IF NOT EXISTS idx_sleep_logs_quality 
ON public.sleep_logs(quality);
