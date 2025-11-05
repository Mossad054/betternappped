-- Migration: Add instruction column to habits table
-- Date: 2025-11-06
-- Description: Adds instruction field to store habit-specific instructions and expected outcomes

-- Add instruction column to habits table
ALTER TABLE public.habits 
ADD COLUMN IF NOT EXISTS instruction TEXT;

-- Add a comment to document the column
COMMENT ON COLUMN public.habits.instruction IS 'Detailed instructions for completing the habit and expected outcomes';
