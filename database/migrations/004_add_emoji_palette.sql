-- Migration: Add emoji_palette to user_preferences
-- Date: 2025-11-05
-- Purpose: Store user's preferred emoji style palette

-- Add emoji_palette column to user_preferences table
ALTER TABLE public.user_preferences
ADD COLUMN IF NOT EXISTS emoji_palette TEXT NOT NULL DEFAULT 'apple';

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_preferences_emoji_palette 
ON public.user_preferences(emoji_palette);

-- Add comment
COMMENT ON COLUMN public.user_preferences.emoji_palette IS 'User preferred emoji style palette (apple, google, twitter, flat, minimal, vibrant)';
