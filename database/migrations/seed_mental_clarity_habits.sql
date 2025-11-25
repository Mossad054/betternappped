-- Seed Mental Clarity Habits from habits_library.json
-- This migration adds 36 new Mental Clarity habits to the habits_library table
-- Excluding 3 habits that already exist in mockData.ts

-- First, check if the table exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'habits_library') THEN
    RAISE EXCEPTION 'Table habits_library does not exist. Please run create_habits_library.sql first.';
  END IF;
END $$;

-- Insert Mental Clarity habits
INSERT INTO public.habits_library (
  name,
  description,
  category,
  instructions,
  expected_outcome,
  emoji,
  difficulty,
  time_required,
  benefits
) VALUES
  (
    'Mindful pause every hour',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: mindful pause every hour.',
    'MentalClarity',
    'Perform the habit ''Mindful pause every hour'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: mindful pause every hour.',
    '⏸️',
    'Easy',
    '5 minutes',
    ARRAY['Improved mental clarity', 'Better focus', 'Reduced stress']
  ),
  (
    'Brain dump journaling',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: brain dump journaling.',
    'MentalClarity',
    'Perform the habit ''Brain dump journaling'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: brain dump journaling.',
    '📓',
    'Medium',
    '10 minutes',
    ARRAY['Better organization', 'Clearer thoughts', 'Reduced mental clutter']
  ),
  (
    'Read 2 pages of a book',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: read 2 pages of a book.',
    'MentalClarity',
    'Perform the habit ''Read 2 pages of a book'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: read 2 pages of a book.',
    '📖',
    'Easy',
    '5 minutes',
    ARRAY['Improved mental clarity', 'Better focus', 'Reduced stress']
  ),
  (
    'Practice gratitude list',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: practice gratitude list.',
    'MentalClarity',
    'Perform the habit ''Practice gratitude list'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: practice gratitude list.',
    '🧠',
    'Easy',
    '5 minutes',
    ARRAY['Improved mental clarity', 'Better focus', 'Reduced stress']
  ),
  (
    'Cold water face splash',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: cold water face splash.',
    'MentalClarity',
    'Perform the habit ''Cold water face splash'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: cold water face splash.',
    '💧',
    'Easy',
    '5 minutes',
    ARRAY['Better hydration', 'Improved cognitive function', 'Increased energy']
  ),
  (
    'Stand and stretch break',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: stand and stretch break.',
    'MentalClarity',
    'Perform the habit ''Stand and stretch break'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: stand and stretch break.',
    '🧠',
    'Easy',
    '5 minutes',
    ARRAY['Improved mental clarity', 'Better focus', 'Reduced stress']
  ),
  (
    'Focus on single task',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: focus on single task.',
    'MentalClarity',
    'Perform the habit ''Focus on single task'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: focus on single task.',
    '🎯',
    'Easy',
    '5 minutes',
    ARRAY['Improved mental clarity', 'Better focus', 'Reduced stress']
  ),
  (
    'Avoid multitasking session',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: avoid multitasking session.',
    'MentalClarity',
    'Perform the habit ''Avoid multitasking session'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: avoid multitasking session.',
    '✅',
    'Easy',
    '5 minutes',
    ARRAY['Improved mental clarity', 'Better focus', 'Reduced stress']
  ),
  (
    '5-minute meditation',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: 5-minute meditation.',
    'MentalClarity',
    'Perform the habit ''5-minute meditation'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: 5-minute meditation.',
    '🧘',
    'Easy',
    '5 minutes',
    ARRAY['Reduced stress', 'Better focus', 'Improved calm']
  ),
  (
    'Limit notifications',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: limit notifications.',
    'MentalClarity',
    'Perform the habit ''Limit notifications'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: limit notifications.',
    '🧠',
    'Easy',
    '5 minutes',
    ARRAY['Reduced digital overwhelm', 'Better attention span', 'Improved focus']
  ),
  (
    'Plan tomorrow tonight',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: plan tomorrow tonight.',
    'MentalClarity',
    'Perform the habit ''Plan tomorrow tonight'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: plan tomorrow tonight.',
    '📅',
    'Easy',
    '5 minutes',
    ARRAY['Improved mental clarity', 'Better focus', 'Reduced stress']
  ),
  (
    'Review goals daily',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: review goals daily.',
    'MentalClarity',
    'Perform the habit ''Review goals daily'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: review goals daily.',
    '🎯',
    'Easy',
    '5 minutes',
    ARRAY['Better organization', 'Improved productivity', 'Reduced decision fatigue']
  ),
  (
    'Do one hard thing first',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: do one hard thing first.',
    'MentalClarity',
    'Perform the habit ''Do one hard thing first'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: do one hard thing first.',
    '🧠',
    'Easy',
    '5 minutes',
    ARRAY['Improved mental clarity', 'Better focus', 'Reduced stress']
  ),
  (
    'Mental reset walk',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: mental reset walk.',
    'MentalClarity',
    'Perform the habit ''Mental reset walk'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: mental reset walk.',
    '🚶',
    'Easy',
    '5 minutes',
    ARRAY['Improved mood', 'Better energy', 'Reduced stress']
  ),
  (
    'Declutter workspace',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: declutter workspace.',
    'MentalClarity',
    'Perform the habit ''Declutter workspace'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: declutter workspace.',
    '🗂️',
    'Easy',
    '5 minutes',
    ARRAY['Improved mental clarity', 'Better focus', 'Reduced stress']
  ),
  (
    'Set clear intentions',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: set clear intentions.',
    'MentalClarity',
    'Perform the habit ''Set clear intentions'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: set clear intentions.',
    '🎯',
    'Easy',
    '5 minutes',
    ARRAY['Improved mental clarity', 'Better focus', 'Reduced stress']
  ),
  (
    'Drink water first thing',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: drink water first thing.',
    'MentalClarity',
    'Perform the habit ''Drink water first thing'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: drink water first thing.',
    '💧',
    'Easy',
    '5 minutes',
    ARRAY['Better hydration', 'Improved cognitive function', 'Increased energy']
  ),
  (
    'Practice silence for 1 min',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: practice silence for 1 min.',
    'MentalClarity',
    'Perform the habit ''Practice silence for 1 min'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: practice silence for 1 min.',
    '🤫',
    'Easy',
    '1 minute',
    ARRAY['Improved mental clarity', 'Better focus', 'Reduced stress']
  ),
  (
    'No-screen breakfast',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: no-screen breakfast.',
    'MentalClarity',
    'Perform the habit ''No-screen breakfast'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: no-screen breakfast.',
    '🍳',
    'Easy',
    '5 minutes',
    ARRAY['Reduced digital overwhelm', 'Better attention span', 'Improved focus']
  ),
  (
    'Slow breathing count',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: slow breathing count.',
    'MentalClarity',
    'Perform the habit ''Slow breathing count'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: slow breathing count.',
    '🌬️',
    'Easy',
    '5 minutes',
    ARRAY['Reduced stress', 'Better focus', 'Improved calm']
  ),
  (
    'Positive affirmation',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: positive affirmation.',
    'MentalClarity',
    'Perform the habit ''Positive affirmation'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: positive affirmation.',
    '💪',
    'Easy',
    '5 minutes',
    ARRAY['Improved mental clarity', 'Better focus', 'Reduced stress']
  ),
  (
    'Reset posture hourly',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: reset posture hourly.',
    'MentalClarity',
    'Perform the habit ''Reset posture hourly'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: reset posture hourly.',
    '🧍',
    'Easy',
    '2 minutes',
    ARRAY['Improved mental clarity', 'Better focus', 'Reduced stress']
  ),
  (
    'Avoid doom scrolling',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: avoid doom scrolling.',
    'MentalClarity',
    'Perform the habit ''Avoid doom scrolling'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: avoid doom scrolling.',
    '🧠',
    'Easy',
    '5 minutes',
    ARRAY['Improved mental clarity', 'Better focus', 'Reduced stress']
  ),
  (
    'Tidy desk end of day',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: tidy desk end of day.',
    'MentalClarity',
    'Perform the habit ''Tidy desk end of day'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: tidy desk end of day.',
    '🧠',
    'Easy',
    '5 minutes',
    ARRAY['Improved mental clarity', 'Better focus', 'Reduced stress']
  ),
  (
    'Reflect on wins',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: reflect on wins.',
    'MentalClarity',
    'Perform the habit ''Reflect on wins'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: reflect on wins.',
    '🏆',
    'Easy',
    '5 minutes',
    ARRAY['Improved mental clarity', 'Better focus', 'Reduced stress']
  ),
  (
    'Set hourly focus timer',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: set hourly focus timer.',
    'MentalClarity',
    'Perform the habit ''Set hourly focus timer'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: set hourly focus timer.',
    '⏰',
    'Easy',
    '2 minutes',
    ARRAY['Improved mental clarity', 'Better focus', 'Reduced stress']
  ),
  (
    'Visualize your day',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: visualize your day.',
    'MentalClarity',
    'Perform the habit ''Visualize your day'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: visualize your day.',
    '👁️',
    'Easy',
    '5 minutes',
    ARRAY['Improved mental clarity', 'Better focus', 'Reduced stress']
  ),
  (
    '5-minute sunlight exposure',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: 5-minute sunlight exposure.',
    'MentalClarity',
    'Perform the habit ''5-minute sunlight exposure'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: 5-minute sunlight exposure.',
    '☀️',
    'Easy',
    '5 minutes',
    ARRAY['Improved mood', 'Better energy', 'Reduced stress']
  ),
  (
    'Track distractions',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: track distractions.',
    'MentalClarity',
    'Perform the habit ''Track distractions'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: track distractions.',
    '🚫',
    'Easy',
    '5 minutes',
    ARRAY['Improved mental clarity', 'Better focus', 'Reduced stress']
  ),
  (
    'Practice mindful eating',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: practice mindful eating.',
    'MentalClarity',
    'Perform the habit ''Practice mindful eating'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: practice mindful eating.',
    '🍽️',
    'Easy',
    '5 minutes',
    ARRAY['Improved mental clarity', 'Better focus', 'Reduced stress']
  ),
  (
    'Plan breaks intentionally',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: plan breaks intentionally.',
    'MentalClarity',
    'Perform the habit ''Plan breaks intentionally'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: plan breaks intentionally.',
    '📅',
    'Easy',
    '5 minutes',
    ARRAY['Improved mental clarity', 'Better focus', 'Reduced stress']
  ),
  (
    'Organize work apps',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: organize work apps.',
    'MentalClarity',
    'Perform the habit ''Organize work apps'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: organize work apps.',
    '📱',
    'Easy',
    '5 minutes',
    ARRAY['Improved mental clarity', 'Better focus', 'Reduced stress']
  ),
  (
    'Create thought boundary',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: create thought boundary.',
    'MentalClarity',
    'Perform the habit ''Create thought boundary'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: create thought boundary.',
    '💭',
    'Easy',
    '5 minutes',
    ARRAY['Improved mental clarity', 'Better focus', 'Reduced stress']
  ),
  (
    'Practice mini grounding',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: practice mini grounding.',
    'MentalClarity',
    'Perform the habit ''Practice mini grounding'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: practice mini grounding.',
    '🌱',
    'Easy',
    '5 minutes',
    ARRAY['Improved mental clarity', 'Better focus', 'Reduced stress']
  ),
  (
    'Single-task meal',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: single-task meal.',
    'MentalClarity',
    'Perform the habit ''Single-task meal'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: single-task meal.',
    '✅',
    'Easy',
    '5 minutes',
    ARRAY['Improved mental clarity', 'Better focus', 'Reduced stress']
  ),
  (
    'Evening mental review',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: evening mental review.',
    'MentalClarity',
    'Perform the habit ''Evening mental review'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: evening mental review.',
    '🌙',
    'Easy',
    '5 minutes',
    ARRAY['Improved mental clarity', 'Better focus', 'Reduced stress']
  )
