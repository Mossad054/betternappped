-- =====================================================
-- INTIMACY GROWTH HUB DATABASE SCHEMA
-- Purpose: Support structured intimacy coaching, experiments, check-ins, and insights
-- Date: November 10, 2025
-- =====================================================

-- =====================================================
-- 1. COACHING PROGRAMS TABLES
-- =====================================================

-- Programs: Pre-developed coaching journeys
CREATE TABLE IF NOT EXISTS programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  duration_days INT NOT NULL, -- Expected completion time
  total_lessons INT NOT NULL,
  category VARCHAR(50) CHECK (category IN ('communication', 'connection', 'desire', 'conflict', 'self-love', 'exploration')),
  difficulty VARCHAR(20) CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  cover_image_url TEXT,
  tags TEXT[], -- e.g., ['couples', 'solo', 'emotional']
  prerequisites TEXT[], -- Other program IDs required first
  is_premium BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Lessons: Individual teaching modules within programs
CREATE TABLE IF NOT EXISTS lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  order_index INT NOT NULL, -- Sequence in program (1, 2, 3...)
  title VARCHAR(255) NOT NULL,
  subtitle TEXT,
  duration_minutes INT NOT NULL, -- Estimated reading/watching time
  content_type VARCHAR(20) CHECK (content_type IN ('text', 'video', 'audio', 'interactive')),
  content_text TEXT, -- Main lesson content
  content_media_url TEXT, -- Video/audio URL if applicable
  objectives TEXT[], -- Learning goals
  action_task TEXT NOT NULL, -- What user should practice
  reflection_prompts TEXT[], -- Questions for post-lesson reflection
  unlock_criteria JSONB, -- e.g., {"requires_previous": true, "wait_days": 1}
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(program_id, order_index)
);

-- User Progress in Programs & Lessons
CREATE TABLE IF NOT EXISTS user_lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  
  -- Progress tracking
  status VARCHAR(20) CHECK (status IN ('locked', 'available', 'in_progress', 'completed')) DEFAULT 'locked',
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  
  -- Task execution
  task_timeline VARCHAR(20) CHECK (task_timeline IN ('tonight', '3_days', '7_days', '14_days', '21_days')),
  task_scheduled_for DATE,
  task_completed BOOLEAN DEFAULT false,
  task_completed_at TIMESTAMP,
  
  -- Feedback
  effectiveness_rating INT CHECK (effectiveness_rating BETWEEN 1 AND 5),
  feeling_after TEXT, -- How they felt after lesson/task
  reflection_text TEXT, -- User's written reflection
  notes TEXT,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(user_id, lesson_id)
);

-- User Program Enrollment
CREATE TABLE IF NOT EXISTS user_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  
  status VARCHAR(20) CHECK (status IN ('enrolled', 'active', 'paused', 'completed', 'abandoned')) DEFAULT 'enrolled',
  progress_percentage INT DEFAULT 0 CHECK (progress_percentage BETWEEN 0 AND 100),
  
  enrolled_at TIMESTAMP DEFAULT NOW(),
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  last_accessed_at TIMESTAMP,
  
  -- Preferences
  reminder_enabled BOOLEAN DEFAULT true,
  reminder_time TIME DEFAULT '20:00:00', -- 8 PM default
  
  UNIQUE(user_id, program_id)
);

-- =====================================================
-- 2. EXPERIMENTS HUB TABLES
-- =====================================================

