-- Migration: Add enhanced intimacy check-in fields
-- Purpose: Support post-intimacy tracking with orgasm, initiation, and duration
-- Date: 2025-11-22

-- Add new columns to daily_checkins table for post-intimacy details
ALTER TABLE public.daily_checkins
ADD COLUMN IF NOT EXISTS had_orgasm BOOLEAN DEFAULT NULL,
ADD COLUMN IF NOT EXISTS initiated BOOLEAN DEFAULT NULL,
ADD COLUMN IF NOT EXISTS duration INTEGER DEFAULT NULL; -- Duration in minutes

-- Add comments
COMMENT ON COLUMN public.daily_checkins.had_orgasm IS 'Whether user had orgasm during intimacy session';
COMMENT ON COLUMN public.daily_checkins.initiated IS 'Whether user initiated the intimacy session';
COMMENT ON COLUMN public.daily_checkins.duration IS 'Duration of intimacy session in minutes';

-- Create user_intimacy_goals table for tracking orgasm goals
CREATE TABLE IF NOT EXISTS public.user_intimacy_goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  goal_type TEXT CHECK (goal_type IN ('orgasm', 'frequency', 'streak')) NOT NULL,
  target_value INTEGER NOT NULL,
  period TEXT CHECK (period IN ('weekly', 'monthly')) NOT NULL DEFAULT 'monthly',
  current_value INTEGER DEFAULT 0,
  start_date DATE NOT NULL,
  end_date DATE,
  status TEXT CHECK (status IN ('active', 'completed', 'expired')) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, goal_type, period)
);

-- Add RLS policies for user_intimacy_goals
ALTER TABLE public.user_intimacy_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own intimacy goals"
ON public.user_intimacy_goals FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own intimacy goals"
ON public.user_intimacy_goals FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own intimacy goals"
ON public.user_intimacy_goals FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own intimacy goals"
ON public.user_intimacy_goals FOR DELETE
USING (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_intimacy_goals_user
ON public.user_intimacy_goals(user_id, status);

-- Add comments
COMMENT ON TABLE public.user_intimacy_goals IS 'User-defined intimacy goals for tracking progress';

-- Verify migration
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'daily_checkins'
AND column_name IN ('had_orgasm', 'initiated', 'duration');
