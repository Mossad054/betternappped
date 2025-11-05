-- Quick Fix: Add instruction column to habits table
-- Run this in Supabase SQL Editor

ALTER TABLE public.habits 
ADD COLUMN IF NOT EXISTS instruction TEXT;
