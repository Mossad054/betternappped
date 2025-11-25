-- =====================================================
-- BETTERNAPPED COMPREHENSIVE DATABASE SCHEMA
-- Version: 2.0 (Normalized & Optimized)
-- Date: November 13, 2025
-- Description: Complete normalized schema reflecting all app features
-- Compatibility: PostgreSQL 14+, Supabase
-- =====================================================

-- =====================================================
-- EXTENSIONS & SETUP
-- =====================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable Row Level Security functions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- SECTION 1: USER MANAGEMENT & AUTHENTICATION
-- =====================================================

-- Table: users (extends Supabase auth.users)
-- Purpose: Core user profile extending Supabase authentication
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb
);

COMMENT ON TABLE public.users IS 'Core user records extending Supabase auth.users';
COMMENT ON COLUMN public.users.metadata IS 'Flexible storage for additional user metadata';

-- Table: profiles
-- Purpose: Extended user profile information (name, avatar, PIN)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  email TEXT,
  profile_picture TEXT, -- URL to Supabase Storage /avatars bucket
  pin_code_hash TEXT, -- SHA-256 hashed PIN (NEVER store plain text)
  pin_enabled BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE public.profiles IS 'Extended user profiles with personal info and security settings';
COMMENT ON COLUMN public.profiles.profile_picture IS 'Public URL to avatar image stored in Supabase Storage avatars bucket';
COMMENT ON COLUMN public.profiles.pin_code_hash IS 'SHA-256 hashed PIN for app lock feature (salted, never plain text)';

-- Table: user_preferences
-- Purpose: User app preferences (theme, colors, icons, emojis)
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  color_theme TEXT DEFAULT 'default' NOT NULL, -- default, warm, cool, nature, pastel, ocean, sunset, forest, lavender
  theme_mode TEXT DEFAULT 'system' NOT NULL CHECK (theme_mode IN ('light', 'dark', 'system')),
  icon_pack TEXT DEFAULT 'default' NOT NULL, -- default, rounded, outlined, filled
  emoji_palette TEXT DEFAULT 'default' NOT NULL, -- default, minimal, playful, nature
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE public.user_preferences IS 'User appearance and theme preferences';
COMMENT ON COLUMN public.user_preferences.emoji_palette IS 'Selected emoji set for mood tracking and activities';

-- =====================================================
-- SECTION 2: MOOD & EMOTIONAL TRACKING
-- =====================================================

-- Table: mood_logs
-- Purpose: Daily mood tracking with multiple moods per day support
CREATE TABLE IF NOT EXISTS public.mood_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  moods JSONB DEFAULT '[]'::jsonb NOT NULL, -- Array of mood objects: [{"emoji": "😊", "name": "happy", "timestamp": "..."}]
  triggers JSONB DEFAULT '{}'::jsonb, -- Contextual triggers: {"positive": [...], "negative": [...]}
  score INTEGER CHECK (score BETWEEN 1 AND 5) NOT NULL,
  emoji TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, date)
);

COMMENT ON TABLE public.mood_logs IS 'Daily mood tracking with multiple moods per day capability';
COMMENT ON COLUMN public.mood_logs.moods IS 'Array of mood entries logged throughout the day with timestamps';
COMMENT ON COLUMN public.mood_logs.score IS 'Overall mood score for the day (1=worst, 5=best)';

-- =====================================================
-- SECTION 3: ACTIVITIES & IMPACT TRACKING
-- =====================================================

-- Table: activities
-- Purpose: Log daily activities (exercise, work, social, etc.)
CREATE TABLE IF NOT EXISTS public.activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  category TEXT NOT NULL, -- exercise, work, social, food, weather, productivity, better_me
  name TEXT NOT NULL,
  duration INTEGER, -- Duration in minutes (optional)
  emoji TEXT,
  follow_up_answer TEXT, -- Contextual post-activity feeling
  post_activity_feeling TEXT, -- Smart emoji-based feeling tracker
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE public.activities IS 'User daily activities for tracking habits and correlations';
COMMENT ON COLUMN public.activities.post_activity_feeling IS 'Emoji-based feeling immediately after activity';
COMMENT ON COLUMN public.activities.follow_up_answer IS 'Additional context about activity experience';

-- Table: activity_outcome_correlations
-- Purpose: Cached correlation analysis between activities and outcomes
CREATE TABLE IF NOT EXISTS public.activity_outcome_correlations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  activity_name VARCHAR(100) NOT NULL,
  activity_category VARCHAR(50),
  outcome_type VARCHAR(50) CHECK (outcome_type IN ('mood', 'sleep', 'clarity', 'productivity', 'anxiety')) NOT NULL,
  
  -- Impact measurements (deltas from baseline)
  same_day_impact DECIMAL(5,3), -- Average same-day change from baseline
  next_day_impact DECIMAL(5,3), -- Average next-day change from baseline
  sustained_impact DECIMAL(5,3), -- Average sustained effect (3-7 days)
  
  -- Statistical measures
  correlation_coefficient DECIMAL(5,3), -- Pearson r (-1 to +1)
  p_value DECIMAL(10,8), -- Statistical significance
  confidence_interval_low DECIMAL(5,3), -- 95% CI lower bound
  confidence_interval_high DECIMAL(5,3), -- 95% CI upper bound
  
  -- Sample data
  total_occurrences INTEGER DEFAULT 0 NOT NULL,
  paired_data_points INTEGER DEFAULT 0 NOT NULL,
  
  -- Interpretation (pre-calculated for fast lookup)
  impact_strength VARCHAR(20) CHECK (impact_strength IN ('none', 'weak', 'moderate', 'strong', 'very-strong')),
  impact_direction VARCHAR(20) CHECK (impact_direction IN ('improves', 'worsens', 'no-effect')),
  statistical_significance VARCHAR(30) CHECK (statistical_significance IN ('none', 'marginal', 'significant', 'highly-significant')),
  interpretation_text TEXT,
  
  -- Metadata
  first_calculated TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  last_updated TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  is_valid BOOLEAN DEFAULT true,
  
  UNIQUE(user_id, activity_name, outcome_type)
);

