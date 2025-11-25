-- Migration: Create Activity Correlation Storage Tables
-- Purpose: Persist activity impact analysis results for fast lookup
-- Date: November 10, 2025

-- =====================================================
-- Table 1: Activity-Outcome Correlations
-- Stores aggregated correlation results for each activity-outcome pair
-- =====================================================

CREATE TABLE IF NOT EXISTS activity_outcome_correlations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  
  -- Activity identification
  activity_name VARCHAR(100) NOT NULL,
  activity_category VARCHAR(50),
  
  -- Outcome being measured
  outcome_type VARCHAR(50) NOT NULL CHECK (outcome_type IN ('mood', 'sleep', 'clarity', 'productivity', 'anxiety')),
  
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
  total_occurrences INT NOT NULL DEFAULT 0, -- Total times activity logged
  paired_data_points INT NOT NULL DEFAULT 0, -- Data points with outcome measured
  
  -- Interpretation (pre-calculated for fast lookup)
  impact_strength VARCHAR(20) CHECK (impact_strength IN ('none', 'weak', 'moderate', 'strong', 'very-strong')),
  impact_direction VARCHAR(20) CHECK (impact_direction IN ('improves', 'worsens', 'no-effect')),
  statistical_significance VARCHAR(30) CHECK (statistical_significance IN ('none', 'marginal', 'significant', 'highly-significant')),
  interpretation_text TEXT, -- Human-readable description
  
  -- Metadata
  first_calculated TIMESTAMP NOT NULL DEFAULT NOW(),
  last_updated TIMESTAMP NOT NULL DEFAULT NOW(),
  is_valid BOOLEAN DEFAULT true, -- Invalidate if data becomes insufficient
  
  -- Ensure uniqueness per user-activity-outcome combination
  UNIQUE(user_id, activity_name, outcome_type)
);

-- Indexes for fast lookups
CREATE INDEX idx_activity_correlations_user ON activity_outcome_correlations(user_id);
CREATE INDEX idx_activity_correlations_activity ON activity_outcome_correlations(user_id, activity_name);
CREATE INDEX idx_activity_correlations_outcome ON activity_outcome_correlations(outcome_type);
CREATE INDEX idx_activity_correlations_strength ON activity_outcome_correlations(impact_strength, statistical_significance);
CREATE INDEX idx_activity_correlations_valid ON activity_outcome_correlations(user_id, is_valid) WHERE is_valid = true;

-- =====================================================
-- Table 2: Activity Impact Records
-- Stores detailed impact records for granular analysis
-- Each row represents one activity occurrence with its outcomes
-- =====================================================

CREATE TABLE IF NOT EXISTS activity_impact_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  activity_id UUID, -- Reference to activities table (optional)
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
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  
  -- Index for efficient queries
  CONSTRAINT fk_impact_record_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Indexes for fast queries
CREATE INDEX idx_impact_records_user_date ON activity_impact_records(user_id, activity_date DESC);
CREATE INDEX idx_impact_records_activity ON activity_impact_records(user_id, activity_name);
CREATE INDEX idx_impact_records_date_range ON activity_impact_records(user_id, activity_date) WHERE activity_date >= CURRENT_DATE - INTERVAL '90 days';

-- =====================================================
-- Table 3: User Activity Insights Cache
-- Stores pre-calculated insights for dashboard display
-- =====================================================

CREATE TABLE IF NOT EXISTS user_activity_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  
  -- Top beneficial activities
  top_mood_boosters JSONB, -- Array of activity names
  top_sleep_improvers JSONB,
  top_clarity_enhancers JSONB,
  top_anxiety_reducers JSONB,
  
  -- Activities needing attention
  activities_to_reduce JSONB,
  
  -- Overall statistics
  total_activities_analyzed INT,
  highly_beneficial_count INT,
  beneficial_count INT,
  neutral_count INT,
  avoid_count INT,
  
  -- Summary insights (pre-generated text)
  summary_insights JSONB, -- Array of insight strings
  
  -- Metadata
  last_calculated TIMESTAMP NOT NULL DEFAULT NOW(),
  next_recalculation TIMESTAMP, -- Schedule next update
  
  CONSTRAINT fk_insights_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

CREATE INDEX idx_user_insights_recalc ON user_activity_insights(next_recalculation) WHERE next_recalculation IS NOT NULL;

-- =====================================================
-- Functions for automatic timestamp updates
-- =====================================================

-- Update last_updated timestamp on activity_outcome_correlations
CREATE OR REPLACE FUNCTION update_correlation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_updated = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_correlation_timestamp
BEFORE UPDATE ON activity_outcome_correlations
FOR EACH ROW
EXECUTE FUNCTION update_correlation_timestamp();

-- =====================================================
-- Cleanup old records (optional, run periodically)
-- =====================================================

-- Function to invalidate outdated correlations
CREATE OR REPLACE FUNCTION invalidate_outdated_correlations()
RETURNS void AS $$
BEGIN
  -- Invalidate correlations older than 90 days
  UPDATE activity_outcome_correlations
  SET is_valid = false
  WHERE last_updated < NOW() - INTERVAL '90 days'
    AND is_valid = true;
END;
$$ LANGUAGE plpgsql;

-- Function to clean up old impact records (keep last 180 days)
CREATE OR REPLACE FUNCTION cleanup_old_impact_records()
RETURNS void AS $$
BEGIN
  DELETE FROM activity_impact_records
  WHERE activity_date < CURRENT_DATE - INTERVAL '180 days';
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- Row Level Security (RLS) Policies
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE activity_outcome_correlations ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_impact_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity_insights ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their own data
CREATE POLICY "Users can view own correlations" ON activity_outcome_correlations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own correlations" ON activity_outcome_correlations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own correlations" ON activity_outcome_correlations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own correlations" ON activity_outcome_correlations
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own impact records" ON activity_impact_records
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own impact records" ON activity_impact_records
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own insights" ON user_activity_insights
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own insights" ON user_activity_insights
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own insights" ON user_activity_insights
  FOR UPDATE USING (auth.uid() = user_id);

-- =====================================================
-- Comments for documentation
-- =====================================================

COMMENT ON TABLE activity_outcome_correlations IS 'Stores aggregated correlation analysis results for activity-outcome pairs';
COMMENT ON TABLE activity_impact_records IS 'Stores detailed impact records for each activity occurrence with baseline and outcome measurements';
COMMENT ON TABLE user_activity_insights IS 'Caches pre-calculated insights for fast dashboard display';

COMMENT ON COLUMN activity_outcome_correlations.same_day_impact IS 'Average delta (change from baseline) on same day activity is performed';
COMMENT ON COLUMN activity_outcome_correlations.next_day_impact IS 'Average delta (change from baseline) on day after activity';
COMMENT ON COLUMN activity_outcome_correlations.correlation_coefficient IS 'Pearson r coefficient measuring consistency of effect';
COMMENT ON COLUMN activity_outcome_correlations.p_value IS 'Statistical significance (p < 0.05 = significant)';
COMMENT ON COLUMN activity_outcome_correlations.is_valid IS 'False if data is outdated or insufficient for reliable analysis';
