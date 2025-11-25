-- Migration: Create Intimacy Connection Score System
-- This creates tables for tracking connection scores and intimacy metrics

-- Drop existing tables if they exist
DROP TABLE IF EXISTS public.connection_score CASCADE;
DROP TABLE IF EXISTS public.intimacy_metrics CASCADE;

-- Create intimacy_metrics table for tracking daily metrics
CREATE TABLE IF NOT EXISTS public.intimacy_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,

  -- Activity tracking
  intimacy_frequency INTEGER DEFAULT 0 CHECK (intimacy_frequency >= 0),
  activity_types TEXT[] DEFAULT ARRAY[]::TEXT[],

  -- Quality metrics (1-10 scale)
  quality_rating INTEGER CHECK (quality_rating >= 1 AND quality_rating <= 10),
  satisfaction_rating INTEGER CHECK (satisfaction_rating >= 1 AND satisfaction_rating <= 10),
  emotional_connection INTEGER CHECK (emotional_connection >= 1 AND emotional_connection <= 10),

  -- Additional context
  time_spent INTEGER DEFAULT 0, -- minutes
  notes TEXT,
  mood_before TEXT,
  mood_after TEXT,

  -- Metadata
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(user_id, date)
);

-- Create connection_score table for daily calculated scores
CREATE TABLE IF NOT EXISTS public.connection_score (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,

  -- Score components (0-100)
  frequency_score INTEGER DEFAULT 0 CHECK (frequency_score >= 0 AND frequency_score <= 100),
  quality_score INTEGER DEFAULT 0 CHECK (quality_score >= 0 AND quality_score <= 100),
  emotional_score INTEGER DEFAULT 0 CHECK (emotional_score >= 0 AND emotional_score <= 100),
  consistency_score INTEGER DEFAULT 0 CHECK (consistency_score >= 0 AND consistency_score <= 100),
  variety_score INTEGER DEFAULT 0 CHECK (variety_score >= 0 AND variety_score <= 100),

  -- Combined score
  total_score INTEGER DEFAULT 0 CHECK (total_score >= 0 AND total_score <= 100),

  -- Streak tracking
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,

  -- Metadata
  calculation_metadata JSONB DEFAULT '{}'::jsonb,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(user_id, date)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_intimacy_metrics_user_date ON public.intimacy_metrics(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_intimacy_metrics_user_timestamp ON public.intimacy_metrics(user_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_connection_score_user_date ON public.connection_score(user_id, date DESC);

-- Enable Row Level Security
ALTER TABLE public.intimacy_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.connection_score ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for intimacy_metrics
CREATE POLICY "Users can view own intimacy metrics" ON public.intimacy_metrics
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own intimacy metrics" ON public.intimacy_metrics
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own intimacy metrics" ON public.intimacy_metrics
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own intimacy metrics" ON public.intimacy_metrics
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for connection_score
CREATE POLICY "Users can view own connection score" ON public.connection_score
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own connection score" ON public.connection_score
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own connection score" ON public.connection_score
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own connection score" ON public.connection_score
  FOR DELETE USING (auth.uid() = user_id);

-- Grant permissions
GRANT ALL ON public.intimacy_metrics TO authenticated;
GRANT ALL ON public.connection_score TO authenticated;

COMMENT ON TABLE public.intimacy_metrics IS 'Stores daily intimacy activity metrics for connection score calculation';
COMMENT ON TABLE public.connection_score IS 'Stores calculated connection scores and streak tracking';
