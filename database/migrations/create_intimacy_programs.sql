-- Migration: Create Intimacy Learning Programs System
-- This creates tables for programs, lessons, and user progress tracking

-- Drop existing tables if they exist
DROP TABLE IF EXISTS public.lesson_reflections CASCADE;
DROP TABLE IF EXISTS public.user_program_progress CASCADE;
DROP TABLE IF EXISTS public.program_lessons CASCADE;
DROP TABLE IF EXISTS public.intimacy_programs CASCADE;

-- Create intimacy_programs table
CREATE TABLE IF NOT EXISTS public.intimacy_programs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Program details
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT CHECK (category IN ('communication', 'emotional', 'physical', 'conflict', 'self-awareness', 'relationship-skills')),
  difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),

  -- Content
  duration_weeks INTEGER DEFAULT 1,
  total_lessons INTEGER DEFAULT 0,
  learning_outcomes TEXT[] DEFAULT ARRAY[]::TEXT[],
  prerequisites TEXT[] DEFAULT ARRAY[]::TEXT[],

  -- Visual
  icon TEXT,
  color TEXT,
  cover_image TEXT,

  -- Metadata
  is_active BOOLEAN DEFAULT true,
  featured BOOLEAN DEFAULT false,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create program_lessons table
CREATE TABLE IF NOT EXISTS public.program_lessons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  program_id UUID REFERENCES public.intimacy_programs(id) ON DELETE CASCADE NOT NULL,

  -- Lesson details
  title TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  lesson_type TEXT CHECK (lesson_type IN ('reading', 'reflection', 'exercise', 'quiz', 'action')),

  -- Content
  content TEXT NOT NULL, -- Markdown or rich text
  duration_minutes INTEGER DEFAULT 10,
  key_takeaways TEXT[] DEFAULT ARRAY[]::TEXT[],

  -- Interactive elements
  reflection_prompts JSONB DEFAULT '[]'::jsonb,
  action_items JSONB DEFAULT '[]'::jsonb, -- Can be converted to habits
  quiz_questions JSONB DEFAULT '[]'::jsonb,

  -- Resources
  resources JSONB DEFAULT '[]'::jsonb, -- Links, videos, etc.

  -- Metadata
  is_locked BOOLEAN DEFAULT false,
  unlock_after_lesson UUID REFERENCES public.program_lessons(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(program_id, order_index)
);

-- Create user_program_progress table
CREATE TABLE IF NOT EXISTS public.user_program_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  program_id UUID REFERENCES public.intimacy_programs(id) ON DELETE CASCADE NOT NULL,

  -- Enrollment
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,

  -- Progress
  current_lesson_id UUID REFERENCES public.program_lessons(id) ON DELETE SET NULL,
  lessons_completed INTEGER DEFAULT 0,
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),

  -- Engagement
  last_accessed TIMESTAMP WITH TIME ZONE,
  total_time_minutes INTEGER DEFAULT 0,

  -- Metadata
  status TEXT CHECK (status IN ('enrolled', 'in_progress', 'completed', 'paused')) DEFAULT 'enrolled',
  notes TEXT,

  UNIQUE(user_id, program_id)
);

-- Create lesson_reflections table
CREATE TABLE IF NOT EXISTS public.lesson_reflections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  lesson_id UUID REFERENCES public.program_lessons(id) ON DELETE CASCADE NOT NULL,

  -- Completion
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,

  -- Reflections
  reflection_responses JSONB DEFAULT '{}'::jsonb, -- prompt_id -> response
  notes TEXT,
  insights TEXT,

  -- Action items
  action_items_completed JSONB DEFAULT '[]'::jsonb, -- array of completed action IDs
  habits_created UUID[] DEFAULT ARRAY[]::UUID[], -- references to habits table

  -- Quiz results
  quiz_score INTEGER,
  quiz_answers JSONB DEFAULT '{}'::jsonb,

  -- Metadata
  time_spent_minutes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(user_id, lesson_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_intimacy_programs_category ON public.intimacy_programs(category, featured);
CREATE INDEX IF NOT EXISTS idx_program_lessons_program ON public.program_lessons(program_id, order_index);
CREATE INDEX IF NOT EXISTS idx_user_program_progress_user ON public.user_program_progress(user_id, status);
CREATE INDEX IF NOT EXISTS idx_user_program_progress_program ON public.user_program_progress(program_id);
CREATE INDEX IF NOT EXISTS idx_lesson_reflections_user ON public.lesson_reflections(user_id, lesson_id);

-- Enable Row Level Security
ALTER TABLE public.intimacy_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.program_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_program_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_reflections ENABLE ROW LEVEL SECURITY;

-- Programs and lessons are public (anyone can view)
CREATE POLICY "Anyone can view programs" ON public.intimacy_programs
  FOR SELECT USING (is_active = true);

CREATE POLICY "Anyone can view lessons" ON public.program_lessons
  FOR SELECT USING (true);

-- User progress and reflections are private
CREATE POLICY "Users can view own progress" ON public.user_program_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress" ON public.user_program_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress" ON public.user_program_progress
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own progress" ON public.user_program_progress
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own reflections" ON public.lesson_reflections
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reflections" ON public.lesson_reflections
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reflections" ON public.lesson_reflections
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reflections" ON public.lesson_reflections
  FOR DELETE USING (auth.uid() = user_id);

-- Grant permissions
GRANT SELECT ON public.intimacy_programs TO authenticated, anon;
GRANT SELECT ON public.program_lessons TO authenticated, anon;
GRANT ALL ON public.user_program_progress TO authenticated;
GRANT ALL ON public.lesson_reflections TO authenticated;

COMMENT ON TABLE public.intimacy_programs IS 'Learning programs for intimacy improvement';
COMMENT ON TABLE public.program_lessons IS 'Individual lessons within programs';
COMMENT ON TABLE public.user_program_progress IS 'User enrollment and progress tracking';
COMMENT ON TABLE public.lesson_reflections IS 'User reflections and completions for lessons';
