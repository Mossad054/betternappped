-- Migration: Create Intimacy Daily Check-Ins System
-- This creates tables for daily reflections and AI recommendations

-- Drop existing tables if they exist
DROP TABLE IF EXISTS public.check_in_recommendations CASCADE;
DROP TABLE IF EXISTS public.intimacy_check_ins CASCADE;

-- Create intimacy_check_ins table for daily reflections
CREATE TABLE IF NOT EXISTS public.intimacy_check_ins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,

  -- Reflection questions
  overall_feeling TEXT CHECK (overall_feeling IN ('amazing', 'good', 'neutral', 'struggling', 'disconnected')),
  emotional_connection INTEGER CHECK (emotional_connection >= 1 AND emotional_connection <= 10),
  physical_connection INTEGER CHECK (physical_connection >= 1 AND physical_connection <= 10),
  communication_quality INTEGER CHECK (communication_quality >= 1 AND communication_quality <= 10),

  -- Open-ended responses
  desires TEXT,
  challenges TEXT,
  gratitude TEXT,
  reflection_notes TEXT,

  -- Specific areas
  needs_attention TEXT[] DEFAULT ARRAY[]::TEXT[], -- areas user wants to improve
  relationship_type TEXT CHECK (relationship_type IN ('solo', 'partnered', 'exploring')),

  -- Mood tracking
  mood_tags TEXT[] DEFAULT ARRAY[]::TEXT[],

  -- Metadata
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(user_id, date)
);

-- Create check_in_recommendations table
CREATE TABLE IF NOT EXISTS public.check_in_recommendations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  check_in_id UUID REFERENCES public.intimacy_check_ins(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,

  -- Recommendation details
  type TEXT CHECK (type IN ('activity', 'program', 'experiment', 'resource', 'reflection')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT,

  -- Action data
  action_type TEXT, -- redirect, modal, link
  action_data JSONB DEFAULT '{}'::jsonb,

  -- Priority and relevance
  priority INTEGER DEFAULT 5 CHECK (priority >= 1 AND priority <= 10),
  relevance_score DECIMAL(3,2) DEFAULT 0.5,

  -- Tracking
  viewed BOOLEAN DEFAULT false,
  completed BOOLEAN DEFAULT false,
  dismissed BOOLEAN DEFAULT false,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_intimacy_check_ins_user_date ON public.intimacy_check_ins(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_check_in_recommendations_check_in ON public.check_in_recommendations(check_in_id);
CREATE INDEX IF NOT EXISTS idx_check_in_recommendations_user ON public.check_in_recommendations(user_id, created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.intimacy_check_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.check_in_recommendations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for intimacy_check_ins
CREATE POLICY "Users can view own check-ins" ON public.intimacy_check_ins
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own check-ins" ON public.intimacy_check_ins
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own check-ins" ON public.intimacy_check_ins
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own check-ins" ON public.intimacy_check_ins
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for check_in_recommendations
CREATE POLICY "Users can view own recommendations" ON public.check_in_recommendations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own recommendations" ON public.check_in_recommendations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own recommendations" ON public.check_in_recommendations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own recommendations" ON public.check_in_recommendations
  FOR DELETE USING (auth.uid() = user_id);

-- Grant permissions
GRANT ALL ON public.intimacy_check_ins TO authenticated;
GRANT ALL ON public.check_in_recommendations TO authenticated;

COMMENT ON TABLE public.intimacy_check_ins IS 'Stores daily intimacy check-in reflections';
COMMENT ON TABLE public.check_in_recommendations IS 'Stores AI-generated recommendations based on check-ins';