COMMENT ON TABLE public.activity_outcome_correlations IS 'Cached correlation analysis between activities and wellness outcomes';
COMMENT ON COLUMN public.activity_outcome_correlations.same_day_impact IS 'Average delta (change from baseline) on same day activity is performed';
COMMENT ON COLUMN public.activity_outcome_correlations.next_day_impact IS 'Average delta (change from baseline) on day after activity';
COMMENT ON COLUMN public.activity_outcome_correlations.correlation_coefficient IS 'Pearson r coefficient measuring consistency of effect';
COMMENT ON COLUMN public.activity_outcome_correlations.is_valid IS 'False if data is outdated or insufficient for reliable analysis';

-- Table: activity_impact_records
-- Purpose: Detailed impact records for each activity occurrence
CREATE TABLE IF NOT EXISTS public.activity_impact_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  activity_id UUID REFERENCES public.activities(id) ON DELETE SET NULL,
  activity_name VARCHAR(100) NOT NULL,
  activity_date DATE NOT NULL,
  
  -- Baseline measurements (BEFORE activity effect)
  baseline_mood DECIMAL(4,2),
  baseline_anxiety DECIMAL(4,2),
  baseline_clarity DECIMAL(4,2),
  baseline_productivity DECIMAL(4,2),
  
  -- Same-day outcomes (AFTER activity)
  same_day_mood DECIMAL(4,2),
  same_day_anxiety DECIMAL(4,2),
  same_day_clarity DECIMAL(4,2),
  same_day_productivity DECIMAL(4,2),
  
  -- Next-day outcomes
  next_day_mood DECIMAL(4,2),
  next_day_sleep_quality DECIMAL(4,2),
  next_day_sleep_hours DECIMAL(4,2),
  next_day_clarity DECIMAL(4,2),
  next_day_productivity DECIMAL(4,2),
  next_day_anxiety DECIMAL(4,2),
  
  -- Calculated deltas (change from baseline)
  mood_delta_same_day DECIMAL(5,2),
  mood_delta_next_day DECIMAL(5,2),
  clarity_delta_same_day DECIMAL(5,2),
  clarity_delta_next_day DECIMAL(5,2),
  productivity_delta_same_day DECIMAL(5,2),
  productivity_delta_next_day DECIMAL(5,2),
  anxiety_delta_same_day DECIMAL(5,2),
  anxiety_delta_next_day DECIMAL(5,2),
  sleep_quality_delta DECIMAL(5,2),
  
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE public.activity_impact_records IS 'Detailed impact records for each activity occurrence with baseline and outcome measurements';

-- Table: user_activity_insights
-- Purpose: Cached insights for dashboard display
CREATE TABLE IF NOT EXISTS public.user_activity_insights (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  
  -- Top beneficial activities
  top_mood_boosters JSONB,
  top_sleep_improvers JSONB,
  top_clarity_enhancers JSONB,
  top_anxiety_reducers JSONB,
  
  -- Activities needing attention
  activities_to_reduce JSONB,
  
  -- Overall statistics
  total_activities_analyzed INTEGER,
  highly_beneficial_count INTEGER,
  beneficial_count INTEGER,
  neutral_count INTEGER,
  avoid_count INTEGER,
  
  -- Summary insights (pre-generated text)
  summary_insights JSONB,
  
  -- Metadata
  last_calculated TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  next_recalculation TIMESTAMPTZ
);

COMMENT ON TABLE public.user_activity_insights IS 'Cached insights for fast dashboard display';

-- =====================================================
-- SECTION 4: SLEEP TRACKING & WELLNESS
-- =====================================================

-- Table: sleep_logs
-- Purpose: Daily sleep tracking with quality metrics
CREATE TABLE IF NOT EXISTS public.sleep_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  bedtime TIME NOT NULL,
  wake_time TIME NOT NULL,
  hours DECIMAL(3,1) NOT NULL CHECK (hours >= 0 AND hours <= 24),
  quality INTEGER CHECK (quality BETWEEN 1 AND 5) NOT NULL,
  waking_feeling TEXT NOT NULL,
  sleep_target DECIMAL(3,1) DEFAULT 8.0, -- User's target sleep duration
  sleep_debt DECIMAL(3,1) GENERATED ALWAYS AS (GREATEST(0, sleep_target - hours)) STORED, -- Calculated sleep debt
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, date)
);

COMMENT ON TABLE public.sleep_logs IS 'Daily sleep tracking with quality and target metrics';
COMMENT ON COLUMN public.sleep_logs.sleep_debt IS 'Calculated difference between target and actual sleep (auto-generated)';
COMMENT ON COLUMN public.sleep_logs.waking_feeling IS 'Subjective feeling upon waking (e.g., refreshed, groggy, tired)';

-- =====================================================
-- SECTION 5: MENTAL CLARITY & PRODUCTIVITY
-- =====================================================

