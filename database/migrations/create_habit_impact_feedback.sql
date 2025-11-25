-- =====================================================
-- HABIT IMPACT FEEDBACK SYSTEM
-- Tracks how habits affect mood, sleep, anxiety, and productivity
-- =====================================================

-- Table to store detailed habit completion feedback
CREATE TABLE IF NOT EXISTS public.habit_impact_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id UUID NOT NULL REFERENCES public.habits(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,

  -- Basic feedback (existing system)
  overall_feeling TEXT CHECK (overall_feeling IN ('good', 'neutral', 'bad')),

  -- Detailed impact ratings (1-5 scale)
  mood_impact INTEGER CHECK (mood_impact BETWEEN 1 AND 5), -- How much did this improve your mood?
  sleep_impact INTEGER CHECK (sleep_impact BETWEEN 1 AND 5), -- How much did this help your sleep?
  anxiety_impact INTEGER CHECK (anxiety_impact BETWEEN 1 AND 5), -- How much did this reduce anxiety?
  productivity_impact INTEGER CHECK (productivity_impact BETWEEN 1 AND 5), -- How much did this boost productivity?
  energy_impact INTEGER CHECK (energy_impact BETWEEN 1 AND 5), -- How much did this increase your energy?

  -- Additional context
  difficulty_level INTEGER CHECK (difficulty_level BETWEEN 1 AND 5), -- How hard was it to complete?
  enjoyment_level INTEGER CHECK (enjoyment_level BETWEEN 1 AND 5), -- How much did you enjoy it?
  time_taken INTEGER, -- Minutes taken to complete
  notes TEXT, -- Optional user notes

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Unique constraint: one feedback per habit per day
  UNIQUE(habit_id, user_id, date)
);

