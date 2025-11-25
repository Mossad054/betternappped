-- Create habits_library table for storing habit templates
-- This table stores pre-defined habit templates that users can add to their personal habits

CREATE TABLE IF NOT EXISTS public.habits_library (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  category TEXT NOT NULL, -- MentalClarity, Health, Sleep, Mood, Intimacy, Anxiety
  instructions TEXT,
  expected_outcome TEXT,
  emoji TEXT,
  difficulty TEXT CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
  time_required TEXT,
  benefits TEXT[], -- Array of benefit strings
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Add index for faster category-based queries
CREATE INDEX IF NOT EXISTS idx_habits_library_category ON public.habits_library(category);

-- Add RLS policies
ALTER TABLE public.habits_library ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read habit templates
CREATE POLICY "Anyone can view habit templates"
  ON public.habits_library
  FOR SELECT
  TO authenticated
  USING (true);

-- Only allow service role to insert/update/delete templates
CREATE POLICY "Only service role can modify templates"
  ON public.habits_library
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

COMMENT ON TABLE public.habits_library IS 'Template library of habits that users can browse and add to their personal habits';
COMMENT ON COLUMN public.habits_library.name IS 'Display name of the habit template';
COMMENT ON COLUMN public.habits_library.category IS 'Category classification for filtering';
COMMENT ON COLUMN public.habits_library.difficulty IS 'Difficulty level: Easy, Medium, or Hard';
COMMENT ON COLUMN public.habits_library.benefits IS 'Array of benefit strings to display to users';