-- Experiment Templates: Pre-defined or user-created experiments
CREATE TABLE IF NOT EXISTS experiments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  type VARCHAR(50) CHECK (type IN ('habit', 'behavioral', 'communication', 'physical', 'emotional', 'environmental')),
  recommended_duration INT DEFAULT 14, -- Days
  difficulty VARCHAR(20) CHECK (difficulty IN ('easy', 'moderate', 'challenging')),
  
  -- What to track
  default_metrics TEXT[], -- e.g., ['mood', 'intimacy', 'energy', 'anxiety']
  success_criteria TEXT, -- What defines success
  
  -- Content
  instructions TEXT NOT NULL,
  tips TEXT[],
  example_schedule TEXT,
  
  -- Metadata
  is_template BOOLEAN DEFAULT true, -- false for user-created custom
  created_by UUID REFERENCES auth.users(id), -- NULL for system templates
  is_public BOOLEAN DEFAULT false, -- Can other users see it?
  usage_count INT DEFAULT 0, -- How many times started
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- User Active/Completed Experiments
CREATE TABLE IF NOT EXISTS user_experiments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  experiment_id UUID NOT NULL REFERENCES experiments(id) ON DELETE CASCADE,
  
  -- Configuration
  custom_title VARCHAR(255), -- User can rename
  duration_days INT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  
  -- Tracking metrics
  metrics_to_track TEXT[] NOT NULL, -- What user chose to measure
  baseline_metrics JSONB, -- Starting values
  expected_outcomes TEXT,
  
  -- Status
  status VARCHAR(20) CHECK (status IN ('planned', 'active', 'completed', 'converted_to_habit', 'abandoned')) DEFAULT 'active',
  completion_percentage INT DEFAULT 0 CHECK (completion_percentage BETWEEN 0 AND 100),
  
  -- Results
  success_rating INT CHECK (success_rating BETWEEN 1 AND 5),
  result_summary TEXT, -- User's final thoughts
  data_insights JSONB, -- Calculated patterns
  
  -- Reminders
  reminder_times TIME[],
  reminder_enabled BOOLEAN DEFAULT true,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Daily Experiment Check-ins
CREATE TABLE IF NOT EXISTS experiment_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_experiment_id UUID NOT NULL REFERENCES user_experiments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  log_date DATE NOT NULL,
  day_number INT NOT NULL, -- Which day of experiment (1, 2, 3...)
  
  -- Completion
  completed BOOLEAN NOT NULL,
  completion_time TIMESTAMP,
  
  -- Feelings & metrics
  mood_score INT CHECK (mood_score BETWEEN 1 AND 10),
  energy_score INT CHECK (energy_score BETWEEN 1 AND 10),
  intimacy_score INT CHECK (intimacy_score BETWEEN 1 AND 10),
  anxiety_score INT CHECK (anxiety_score BETWEEN 1 AND 10),
  custom_metrics JSONB, -- Other tracked values
  
  -- Reflection
  reflection_text TEXT,
  challenges TEXT, -- What was hard
  wins TEXT, -- What went well
  notes TEXT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(user_experiment_id, log_date)
);

-- =====================================================
-- 3. DAILY CHECK-INS
-- =====================================================

CREATE TABLE IF NOT EXISTS daily_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  checkin_date DATE NOT NULL,
  checkin_type VARCHAR(30) CHECK (checkin_type IN ('morning', 'evening', 'general', 'pre_intimacy', 'post_intimacy')) DEFAULT 'general',
  
  -- Emotional state
  mood INT CHECK (mood BETWEEN 1 AND 10),
  stress INT CHECK (stress BETWEEN 1 AND 10),
  energy INT CHECK (energy BETWEEN 1 AND 10),
  
  -- Intimacy-specific
  intimacy_level INT CHECK (intimacy_level BETWEEN 1 AND 10), -- How connected you felt
  desire_level INT CHECK (desire_level BETWEEN 1 AND 10),
  comfort_level INT CHECK (comfort_level BETWEEN 1 AND 10),
  communication_quality INT CHECK (communication_quality BETWEEN 1 AND 10),
  
  -- Physical
  sleep_quality INT CHECK (sleep_quality BETWEEN 1 AND 10),
  physical_wellbeing INT CHECK (physical_wellbeing BETWEEN 1 AND 10),
  
  -- Reflection
  gratitude_note TEXT,
  challenge_note TEXT,
  win_note TEXT,
  general_notes TEXT,
  
  -- Intimacy event tracking (optional)
  had_intimacy BOOLEAN DEFAULT false,
  intimacy_type VARCHAR(50), -- e.g., 'physical', 'emotional', 'both'
  intimacy_satisfaction INT CHECK (intimacy_satisfaction BETWEEN 1 AND 10),
  
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(user_id, checkin_date, checkin_type)
);

-- Check-in Streaks (calculated and cached)
CREATE TABLE IF NOT EXISTS user_streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  streak_type VARCHAR(30) CHECK (streak_type IN ('daily_checkin', 'experiment', 'program', 'overall')) NOT NULL,
  
  current_streak INT DEFAULT 0,
  longest_streak INT DEFAULT 0,
  last_checkin_date DATE,
  
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(user_id, streak_type)
);

