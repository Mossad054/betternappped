-- =====================================================
-- USER ONBOARDING GOALS & METADATA
-- Date: 2025-11-23
-- Purpose: Store user goals and onboarding answers for personalization
-- =====================================================

-- Create user goals table
CREATE TABLE IF NOT EXISTS user_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    goal_type VARCHAR(50) NOT NULL, -- 'sleep', 'energy', 'stress', 'intimacy', 'clarity'
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, goal_type)
);

-- Create onboarding metadata table for adaptive questions
CREATE TABLE IF NOT EXISTS onboarding_metadata (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    question_id VARCHAR(100) NOT NULL,
    answer TEXT NOT NULL,
    goal_type VARCHAR(50), -- Which goal this question relates to
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, question_id)
);

-- Create generated programs table
CREATE TABLE IF NOT EXISTS user_generated_programs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    program_id UUID REFERENCES programs(id) ON DELETE SET NULL,
    goal_type VARCHAR(50) NOT NULL,
    generated_from_onboarding BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Update profiles table to add preferred_name if not exists
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS preferred_name VARCHAR(100);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS auth_provider VARCHAR(50) DEFAULT 'email';

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_goals_user_id ON user_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_metadata_user_id ON onboarding_metadata(user_id);
CREATE INDEX IF NOT EXISTS idx_user_generated_programs_user_id ON user_generated_programs(user_id);

-- Enable RLS
ALTER TABLE user_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_generated_programs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_goals
CREATE POLICY "Users can view their own goals"
    ON user_goals FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own goals"
    ON user_goals FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own goals"
    ON user_goals FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own goals"
    ON user_goals FOR DELETE
    USING (auth.uid() = user_id);

-- RLS Policies for onboarding_metadata
CREATE POLICY "Users can view their own onboarding data"
    ON onboarding_metadata FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own onboarding data"
    ON onboarding_metadata FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own onboarding data"
    ON onboarding_metadata FOR UPDATE
    USING (auth.uid() = user_id);

-- RLS Policies for user_generated_programs
CREATE POLICY "Users can view their generated programs"
    ON user_generated_programs FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their generated programs"
    ON user_generated_programs FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their generated programs"
    ON user_generated_programs FOR UPDATE
    USING (auth.uid() = user_id);

-- Add comments
COMMENT ON TABLE user_goals IS 'Stores user wellness goals selected during onboarding';
COMMENT ON TABLE onboarding_metadata IS 'Stores adaptive question answers from onboarding';
COMMENT ON TABLE user_generated_programs IS 'Stores programs auto-generated based on user goals';
