-- Habit Correlation Engine Tables
-- Extends the correlation system to include habits

-- Habit Feedback Log
-- Stores user feedback scores for each habit completion
CREATE TABLE IF NOT EXISTS habit_feedback_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  habit_id UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  habit_name TEXT NOT NULL,
  date DATE NOT NULL,
  emoji_id TEXT NOT NULL,
  score INTEGER NOT NULL CHECK (score >= 1 AND score <= 5),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure one feedback per habit per date per user (use latest)
  UNIQUE(user_id, habit_id, date)
);

-- Habit Correlation Summary
-- Stores computed correlations for each habit per user
CREATE TABLE IF NOT EXISTS habit_correlation_summary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  habit_id UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  habit_name TEXT NOT NULL,

  -- Correlations (-1 to 1)
  correlation_with_mood DECIMAL(4,3),
  correlation_with_clarity DECIMAL(4,3),
  correlation_with_sleep_quality DECIMAL(4,3),
  correlation_with_sleep_duration DECIMAL(4,3),
  correlation_with_energy DECIMAL(4,3),
  correlation_with_next_day_mood DECIMAL(4,3),

  -- Statistical data
  sample_size INTEGER DEFAULT 0,
  total_completions INTEGER DEFAULT 0,
  avg_completion_score DECIMAL(3,2),

  -- Averages when habit is done vs not done
  avg_mood_with_habit DECIMAL(3,2),
  avg_mood_without_habit DECIMAL(3,2),
  avg_clarity_with_habit DECIMAL(3,2),
  avg_clarity_without_habit DECIMAL(3,2),
  avg_sleep_with_habit DECIMAL(3,2),
  avg_sleep_without_habit DECIMAL(3,2),

  -- Insights
  is_beneficial BOOLEAN,
  impact_score DECIMAL(3,2), -- Overall impact 1-5
  recommendation TEXT,

  last_calculated TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, habit_id)
);

-- Cross-Habit Correlations
-- Stores correlations between different habits
CREATE TABLE IF NOT EXISTS cross_habit_correlations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  habit_id_a UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  habit_id_b UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  correlation DECIMAL(4,3),
  sample_size INTEGER DEFAULT 0,
  last_calculated TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, habit_id_a, habit_id_b)
);

-- Habit-Activity Correlations
-- Stores correlations between habits and activities
CREATE TABLE IF NOT EXISTS habit_activity_correlations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  habit_id UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  correlation DECIMAL(4,3),
  sample_size INTEGER DEFAULT 0,
  last_calculated TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, habit_id, activity_type)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_habit_feedback_user_date ON habit_feedback_log(user_id, date);
CREATE INDEX IF NOT EXISTS idx_habit_feedback_habit ON habit_feedback_log(habit_id);
CREATE INDEX IF NOT EXISTS idx_habit_correlation_user ON habit_correlation_summary(user_id);
CREATE INDEX IF NOT EXISTS idx_habit_correlation_habit ON habit_correlation_summary(habit_id);

-- Enable RLS
ALTER TABLE habit_feedback_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_correlation_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE cross_habit_correlations ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_activity_correlations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage own habit feedback"
  ON habit_feedback_log FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own habit correlations"
  ON habit_correlation_summary FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own cross habit correlations"
  ON cross_habit_correlations FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own habit activity correlations"
  ON habit_activity_correlations FOR ALL
  USING (auth.uid() = user_id);

-- Function to update daily wellness summary with habit data
CREATE OR REPLACE FUNCTION update_wellness_with_habit_feedback(
  p_user_id UUID,
  p_date DATE
)
RETURNS VOID AS $$
DECLARE
  v_habit_data RECORD;
BEGIN
  -- Get habit feedback data for the day
  SELECT
    COUNT(*) as total_completions,
    AVG(score) as avg_score,
    ARRAY_AGG(DISTINCT habit_name) as completed_habits
  INTO v_habit_data
  FROM habit_feedback_log
  WHERE user_id = p_user_id
    AND date = p_date;

  -- Update daily wellness summary with habit data
  UPDATE daily_wellness_summary
  SET
    total_activities = COALESCE(total_activities, 0) + COALESCE(v_habit_data.total_completions, 0),
    updated_at = NOW()
  WHERE user_id = p_user_id
    AND date = p_date;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update wellness summary when habit feedback is logged
CREATE OR REPLACE FUNCTION trigger_habit_feedback_update()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM update_wellness_with_habit_feedback(NEW.user_id, NEW.date);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_habit_feedback_insert
  AFTER INSERT OR UPDATE ON habit_feedback_log
  FOR EACH ROW
  EXECUTE FUNCTION trigger_habit_feedback_update();

-- Function to get habit impact score
CREATE OR REPLACE FUNCTION get_habit_impact_score(
  p_user_id UUID,
  p_habit_id UUID
)
RETURNS DECIMAL AS $$
DECLARE
  v_correlation RECORD;
  v_impact DECIMAL;
BEGIN
  SELECT
    correlation_with_mood,
    correlation_with_clarity,
    correlation_with_sleep_quality
  INTO v_correlation
  FROM habit_correlation_summary
  WHERE user_id = p_user_id
    AND habit_id = p_habit_id;

  IF v_correlation IS NULL THEN
    RETURN 3.0; -- Neutral default
  END IF;

  -- Calculate weighted impact score (1-5 scale)
  v_impact := 3.0 + (
    (COALESCE(v_correlation.correlation_with_mood, 0) * 0.4 +
     COALESCE(v_correlation.correlation_with_clarity, 0) * 0.3 +
     COALESCE(v_correlation.correlation_with_sleep_quality, 0) * 0.3) * 2
  );

  -- Clamp to 1-5 range
  RETURN GREATEST(1.0, LEAST(5.0, v_impact));
END;
$$ LANGUAGE plpgsql;