-- Table: mental_clarity_tests
-- Purpose: Cognitive performance tracking (subjective + objective tests)
CREATE TABLE IF NOT EXISTS public.mental_clarity_tests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  score INTEGER CHECK (score BETWEEN 1 AND 5) NOT NULL,
  factors JSONB DEFAULT '[]'::jsonb NOT NULL, -- Factors affecting clarity: ["caffeine", "sleep", "stress"]
  test_results JSONB, -- Optional: Store results from cognitive tests (focus, memory, speed, flexibility)
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, date)
);

COMMENT ON TABLE public.mental_clarity_tests IS 'Mental clarity and cognitive performance tracking';
COMMENT ON COLUMN public.mental_clarity_tests.test_results IS 'Results from objective cognitive tests (focus, memory, speed, flexibility)';

-- Table: productivity_logs
-- Purpose: Daily productivity self-assessment
CREATE TABLE IF NOT EXISTS public.productivity_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5) NOT NULL,
  focused_hours DECIMAL(3,1),
  factors JSONB DEFAULT '[]'::jsonb NOT NULL, -- Factors affecting productivity
  other_factor TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, date)
);

COMMENT ON TABLE public.productivity_logs IS 'Daily productivity self-assessment and tracking';
COMMENT ON COLUMN public.productivity_logs.focused_hours IS 'Number of hours spent in focused, productive work';

-- =====================================================
-- SECTION 6: HABIT TRACKING SYSTEM
-- =====================================================

-- Table: habits
-- Purpose: User-created habits for tracking consistency
CREATE TABLE IF NOT EXISTS public.habits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL, -- MentalClarity, Health, Sleep, Mood, Intimacy, Anxiety
  instruction TEXT, -- Step-by-step guidance
  emoji TEXT,
  total_days INTEGER DEFAULT 30 NOT NULL,
  streak INTEGER DEFAULT 0 NOT NULL,
  streak_goal INTEGER DEFAULT 30 NOT NULL,
  reminder_enabled BOOLEAN DEFAULT false NOT NULL,
  reminder_time TIME,
  quote TEXT, -- Motivational quote
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE public.habits IS 'User-defined habits for building consistent routines';
COMMENT ON COLUMN public.habits.streak IS 'Current consecutive days completed';
COMMENT ON COLUMN public.habits.instruction IS 'Detailed instructions for completing the habit';

-- Table: habit_logs
-- Purpose: Daily habit completion tracking
CREATE TABLE IF NOT EXISTS public.habit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  habit_id UUID REFERENCES public.habits(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  completed BOOLEAN DEFAULT false NOT NULL,
  feedback TEXT CHECK (feedback IN ('good', 'neutral', 'bad')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(habit_id, date)
);

COMMENT ON TABLE public.habit_logs IS 'Daily habit completion logs with feedback';
COMMENT ON COLUMN public.habit_logs.feedback IS 'User feedback on habit completion experience';

-- =====================================================
-- SECTION 7: EXPERIMENTS & A/B TESTING
-- =====================================================

-- Table: experiments
-- Purpose: User-created behavioral experiments (e.g., test caffeine impact on sleep)
CREATE TABLE IF NOT EXISTS public.experiments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  activity_name TEXT NOT NULL,
  activity_emoji TEXT NOT NULL,
  outcomes JSONB DEFAULT '[]'::jsonb NOT NULL, -- Outcomes being tracked: ["mood", "sleep", "clarity"]
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  duration INTEGER NOT NULL, -- Duration in days
  status TEXT CHECK (status IN ('active', 'completed', 'paused')) DEFAULT 'active' NOT NULL,
  current_day INTEGER DEFAULT 1 NOT NULL,
  baseline_data JSONB, -- Pre-experiment baseline measurements
  results_data JSONB, -- Post-experiment aggregated results
  insights TEXT, -- AI-generated or user-written insights
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE public.experiments IS 'User behavioral experiments to test activity impact on wellness outcomes';
COMMENT ON COLUMN public.experiments.baseline_data IS 'Pre-experiment baseline measurements for comparison';
COMMENT ON COLUMN public.experiments.results_data IS 'Aggregated results and statistics after experiment completion';

-- Table: experiment_logs
-- Purpose: Daily experiment tracking (did user complete experiment activity?)
CREATE TABLE IF NOT EXISTS public.experiment_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  experiment_id UUID REFERENCES public.experiments(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  completed BOOLEAN DEFAULT false NOT NULL,
  skipped BOOLEAN DEFAULT false NOT NULL,
  outcome_scores JSONB, -- Daily outcome measurements: {"mood": 4, "sleep": 3, "clarity": 5}
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(experiment_id, date)
);

COMMENT ON TABLE public.experiment_logs IS 'Daily experiment activity completion and outcome tracking';
COMMENT ON COLUMN public.experiment_logs.outcome_scores IS 'Daily measurements of outcomes being tracked in experiment';

-- =====================================================
-- SECTION 8: INTIMACY TRACKING (Basic)
-- =====================================================

-- Table: intimacy_logs
-- Purpose: Track intimacy events and their impact on mood/sleep
CREATE TABLE IF NOT EXISTS public.intimacy_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  type TEXT CHECK (type IN ('solo', 'couple')) NOT NULL,
  orgasm BOOLEAN DEFAULT false NOT NULL,
  location TEXT,
  toy_used BOOLEAN DEFAULT false NOT NULL,
  time_to_sleep INTEGER DEFAULT 0 NOT NULL, -- Minutes to fall asleep after
  mood_before INTEGER CHECK (mood_before BETWEEN 1 AND 5) NOT NULL,
  mood_after INTEGER CHECK (mood_after BETWEEN 1 AND 5) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, date)
);

COMMENT ON TABLE public.intimacy_logs IS 'Basic intimacy event tracking with mood impact';
COMMENT ON COLUMN public.intimacy_logs.time_to_sleep IS 'Minutes taken to fall asleep after intimacy event';

