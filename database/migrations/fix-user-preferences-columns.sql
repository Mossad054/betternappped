-- Migration: Add missing columns to user_preferences table
-- Date: 2025-11-05
-- Run this if you already created user_preferences table without theme columns

-- Add missing theme-related columns
ALTER TABLE public.user_preferences 
  ADD COLUMN IF NOT EXISTS color_theme TEXT DEFAULT 'default',
  ADD COLUMN IF NOT EXISTS theme_mode TEXT DEFAULT 'system' CHECK (theme_mode IN ('light', 'dark', 'system')),
  ADD COLUMN IF NOT EXISTS icon_pack TEXT DEFAULT 'default',
  ADD COLUMN IF NOT EXISTS emoji_palette TEXT DEFAULT 'apple';

-- Update existing rows to have default values
UPDATE public.user_preferences 
SET 
  color_theme = COALESCE(color_theme, 'default'),
  theme_mode = COALESCE(theme_mode, 'system'),
  icon_pack = COALESCE(icon_pack, 'default'),
  emoji_palette = COALESCE(emoji_palette, 'apple')
WHERE 
  color_theme IS NULL 
  OR theme_mode IS NULL 
  OR icon_pack IS NULL 
  OR emoji_palette IS NULL;
