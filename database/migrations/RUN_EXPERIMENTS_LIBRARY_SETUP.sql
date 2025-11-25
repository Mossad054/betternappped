-- Master Script: Setup Experiments Library
-- Run this file to create and populate the experiments_library table
--
-- Execution Order:
-- 1. Create table structure (create_experiments_library.sql)
-- 2. Seed Sleep experiments (seed_experiments_library.sql)
-- 3. Seed Mood experiments (seed_experiments_mood.sql)
-- 4. Seed Focus, Energy, Anxiety, Productivity experiments (seed_experiments_remaining.sql)

\echo '========================================';
\echo 'Creating experiments_library table...';
\echo '========================================';
\i create_experiments_library.sql

\echo '';
\echo '========================================';
\echo 'Seeding Sleep experiments...';
\echo '========================================';
\i seed_experiments_library.sql

\echo '';
\echo '========================================';
\echo 'Seeding Mood experiments...';
\echo '========================================';
\i seed_experiments_mood.sql

\echo '';
\echo '========================================';
\echo 'Seeding Focus, Energy, Anxiety, and Productivity experiments...';
\echo '========================================';
\i seed_experiments_remaining.sql

\echo '';
\echo '========================================';
\echo 'Experiments Library Setup Complete!';
\echo '========================================';
\echo '';
\echo 'Summary of loaded experiments:';

SELECT
  category,
  COUNT(*) as experiment_count,
  COUNT(DISTINCT difficulty) as difficulty_levels
FROM public.experiments_library
GROUP BY category
ORDER BY category;

\echo '';
\echo 'Total experiments loaded:';
SELECT COUNT(*) as total_experiments FROM public.experiments_library;

\echo '';
\echo '========================================';
\echo 'Verification Complete!';
\echo '========================================';