-- =====================================================
-- SECTION 9: INTIMACY HUB (Comprehensive Coaching)
-- =====================================================

-- Table: programs
-- Purpose: Pre-developed intimacy coaching programs
CREATE TABLE IF NOT EXISTS public.programs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  duration_days INTEGER NOT NULL,
  total_lessons INTEGER NOT NULL,
  category VARCHAR(50) CHECK (category IN ('communication', 'connection', 'desire', 'conflict', 'self-love', 'exploration')),
  difficulty VARCHAR(20) CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  cover_image_url TEXT,
  tags TEXT[],
  prerequisites TEXT[], -- Program IDs required before starting
  is_premium BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE public.programs IS 'Pre-developed coaching programs for intimacy growth';

-- Table: lessons
-- Purpose: Individual lessons within coaching programs
CREATE TABLE IF NOT EXISTS public.lessons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  program_id UUID REFERENCES public.programs(id) ON DELETE CASCADE NOT NULL,
  order_index INTEGER NOT NULL,
  title VARCHAR(255) NOT NULL,
  subtitle TEXT,
  duration_minutes INTEGER NOT NULL,
  content_type VARCHAR(20) CHECK (content_type IN ('text', 'video', 'audio', 'interactive')),
  content_text TEXT,
  content_media_url TEXT,
  objectives TEXT[],
  action_task TEXT NOT NULL,
  reflection_prompts TEXT[],
  unlock_criteria JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(program_id, order_index)
);

COMMENT ON TABLE public.lessons IS 'Individual teaching modules within coaching programs';

-- Table: user_programs
-- Purpose: User enrollment and progress in programs
CREATE TABLE IF NOT EXISTS public.user_programs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  program_id UUID REFERENCES public.programs(id) ON DELETE CASCADE NOT NULL,
  status VARCHAR(20) CHECK (status IN ('enrolled', 'active', 'paused', 'completed', 'abandoned')) DEFAULT 'enrolled' NOT NULL,
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage BETWEEN 0 AND 100) NOT NULL,
  enrolled_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  last_accessed_at TIMESTAMPTZ,
  reminder_enabled BOOLEAN DEFAULT true,
  reminder_time TIME DEFAULT '20:00:00',
  UNIQUE(user_id, program_id)
);

COMMENT ON TABLE public.user_programs IS 'User enrollment and progress tracking in coaching programs';

-- Table: user_lessons
-- Purpose: User progress tracking for individual lessons
CREATE TABLE IF NOT EXISTS public.user_lessons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE NOT NULL,
  program_id UUID REFERENCES public.programs(id) ON DELETE CASCADE NOT NULL,
  status VARCHAR(20) CHECK (status IN ('locked', 'available', 'in_progress', 'completed')) DEFAULT 'locked' NOT NULL,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  task_timeline VARCHAR(20) CHECK (task_timeline IN ('tonight', '3_days', '7_days', '14_days', '21_days')),
  task_scheduled_for DATE,
  task_completed BOOLEAN DEFAULT false,
  task_completed_at TIMESTAMPTZ,
  effectiveness_rating INTEGER CHECK (effectiveness_rating BETWEEN 1 AND 5),
  feeling_after TEXT,
  reflection_text TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, lesson_id)
);

COMMENT ON TABLE public.user_lessons IS 'User progress tracking for lessons including completion, reflection, and task scheduling';

-- Table: intimacy_experiments
-- Purpose: Intimacy-specific experiments (separate from general experiments)
CREATE TABLE IF NOT EXISTS public.intimacy_experiments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  hypothesis TEXT,
  duration_days INTEGER NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  parameters_tracked TEXT[] NOT NULL,
  frequency VARCHAR(20) CHECK (frequency IN ('daily', 'alternate')),
  reminder_time TIME,
  status VARCHAR(20) CHECK (status IN ('active', 'completed', 'archived')) DEFAULT 'active' NOT NULL,
  completion_rate INTEGER DEFAULT 0 CHECK (completion_rate BETWEEN 0 AND 100),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE public.intimacy_experiments IS 'Intimacy-focused behavioral experiments for testing interventions';

-- Table: intimacy_experiment_logs
-- Purpose: Daily check-ins for intimacy experiments
CREATE TABLE IF NOT EXISTS public.intimacy_experiment_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  experiment_id UUID REFERENCES public.intimacy_experiments(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  day_number INTEGER NOT NULL,
  completed BOOLEAN NOT NULL,
  completion_time TIMESTAMPTZ,
  mood_score INTEGER CHECK (mood_score BETWEEN 1 AND 10),
  energy_score INTEGER CHECK (energy_score BETWEEN 1 AND 10),
  intimacy_score INTEGER CHECK (intimacy_score BETWEEN 1 AND 10),
  anxiety_score INTEGER CHECK (anxiety_score BETWEEN 1 AND 10),
  custom_metrics JSONB,
  reflection_text TEXT,
  challenges TEXT,
  wins TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(experiment_id, date)
);

COMMENT ON TABLE public.intimacy_experiment_logs IS 'Daily check-ins for intimacy experiments tracking completion and metrics';