ON CONFLICT (name) DO NOTHING;

-- Verify the insertion
SELECT
  COUNT(*) as total_mental_clarity_habits,
  COUNT(*) FILTER (WHERE difficulty = 'Easy') as easy_habits,
  COUNT(*) FILTER (WHERE difficulty = 'Medium') as medium_habits,
  COUNT(*) FILTER (WHERE difficulty = 'Hard') as hard_habits
FROM public.habits_library
WHERE category = 'MentalClarity';

-- Show sample of inserted habits
SELECT name, difficulty, time_required, emoji
FROM public.habits_library
WHERE category = 'MentalClarity'
ORDER BY created_at DESC
LIMIT 10;
-- Add the 3 Missing Mental Clarity Habits
-- These habits were initially excluded because they existed in mockData.ts
-- However, they should also be in the database for completeness

INSERT INTO public.habits_library (
  name,
  description,
  category,
  instructions,
  expected_outcome,
  emoji,
  difficulty,
  time_required,
  benefits
) VALUES
  (
    '5-minute deep breathing',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: 5-minute deep breathing.',
    'MentalClarity',
    'Perform the habit ''5-minute deep breathing'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: 5-minute deep breathing.',
    '🌬️',
    'Easy',
    '5 minutes',
    ARRAY['Reduced stress', 'Improved focus', 'Better oxygen flow to brain']
  ),
  (
    'Write daily priorities',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: write daily priorities.',
    'MentalClarity',
    'Perform the habit ''Write daily priorities'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: write daily priorities.',
    '📝',
    'Easy',
    '5 minutes',
    ARRAY['Better organization', 'Improved productivity', 'Reduced decision fatigue']
  ),
  (
    'Digital detox break',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: digital detox break.',
    'MentalClarity',
    'Perform the habit ''Digital detox break'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: digital detox break.',
    '📵',
    'Easy',
    '10 minutes',
    ARRAY['Reduced digital overwhelm', 'Better attention span', 'Improved focus']
  )
ON CONFLICT (name) DO NOTHING;

-- Verify insertion
SELECT name, emoji, difficulty FROM public.habits_library
WHERE name IN ('5-minute deep breathing', 'Write daily priorities', 'Digital detox break');
