-- Create experiments_library table
-- This table stores pre-defined experiment templates that users can select from

CREATE TABLE IF NOT EXISTS public.experiments_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL CHECK (category IN ('Sleep', 'Mood', 'Focus', 'Energy', 'Anxiety', 'Productivity')),
  instructions TEXT NOT NULL,
  description TEXT NOT NULL,
  difficulty TEXT DEFAULT 'Medium' CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
  duration_options TEXT[] DEFAULT ARRAY['1-week', '2-weeks', '1-month'],
  emoji TEXT NOT NULL DEFAULT '✨',
  benefits TEXT[] DEFAULT ARRAY[]::TEXT[],
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_experiments_library_category ON public.experiments_library(category);
CREATE INDEX IF NOT EXISTS idx_experiments_library_name ON public.experiments_library(name);
CREATE INDEX IF NOT EXISTS idx_experiments_library_difficulty ON public.experiments_library(difficulty);

-- Enable RLS (Row Level Security)
ALTER TABLE public.experiments_library ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all users to read experiments library
CREATE POLICY "Experiments library is publicly readable"
  ON public.experiments_library
  FOR SELECT
  USING (true);

-- Create policy to allow only authenticated users to insert (admin only)
CREATE POLICY "Only authenticated users can insert experiments"
  ON public.experiments_library
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_experiments_library_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER experiments_library_updated_at
  BEFORE UPDATE ON public.experiments_library
  FOR EACH ROW
  EXECUTE FUNCTION update_experiments_library_updated_at();

-- Add comments
COMMENT ON TABLE public.experiments_library IS 'Pre-defined experiment templates that users can choose from';
COMMENT ON COLUMN public.experiments_library.name IS 'Name of the experiment';
COMMENT ON COLUMN public.experiments_library.category IS 'Category: Sleep, Mood, Focus, Energy, Anxiety, or Productivity';
COMMENT ON COLUMN public.experiments_library.instructions IS 'Instructions on how to complete the experiment';
COMMENT ON COLUMN public.experiments_library.description IS 'Expected outcomes and benefits over time (7, 14, 30 days)';
COMMENT ON COLUMN public.experiments_library.difficulty IS 'Difficulty level: Easy, Medium, or Hard';
COMMENT ON COLUMN public.experiments_library.duration_options IS 'Available duration options for the experiment';
COMMENT ON COLUMN public.experiments_library.emoji IS 'Emoji representing the experiment category';