-- =====================================================
-- 4. ASSESSMENTS
-- =====================================================

-- Assessment Templates
CREATE TABLE IF NOT EXISTS assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(50) CHECK (category IN ('connection', 'communication', 'desire', 'satisfaction', 'compatibility')),
  duration_minutes INT,
  
  -- Questions stored as JSONB for flexibility
  questions JSONB NOT NULL, 
  -- Format: [{"id": 1, "text": "...", "type": "scale|choice|text", "options": [...]}]
  
  -- Scoring logic
  scoring_rules JSONB NOT NULL,
  -- Format: {"max_score": 100, "ranges": [{"min": 0, "max": 40, "label": "Needs attention"}]}
  
  -- Recommendations based on score
  recommendation_rules JSONB,
  -- Format: [{"score_range": [0, 40], "programs": [...], "experiments": [...]}]
  
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- User Assessment Results
CREATE TABLE IF NOT EXISTS user_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  
  taken_at TIMESTAMP DEFAULT NOW(),
  
  -- Results
  answers JSONB NOT NULL, -- User's responses
  score INT NOT NULL,
  max_score INT NOT NULL,
  percentage INT NOT NULL CHECK (percentage BETWEEN 0 AND 100),
  result_category VARCHAR(50), -- e.g., 'thriving', 'growing', 'struggling'
  result_summary TEXT,
  
  -- Recommendations generated
  recommended_programs UUID[],
  recommended_experiments UUID[],
  recommended_practices TEXT[],
  
  -- Follow-up
  action_taken BOOLEAN DEFAULT false,
  follow_up_notes TEXT,
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 5. USER METRICS & INSIGHTS (Aggregated)
-- =====================================================

CREATE TABLE IF NOT EXISTS user_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Connection Score (0-100, aggregate of multiple factors)
  connection_score INT CHECK (connection_score BETWEEN 0 AND 100),
  connection_trend VARCHAR(20) CHECK (connection_trend IN ('improving', 'stable', 'declining')),
  
  -- Averages (last 30 days)
  avg_mood DECIMAL(3,1),
  avg_intimacy DECIMAL(3,1),
  avg_stress DECIMAL(3,1),
  avg_energy DECIMAL(3,1),
  avg_communication DECIMAL(3,1),
  
  -- Activity counts
  total_programs_completed INT DEFAULT 0,
  total_experiments_completed INT DEFAULT 0,
  total_lessons_completed INT DEFAULT 0,
  total_checkins INT DEFAULT 0,
  
  -- Engagement
  current_daily_streak INT DEFAULT 0,
  longest_daily_streak INT DEFAULT 0,
  days_active_last_30 INT DEFAULT 0,
  
  -- Top performing activities
  top_activity VARCHAR(255), -- Best habit/experiment
  top_program VARCHAR(255),
  
  -- Calculated insights
  best_mood_days TEXT[], -- e.g., ['Monday', 'Friday']
  correlation_insights JSONB, -- {"exercise_mood": 0.7, "sleep_intimacy": 0.6}
  
  last_calculated TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(user_id)
);

-- =====================================================
-- 6. ACHIEVEMENTS & GAMIFICATION
-- =====================================================

-- Achievement Definitions
CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  icon VARCHAR(50), -- Icon name or emoji
  category VARCHAR(50) CHECK (category IN ('programs', 'experiments', 'streaks', 'checkins', 'growth', 'milestones')),
  
  -- Unlock criteria
  criteria_type VARCHAR(50) CHECK (criteria_type IN ('program_complete', 'experiment_complete', 'streak_days', 'total_checkins', 'total_lessons', 'score_threshold')),
  criteria_value INT NOT NULL, -- e.g., 3 programs, 14 day streak
  
  -- Rewards
  reward_points INT DEFAULT 0,
  badge_color VARCHAR(20), -- 'gold', 'silver', 'bronze'
  
  -- Rarity
  rarity VARCHAR(20) CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')) DEFAULT 'common',
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- User Unlocked Achievements
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  
  unlocked_at TIMESTAMP DEFAULT NOW(),
  progress INT DEFAULT 0, -- For progressive achievements
  
  -- Celebration
  viewed BOOLEAN DEFAULT false, -- Has user seen the unlock animation?
  
  UNIQUE(user_id, achievement_id)
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Programs & Lessons
CREATE INDEX idx_lessons_program ON lessons(program_id, order_index);
CREATE INDEX idx_user_lessons_user ON user_lessons(user_id, status);
CREATE INDEX idx_user_programs_user ON user_programs(user_id, status);

