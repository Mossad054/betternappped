-- Sleep Content Library Tables
-- Run this migration to create the content library and favorites tables

-- Main content library table
CREATE TABLE IF NOT EXISTS sleep_content_library (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('guided_meditation', 'bedtime_stories', 'nature_sounds', 'ambient', 'sleep_hypnosis', 'quick_tools')),
    youtube_id TEXT NOT NULL,
    thumbnail_url TEXT,
    description TEXT,
    duration TEXT NOT NULL,
    duration_minutes INTEGER,
    type TEXT DEFAULT 'audio',
    tags TEXT[] DEFAULT '{}',
    emoji TEXT DEFAULT '🎵',
    language TEXT DEFAULT 'English',
    voice_type TEXT,
    best_for TEXT[] DEFAULT '{}',
    is_public_domain BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    play_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User favorites table
CREATE TABLE IF NOT EXISTS sleep_favorites (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content_id UUID NOT NULL REFERENCES sleep_content_library(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, content_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_sleep_content_category ON sleep_content_library(category);
CREATE INDEX IF NOT EXISTS idx_sleep_content_tags ON sleep_content_library USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_sleep_content_featured ON sleep_content_library(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_sleep_favorites_user ON sleep_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_sleep_favorites_content ON sleep_favorites(content_id);

-- Enable RLS
ALTER TABLE sleep_content_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE sleep_favorites ENABLE ROW LEVEL SECURITY;

-- RLS Policies for content library (public read)
CREATE POLICY "Anyone can read content library"
    ON sleep_content_library FOR SELECT
    USING (true);

-- RLS Policies for favorites
CREATE POLICY "Users can read own favorites"
    ON sleep_favorites FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own favorites"
    ON sleep_favorites FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites"
    ON sleep_favorites FOR DELETE
    USING (auth.uid() = user_id);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_sleep_content_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sleep_content_updated_at
    BEFORE UPDATE ON sleep_content_library
    FOR EACH ROW
    EXECUTE FUNCTION update_sleep_content_updated_at();
