-- Migration: Add initiated column to intimacy_logs
-- Purpose: Track whether user initiated intimacy (only relevant for couples)
-- Date: 2025-11-22

-- Add initiated column to intimacy_logs table
ALTER TABLE public.intimacy_logs
ADD COLUMN IF NOT EXISTS initiated BOOLEAN DEFAULT NULL;

-- Add comment explaining the column
COMMENT ON COLUMN public.intimacy_logs.initiated IS 'Whether user initiated intimacy - only applicable for couple type, NULL for solo';

-- Verify the migration
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'intimacy_logs'
AND column_name = 'initiated';
