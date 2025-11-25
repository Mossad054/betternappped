-- Activity Correlation Engine Tables
-- Creates tables for storing activity feedback and computed correlations

-- Activity Feedback Log
-- Stores user feedback scores for each activity
CREATE TABLE IF NOT EXISTS activity_feedback_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_id UUID REFERENCES activities(id) ON DELETE SET NULL,
  activity_type TEXT NOT NULL, -- 'exercise', 'meditation', 'journaling', etc.
  activity_name TEXT,
  date DATE NOT NULL,
  emoji_id TEXT NOT NULL,
  mood_score INTEGER CHECK (mood_score >= 1 AND mood_score <= 5),
  sleep_score INTEGER CHECK (sleep_score >= 1 AND sleep_score <= 5),
  clarity_score INTEGER CHECK (clarity_score >= 1 AND clarity_score <= 5),
  energy_score INTEGER CHECK (energy_score >= 1 AND energy_score <= 5),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure one feedback per activity per date per user
  UNIQUE(user_id, activity_id, date)
);

-- Daily Wellness Summary
-- Aggregated daily scores for correlation analysis
CREATE TABLE IF NOT EXISTS daily_wellness_summary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,

  -- Mood metrics
  mood_score DECIMAL(3,2), -- Average mood 1-5
  mood_variance DECIMAL(3,2),
  mood_count INTEGER DEFAULT 0,

  -- Sleep metrics
  sleep_quality_score DECIMAL(3,2),
  sleep_duration_hours DECIMAL(4,2),
  bedtime TIME,
  wake_time TIME,

  -- Mental clarity
  clarity_score DECIMAL(3,2),

  -- Energy
  energy_score DECIMAL(3,2),

  -- Activity summary
  total_activities INTEGER DEFAULT 0,
  activities_completed TEXT[], -- Array of activity types
  avg_activity_mood_score DECIMAL(3,2),
  avg_activity_energy_score DECIMAL(3,2),

  -- Computed flags
  had_exercise BOOLEAN DEFAULT FALSE,
  had_meditation BOOLEAN DEFAULT FALSE,
  had_journaling BOOLEAN DEFAULT FALSE,
  had_social BOOLEAN DEFAULT FALSE,
  had_outdoor BOOLEAN DEFAULT FALSE,
  had_creative BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, date)
);

-- Activity Correlation Summary
-- Stores computed correlations for each activity type per user
CREATE TABLE IF NOT EXISTS activity_correlation_summary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,

  -- Correlations (-1 to 1)
  correlation_with_mood DECIMAL(4,3),
  correlation_with_clarity DECIMAL(4,3),
  correlation_with_sleep_quality DECIMAL(4,3),
  correlation_with_sleep_duration DECIMAL(4,3),
  correlation_with_energy DECIMAL(4,3),
  correlation_with_next_day_mood DECIMAL(4,3),

  -- Statistical confidence
  sample_size INTEGER DEFAULT 0,
  p_value_mood DECIMAL(5,4),
  p_value_clarity DECIMAL(5,4),
  p_value_sleep DECIMAL(5,4),

  -- Averages when activity is done
  avg_mood_with_activity DECIMAL(3,2),
  avg_mood_without_activity DECIMAL(3,2),
  avg_clarity_with_activity DECIMAL(3,2),
  avg_clarity_without_activity DECIMAL(3,2),
  avg_sleep_with_activity DECIMAL(3,2),
  avg_sleep_without_activity DECIMAL(3,2),

  -- Insights
  is_beneficial BOOLEAN,
  recommendation TEXT,

  last_calculated TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, activity_type)
);

-- Cross-Activity Correlations
-- Stores correlations between different activities
CREATE TABLE IF NOT EXISTS cross_activity_correlations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type_a TEXT NOT NULL,
  activity_type_b TEXT NOT NULL,
  correlation DECIMAL(4,3),
  sample_size INTEGER DEFAULT 0,
  last_calculated TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, activity_type_a, activity_type_b)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_activity_feedback_user_date ON activity_feedback_log(user_id, date);
CREATE INDEX IF NOT EXISTS idx_activity_feedback_type ON activity_feedback_log(activity_type);
CREATE INDEX IF NOT EXISTS idx_daily_wellness_user_date ON daily_wellness_summary(user_id, date);
CREATE INDEX IF NOT EXISTS idx_correlation_summary_user ON activity_correlation_summary(user_id);
CREATE INDEX IF NOT EXISTS idx_correlation_summary_type ON activity_correlation_summary(activity_type);

