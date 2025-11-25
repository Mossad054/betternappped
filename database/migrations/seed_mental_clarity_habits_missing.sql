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