-- Table: daily_checkins
-- Purpose: Daily emotional and intimacy state tracking
CREATE TABLE IF NOT EXISTS public.daily_checkins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  checkin_date DATE NOT NULL,
  checkin_type VARCHAR(30) CHECK (checkin_type IN ('morning', 'evening', 'general', 'pre_intimacy', 'post_intimacy')) DEFAULT 'general',
  
  -- Emotional state
  mood INTEGER CHECK (mood BETWEEN 1 AND 10),
  stress INTEGER CHECK (stress BETWEEN 1 AND 10),
  energy INTEGER CHECK (energy BETWEEN 1 AND 10),
  
  -- Intimacy-specific
  intimacy_level INTEGER CHECK (intimacy_level BETWEEN 1 AND 10),
  desire_level INTEGER CHECK (desire_level BETWEEN 1 AND 10),
  comfort_level INTEGER CHECK (comfort_level BETWEEN 1 AND 10),
  communication_quality INTEGER CHECK (communication_quality BETWEEN 1 AND 10),
  
  -- Physical
  sleep_quality INTEGER CHECK (sleep_quality BETWEEN 1 AND 10),
  physical_wellbeing INTEGER CHECK (physical_wellbeing BETWEEN 1 AND 10),
  
  -- Reflection
  gratitude_note TEXT,
  challenge_note TEXT,
  win_note TEXT,
  general_notes TEXT,
  
  -- Intimacy event tracking
  had_intimacy BOOLEAN DEFAULT false,
  intimacy_type VARCHAR(50),
  intimacy_satisfaction INTEGER CHECK (intimacy_satisfaction BETWEEN 1 AND 10),
  
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, checkin_date, checkin_type)
);

COMMENT ON TABLE public.daily_checkins IS 'Daily emotional, physical, and intimacy state tracking';

-- Table: user_streaks
-- Purpose: Cached streak counters for gamification
CREATE TABLE IF NOT EXISTS public.user_streaks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  streak_type VARCHAR(30) CHECK (streak_type IN ('daily_checkin', 'experiment', 'program', 'overall')) NOT NULL,
  current_streak INTEGER DEFAULT 0 NOT NULL,
  longest_streak INTEGER DEFAULT 0 NOT NULL,
  last_checkin_date DATE,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, streak_type)
);

COMMENT ON TABLE public.user_streaks IS 'Cached streak counters for gamification';

-- Table: assessments
-- Purpose: Standardized intimacy assessments (templates)
CREATE TABLE IF NOT EXISTS public.assessments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(50) CHECK (category IN ('connection', 'communication', 'desire', 'satisfaction', 'compatibility')),
  duration_minutes INTEGER,
  questions JSONB NOT NULL,
  scoring_rules JSONB NOT NULL,
  recommendation_rules JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE public.assessments IS 'Standardized assessment templates for intimacy health evaluation';

-- Table: user_assessments
-- Purpose: User assessment results and recommendations
CREATE TABLE IF NOT EXISTS public.user_assessments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  assessment_id UUID REFERENCES public.assessments(id) ON DELETE CASCADE NOT NULL,
  taken_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  answers JSONB NOT NULL,
  score INTEGER NOT NULL,
  max_score INTEGER NOT NULL,
  percentage INTEGER CHECK (percentage BETWEEN 0 AND 100) NOT NULL,
  result_category VARCHAR(50),
  result_summary TEXT,
  recommended_programs UUID[],
  recommended_experiments UUID[],
  recommended_practices TEXT[],
  action_taken BOOLEAN DEFAULT false,
  follow_up_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE public.user_assessments IS 'User assessment results with scores and personalized recommendations';

-- Table: user_metrics
-- Purpose: Aggregated user wellness metrics for dashboard
CREATE TABLE IF NOT EXISTS public.user_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  
  -- Connection Score (0-100)
  connection_score INTEGER CHECK (connection_score BETWEEN 0 AND 100),
  connection_trend VARCHAR(20) CHECK (connection_trend IN ('improving', 'stable', 'declining')),
  
  -- Averages (last 30 days)
  avg_mood DECIMAL(3,1),
  avg_intimacy DECIMAL(3,1),
  avg_stress DECIMAL(3,1),
  avg_energy DECIMAL(3,1),
  avg_communication DECIMAL(3,1),
  
  -- Activity counts
  total_programs_completed INTEGER DEFAULT 0,
  total_experiments_completed INTEGER DEFAULT 0,
  total_lessons_completed INTEGER DEFAULT 0,
  total_checkins INTEGER DEFAULT 0,
  
  -- Engagement
  current_daily_streak INTEGER DEFAULT 0,
  longest_daily_streak INTEGER DEFAULT 0,
  days_active_last_30 INTEGER DEFAULT 0,
  
  -- Top performing activities
  top_activity VARCHAR(255),
  top_program VARCHAR(255),
  
  -- Calculated insights
  best_mood_days TEXT[],
  correlation_insights JSONB,
  
  last_calculated TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE public.user_metrics IS 'Aggregated user wellness metrics calculated from check-ins and activities';

-- Table: achievements
-- Purpose: Achievement definitions for gamification
CREATE TABLE IF NOT EXISTS public.achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  icon VARCHAR(50),
  category VARCHAR(50) CHECK (category IN ('programs', 'experiments', 'streaks', 'checkins', 'growth', 'milestones')),
  criteria_type VARCHAR(50) CHECK (criteria_type IN ('program_complete', 'experiment_complete', 'streak_days', 'total_checkins', 'total_lessons', 'score_threshold')),
  criteria_value INTEGER NOT NULL,
  reward_points INTEGER DEFAULT 0,
  badge_color VARCHAR(20),
  rarity VARCHAR(20) CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')) DEFAULT 'common',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE public.achievements IS 'Achievement definitions for gamification system';

-- Table: user_achievements
-- Purpose: User unlocked achievements
CREATE TABLE IF NOT EXISTS public.user_achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  achievement_id UUID REFERENCES public.achievements(id) ON DELETE CASCADE NOT NULL,
  unlocked_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  progress INTEGER DEFAULT 0,
  viewed BOOLEAN DEFAULT false,
  UNIQUE(user_id, achievement_id)
);

