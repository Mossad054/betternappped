-- Seed Anxiety Habits from habits_library.json
-- This migration adds 40 Anxiety habits to the habits_library table

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
    '5 deep breaths',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: 5 deep breaths.',
    'Anxiety',
    'Perform the habit ''5 deep breaths'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: 5 deep breaths.',
    '🧘',
    'Easy',
    '5 minutes',
    ARRAY['Reduced anxiety', 'Better calm', 'Improved mindfulness']
  ),
  (
    'Grounding exercise',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: grounding exercise.',
    'Anxiety',
    'Perform the habit ''Grounding exercise'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: grounding exercise.',
    '🌱',
    'Easy',
    '5 minutes',
    ARRAY['Reduced anxiety', 'Better calm', 'Improved mindfulness']
  ),
  (
    'Drink water slowly',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: drink water slowly.',
    'Anxiety',
    'Perform the habit ''Drink water slowly'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: drink water slowly.',
    '🧘',
    'Easy',
    '5 minutes',
    ARRAY['Reduced anxiety', 'Better calm', 'Improved mindfulness']
  ),
  (
    'Step outside for air',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: step outside for air.',
    'Anxiety',
    'Perform the habit ''Step outside for air'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: step outside for air.',
    '🧘',
    'Easy',
    '5 minutes',
    ARRAY['Reduced anxiety', 'Better calm', 'Improved mindfulness']
  ),
  (
    'Journal anxious thoughts',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: journal anxious thoughts.',
    'Anxiety',
    'Perform the habit ''Journal anxious thoughts'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: journal anxious thoughts.',
    '🧘',
    'Easy',
    '5 minutes',
    ARRAY['Reduced anxiety', 'Better calm', 'Improved mindfulness']
  ),
  (
    'Write what you can control',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: write what you can control.',
    'Anxiety',
    'Perform the habit ''Write what you can control'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: write what you can control.',
    '🧘',
    'Easy',
    '5 minutes',
    ARRAY['Reduced anxiety', 'Better calm', 'Improved mindfulness']
  ),
  (
    'Listen to calm music',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: listen to calm music.',
    'Anxiety',
    'Perform the habit ''Listen to calm music'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: listen to calm music.',
    '🧘',
    'Easy',
    '5 minutes',
    ARRAY['Reduced anxiety', 'Better calm', 'Improved mindfulness']
  ),
  (
    'Stretch neck/shoulders',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: stretch neck/shoulders.',
    'Anxiety',
    'Perform the habit ''Stretch neck/shoulders'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: stretch neck/shoulders.',
    '🧘',
    'Easy',
    '5 minutes',
    ARRAY['Reduced anxiety', 'Better calm', 'Improved mindfulness']
  ),
  (
    'Do 1-minute meditation',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: do 1-minute meditation.',
    'Anxiety',
    'Perform the habit ''Do 1-minute meditation'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: do 1-minute meditation.',
    '🧘',
    'Easy',
    '1 minute',
    ARRAY['Reduced anxiety', 'Better calm', 'Improved mindfulness']
  ),
  (
    'Reduce caffeine',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: reduce caffeine.',
    'Anxiety',
    'Perform the habit ''Reduce caffeine'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: reduce caffeine.',
    '🧘',
    'Easy',
    '5 minutes',
    ARRAY['Reduced anxiety', 'Better calm', 'Improved mindfulness']
  ),
  (
    'Slow walking',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: slow walking.',
    'Anxiety',
    'Perform the habit ''Slow walking'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: slow walking.',
    '🧘',
    'Easy',
    '5 minutes',
    ARRAY['Reduced anxiety', 'Better calm', 'Improved mindfulness']
  ),
  (
    'Hold warm cup',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: hold warm cup.',
    'Anxiety',
    'Perform the habit ''Hold warm cup'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: hold warm cup.',
    '🧘',
    'Easy',
    '5 minutes',
    ARRAY['Reduced anxiety', 'Better calm', 'Improved mindfulness']
  ),
  (
    'Practice gratitude',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: practice gratitude.',
    'Anxiety',
    'Perform the habit ''Practice gratitude'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: practice gratitude.',
    '🧘',
    'Easy',
    '5 minutes',
    ARRAY['Reduced anxiety', 'Better calm', 'Improved mindfulness']
  ),
  (
    'Speak positive affirmation',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: speak positive affirmation.',
    'Anxiety',
    'Perform the habit ''Speak positive affirmation'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: speak positive affirmation.',
    '🧘',
    'Easy',
    '5 minutes',
    ARRAY['Reduced anxiety', 'Better calm', 'Improved mindfulness']
  ),
  (
    'Limit social media',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: limit social media.',
    'Anxiety',
    'Perform the habit ''Limit social media'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: limit social media.',
    '🧘',
    'Easy',
    '5 minutes',
    ARRAY['Reduced anxiety', 'Better calm', 'Improved mindfulness']
  ),
  (
    'Take mindful pause',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: take mindful pause.',
    'Anxiety',
    'Perform the habit ''Take mindful pause'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: take mindful pause.',
    '🧘',
    'Easy',
    '5 minutes',
    ARRAY['Reduced anxiety', 'Better calm', 'Improved mindfulness']
  ),
  (
    'Declutter small space',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: declutter small space.',
    'Anxiety',
    'Perform the habit ''Declutter small space'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: declutter small space.',
    '🧘',
    'Easy',
    '5 minutes',
    ARRAY['Reduced anxiety', 'Better calm', 'Improved mindfulness']
  ),
  (
    'Progressive muscle relaxation',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: progressive muscle relaxation.',
    'Anxiety',
    'Perform the habit ''Progressive muscle relaxation'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: progressive muscle relaxation.',
    '🧘',
    'Easy',
    '5 minutes',
    ARRAY['Reduced anxiety', 'Better calm', 'Improved mindfulness']
  ),
  (
    'Check breathing rate',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: check breathing rate.',
    'Anxiety',
    'Perform the habit ''Check breathing rate'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: check breathing rate.',
    '🫁',
    'Easy',
    '5 minutes',
    ARRAY['Reduced anxiety', 'Better calm', 'Improved mindfulness']
  ),
  (
    'Slow exhale practice',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: slow exhale practice.',
    'Anxiety',
    'Perform the habit ''Slow exhale practice'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: slow exhale practice.',
    '🧘',
    'Easy',
    '5 minutes',
    ARRAY['Reduced anxiety', 'Better calm', 'Improved mindfulness']
  ),
  (
    'Avoid stressful news',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: avoid stressful news.',
    'Anxiety',
    'Perform the habit ''Avoid stressful news'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: avoid stressful news.',
    '🧘',
    'Easy',
    '5 minutes',
    ARRAY['Reduced anxiety', 'Better calm', 'Improved mindfulness']
  ),
  (
    'Sit quietly for 1 min',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: sit quietly for 1 min.',
    'Anxiety',
    'Perform the habit ''Sit quietly for 1 min'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: sit quietly for 1 min.',
    '🧘',
    'Easy',
    '1 minute',
    ARRAY['Reduced anxiety', 'Better calm', 'Improved mindfulness']
  ),
  (
    'Practice grounding 5-4-3-2-1',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: practice grounding 5-4-3-2-1.',
    'Anxiety',
    'Perform the habit ''Practice grounding 5-4-3-2-1'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: practice grounding 5-4-3-2-1.',
    '🌱',
    'Easy',
    '5 minutes',
    ARRAY['Reduced anxiety', 'Better calm', 'Improved mindfulness']
  ),
  (
    'Journal worries',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: journal worries.',
    'Anxiety',
    'Perform the habit ''Journal worries'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: journal worries.',
    '🧘',
    'Easy',
    '5 minutes',
    ARRAY['Reduced anxiety', 'Better calm', 'Improved mindfulness']
  ),
  (
    'Warm shower',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: warm shower.',
    'Anxiety',
    'Perform the habit ''Warm shower'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: warm shower.',
    '🧘',
    'Easy',
    '5 minutes',
    ARRAY['Reduced anxiety', 'Better calm', 'Improved mindfulness']
  ),
  (
    'Plan small task',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: plan small task.',
    'Anxiety',
    'Perform the habit ''Plan small task'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: plan small task.',
    '🧘',
    'Easy',
    '5 minutes',
    ARRAY['Reduced anxiety', 'Better calm', 'Improved mindfulness']
  ),
  (
    'Take mental break',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: take mental break.',
    'Anxiety',
    'Perform the habit ''Take mental break'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: take mental break.',
    '🧘',
    'Easy',
    '5 minutes',
    ARRAY['Reduced anxiety', 'Better calm', 'Improved mindfulness']
  ),
  (
    'Do creative activity',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: do creative activity.',
    'Anxiety',
    'Perform the habit ''Do creative activity'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: do creative activity.',
    '🧘',
    'Easy',
    '5 minutes',
    ARRAY['Reduced anxiety', 'Better calm', 'Improved mindfulness']
  ),
  (
    'Drink herbal tea',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: drink herbal tea.',
    'Anxiety',
    'Perform the habit ''Drink herbal tea'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: drink herbal tea.',
    '🧘',
    'Easy',
    '5 minutes',
    ARRAY['Reduced anxiety', 'Better calm', 'Improved mindfulness']
  ),
  (
    'Practice acceptance',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: practice acceptance.',
    'Anxiety',
    'Perform the habit ''Practice acceptance'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: practice acceptance.',
    '🧘',
    'Easy',
    '5 minutes',
    ARRAY['Reduced anxiety', 'Better calm', 'Improved mindfulness']
  ),
  (
    'Write reassurance note',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: write reassurance note.',
    'Anxiety',
    'Perform the habit ''Write reassurance note'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: write reassurance note.',
    '🧘',
    'Easy',
    '5 minutes',
    ARRAY['Reduced anxiety', 'Better calm', 'Improved mindfulness']
  ),
  (
    'Use calming scent',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: use calming scent.',
    'Anxiety',
    'Perform the habit ''Use calming scent'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: use calming scent.',
    '🧘',
    'Easy',
    '5 minutes',
    ARRAY['Reduced anxiety', 'Better calm', 'Improved mindfulness']
  ),
  (
    'Walk barefoot grass',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: walk barefoot grass.',
    'Anxiety',
    'Perform the habit ''Walk barefoot grass'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: walk barefoot grass.',
    '🧘',
    'Easy',
    '5 minutes',
    ARRAY['Reduced anxiety', 'Better calm', 'Improved mindfulness']
  ),
  (
    'Take sunlight break',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: take sunlight break.',
    'Anxiety',
    'Perform the habit ''Take sunlight break'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: take sunlight break.',
    '🧘',
    'Easy',
    '5 minutes',
    ARRAY['Reduced anxiety', 'Better calm', 'Improved mindfulness']
  ),
  (
    'Limit overstimulation',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: limit overstimulation.',
    'Anxiety',
    'Perform the habit ''Limit overstimulation'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: limit overstimulation.',
    '🧘',
    'Easy',
    '5 minutes',
    ARRAY['Reduced anxiety', 'Better calm', 'Improved mindfulness']
  ),
  (
    'Check posture',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: check posture.',
    'Anxiety',
    'Perform the habit ''Check posture'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: check posture.',
    '🧘',
    'Easy',
    '5 minutes',
    ARRAY['Reduced anxiety', 'Better calm', 'Improved mindfulness']
  ),
  (
    'Relax jaw',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: relax jaw.',
    'Anxiety',
    'Perform the habit ''Relax jaw'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: relax jaw.',
    '🧘',
    'Easy',
    '5 minutes',
    ARRAY['Reduced anxiety', 'Better calm', 'Improved mindfulness']
  ),
  (
    'Reduce noise',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: reduce noise.',
    'Anxiety',
    'Perform the habit ''Reduce noise'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: reduce noise.',
    '🧘',
    'Easy',
    '5 minutes',
    ARRAY['Reduced anxiety', 'Better calm', 'Improved mindfulness']
  ),
  (
    'Focus on one task',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: focus on one task.',
    'Anxiety',
    'Perform the habit ''Focus on one task'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: focus on one task.',
    '🧘',
    'Easy',
    '5 minutes',
    ARRAY['Reduced anxiety', 'Better calm', 'Improved mindfulness']
  ),
  (
    'Do slow breathing cycle',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: do slow breathing cycle.',
    'Anxiety',
    'Perform the habit ''Do slow breathing cycle'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: do slow breathing cycle.',
    '🫁',
    'Easy',
    '5 minutes',
    ARRAY['Reduced anxiety', 'Better calm', 'Improved mindfulness']
  )
ON CONFLICT (name) DO NOTHING;

-- Verify the insertion
SELECT COUNT(*) as total_anxiety_habits FROM public.habits_library WHERE category = 'Anxiety';

-- Show sample of inserted habits
SELECT name, difficulty, time_required, emoji FROM public.habits_library
WHERE category = 'Anxiety' ORDER BY created_at DESC LIMIT 10;