-- Experiments
CREATE INDEX idx_user_experiments_user_status ON user_experiments(user_id, status);
CREATE INDEX idx_user_experiments_dates ON user_experiments(user_id, start_date, end_date);
CREATE INDEX idx_experiment_logs_user_date ON experiment_logs(user_id, log_date DESC);

-- Check-ins
CREATE INDEX idx_daily_checkins_user_date ON daily_checkins(user_id, checkin_date DESC);
CREATE INDEX idx_daily_checkins_date_range ON daily_checkins(user_id, checkin_date) 
  WHERE checkin_date >= CURRENT_DATE - INTERVAL '90 days';

-- Assessments
CREATE INDEX idx_user_assessments_user ON user_assessments(user_id, taken_at DESC);

-- Achievements
CREATE INDEX idx_user_achievements_user ON user_achievements(user_id, unlocked_at DESC);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all user-specific tables
ALTER TABLE user_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_experiments ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiment_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own data

CREATE POLICY "Users access own program progress" ON user_programs
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users access own lessons" ON user_lessons
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users access own experiments" ON user_experiments
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users access own experiment logs" ON experiment_logs
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users access own check-ins" ON daily_checkins
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users access own streaks" ON user_streaks
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users access own assessments" ON user_assessments
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users access own metrics" ON user_metrics
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users access own achievements" ON user_achievements
  FOR ALL USING (auth.uid() = user_id);

-- Public read access for templates and definitions
CREATE POLICY "Anyone can read programs" ON programs
  FOR SELECT USING (true);

CREATE POLICY "Anyone can read lessons" ON lessons
  FOR SELECT USING (true);

CREATE POLICY "Anyone can read experiments" ON experiments
  FOR SELECT USING (is_template = true OR is_public = true);

CREATE POLICY "Anyone can read assessments" ON assessments
  FOR SELECT USING (is_active = true);

CREATE POLICY "Anyone can read achievements" ON achievements
  FOR SELECT USING (true);

-- =====================================================
-- TRIGGERS & FUNCTIONS
-- =====================================================

-- Auto-update timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_user_programs_updated
  BEFORE UPDATE ON user_programs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_user_lessons_updated
  BEFORE UPDATE ON user_lessons
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_user_experiments_updated
  BEFORE UPDATE ON user_experiments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Calculate program progress when lesson completed
CREATE OR REPLACE FUNCTION update_program_progress()
RETURNS TRIGGER AS $$
DECLARE
  total_lessons INT;
  completed_lessons INT;
  progress INT;
BEGIN
  -- Get total lessons in program
  SELECT COUNT(*) INTO total_lessons
  FROM lessons WHERE program_id = NEW.program_id;
  
  -- Get completed lessons for this user
  SELECT COUNT(*) INTO completed_lessons
  FROM user_lessons
  WHERE user_id = NEW.user_id 
    AND program_id = NEW.program_id 
    AND status = 'completed';
  
  -- Calculate percentage
  progress := ROUND((completed_lessons::DECIMAL / total_lessons) * 100);
  
  -- Update user_programs
  UPDATE user_programs
  SET progress_percentage = progress,
      status = CASE 
        WHEN progress = 100 THEN 'completed'
        WHEN progress > 0 THEN 'active'
        ELSE status
      END,
      completed_at = CASE WHEN progress = 100 THEN NOW() ELSE completed_at END
  WHERE user_id = NEW.user_id AND program_id = NEW.program_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_program_progress
  AFTER UPDATE OF status ON user_lessons
  FOR EACH ROW
  WHEN (NEW.status = 'completed')
  EXECUTE FUNCTION update_program_progress();

-- Update experiment completion percentage
CREATE OR REPLACE FUNCTION update_experiment_progress()
RETURNS TRIGGER AS $$
DECLARE
  total_days INT;
  completed_days INT;
  progress INT;
