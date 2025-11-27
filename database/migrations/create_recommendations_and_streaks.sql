-- =====================================================
-- INTIMACY HUB: RECOMMENDATIONS AND STREAKS SYSTEM
-- Purpose: Add data-driven recommendations and intimacy streaks tracking
-- Date: 2025-11-26
-- =====================================================

-- =====================================================
-- 1. RECOMMENDATION SYSTEM
-- =====================================================

-- Recommendation Rules Table (defines matching patterns)
CREATE TABLE IF NOT EXISTS public.recommendation_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_name VARCHAR(255) NOT NULL UNIQUE,
  pattern_criteria JSONB NOT NULL, -- Pattern matching rules
  program_id UUID REFERENCES public.programs(id) ON DELETE CASCADE NOT NULL,
  reason_template TEXT NOT NULL, -- Template with placeholders like {avgMood}
  min_confidence DECIMAL(3,2) DEFAULT 0.5 CHECK (min_confidence >= 0 AND min_confidence <= 1),
  priority INTEGER DEFAULT 5 CHECK (priority >= 1 AND priority <= 10),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Program Recommendations Table (user-specific recommendations)
CREATE TABLE IF NOT EXISTS public.program_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  program_id UUID REFERENCES public.programs(id) ON DELETE CASCADE NOT NULL,
  reason TEXT NOT NULL, -- Personalized reason why this was recommended
  pattern_detected TEXT, -- JSON string of detected pattern
  confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
  dismissed BOOLEAN DEFAULT false,
  acted_on BOOLEAN DEFAULT false, -- User enrolled in the program
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for recommendations
CREATE INDEX IF NOT EXISTS idx_recommendation_rules_active ON public.recommendation_rules(active, priority DESC);
CREATE INDEX IF NOT EXISTS idx_program_recommendations_user ON public.program_recommendations(user_id, dismissed, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_program_recommendations_program ON public.program_recommendations(program_id);

-- RLS for recommendations
ALTER TABLE public.recommendation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.program_recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active recommendation rules"
ON public.recommendation_rules FOR SELECT
USING (active = true);

CREATE POLICY "Users can view own program recommendations"
ON public.program_recommendations FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own program recommendations"
ON public.program_recommendations FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own program recommendations"
ON public.program_recommendations FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own program recommendations"
ON public.program_recommendations FOR DELETE
USING (auth.uid() = user_id);

-- =====================================================
-- 2. INTIMACY STREAKS SYSTEM
-- =====================================================

-- Streak Goals Table (user-defined streak goals)
CREATE TABLE IF NOT EXISTS public.intimacy_streak_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  goal_name VARCHAR(255) NOT NULL,
  goal_type VARCHAR(50) CHECK (goal_type IN ('frequency', 'consistency', 'orgasm', 'custom')) NOT NULL,
  target_frequency INT NOT NULL CHECK (target_frequency > 0), -- e.g., 3 times per week
  target_period VARCHAR(20) CHECK (target_period IN ('daily', 'weekly', 'monthly')) DEFAULT 'weekly',
  target_duration_days INT NOT NULL CHECK (target_duration_days > 0), -- e.g., 30 days
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status VARCHAR(20) CHECK (status IN ('active', 'completed', 'failed', 'paused')) DEFAULT 'active',
  current_streak INT DEFAULT 0,
  longest_streak INT DEFAULT 0,
  success_count INT DEFAULT 0, -- How many times target was met
  missed_count INT DEFAULT 0, -- How many times target was missed
  reminder_enabled BOOLEAN DEFAULT true,
  reminder_times TIME[] DEFAULT ARRAY['20:00:00']::TIME[],
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, goal_name)
);

-- Streak Logs Table (daily streak tracking)
CREATE TABLE IF NOT EXISTS public.intimacy_streak_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  streak_goal_id UUID REFERENCES public.intimacy_streak_goals(id) ON DELETE CASCADE NOT NULL,
  log_date DATE NOT NULL,
  target_met BOOLEAN NOT NULL,
  intimacy_count INT DEFAULT 0, -- How many times that day/week
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(streak_goal_id, log_date)
);

