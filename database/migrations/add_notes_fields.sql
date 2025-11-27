-- Migration: Add notes, intensity, and post_activity_feeling fields to activities table
-- Migration: Add notes field to sleep_logs table
-- Date: 2025-11-26
-- Description: Ensures journal entries can store user notes for activities and sleep logs

-- Add new columns to activities table
ALTER TABLE activities
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS intensity INTEGER,
ADD COLUMN IF NOT EXISTS post_activity_feeling TEXT;

-- Add notes column to sleep_logs table
ALTER TABLE sleep_logs
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Add comments to document the purpose of these fields
COMMENT ON COLUMN activities.notes IS 'Optional user notes about the activity (max 200 characters recommended)';
COMMENT ON COLUMN activities.intensity IS 'Optional intensity level of the activity (1-5 scale)';
COMMENT ON COLUMN activities.post_activity_feeling IS 'Optional feeling after completing the activity';
COMMENT ON COLUMN sleep_logs.notes IS 'Optional user notes about the sleep session';

-- Note: mood_logs table already has notes field, no changes needed
