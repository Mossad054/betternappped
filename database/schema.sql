-- Betternapped Database Schema
-- Run this SQL in your Supabase SQL Editor

-- Note: JWT configuration removed for basic setup
-- You can add JWT configuration later if needed

-- Create users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create mood_logs table
CREATE TABLE IF NOT EXISTS public.mood_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  moods JSONB NOT NULL DEFAULT '[]'::jsonb,
  triggers JSONB DEFAULT '{}'::jsonb,
  score INTEGER NOT NULL CHECK (score >= 1 AND score <= 5),
  emoji TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Create activities table
CREATE TABLE IF NOT EXISTS public.activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  duration INTEGER,
  emoji TEXT,
  follow_up_answer TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create sleep_logs table
CREATE TABLE IF NOT EXISTS public.sleep_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  bedtime TIME NOT NULL,
  wake_time TIME NOT NULL,
  hours DECIMAL(3,1) NOT NULL,
  quality INTEGER NOT NULL CHECK (quality >= 1 AND quality <= 5),
  waking_feeling TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Create habits table
CREATE TABLE IF NOT EXISTS public.habits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  instruction TEXT,
  emoji TEXT,
  total_days INTEGER NOT NULL DEFAULT 30,
  streak INTEGER NOT NULL DEFAULT 0,
  streak_goal INTEGER NOT NULL DEFAULT 30,
  reminder_enabled BOOLEAN NOT NULL DEFAULT false,
  reminder_time TIME,
  quote TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create habit_logs table
CREATE TABLE IF NOT EXISTS public.habit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  habit_id UUID REFERENCES public.habits(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  feedback TEXT CHECK (feedback IN ('good', 'neutral', 'bad')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(habit_id, date)
);

-- Create experiments table
CREATE TABLE IF NOT EXISTS public.experiments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  activity_name TEXT NOT NULL,
  activity_emoji TEXT NOT NULL,
  outcomes JSONB NOT NULL DEFAULT '[]'::jsonb,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  duration INTEGER NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'completed', 'paused')),
  current_day INTEGER NOT NULL DEFAULT 1,
  baseline_data JSONB,
  results_data JSONB,
  insights TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create experiment_logs table
CREATE TABLE IF NOT EXISTS public.experiment_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  experiment_id UUID REFERENCES public.experiments(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  skipped BOOLEAN NOT NULL DEFAULT false,
  outcome_scores JSONB,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(experiment_id, date)
);

-- Create productivity_logs table
CREATE TABLE IF NOT EXISTS public.productivity_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  focused_hours DECIMAL(3,1),
  factors JSONB NOT NULL DEFAULT '[]'::jsonb,
  other_factor TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Create intimacy_logs table
CREATE TABLE IF NOT EXISTS public.intimacy_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('solo', 'couple')),
  orgasm BOOLEAN NOT NULL DEFAULT false,
  location TEXT,
  toy_used BOOLEAN NOT NULL DEFAULT false,
  time_to_sleep INTEGER NOT NULL DEFAULT 0,
  mood_before INTEGER NOT NULL CHECK (mood_before >= 1 AND mood_before <= 5),
  mood_after INTEGER NOT NULL CHECK (mood_after >= 1 AND mood_after <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Create mental_clarity_tests table
CREATE TABLE IF NOT EXISTS public.mental_clarity_tests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  score INTEGER NOT NULL CHECK (score >= 1 AND score <= 5),
  factors JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_mood_logs_user_date ON public.mood_logs(user_id, date);
CREATE INDEX IF NOT EXISTS idx_activities_user_date ON public.activities(user_id, date);
CREATE INDEX IF NOT EXISTS idx_sleep_logs_user_date ON public.sleep_logs(user_id, date);
CREATE INDEX IF NOT EXISTS idx_habits_user_id ON public.habits(user_id);
CREATE INDEX IF NOT EXISTS idx_habit_logs_habit_date ON public.habit_logs(habit_id, date);
CREATE INDEX IF NOT EXISTS idx_experiments_user_id ON public.experiments(user_id);
CREATE INDEX IF NOT EXISTS idx_experiment_logs_experiment_date ON public.experiment_logs(experiment_id, date);
CREATE INDEX IF NOT EXISTS idx_productivity_logs_user_date ON public.productivity_logs(user_id, date);
CREATE INDEX IF NOT EXISTS idx_intimacy_logs_user_date ON public.intimacy_logs(user_id, date);
CREATE INDEX IF NOT EXISTS idx_mental_clarity_tests_user_date ON public.mental_clarity_tests(user_id, date);

-- Enable Row Level Security on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mood_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sleep_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experiments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experiment_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.productivity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.intimacy_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mental_clarity_tests ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for users table
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create RLS policies for mood_logs table
CREATE POLICY "Users can view own mood logs" ON public.mood_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own mood logs" ON public.mood_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own mood logs" ON public.mood_logs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own mood logs" ON public.mood_logs
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for activities table
CREATE POLICY "Users can view own activities" ON public.activities
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own activities" ON public.activities
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own activities" ON public.activities
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own activities" ON public.activities
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for sleep_logs table
CREATE POLICY "Users can view own sleep logs" ON public.sleep_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sleep logs" ON public.sleep_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sleep logs" ON public.sleep_logs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sleep logs" ON public.sleep_logs
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for habits table
CREATE POLICY "Users can view own habits" ON public.habits
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own habits" ON public.habits
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own habits" ON public.habits
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own habits" ON public.habits
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for habit_logs table
CREATE POLICY "Users can view own habit logs" ON public.habit_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own habit logs" ON public.habit_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own habit logs" ON public.habit_logs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own habit logs" ON public.habit_logs
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for experiments table
CREATE POLICY "Users can view own experiments" ON public.experiments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own experiments" ON public.experiments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own experiments" ON public.experiments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own experiments" ON public.experiments
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for experiment_logs table
CREATE POLICY "Users can view own experiment logs" ON public.experiment_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own experiment logs" ON public.experiment_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own experiment logs" ON public.experiment_logs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own experiment logs" ON public.experiment_logs
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for productivity_logs table
CREATE POLICY "Users can view own productivity logs" ON public.productivity_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own productivity logs" ON public.productivity_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own productivity logs" ON public.productivity_logs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own productivity logs" ON public.productivity_logs
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for intimacy_logs table
CREATE POLICY "Users can view own intimacy logs" ON public.intimacy_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own intimacy logs" ON public.intimacy_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own intimacy logs" ON public.intimacy_logs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own intimacy logs" ON public.intimacy_logs
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for mental_clarity_tests table
CREATE POLICY "Users can view own mental clarity tests" ON public.mental_clarity_tests
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own mental clarity tests" ON public.mental_clarity_tests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own mental clarity tests" ON public.mental_clarity_tests
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own mental clarity tests" ON public.mental_clarity_tests
  FOR DELETE USING (auth.uid() = user_id);

-- Create function to automatically create user profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create user profile
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update updated_at on users table
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
