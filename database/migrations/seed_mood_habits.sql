-- Seed Mood Habits from habits_library.json
-- This migration adds 40 Mood habits to the habits_library table

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
    'Write 3 gratitude items',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: write 3 gratitude items.',
    'Mood',
    'Perform the habit ''Write 3 gratitude items'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: write 3 gratitude items.',
    '🙏',
    'Easy',
    '5 minutes',
    ARRAY['Better perspective', 'Increased positivity', 'Reduced negativity']
  ),
  (
    'Compliment someone',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: compliment someone.',
    'Mood',
    'Perform the habit ''Compliment someone'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: compliment someone.',
    '💬',
    'Easy',
    '5 minutes',
    ARRAY['Better mood', 'Improved wellbeing', 'Increased happiness']
  ),
  (
    '2-minute breathing',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: 2-minute breathing.',
    'Mood',
    'Perform the habit ''2-minute breathing'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: 2-minute breathing.',
    '🌬️',
    'Easy',
    '2 minutes',
    ARRAY['Reduced stress', 'Better calm', 'Improved focus']
  ),
  (
    'Walk outside',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: walk outside.',
    'Mood',
    'Perform the habit ''Walk outside'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: walk outside.',
    '🚶',
    'Easy',
    '5 minutes',
    ARRAY['Better mood', 'Fresh air', 'Improved energy']
  ),
  (
    'Journal emotions',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: journal emotions.',
    'Mood',
    'Perform the habit ''Journal emotions'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: journal emotions.',
    '📓',
    'Easy',
    '5 minutes',
    ARRAY['Emotional processing', 'Better awareness', 'Reduced stress']
  ),
  (
    'Talk to a friend',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: talk to a friend.',
    'Mood',
    'Perform the habit ''Talk to a friend'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: talk to a friend.',
    '👥',
    'Easy',
    '5 minutes',
    ARRAY['Social connection', 'Better mood', 'Reduced loneliness']
  ),
  (
    'Listen to music',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: listen to music.',
    'Mood',
    'Perform the habit ''Listen to music'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: listen to music.',
    '🎵',
    'Easy',
    '5 minutes',
    ARRAY['Better mood', 'Emotional uplift', 'Stress relief']
  ),
  (
    'Watch something funny',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: watch something funny.',
    'Mood',
    'Perform the habit ''Watch something funny'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: watch something funny.',
    '😂',
    'Easy',
    '5 minutes',
    ARRAY['Better mood', 'Improved wellbeing', 'Increased happiness']
  ),
  (
    'Stretch body',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: stretch body.',
    'Mood',
    'Perform the habit ''Stretch body'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: stretch body.',
    '🧘',
    'Easy',
    '5 minutes',
    ARRAY['Better mood', 'Improved wellbeing', 'Increased happiness']
  ),
  (
    'Drink water',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: drink water.',
    'Mood',
    'Perform the habit ''Drink water'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: drink water.',
    '💧',
    'Easy',
    '5 minutes',
    ARRAY['Better mood', 'Improved wellbeing', 'Increased happiness']
  ),
  (
    'Avoid negative news',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: avoid negative news.',
    'Mood',
    'Perform the habit ''Avoid negative news'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: avoid negative news.',
    '📰',
    'Easy',
    '5 minutes',
    ARRAY['Better mood', 'Improved wellbeing', 'Increased happiness']
  ),
  (
    'Practice self-kindness',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: practice self-kindness.',
    'Mood',
    'Perform the habit ''Practice self-kindness'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: practice self-kindness.',
    '💝',
    'Easy',
    '5 minutes',
    ARRAY['Better mood', 'Improved wellbeing', 'Increased happiness']
  ),
  (
    'Hug someone',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: hug someone.',
    'Mood',
    'Perform the habit ''Hug someone'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: hug someone.',
    '🤗',
    'Easy',
    '5 minutes',
    ARRAY['Better mood', 'Improved wellbeing', 'Increased happiness']
  ),
  (
    'Affirmations',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: affirmations.',
    'Mood',
    'Perform the habit ''Affirmations'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: affirmations.',
    '💪',
    'Easy',
    '5 minutes',
    ARRAY['Better mood', 'Improved wellbeing', 'Increased happiness']
  ),
  (
    'Do something creative',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: do something creative.',
    'Mood',
    'Perform the habit ''Do something creative'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: do something creative.',
    '🎨',
    'Easy',
    '5 minutes',
    ARRAY['Creative expression', 'Better mood', 'Stress relief']
  ),
  (
    'Spend time in nature',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: spend time in nature.',
    'Mood',
    'Perform the habit ''Spend time in nature'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: spend time in nature.',
    '🌳',
    'Easy',
    '5 minutes',
    ARRAY['Improved calm', 'Better mood', 'Stress reduction']
  ),
  (
    'Morning sunlight',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: morning sunlight.',
    'Mood',
    'Perform the habit ''Morning sunlight'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: morning sunlight.',
    '😊',
    'Easy',
    '5 minutes',
    ARRAY['Better mood', 'Improved wellbeing', 'Increased happiness']
  ),
  (
    'Write positive thoughts',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: write positive thoughts.',
    'Mood',
    'Perform the habit ''Write positive thoughts'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: write positive thoughts.',
    '😊',
    'Easy',
    '5 minutes',
    ARRAY['Better mood', 'Improved wellbeing', 'Increased happiness']
  ),
  (
    'Take break from phone',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: take break from phone.',
    'Mood',
    'Perform the habit ''Take break from phone'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: take break from phone.',
    '😊',
    'Easy',
    '5 minutes',
    ARRAY['Better mood', 'Improved wellbeing', 'Increased happiness']
  ),
  (
    'Declutter small area',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: declutter small area.',
    'Mood',
    'Perform the habit ''Declutter small area'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: declutter small area.',
    '😊',
    'Easy',
    '5 minutes',
    ARRAY['Better mood', 'Improved wellbeing', 'Increased happiness']
  ),
  (
    'Smile intentionally',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: smile intentionally.',
    'Mood',
    'Perform the habit ''Smile intentionally'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: smile intentionally.',
    '😊',
    'Easy',
    '5 minutes',
    ARRAY['Better mood', 'Improved wellbeing', 'Increased happiness']
  ),
  (
    'Check in with feelings',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: check in with feelings.',
    'Mood',
    'Perform the habit ''Check in with feelings'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: check in with feelings.',
    '😊',
    'Easy',
    '5 minutes',
    ARRAY['Better mood', 'Improved wellbeing', 'Increased happiness']
  ),
  (
    'Set small win goal',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: set small win goal.',
    'Mood',
    'Perform the habit ''Set small win goal'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: set small win goal.',
    '😊',
    'Easy',
    '5 minutes',
    ARRAY['Better mood', 'Improved wellbeing', 'Increased happiness']
  ),
  (
    'Celebrate tiny win',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: celebrate tiny win.',
    'Mood',
    'Perform the habit ''Celebrate tiny win'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: celebrate tiny win.',
    '😊',
    'Easy',
    '5 minutes',
    ARRAY['Better mood', 'Improved wellbeing', 'Increased happiness']
  ),
  (
    'Avoid complaining',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: avoid complaining.',
    'Mood',
    'Perform the habit ''Avoid complaining'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: avoid complaining.',
    '😊',
    'Easy',
    '5 minutes',
    ARRAY['Better mood', 'Improved wellbeing', 'Increased happiness']
  ),
  (
    'Forgive yourself',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: forgive yourself.',
    'Mood',
    'Perform the habit ''Forgive yourself'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: forgive yourself.',
    '😊',
    'Easy',
    '5 minutes',
    ARRAY['Better mood', 'Improved wellbeing', 'Increased happiness']
  ),
  (
    'Do mindful breathing',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: do mindful breathing.',
    'Mood',
    'Perform the habit ''Do mindful breathing'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: do mindful breathing.',
    '🌬️',
    'Easy',
    '5 minutes',
    ARRAY['Reduced stress', 'Better calm', 'Improved focus']
  ),
  (
    'Slow down morning',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: slow down morning.',
    'Mood',
    'Perform the habit ''Slow down morning'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: slow down morning.',
    '😊',
    'Easy',
    '5 minutes',
    ARRAY['Better mood', 'Improved wellbeing', 'Increased happiness']
  ),
  (
    'Eat nourishing food',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: eat nourishing food.',
    'Mood',
    'Perform the habit ''Eat nourishing food'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: eat nourishing food.',
    '😊',
    'Easy',
    '5 minutes',
    ARRAY['Better mood', 'Improved wellbeing', 'Increased happiness']
  ),
  (
    'Dance for 1 minute',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: dance for 1 minute.',
    'Mood',
    'Perform the habit ''Dance for 1 minute'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: dance for 1 minute.',
    '😊',
    'Easy',
    '1 minute',
    ARRAY['Better mood', 'Improved wellbeing', 'Increased happiness']
  ),
  (
    'Check posture',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: check posture.',
    'Mood',
    'Perform the habit ''Check posture'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: check posture.',
    '😊',
    'Easy',
    '5 minutes',
    ARRAY['Better mood', 'Improved wellbeing', 'Increased happiness']
  ),
  (
    'Do something relaxing',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: do something relaxing.',
    'Mood',
    'Perform the habit ''Do something relaxing'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: do something relaxing.',
    '😊',
    'Easy',
    '5 minutes',
    ARRAY['Better mood', 'Improved wellbeing', 'Increased happiness']
  ),
  (
    'Connect with loved one',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: connect with loved one.',
    'Mood',
    'Perform the habit ''Connect with loved one'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: connect with loved one.',
    '😊',
    'Easy',
    '5 minutes',
    ARRAY['Better mood', 'Improved wellbeing', 'Increased happiness']
  ),
  (
    'Practice acceptance',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: practice acceptance.',
    'Mood',
    'Perform the habit ''Practice acceptance'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: practice acceptance.',
    '😊',
    'Easy',
    '5 minutes',
    ARRAY['Better mood', 'Improved wellbeing', 'Increased happiness']
  ),
  (
    'Reflect on good moments',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: reflect on good moments.',
    'Mood',
    'Perform the habit ''Reflect on good moments'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: reflect on good moments.',
    '😊',
    'Easy',
    '5 minutes',
    ARRAY['Better mood', 'Improved wellbeing', 'Increased happiness']
  ),
  (
    'Limit social media',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: limit social media.',
    'Mood',
    'Perform the habit ''Limit social media'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: limit social media.',
    '😊',
    'Easy',
    '5 minutes',
    ARRAY['Better mood', 'Improved wellbeing', 'Increased happiness']
  ),
  (
    'Say thank you',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: say thank you.',
    'Mood',
    'Perform the habit ''Say thank you'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: say thank you.',
    '😊',
    'Easy',
    '5 minutes',
    ARRAY['Better mood', 'Improved wellbeing', 'Increased happiness']
  ),
  (
    'Practice deep breaths',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: practice deep breaths.',
    'Mood',
    'Perform the habit ''Practice deep breaths'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: practice deep breaths.',
    '🌬️',
    'Easy',
    '5 minutes',
    ARRAY['Better mood', 'Improved wellbeing', 'Increased happiness']
  ),
  (
    'Journal gratitude',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: journal gratitude.',
    'Mood',
    'Perform the habit ''Journal gratitude'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: journal gratitude.',
    '🙏',
    'Easy',
    '5 minutes',
    ARRAY['Better perspective', 'Increased positivity', 'Reduced negativity']
  ),
  (
    'Stretch upper body',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: stretch upper body.',
    'Mood',
    'Perform the habit ''Stretch upper body'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: stretch upper body.',
    '🧘',
    'Easy',
    '5 minutes',
    ARRAY['Better mood', 'Improved wellbeing', 'Increased happiness']
  )
ON CONFLICT (name) DO NOTHING;

-- Verify the insertion
SELECT COUNT(*) as total_mood_habits FROM public.habits_library WHERE category = 'Mood';

-- Show sample of inserted habits
SELECT name, difficulty, time_required, emoji FROM public.habits_library
WHERE category = 'Mood' ORDER BY created_at DESC LIMIT 10;