BEGIN
  -- Get experiment duration
  SELECT duration_days INTO total_days
  FROM user_experiments WHERE id = NEW.user_experiment_id;
  
  -- Get completed days
  SELECT COUNT(*) INTO completed_days
  FROM experiment_logs
  WHERE user_experiment_id = NEW.user_experiment_id AND completed = true;
  
  -- Calculate percentage
  progress := ROUND((completed_days::DECIMAL / total_days) * 100);
  
  -- Update user_experiments
  UPDATE user_experiments
  SET completion_percentage = progress,
      status = CASE 
        WHEN progress = 100 THEN 'completed'
        ELSE 'active'
      END,
      completed_at = CASE WHEN progress = 100 THEN NOW() ELSE completed_at END
  WHERE id = NEW.user_experiment_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_experiment_progress
  AFTER INSERT OR UPDATE ON experiment_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_experiment_progress();

-- =====================================================
-- SEED DATA: Default Programs
-- =====================================================

INSERT INTO programs (title, description, duration_days, total_lessons, category, difficulty, tags) VALUES
('Rebuilding Intimacy', 'A gentle journey to reconnect with yourself and your partner through communication, vulnerability, and shared experiences.', 21, 7, 'connection', 'beginner', ARRAY['couples', 'communication', 'emotional']),
('Desire Discovery', 'Explore what ignites your desire and learn to communicate your needs authentically.', 14, 5, 'desire', 'intermediate', ARRAY['solo', 'self-awareness', 'communication']),
('Conflict to Connection', 'Transform disagreements into opportunities for deeper understanding and intimacy.', 14, 6, 'conflict', 'intermediate', ARRAY['couples', 'communication']),
('Self-Love Foundation', 'Build a loving relationship with yourself as the cornerstone of healthy intimacy.', 21, 8, 'self-love', 'beginner', ARRAY['solo', 'self-care', 'emotional']);

-- =====================================================
-- SEED DATA: Default Achievements
-- =====================================================

INSERT INTO achievements (title, description, icon, category, criteria_type, criteria_value, badge_color, rarity) VALUES
('First Step', 'Completed your first lesson', '🌱', 'programs', 'total_lessons', 1, 'bronze', 'common'),
('Committed Learner', 'Completed 3 programs', '📚', 'programs', 'program_complete', 3, 'silver', 'rare'),
('Week Warrior', 'Logged check-ins for 7 days straight', '🔥', 'streaks', 'streak_days', 7, 'bronze', 'common'),
('Consistency Champion', 'Logged check-ins for 30 days straight', '💎', 'streaks', 'streak_days', 30, 'gold', 'epic'),
('Experiment Explorer', 'Completed your first experiment', '🔬', 'experiments', 'experiment_complete', 1, 'bronze', 'common'),
('Growth Mindset', 'Completed 5 experiments', '🌟', 'experiments', 'experiment_complete', 5, 'gold', 'rare'),
('Self-Aware', 'Taken your first assessment', '🧭', 'growth', 'total_checkins', 1, 'bronze', 'common'),
('Century Club', 'Logged 100 total check-ins', '💯', 'checkins', 'total_checkins', 100, 'gold', 'epic');

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON TABLE programs IS 'Pre-developed coaching journeys with structured lessons';
COMMENT ON TABLE lessons IS 'Individual teaching modules within coaching programs';
COMMENT ON TABLE user_lessons IS 'User progress tracking for lessons including completion, reflection, and task scheduling';
COMMENT ON TABLE user_programs IS 'User enrollment and progress in coaching programs';
COMMENT ON TABLE experiments IS 'Experiment templates (system or user-created) for testing habits';
COMMENT ON TABLE user_experiments IS 'Active or completed user experiments with configuration and results';
COMMENT ON TABLE experiment_logs IS 'Daily check-ins for experiments tracking completion and metrics';
COMMENT ON TABLE daily_checkins IS 'Daily emotional, physical, and intimacy state tracking';
COMMENT ON TABLE user_streaks IS 'Cached streak counters for gamification';
COMMENT ON TABLE assessments IS 'Standardized tests for intimacy health evaluation';
COMMENT ON TABLE user_assessments IS 'User assessment results with scores and recommendations';
COMMENT ON TABLE user_metrics IS 'Aggregated user metrics calculated from check-ins and activities';
COMMENT ON TABLE achievements IS 'Achievement definitions with unlock criteria';
COMMENT ON TABLE user_achievements IS 'Unlocked achievements per user with celebration tracking';