-- Table to store calculated correlations between habits and outcomes
CREATE TABLE IF NOT EXISTS public.habit_correlations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id UUID NOT NULL REFERENCES public.habits(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Correlation metrics (calculated from feedback data)
  mood_correlation DECIMAL(3, 2), -- Range: -1.00 to 1.00
  sleep_correlation DECIMAL(3, 2),
  anxiety_correlation DECIMAL(3, 2),
  productivity_correlation DECIMAL(3, 2),
  energy_correlation DECIMAL(3, 2),

  -- Aggregate statistics
  total_completions INTEGER DEFAULT 0,
  avg_mood_impact DECIMAL(3, 2),
  avg_sleep_impact DECIMAL(3, 2),
  avg_anxiety_impact DECIMAL(3, 2),
  avg_productivity_impact DECIMAL(3, 2),
  avg_energy_impact DECIMAL(3, 2),
  avg_difficulty DECIMAL(3, 2),
  avg_enjoyment DECIMAL(3, 2),

  -- Impact confidence (higher = more data points)
  confidence_score DECIMAL(3, 2), -- 0.00 to 1.00

  -- Timestamps
  last_calculated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  UNIQUE(habit_id, user_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_habit_impact_feedback_habit_id ON public.habit_impact_feedback(habit_id);
CREATE INDEX IF NOT EXISTS idx_habit_impact_feedback_user_id ON public.habit_impact_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_habit_impact_feedback_date ON public.habit_impact_feedback(date);
CREATE INDEX IF NOT EXISTS idx_habit_impact_feedback_user_date ON public.habit_impact_feedback(user_id, date);

CREATE INDEX IF NOT EXISTS idx_habit_correlations_habit_id ON public.habit_correlations(habit_id);
CREATE INDEX IF NOT EXISTS idx_habit_correlations_user_id ON public.habit_correlations(user_id);

-- Enable RLS
ALTER TABLE public.habit_impact_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habit_correlations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for habit_impact_feedback
DROP POLICY IF EXISTS "Users can view their own habit feedback" ON public.habit_impact_feedback;
CREATE POLICY "Users can view their own habit feedback"
  ON public.habit_impact_feedback
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own habit feedback" ON public.habit_impact_feedback;
CREATE POLICY "Users can insert their own habit feedback"
  ON public.habit_impact_feedback
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own habit feedback" ON public.habit_impact_feedback;
CREATE POLICY "Users can update their own habit feedback"
  ON public.habit_impact_feedback
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own habit feedback" ON public.habit_impact_feedback;
CREATE POLICY "Users can delete their own habit feedback"
  ON public.habit_impact_feedback
  FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for habit_correlations
DROP POLICY IF EXISTS "Users can view their own habit correlations" ON public.habit_correlations;
CREATE POLICY "Users can view their own habit correlations"
  ON public.habit_correlations
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own habit correlations" ON public.habit_correlations;
CREATE POLICY "Users can insert their own habit correlations"
  ON public.habit_correlations
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own habit correlations" ON public.habit_correlations;
CREATE POLICY "Users can update their own habit correlations"
  ON public.habit_correlations
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Function to automatically update correlations when feedback is added
CREATE OR REPLACE FUNCTION public.update_habit_correlations()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_total_completions INTEGER;
  v_avg_mood DECIMAL(3, 2);
  v_avg_sleep DECIMAL(3, 2);
  v_avg_anxiety DECIMAL(3, 2);
  v_avg_productivity DECIMAL(3, 2);
  v_avg_energy DECIMAL(3, 2);
  v_avg_difficulty DECIMAL(3, 2);
  v_avg_enjoyment DECIMAL(3, 2);
  v_confidence DECIMAL(3, 2);
BEGIN
  -- Calculate aggregates from feedback
  SELECT
    COUNT(*),
    AVG(mood_impact)::DECIMAL(3, 2),
    AVG(sleep_impact)::DECIMAL(3, 2),
    AVG(anxiety_impact)::DECIMAL(3, 2),
    AVG(productivity_impact)::DECIMAL(3, 2),
    AVG(energy_impact)::DECIMAL(3, 2),
    AVG(difficulty_level)::DECIMAL(3, 2),
    AVG(enjoyment_level)::DECIMAL(3, 2)
  INTO
    v_total_completions,
    v_avg_mood,
    v_avg_sleep,
    v_avg_anxiety,
    v_avg_productivity,
    v_avg_energy,
    v_avg_difficulty,
    v_avg_enjoyment
  FROM public.habit_impact_feedback
  WHERE habit_id = NEW.habit_id AND user_id = NEW.user_id;

  -- Calculate confidence score (0-1 based on number of data points)
  -- More data points = higher confidence
  v_confidence := LEAST(v_total_completions / 30.0, 1.0)::DECIMAL(3, 2);

  -- Upsert correlations
  INSERT INTO public.habit_correlations (
    habit_id,
    user_id,
    total_completions,
    avg_mood_impact,
    avg_sleep_impact,
    avg_anxiety_impact,
    avg_productivity_impact,
    avg_energy_impact,
    avg_difficulty,
    avg_enjoyment,
    confidence_score,
    last_calculated_at
  ) VALUES (
    NEW.habit_id,
    NEW.user_id,
    v_total_completions,
    v_avg_mood,
    v_avg_sleep,
    v_avg_anxiety,
    v_avg_productivity,
    v_avg_energy,
    v_avg_difficulty,
    v_avg_enjoyment,
    v_confidence,
    NOW()
  )
  ON CONFLICT (habit_id, user_id)
  DO UPDATE SET
    total_completions = v_total_completions,
    avg_mood_impact = v_avg_mood,
    avg_sleep_impact = v_avg_sleep,
    avg_anxiety_impact = v_avg_anxiety,
    avg_productivity_impact = v_avg_productivity,
    avg_energy_impact = v_avg_energy,
    avg_difficulty = v_avg_difficulty,
    avg_enjoyment = v_avg_enjoyment,
    confidence_score = v_confidence,
    last_calculated_at = NOW(),
    updated_at = NOW();

  RETURN NEW;
END;
$$;

-- Trigger to update correlations automatically
DROP TRIGGER IF EXISTS on_habit_feedback_upsert ON public.habit_impact_feedback;
CREATE TRIGGER on_habit_feedback_upsert
  AFTER INSERT OR UPDATE ON public.habit_impact_feedback
  FOR EACH ROW
  EXECUTE FUNCTION public.update_habit_correlations();

-- Grant permissions
GRANT ALL ON public.habit_impact_feedback TO authenticated;
GRANT ALL ON public.habit_correlations TO authenticated;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Habit Impact Feedback System created successfully!';
  RAISE NOTICE 'Tables created: habit_impact_feedback, habit_correlations';
  RAISE NOTICE 'Automatic correlation calculation enabled via trigger.';
END $$;
