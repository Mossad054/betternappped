-- ============================================================================
-- Migration: 003_create_user_preferences_table
-- Date: 2025-11-05
-- Purpose: Store user theme and appearance preferences
-- ============================================================================

-- Create user_preferences table
CREATE TABLE IF NOT EXISTS public.user_preferences (
  -- Primary key (references auth.users)
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Theme preferences
  color_theme TEXT NOT NULL DEFAULT 'default',
  theme_mode TEXT NOT NULL DEFAULT 'system', -- options: light, dark, system
  icon_pack TEXT NOT NULL DEFAULT 'default',
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can only view their own preferences
CREATE POLICY "Users can view own preferences"
  ON public.user_preferences
  FOR SELECT
  USING (auth.uid() = id);

-- Users can insert their own preferences
CREATE POLICY "Users can insert own preferences"
  ON public.user_preferences
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Users can update their own preferences
CREATE POLICY "Users can update own preferences"
  ON public.user_preferences
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Users can delete their own preferences
CREATE POLICY "Users can delete own preferences"
  ON public.user_preferences
  FOR DELETE
  USING (auth.uid() = id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at_user_preferences()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER set_updated_at_user_preferences
  BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at_user_preferences();

-- Auto-create user_preferences on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user_preferences()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_preferences (id, color_theme, theme_mode, icon_pack)
  VALUES (NEW.id, 'default', 'system', 'default')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created_preferences
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_preferences();

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_preferences_color_theme 
  ON public.user_preferences(color_theme);
CREATE INDEX IF NOT EXISTS idx_user_preferences_theme_mode 
  ON public.user_preferences(theme_mode);

-- Comments
COMMENT ON TABLE public.user_preferences IS 'User theme and appearance preferences';
COMMENT ON COLUMN public.user_preferences.color_theme IS 'Selected color palette: default, warm, cool, nature, pastel, ocean, sunset, forest, lavender';
COMMENT ON COLUMN public.user_preferences.theme_mode IS 'Theme mode preference: light, dark, or system';
COMMENT ON COLUMN public.user_preferences.icon_pack IS 'Selected icon pack: default, rounded, outlined, filled';
