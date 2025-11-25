-- Master Migration Script for Intimacy Hub
-- Run this script to set up the complete intimacy hub database

-- Order of execution:
-- 1. Programs (base data)
-- 2. Lessons (depend on programs)
-- 3. Habits (depend on programs)
-- 4. Lesson-habits junction (depend on both)
-- 5. Recommendations table

-- ============================================
-- TABLE CREATION (if not exists)
-- ============================================

-- Programs table
CREATE TABLE IF NOT EXISTS programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  difficulty TEXT,
  duration_days INTEGER DEFAULT 7,
  tags TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Lessons table
CREATE TABLE IF NOT EXISTS lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID REFERENCES programs(id),
  title TEXT NOT NULL,
  description TEXT,
  content TEXT,
  order_index INTEGER DEFAULT 0,
  duration_minutes INTEGER DEFAULT 15,
  lesson_type TEXT DEFAULT 'reading',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Habits table (if not exists, may already exist from main app)
CREATE TABLE IF NOT EXISTS habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID REFERENCES programs(id),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'general',
  frequency TEXT DEFAULT 'daily',
  is_from_program BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Lesson-habits junction table
CREATE TABLE IF NOT EXISTS lesson_habits (
  id TEXT PRIMARY KEY,
  lesson_id UUID REFERENCES lessons(id),
  habit_id UUID REFERENCES habits(id),
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(lesson_id, habit_id)
);

-- Program recommendations table
CREATE TABLE IF NOT EXISTS program_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  program_id UUID REFERENCES programs(id),
  reason TEXT,
  pattern_detected TEXT,
  confidence_score DECIMAL(3,2) DEFAULT 0.5,
  is_dismissed BOOLEAN DEFAULT false,
  is_enrolled BOOLEAN DEFAULT false,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- User program progress table
CREATE TABLE IF NOT EXISTS user_program_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  program_id UUID REFERENCES programs(id),
  current_lesson_id UUID REFERENCES lessons(id),
  lessons_completed INTEGER DEFAULT 0,
  progress_percentage INTEGER DEFAULT 0,
  status TEXT DEFAULT 'enrolled',
  enrolled_at TIMESTAMPTZ DEFAULT now(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  last_accessed TIMESTAMPTZ,
  total_time_minutes INTEGER DEFAULT 0,
  UNIQUE(user_id, program_id)
);

-- User habits junction table
CREATE TABLE IF NOT EXISTS user_habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  habit_id UUID REFERENCES habits(id),
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, habit_id)
);

-- ============================================
-- DATA SEEDING ORDER
-- ============================================

-- Run these migration files in order:
-- 1. seed_programs_1_to_10.sql (if exists)
-- 2. seed_programs_11_to_30.sql
-- 3. seed_lessons_1_to_15.sql (if exists)
-- 4. seed_lessons_16_to_30.sql
-- 5. seed_habits_1_to_15.sql (if exists)
-- 6. seed_habits_16_to_30.sql
-- 7. seed_lesson_habits.sql

-- ============================================
-- RLS POLICIES (Row Level Security)
-- ============================================

ALTER TABLE program_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_program_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_habits ENABLE ROW LEVEL SECURITY;

-- Programs, lessons, habits are public read
CREATE POLICY IF NOT EXISTS "Programs are viewable by all" ON programs
  FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "Lessons are viewable by all" ON lessons
  FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "Habits are viewable by all" ON habits
  FOR SELECT USING (true);

-- User-specific data
CREATE POLICY IF NOT EXISTS "Users can view own recommendations" ON program_recommendations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can update own recommendations" ON program_recommendations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can insert own recommendations" ON program_recommendations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can manage own progress" ON user_program_progress
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can manage own habits" ON user_habits
  FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_lessons_program ON lessons(program_id);
CREATE INDEX IF NOT EXISTS idx_habits_program ON habits(program_id);
CREATE INDEX IF NOT EXISTS idx_lesson_habits_lesson ON lesson_habits(lesson_id);
CREATE INDEX IF NOT EXISTS idx_lesson_habits_habit ON lesson_habits(habit_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_user ON program_recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_user ON user_program_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_habits_user ON user_habits(user_id);

-- ============================================
-- SUMMARY
-- ============================================
-- Total Programs: 30
-- Total Lessons: 150 (5 per program)
-- Total Habits: 150 (5 per program)
-- Total Lesson-Habit Links: 150
