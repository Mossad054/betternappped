-- Debug Sleep Content Library
-- Run these queries in Supabase SQL Editor to diagnose the issue

-- 1. Check if data exists
SELECT COUNT(*) as total_items FROM sleep_content_library;

-- 2. Check by category
SELECT category, COUNT(*) as count
FROM sleep_content_library
GROUP BY category;

-- 3. Sample data
SELECT id, title, category, youtube_id
FROM sleep_content_library
LIMIT 5;

-- 4. Check RLS status
SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'sleep_content_library';

-- 5. View current policies
SELECT policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'sleep_content_library';

-- 6. If RLS is blocking, fix it:
-- Drop and recreate the SELECT policy to ensure it works
DROP POLICY IF EXISTS "Anyone can read content library" ON sleep_content_library;
DROP POLICY IF EXISTS "Public read access for sleep content" ON sleep_content_library;

CREATE POLICY "Public read access for sleep content"
    ON sleep_content_library
    FOR SELECT
    TO public
    USING (true);

-- Also create for anon role specifically
CREATE POLICY "Anon read access for sleep content"
    ON sleep_content_library
    FOR SELECT
    TO anon
    USING (true);

-- 7. Verify policies after fix
SELECT policyname, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'sleep_content_library';