COMMENT ON TABLE public.user_achievements IS 'User unlocked achievements with unlock timestamp';

-- =====================================================
-- SECTION 10: NOTIFICATIONS & REMINDERS
-- =====================================================

-- Table: notification_preferences
-- Purpose: User-level notification preferences by type
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT CHECK (type IN ('daily_reminder', 'streak_alert', 'experiment_reminder', 'activity_insight', 'sleep_tip', 'habit_suggestion', 'missed_log')) NOT NULL,
  channels JSONB DEFAULT '["in_app"]'::jsonb NOT NULL,
  frequency TEXT CHECK (frequency IN ('immediate', 'daily_digest', 'weekly_digest')) DEFAULT 'immediate' NOT NULL,
  priority TEXT CHECK (priority IN ('normal', 'high')) DEFAULT 'normal' NOT NULL,
  time_of_day TIME,
  quiet_hours_start TIME,
  quiet_hours_end TIME,
  enabled BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, type)
);

COMMENT ON TABLE public.notification_preferences IS 'User-level notification preferences by type with channel, frequency, and timing controls';
COMMENT ON COLUMN public.notification_preferences.channels IS 'Array of enabled channels: push, email, in_app';

-- Table: item_notification_overrides
-- Purpose: Per-habit or per-experiment notification overrides
CREATE TABLE IF NOT EXISTS public.item_notification_overrides (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  item_id UUID NOT NULL,
  item_type TEXT CHECK (item_type IN ('habit', 'experiment')) NOT NULL,
  channels JSONB DEFAULT '["push"]'::jsonb,
  frequency TEXT CHECK (frequency IN ('immediate', 'daily_digest', 'weekly_digest', 'on_milestone', 'when_missed')) DEFAULT 'immediate',
  time_of_day TIME,
  weekdays JSONB DEFAULT '[0,1,2,3,4,5,6]'::jsonb,
  enabled BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, item_id, item_type)
);

COMMENT ON TABLE public.item_notification_overrides IS 'Per-habit or per-experiment notification overrides with weekday filters';
COMMENT ON COLUMN public.item_notification_overrides.weekdays IS 'Array of weekday numbers (0=Sunday, 6=Saturday) when notifications allowed';

-- Table: notifications
-- Purpose: Notification outbox and delivery history
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL,
  channel TEXT CHECK (channel IN ('push', 'email', 'in_app')) NOT NULL,
  status TEXT CHECK (status IN ('queued', 'sent', 'failed', 'delivered', 'read')) DEFAULT 'queued' NOT NULL,
  payload JSONB DEFAULT '{}'::jsonb NOT NULL,
  send_after TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE public.notifications IS 'Notification outbox and delivery history with status tracking';
COMMENT ON COLUMN public.notifications.payload IS 'Notification content as JSON: { title, body, data }';
COMMENT ON COLUMN public.notifications.status IS 'Lifecycle: queued → sent → delivered → read';

-- Table: user_devices
-- Purpose: Track user devices for push notifications
CREATE TABLE IF NOT EXISTS public.user_devices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  device_token TEXT NOT NULL,
  platform TEXT CHECK (platform IN ('ios', 'android', 'web')) NOT NULL,
  push_enabled BOOLEAN DEFAULT true NOT NULL,
  last_seen TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, device_token)
);

COMMENT ON TABLE public.user_devices IS 'User device registry for push notification token management';

-- =====================================================
-- INDEXES FOR PERFORMANCE OPTIMIZATION
-- =====================================================

-- User Management
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_pin_enabled ON public.profiles(pin_enabled) WHERE pin_enabled = true;

