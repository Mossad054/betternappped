-- =====================================================
-- SLEEP WELLNESS HUB: RECOMMENDATIONS SYSTEM
-- Purpose: Add data-driven sleep recommendations
-- Date: 2025-11-26
-- =====================================================

-- =====================================================
-- 1. SLEEP RECOMMENDATIONS TABLE
-- =====================================================

-- Sleep Recommendation Rules Table (defines matching patterns)
CREATE TABLE IF NOT EXISTS public.sleep_recommendation_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_name VARCHAR(255) NOT NULL UNIQUE,
  pattern_criteria JSONB NOT NULL, -- Pattern matching rules
  reason_template TEXT NOT NULL, -- Template with placeholders like {avgSleepHours}
  recommendation_text TEXT NOT NULL, -- The actual recommendation
  min_confidence DECIMAL(3,2) DEFAULT 0.5 CHECK (min_confidence >= 0 AND min_confidence <= 1),
  priority INTEGER DEFAULT 5 CHECK (priority >= 1 AND priority <= 10),
  tags TEXT[] DEFAULT '{}', -- Tags for categorization (e.g., 'duration', 'quality', 'consistency')
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- User Sleep Recommendations Table (user-specific recommendations)
CREATE TABLE IF NOT EXISTS public.user_sleep_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  rule_id UUID REFERENCES public.sleep_recommendation_rules(id) ON DELETE CASCADE,
  recommendation_text TEXT NOT NULL, -- Personalized recommendation text
  reason TEXT NOT NULL, -- Personalized reason why this was recommended
  pattern_detected TEXT, -- JSON string of detected pattern
  confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
  dismissed BOOLEAN DEFAULT false,
  acted_on BOOLEAN DEFAULT false, -- User tried the recommendation
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- =====================================================
-- 2. INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_sleep_recommendation_rules_active
ON public.sleep_recommendation_rules(active, priority DESC);

CREATE INDEX IF NOT EXISTS idx_user_sleep_recommendations_user
ON public.user_sleep_recommendations(user_id, dismissed, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_sleep_recommendations_rule
ON public.user_sleep_recommendations(rule_id);

-- =====================================================
-- 3. ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE public.sleep_recommendation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sleep_recommendations ENABLE ROW LEVEL SECURITY;

-- Anyone can view active recommendation rules
CREATE POLICY "Anyone can view active sleep recommendation rules"
ON public.sleep_recommendation_rules FOR SELECT
USING (active = true);

-- Users can view own sleep recommendations
CREATE POLICY "Users can view own sleep recommendations"
ON public.user_sleep_recommendations FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert own sleep recommendations
CREATE POLICY "Users can insert own sleep recommendations"
ON public.user_sleep_recommendations FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update own sleep recommendations
CREATE POLICY "Users can update own sleep recommendations"
ON public.user_sleep_recommendations FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete own sleep recommendations
CREATE POLICY "Users can delete own sleep recommendations"
ON public.user_sleep_recommendations FOR DELETE
USING (auth.uid() = user_id);

-- =====================================================
-- 4. TRIGGERS & FUNCTIONS
-- =====================================================

-- Auto-update timestamps for recommendation rules
CREATE OR REPLACE FUNCTION update_sleep_recommendation_rules_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_sleep_recommendation_rules_updated
  BEFORE UPDATE ON public.sleep_recommendation_rules
  FOR EACH ROW EXECUTE FUNCTION update_sleep_recommendation_rules_timestamp();

-- Auto-update timestamps for user sleep recommendations
CREATE OR REPLACE FUNCTION update_user_sleep_recommendations_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_user_sleep_recommendations_updated
  BEFORE UPDATE ON public.user_sleep_recommendations
  FOR EACH ROW EXECUTE FUNCTION update_user_sleep_recommendations_timestamp();

-- =====================================================
-- 5. COMMENTS
-- =====================================================

COMMENT ON TABLE public.sleep_recommendation_rules IS 'Pattern-matching rules for generating sleep recommendations';
COMMENT ON TABLE public.user_sleep_recommendations IS 'User-specific sleep recommendations based on their sleep patterns';

COMMENT ON COLUMN public.sleep_recommendation_rules.pattern_criteria IS 'JSONB pattern matching criteria, e.g., {"avgSleepHours": {"min": 0, "max": 6}}';
COMMENT ON COLUMN public.sleep_recommendation_rules.reason_template IS 'Template string with placeholders like "Your average sleep is {avgSleepHours}h"';
COMMENT ON COLUMN public.sleep_recommendation_rules.recommendation_text IS 'The actual recommendation text to display';