-- Indexes for streaks
CREATE INDEX IF NOT EXISTS idx_intimacy_streak_goals_user ON public.intimacy_streak_goals(user_id, status);
CREATE INDEX IF NOT EXISTS idx_intimacy_streak_goals_dates ON public.intimacy_streak_goals(user_id, start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_intimacy_streak_logs_goal ON public.intimacy_streak_logs(streak_goal_id, log_date DESC);
CREATE INDEX IF NOT EXISTS idx_intimacy_streak_logs_user_date ON public.intimacy_streak_logs(user_id, log_date DESC);

-- RLS for streaks
ALTER TABLE public.intimacy_streak_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.intimacy_streak_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own streak goals"
ON public.intimacy_streak_goals FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own streak goals"
ON public.intimacy_streak_goals FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own streak goals"
ON public.intimacy_streak_goals FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own streak goals"
ON public.intimacy_streak_goals FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Users can view own streak logs"
ON public.intimacy_streak_logs FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own streak logs"
ON public.intimacy_streak_logs FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own streak logs"
ON public.intimacy_streak_logs FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own streak logs"
ON public.intimacy_streak_logs FOR DELETE
USING (auth.uid() = user_id);

-- =====================================================
-- 3. TRIGGERS & FUNCTIONS
-- =====================================================

-- Auto-update timestamps for recommendation rules
CREATE OR REPLACE FUNCTION update_recommendation_rules_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_recommendation_rules_updated
  BEFORE UPDATE ON public.recommendation_rules
  FOR EACH ROW EXECUTE FUNCTION update_recommendation_rules_timestamp();

-- Auto-update timestamps for program recommendations
CREATE OR REPLACE FUNCTION update_program_recommendations_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_program_recommendations_updated
  BEFORE UPDATE ON public.program_recommendations
  FOR EACH ROW EXECUTE FUNCTION update_program_recommendations_timestamp();

-- Auto-update streak goal statistics
CREATE OR REPLACE FUNCTION update_streak_goal_stats()
RETURNS TRIGGER AS $$
DECLARE
  goal_record RECORD;
  consecutive_streak INT;
BEGIN
  -- Get the goal
  SELECT * INTO goal_record
  FROM public.intimacy_streak_goals
  WHERE id = NEW.streak_goal_id;

  IF goal_record IS NULL THEN
    RETURN NEW;
  END IF;

  -- Calculate current streak
  SELECT COUNT(*) INTO consecutive_streak
  FROM (
    SELECT log_date, target_met,
           ROW_NUMBER() OVER (ORDER BY log_date DESC) as rn,
           log_date::date - ROW_NUMBER() OVER (ORDER BY log_date DESC)::int as grp
    FROM public.intimacy_streak_logs
    WHERE streak_goal_id = NEW.streak_goal_id
      AND target_met = true
      AND log_date <= NEW.log_date
    ORDER BY log_date DESC
  ) sub
  WHERE grp = (
    SELECT log_date::date - ROW_NUMBER() OVER (ORDER BY log_date DESC)::int
    FROM public.intimacy_streak_logs
    WHERE streak_goal_id = NEW.streak_goal_id
      AND target_met = true
      AND log_date <= NEW.log_date
    ORDER BY log_date DESC
    LIMIT 1
  );

  -- Update the goal with new stats
  UPDATE public.intimacy_streak_goals
  SET
    current_streak = CASE WHEN NEW.target_met THEN consecutive_streak ELSE 0 END,
    longest_streak = GREATEST(longest_streak, consecutive_streak),
    success_count = CASE WHEN NEW.target_met THEN success_count + 1 ELSE success_count END,
    missed_count = CASE WHEN NOT NEW.target_met THEN missed_count + 1 ELSE missed_count END,
    updated_at = NOW()
  WHERE id = NEW.streak_goal_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_streak_stats
  AFTER INSERT OR UPDATE ON public.intimacy_streak_logs
  FOR EACH ROW EXECUTE FUNCTION update_streak_goal_stats();

-- Auto-complete streak goals when end date is reached
CREATE OR REPLACE FUNCTION check_streak_goal_completion()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.end_date <= CURRENT_DATE AND NEW.status = 'active' THEN
    -- Check if goal was successful
    IF NEW.current_streak >= NEW.target_duration_days THEN
      NEW.status = 'completed';
    ELSE
      NEW.status = 'failed';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_check_streak_completion
  BEFORE UPDATE ON public.intimacy_streak_goals
  FOR EACH ROW EXECUTE FUNCTION check_streak_goal_completion();

-- =====================================================
-- 4. COMMENTS
-- =====================================================

COMMENT ON TABLE public.recommendation_rules IS 'Pattern-matching rules for generating program recommendations';
COMMENT ON TABLE public.program_recommendations IS 'User-specific program recommendations based on their intimacy patterns';
COMMENT ON TABLE public.intimacy_streak_goals IS 'User-defined intimacy streak goals with tracking';
COMMENT ON TABLE public.intimacy_streak_logs IS 'Daily logs for tracking streak goal progress';

COMMENT ON COLUMN public.recommendation_rules.pattern_criteria IS 'JSONB pattern matching criteria, e.g., {"avgIntimacy": {"min": 0, "max": 5}}';
COMMENT ON COLUMN public.recommendation_rules.reason_template IS 'Template string with placeholders like "Your intimacy level is {avgIntimacy}/10"';
COMMENT ON COLUMN public.intimacy_streak_goals.target_frequency IS 'Target frequency, e.g., 3 for "3 times per week"';
COMMENT ON COLUMN public.intimacy_streak_goals.target_duration_days IS 'Duration to maintain the streak, e.g., 30 days';