-- Mood & Activities
CREATE INDEX IF NOT EXISTS idx_mood_logs_user_date ON public.mood_logs(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_activities_user_date ON public.activities(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_activities_category ON public.activities(user_id, category);

-- Correlations
CREATE INDEX IF NOT EXISTS idx_activity_correlations_user ON public.activity_outcome_correlations(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_correlations_activity ON public.activity_outcome_correlations(user_id, activity_name);
CREATE INDEX IF NOT EXISTS idx_activity_correlations_outcome ON public.activity_outcome_correlations(outcome_type);
CREATE INDEX IF NOT EXISTS idx_activity_correlations_strength ON public.activity_outcome_correlations(impact_strength, statistical_significance);
CREATE INDEX IF NOT EXISTS idx_activity_correlations_valid ON public.activity_outcome_correlations(user_id, is_valid) WHERE is_valid = true;

CREATE INDEX IF NOT EXISTS idx_impact_records_user_date ON public.activity_impact_records(user_id, activity_date DESC);
CREATE INDEX IF NOT EXISTS idx_impact_records_activity ON public.activity_impact_records(user_id, activity_name);
CREATE INDEX IF NOT EXISTS idx_impact_records_date_range ON public.activity_impact_records(user_id, activity_date) WHERE activity_date >= CURRENT_DATE - INTERVAL '90 days';

-- Sleep & Wellness
CREATE INDEX IF NOT EXISTS idx_sleep_logs_user_date ON public.sleep_logs(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_mental_clarity_tests_user_date ON public.mental_clarity_tests(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_productivity_logs_user_date ON public.productivity_logs(user_id, date DESC);

-- Habits & Experiments
CREATE INDEX IF NOT EXISTS idx_habits_user_id ON public.habits(user_id);
CREATE INDEX IF NOT EXISTS idx_habit_logs_habit_date ON public.habit_logs(habit_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_experiments_user_id ON public.experiments(user_id);
CREATE INDEX IF NOT EXISTS idx_experiments_status ON public.experiments(user_id, status);
CREATE INDEX IF NOT EXISTS idx_experiment_logs_experiment_date ON public.experiment_logs(experiment_id, date DESC);

-- Intimacy
CREATE INDEX IF NOT EXISTS idx_intimacy_logs_user_date ON public.intimacy_logs(user_id, date DESC);

-- Intimacy Hub
CREATE INDEX IF NOT EXISTS idx_lessons_program ON public.lessons(program_id, order_index);
CREATE INDEX IF NOT EXISTS idx_user_lessons_user ON public.user_lessons(user_id, status);
CREATE INDEX IF NOT EXISTS idx_user_programs_user ON public.user_programs(user_id, status);
CREATE INDEX IF NOT EXISTS idx_intimacy_experiments_user_status ON public.intimacy_experiments(user_id, status);
CREATE INDEX IF NOT EXISTS idx_intimacy_experiment_logs_user_date ON public.intimacy_experiment_logs(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_daily_checkins_user_date ON public.daily_checkins(user_id, checkin_date DESC);
CREATE INDEX IF NOT EXISTS idx_daily_checkins_date_range ON public.daily_checkins(user_id, checkin_date) WHERE checkin_date >= CURRENT_DATE - INTERVAL '90 days';
CREATE INDEX IF NOT EXISTS idx_user_assessments_user ON public.user_assessments(user_id, taken_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user ON public.user_achievements(user_id, unlocked_at DESC);

-- Notifications
CREATE INDEX IF NOT EXISTS idx_notification_preferences_user ON public.notification_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_preferences_type ON public.notification_preferences(type);
CREATE INDEX IF NOT EXISTS idx_item_overrides_user ON public.item_notification_overrides(user_id);
CREATE INDEX IF NOT EXISTS idx_item_overrides_item ON public.item_notification_overrides(item_id, item_type);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON public.notifications(status);
CREATE INDEX IF NOT EXISTS idx_notifications_send_after ON public.notifications(send_after);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON public.notifications(type);
CREATE INDEX IF NOT EXISTS idx_user_devices_user ON public.user_devices(user_id);
CREATE INDEX IF NOT EXISTS idx_user_devices_token ON public.user_devices(device_token);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mood_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_outcome_correlations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_impact_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activity_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sleep_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mental_clarity_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.productivity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experiments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experiment_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.intimacy_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.intimacy_experiments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.intimacy_experiment_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.item_notification_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_devices ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own data
CREATE POLICY "Users access own data" ON public.users FOR ALL USING (auth.uid() = id);
CREATE POLICY "Users access own profile" ON public.profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "Users access own preferences" ON public.user_preferences FOR ALL USING (auth.uid() = id);
CREATE POLICY "Users access own mood logs" ON public.mood_logs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users access own activities" ON public.activities FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users access own correlations" ON public.activity_outcome_correlations FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users access own impact records" ON public.activity_impact_records FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users access own insights" ON public.user_activity_insights FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users access own sleep logs" ON public.sleep_logs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users access own clarity tests" ON public.mental_clarity_tests FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users access own productivity logs" ON public.productivity_logs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users access own habits" ON public.habits FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users access own habit logs" ON public.habit_logs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users access own experiments" ON public.experiments FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users access own experiment logs" ON public.experiment_logs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users access own intimacy logs" ON public.intimacy_logs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users access own program progress" ON public.user_programs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users access own lessons" ON public.user_lessons FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users access own intimacy experiments" ON public.intimacy_experiments FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users access own intimacy experiment logs" ON public.intimacy_experiment_logs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users access own check-ins" ON public.daily_checkins FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users access own streaks" ON public.user_streaks FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users access own assessments" ON public.user_assessments FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users access own metrics" ON public.user_metrics FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users access own achievements" ON public.user_achievements FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users access own notification preferences" ON public.notification_preferences FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users access own item overrides" ON public.item_notification_overrides FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users access own notifications" ON public.notifications FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users access own devices" ON public.user_devices FOR ALL USING (auth.uid() = user_id);

-- Public read access for templates and definitions
CREATE POLICY "Anyone can read programs" ON public.programs FOR SELECT USING (true);
CREATE POLICY "Anyone can read lessons" ON public.lessons FOR SELECT USING (true);
CREATE POLICY "Anyone can read assessments" ON public.assessments FOR SELECT USING (is_active = true);
CREATE POLICY "Anyone can read achievements" ON public.achievements FOR SELECT USING (true);

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Function: Update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at columns
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON public.user_preferences FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_programs_updated_at BEFORE UPDATE ON public.programs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_user_programs_updated_at BEFORE UPDATE ON public.user_programs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_user_lessons_updated_at BEFORE UPDATE ON public.user_lessons FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_user_metrics_updated_at BEFORE UPDATE ON public.user_metrics FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_notification_preferences_updated_at BEFORE UPDATE ON public.notification_preferences FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_item_overrides_updated_at BEFORE UPDATE ON public.item_notification_overrides FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function: Auto-create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email) VALUES (NEW.id, NEW.email);
  INSERT INTO public.profiles (id, email, full_name) VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', NULL));
  INSERT INTO public.user_preferences (id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function: Initialize default notification preferences
CREATE OR REPLACE FUNCTION public.initialize_notification_preferences()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.notification_preferences (user_id, type, channels, frequency, priority, time_of_day, enabled) VALUES
    (NEW.id, 'daily_reminder', '["push", "in_app"]'::jsonb, 'immediate', 'normal', '20:00:00', true),
    (NEW.id, 'streak_alert', '["push", "in_app"]'::jsonb, 'immediate', 'high', true),
    (NEW.id, 'experiment_reminder', '["push", "in_app"]'::jsonb, 'immediate', 'normal', '19:00:00', true),
    (NEW.id, 'activity_insight', '["in_app"]'::jsonb, 'daily_digest', 'normal', false),
    (NEW.id, 'sleep_tip', '["in_app"]'::jsonb, 'weekly_digest', 'normal', false),
    (NEW.id, 'habit_suggestion', '["in_app"]'::jsonb, 'weekly_digest', 'normal', false),
    (NEW.id, 'missed_log', '["push", "in_app"]'::jsonb, 'immediate', 'normal', '21:00:00', true);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_user_created_initialize_notifications AFTER INSERT ON public.users FOR EACH ROW EXECUTE FUNCTION public.initialize_notification_preferences();

-- Function: Update program progress when lesson completed
CREATE OR REPLACE FUNCTION public.update_program_progress()
RETURNS TRIGGER AS $$
DECLARE
  total_lessons INTEGER;
  completed_lessons INTEGER;
  progress INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_lessons FROM public.lessons WHERE program_id = NEW.program_id;
  SELECT COUNT(*) INTO completed_lessons FROM public.user_lessons WHERE user_id = NEW.user_id AND program_id = NEW.program_id AND status = 'completed';
  
  progress := ROUND((completed_lessons::DECIMAL / total_lessons) * 100);
  
  UPDATE public.user_programs
  SET progress_percentage = progress,
      status = CASE WHEN progress = 100 THEN 'completed' WHEN progress > 0 THEN 'active' ELSE status END,
      completed_at = CASE WHEN progress = 100 THEN NOW() ELSE completed_at END
  WHERE user_id = NEW.user_id AND program_id = NEW.program_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_program_progress AFTER UPDATE OF status ON public.user_lessons FOR EACH ROW WHEN (NEW.status = 'completed') EXECUTE FUNCTION public.update_program_progress();

-- Function: Update experiment progress
CREATE OR REPLACE FUNCTION public.update_experiment_progress()
RETURNS TRIGGER AS $$
DECLARE
  total_days INTEGER;
  completed_days INTEGER;
  progress INTEGER;
BEGIN
  SELECT duration_days INTO total_days FROM public.intimacy_experiments WHERE id = NEW.experiment_id;
  SELECT COUNT(*) INTO completed_days FROM public.intimacy_experiment_logs WHERE experiment_id = NEW.experiment_id AND completed = true;
  
  progress := ROUND((completed_days::DECIMAL / total_days) * 100);
  
  UPDATE public.intimacy_experiments
  SET completion_rate = progress,
      status = CASE WHEN progress = 100 THEN 'completed' ELSE 'active' END
  WHERE id = NEW.experiment_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_intimacy_experiment_progress AFTER INSERT OR UPDATE ON public.intimacy_experiment_logs FOR EACH ROW EXECUTE FUNCTION public.update_experiment_progress();

-- Function: Update correlation timestamp
CREATE OR REPLACE FUNCTION public.update_correlation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_updated = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_correlation_timestamp BEFORE UPDATE ON public.activity_outcome_correlations FOR EACH ROW EXECUTE FUNCTION public.update_correlation_timestamp();

-- =====================================================
-- SEED DATA: Default Programs & Achievements
-- =====================================================

-- Seed intimacy programs
INSERT INTO public.programs (title, description, duration_days, total_lessons, category, difficulty, tags) VALUES
('Rebuilding Intimacy', 'A gentle journey to reconnect with yourself and your partner through communication, vulnerability, and shared experiences.', 21, 7, 'connection', 'beginner', ARRAY['couples', 'communication', 'emotional']),
('Desire Discovery', 'Explore what ignites your desire and learn to communicate your needs authentically.', 14, 5, 'desire', 'intermediate', ARRAY['solo', 'self-awareness', 'communication']),
('Conflict to Connection', 'Transform disagreements into opportunities for deeper understanding and intimacy.', 14, 6, 'conflict', 'intermediate', ARRAY['couples', 'communication']),
('Self-Love Foundation', 'Build a loving relationship with yourself as the cornerstone of healthy intimacy.', 21, 8, 'self-love', 'beginner', ARRAY['solo', 'self-care', 'emotional']);

-- Seed achievements
INSERT INTO public.achievements (title, description, icon, category, criteria_type, criteria_value, badge_color, rarity) VALUES
('First Step', 'Completed your first lesson', '🌱', 'programs', 'total_lessons', 1, 'bronze', 'common'),
('Committed Learner', 'Completed 3 programs', '📚', 'programs', 'program_complete', 3, 'silver', 'rare'),
('Week Warrior', 'Logged check-ins for 7 days straight', '🔥', 'streaks', 'streak_days', 7, 'bronze', 'common'),
('Consistency Champion', 'Logged check-ins for 30 days straight', '💎', 'streaks', 'streak_days', 30, 'gold', 'epic'),
('Experiment Explorer', 'Completed your first experiment', '🔬', 'experiments', 'experiment_complete', 1, 'bronze', 'common'),
('Growth Mindset', 'Completed 5 experiments', '🌟', 'experiments', 'experiment_complete', 5, 'gold', 'rare'),
('Self-Aware', 'Taken your first assessment', '🧭', 'growth', 'total_checkins', 1, 'bronze', 'common'),
('Century Club', 'Logged 100 total check-ins', '💯', 'checkins', 'total_checkins', 100, 'gold', 'epic');

-- =====================================================
-- END OF SCHEMA
-- =====================================================
