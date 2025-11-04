-- Migration: Create profiles table for account settings
-- Date: 2025-11-05
-- Description: Adds profiles table to store user profile information, including name, profile picture, and PIN lock

-- ============================================================
-- Profiles Table
-- ============================================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  email TEXT,
  profile_picture TEXT, -- URL to Supabase Storage
  pin_code_hash TEXT, -- Hashed PIN for account lock feature
  pin_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add comment for documentation
COMMENT ON TABLE public.profiles IS 'User profile information including name, avatar, and PIN lock settings';
COMMENT ON COLUMN public.profiles.profile_picture IS 'Public URL to profile picture stored in Supabase Storage avatars bucket';
COMMENT ON COLUMN public.profiles.pin_code_hash IS 'Bcrypt hashed PIN code for account lock feature (never store plain PIN)';
COMMENT ON COLUMN public.profiles.pin_enabled IS 'Whether PIN lock is enabled for this account';

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Policy: Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policy: Users can delete their own profile (when deleting account)
CREATE POLICY "Users can delete own profile"
  ON public.profiles
  FOR DELETE
  USING (auth.uid() = id);

-- ============================================================
-- Indexes for Performance
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_profiles_email 
  ON public.profiles(email);

CREATE INDEX IF NOT EXISTS idx_profiles_pin_enabled 
  ON public.profiles(pin_enabled) 
  WHERE pin_enabled = true;

-- ============================================================
-- Trigger: Auto-update updated_at timestamp
-- ============================================================

CREATE OR REPLACE FUNCTION public.update_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_profiles_updated_at();

-- ============================================================
-- Function: Auto-create profile on user signup
-- ============================================================

CREATE OR REPLACE FUNCTION public.create_profile_for_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NULL)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create profile when user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.create_profile_for_new_user();

-- ============================================================
-- Supabase Storage Setup (Run in Dashboard or via API)
-- ============================================================

-- Note: Storage buckets must be created via Supabase Dashboard or Management API
-- This is documentation for manual setup:
--
-- 1. Go to Storage in Supabase Dashboard
-- 2. Create new bucket: "avatars"
-- 3. Make it public
-- 4. Set file size limit: 5MB
-- 5. Allowed MIME types: image/jpeg, image/png, image/webp
-- 
-- Storage policies (apply in Storage > avatars > Policies):
--
-- Policy: Anyone can view avatars (public bucket)
-- CREATE POLICY "Public avatars are viewable by everyone"
--   ON storage.objects FOR SELECT
--   USING (bucket_id = 'avatars');
--
-- Policy: Users can upload their own avatar
-- CREATE POLICY "Users can upload own avatar"
--   ON storage.objects FOR INSERT
--   WITH CHECK (
--     bucket_id = 'avatars' AND
--     auth.uid()::text = (storage.foldername(name))[1]
--   );
--
-- Policy: Users can update their own avatar
-- CREATE POLICY "Users can update own avatar"
--   ON storage.objects FOR UPDATE
--   USING (
--     bucket_id = 'avatars' AND
--     auth.uid()::text = (storage.foldername(name))[1]
--   );
--
-- Policy: Users can delete their own avatar
-- CREATE POLICY "Users can delete own avatar"
--   ON storage.objects FOR DELETE
--   USING (
--     bucket_id = 'avatars' AND
--     auth.uid()::text = (storage.foldername(name))[1]
--   );

-- ============================================================
-- Update existing users table metadata (optional)
-- ============================================================

-- Sync existing users to profiles table
INSERT INTO public.profiles (id, email, full_name)
SELECT 
  id, 
  email,
  metadata->>'full_name' as full_name
FROM public.users
ON CONFLICT (id) DO NOTHING;