-- Enable RLS
ALTER TABLE activity_feedback_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_wellness_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_correlation_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE cross_activity_correlations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage own feedback"
  ON activity_feedback_log FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own wellness summary"
  ON daily_wellness_summary FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own correlations"
  ON activity_correlation_summary FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own cross correlations"
  ON cross_activity_correlations FOR ALL
  USING (auth.uid() = user_id);

-- Function to update daily wellness summary
CREATE OR REPLACE FUNCTION update_daily_wellness_summary(
  p_user_id UUID,
  p_date DATE
)
RETURNS VOID AS $$
DECLARE
  v_mood_data RECORD;
  v_sleep_data RECORD;
  v_activity_data RECORD;
BEGIN
  -- Get mood data for the day
  SELECT
    AVG(score) as avg_score,
    VARIANCE(score) as variance,
    COUNT(*) as count
  INTO v_mood_data
  FROM moods
  WHERE user_id = p_user_id
    AND DATE(created_at) = p_date;

  -- Get sleep data for the night before
  SELECT
    quality_score,
    duration_hours,
    bedtime,
    wake_time
  INTO v_sleep_data
  FROM sleep_logs
  WHERE user_id = p_user_id
    AND DATE(created_at) = p_date
  LIMIT 1;

  -- Get activity feedback data
  SELECT
    COUNT(*) as total,
    AVG(mood_score) as avg_mood,
    AVG(energy_score) as avg_energy,
    ARRAY_AGG(DISTINCT activity_type) as types,
    BOOL_OR(activity_type = 'exercise') as had_exercise,
    BOOL_OR(activity_type = 'meditation') as had_meditation,
    BOOL_OR(activity_type = 'journaling') as had_journaling,
    BOOL_OR(activity_type = 'social') as had_social,
    BOOL_OR(activity_type = 'outdoor') as had_outdoor,
    BOOL_OR(activity_type = 'creative') as had_creative
  INTO v_activity_data
  FROM activity_feedback_log
  WHERE user_id = p_user_id
    AND date = p_date;

  -- Upsert daily summary
  INSERT INTO daily_wellness_summary (
    user_id, date,
    mood_score, mood_variance, mood_count,
    sleep_quality_score, sleep_duration_hours, bedtime, wake_time,
    total_activities, activities_completed, avg_activity_mood_score, avg_activity_energy_score,
    had_exercise, had_meditation, had_journaling, had_social, had_outdoor, had_creative,
    updated_at
  ) VALUES (
    p_user_id, p_date,
    v_mood_data.avg_score, v_mood_data.variance, v_mood_data.count,
    v_sleep_data.quality_score, v_sleep_data.duration_hours, v_sleep_data.bedtime, v_sleep_data.wake_time,
    v_activity_data.total, v_activity_data.types, v_activity_data.avg_mood, v_activity_data.avg_energy,
    COALESCE(v_activity_data.had_exercise, false),
    COALESCE(v_activity_data.had_meditation, false),
    COALESCE(v_activity_data.had_journaling, false),
    COALESCE(v_activity_data.had_social, false),
    COALESCE(v_activity_data.had_outdoor, false),
    COALESCE(v_activity_data.had_creative, false),
    NOW()
  )
  ON CONFLICT (user_id, date) DO UPDATE SET
    mood_score = EXCLUDED.mood_score,
    mood_variance = EXCLUDED.mood_variance,
    mood_count = EXCLUDED.mood_count,
    sleep_quality_score = EXCLUDED.sleep_quality_score,
    sleep_duration_hours = EXCLUDED.sleep_duration_hours,
    bedtime = EXCLUDED.bedtime,
    wake_time = EXCLUDED.wake_time,
    total_activities = EXCLUDED.total_activities,
    activities_completed = EXCLUDED.activities_completed,
    avg_activity_mood_score = EXCLUDED.avg_activity_mood_score,
    avg_activity_energy_score = EXCLUDED.avg_activity_energy_score,
    had_exercise = EXCLUDED.had_exercise,
    had_meditation = EXCLUDED.had_meditation,
    had_journaling = EXCLUDED.had_journaling,
    had_social = EXCLUDED.had_social,
    had_outdoor = EXCLUDED.had_outdoor,
    had_creative = EXCLUDED.had_creative,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Trigger to update summary when feedback is logged
CREATE OR REPLACE FUNCTION trigger_update_wellness_summary()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM update_daily_wellness_summary(NEW.user_id, NEW.date);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_feedback_insert
  AFTER INSERT OR UPDATE ON activity_feedback_log
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_wellness_summary();
