-- =====================================================
-- CREATE USER SECURITY SETTINGS TABLE
-- Date: 2025-11-23
-- Purpose: Store encrypted PIN and security settings
-- =====================================================

-- Create user_security_settings table
CREATE TABLE IF NOT EXISTS user_security_settings (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    pin_enabled BOOLEAN DEFAULT FALSE,
    pin_hash TEXT,
    auto_lock_enabled BOOLEAN DEFAULT FALSE,
    auto_lock_time VARCHAR(20) DEFAULT '1_minute',
    biometric_enabled BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_security_settings_user_id
ON user_security_settings(id);

-- Enable RLS
ALTER TABLE user_security_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own security settings"
    ON user_security_settings
    FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own security settings"
    ON user_security_settings
    FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can insert their own security settings"
    ON user_security_settings
    FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_user_security_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_user_security_settings_updated_at
ON user_security_settings;

CREATE TRIGGER trigger_update_user_security_settings_updated_at
    BEFORE UPDATE ON user_security_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_user_security_settings_updated_at();

-- Add comment
COMMENT ON TABLE user_security_settings IS 'Stores user security settings including encrypted PIN hash and auto-lock preferences';
