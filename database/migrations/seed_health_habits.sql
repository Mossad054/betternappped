-- Seed Health Habits from habits_library.json
-- This migration adds 40 Health habits to the habits_library table

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
    '10-minute walk',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: 10-minute walk.',
    'Health',
    'Perform the habit ''10-minute walk'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: 10-minute walk.',
    '🚶',
    'Easy',
    '10 minutes',
    ARRAY['Better circulation', 'Improved mood', 'Increased energy']
  ),
  (
    'Drink 1 glass of water',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: drink 1 glass of water.',
    'Health',
    'Perform the habit ''Drink 1 glass of water'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: drink 1 glass of water.',
    '💧',
    'Easy',
    '1 minute',
    ARRAY['Better hydration', 'Improved cognitive function', 'Increased energy']
  ),
  (
    'Stretch for 5 mins',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: stretch for 5 mins.',
    'Health',
    'Perform the habit ''Stretch for 5 mins'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: stretch for 5 mins.',
    '🤸',
    'Easy',
    '5 minutes',
    ARRAY['Better flexibility', 'Reduced tension', 'Improved posture']
  ),
  (
    'Eat 1 fruit',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: eat 1 fruit.',
    'Health',
    'Perform the habit ''Eat 1 fruit'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: eat 1 fruit.',
    '🍎',
    'Easy',
    '5 minutes',
    ARRAY['Better nutrition', 'Natural vitamins', 'Improved digestion']
  ),
  (
    'Healthy breakfast',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: healthy breakfast.',
    'Health',
    'Perform the habit ''Healthy breakfast'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: healthy breakfast.',
    '🍳',
    'Easy',
    '5 minutes',
    ARRAY['Better energy', 'Improved focus', 'Stable blood sugar']
  ),
  (
    'Take vitamins',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: take vitamins.',
    'Health',
    'Perform the habit ''Take vitamins'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: take vitamins.',
    '💊',
    'Easy',
    '5 minutes',
    ARRAY['Nutrient support', 'Better immunity', 'Improved health']
  ),
  (
    'Walk after meals',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: walk after meals.',
    'Health',
    'Perform the habit ''Walk after meals'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: walk after meals.',
    '🚶',
    'Easy',
    '5 minutes',
    ARRAY['Better circulation', 'Improved mood', 'Increased energy']
  ),
  (
    'Balance meal plate',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: balance meal plate.',
    'Health',
    'Perform the habit ''Balance meal plate'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: balance meal plate.',
    '🍽️',
    'Medium',
    '5 minutes',
    ARRAY['Improved health', 'Better wellbeing', 'Increased vitality']
  ),
  (
    'Reduce sugar intake',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: reduce sugar intake.',
    'Health',
    'Perform the habit ''Reduce sugar intake'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: reduce sugar intake.',
    '🍬',
    'Easy',
    '5 minutes',
    ARRAY['Stable blood sugar', 'Better energy', 'Improved health']
  ),
  (
    'Sleep before 11pm',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: sleep before 11pm.',
    'Health',
    'Perform the habit ''Sleep before 11pm'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: sleep before 11pm.',
    '🛏️',
    'Easy',
    '5 minutes',
    ARRAY['Better sleep', 'Improved recovery', 'More energy']
  ),
  (
    'Stand every hour',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: stand every hour.',
    'Health',
    'Perform the habit ''Stand every hour'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: stand every hour.',
    '🧍',
    'Easy',
    '5 minutes',
    ARRAY['Better alignment', 'Reduced pain', 'Improved breathing']
  ),
  (
    'Hydrate morning',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: hydrate morning.',
    'Health',
    'Perform the habit ''Hydrate morning'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: hydrate morning.',
    '💧',
    'Easy',
    '5 minutes',
    ARRAY['Better hydration', 'Improved cognitive function', 'Increased energy']
  ),
  (
    'Healthy snack swap',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: healthy snack swap.',
    'Health',
    'Perform the habit ''Healthy snack swap'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: healthy snack swap.',
    '🥕',
    'Easy',
    '5 minutes',
    ARRAY['Improved health', 'Better wellbeing', 'Increased vitality']
  ),
  (
    'Limit caffeine',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: limit caffeine.',
    'Health',
    'Perform the habit ''Limit caffeine'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: limit caffeine.',
    '☕',
    'Easy',
    '5 minutes',
    ARRAY['Improved health', 'Better wellbeing', 'Increased vitality']
  ),
  (
    'Home-cooked meal',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: home-cooked meal.',
    'Health',
    'Perform the habit ''Home-cooked meal'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: home-cooked meal.',
    '🍽️',
    'Medium',
    '30 minutes',
    ARRAY['Improved health', 'Better wellbeing', 'Increased vitality']
  ),
  (
    'Bodyweight workout',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: bodyweight workout.',
    'Health',
    'Perform the habit ''Bodyweight workout'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: bodyweight workout.',
    '💪',
    'Medium',
    '15 minutes',
    ARRAY['Better strength', 'Improved fitness', 'Increased energy']
  ),
  (
    'Track water intake',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: track water intake.',
    'Health',
    'Perform the habit ''Track water intake'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: track water intake.',
    '💧',
    'Easy',
    '5 minutes',
    ARRAY['Better hydration', 'Improved cognitive function', 'Increased energy']
  ),
  (
    'Take deep breaths',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: take deep breaths.',
    'Health',
    'Perform the habit ''Take deep breaths'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: take deep breaths.',
    '🌬️',
    'Easy',
    '5 minutes',
    ARRAY['Reduced stress', 'Better oxygenation', 'Improved calm']
  ),
  (
    'Meal prep Sunday',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: meal prep sunday.',
    'Health',
    'Perform the habit ''Meal prep Sunday'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: meal prep sunday.',
    '🍽️',
    'Medium',
    '60 minutes',
    ARRAY['Improved health', 'Better wellbeing', 'Increased vitality']
  ),
  (
    'Avoid junk food',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: avoid junk food.',
    'Health',
    'Perform the habit ''Avoid junk food'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: avoid junk food.',
    '🚫',
    'Easy',
    '5 minutes',
    ARRAY['Stable blood sugar', 'Better energy', 'Improved health']
  ),
  (
    'Add veggies to meal',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: add veggies to meal.',
    'Health',
    'Perform the habit ''Add veggies to meal'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: add veggies to meal.',
    '🍽️',
    'Easy',
    '5 minutes',
    ARRAY['Better nutrition', 'Natural vitamins', 'Improved digestion']
  ),
  (
    'Daily sunlight',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: daily sunlight.',
    'Health',
    'Perform the habit ''Daily sunlight'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: daily sunlight.',
    '☀️',
    'Easy',
    '5 minutes',
    ARRAY['Vitamin D', 'Better mood', 'Improved sleep']
  ),
  (
    'Maintain good posture',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: maintain good posture.',
    'Health',
    'Perform the habit ''Maintain good posture'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: maintain good posture.',
    '🧍',
    'Medium',
    '5 minutes',
    ARRAY['Better alignment', 'Reduced pain', 'Improved breathing']
  ),
  (
    'Reduce late-night eating',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: reduce late-night eating.',
    'Health',
    'Perform the habit ''Reduce late-night eating'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: reduce late-night eating.',
    '🍴',
    'Easy',
    '5 minutes',
    ARRAY['Improved health', 'Better wellbeing', 'Increased vitality']
  ),
  (
    'No sugary drink',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: no sugary drink.',
    'Health',
    'Perform the habit ''No sugary drink'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: no sugary drink.',
    '🍬',
    'Easy',
    '5 minutes',
    ARRAY['Stable blood sugar', 'Better energy', 'Improved health']
  ),
  (
    'Drink herbal tea',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: drink herbal tea.',
    'Health',
    'Perform the habit ''Drink herbal tea'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: drink herbal tea.',
    '🥤',
    'Easy',
    '5 minutes',
    ARRAY['Improved health', 'Better wellbeing', 'Increased vitality']
  ),
  (
    'Healthy lunch',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: healthy lunch.',
    'Health',
    'Perform the habit ''Healthy lunch'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: healthy lunch.',
    '🥗',
    'Easy',
    '5 minutes',
    ARRAY['Better energy', 'Improved focus', 'Stable blood sugar']
  ),
  (
    'Limit fried foods',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: limit fried foods.',
    'Health',
    'Perform the habit ''Limit fried foods'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: limit fried foods.',
    '🍟',
    'Easy',
    '5 minutes',
    ARRAY['Stable blood sugar', 'Better energy', 'Improved health']
  ),
  (
    'Eat slowly',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: eat slowly.',
    'Health',
    'Perform the habit ''Eat slowly'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: eat slowly.',
    '🍽️',
    'Easy',
    '5 minutes',
    ARRAY['Improved health', 'Better wellbeing', 'Increased vitality']
  ),
  (
    '10 push-ups',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: 10 push-ups.',
    'Health',
    'Perform the habit ''10 push-ups'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: 10 push-ups.',
    '🏋️',
    'Easy',
    '5 minutes',
    ARRAY['Better strength', 'Improved fitness', 'Increased energy']
  ),
  (
    'Take probiotics',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: take probiotics.',
    'Health',
    'Perform the habit ''Take probiotics'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: take probiotics.',
    '🦠',
    'Easy',
    '5 minutes',
    ARRAY['Nutrient support', 'Better immunity', 'Improved health']
  ),
  (
    'Warm-up stretches',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: warm-up stretches.',
    'Health',
    'Perform the habit ''Warm-up stretches'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: warm-up stretches.',
    '🤸',
    'Easy',
    '5 minutes',
    ARRAY['Better flexibility', 'Reduced tension', 'Improved posture']
  ),
  (
    'Healthy dessert swap',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: healthy dessert swap.',
    'Health',
    'Perform the habit ''Healthy dessert swap'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: healthy dessert swap.',
    '🍓',
    'Easy',
    '5 minutes',
    ARRAY['Improved health', 'Better wellbeing', 'Increased vitality']
  ),
  (
    'Track food intake',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: track food intake.',
    'Health',
    'Perform the habit ''Track food intake'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: track food intake.',
    '📊',
    'Medium',
    '5 minutes',
    ARRAY['Better awareness', 'Improved nutrition', 'Accountability']
  ),
  (
    'Avoid overeating',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: avoid overeating.',
    'Health',
    'Perform the habit ''Avoid overeating'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: avoid overeating.',
    '🍴',
    'Easy',
    '5 minutes',
    ARRAY['Improved health', 'Better wellbeing', 'Increased vitality']
  ),
  (
    'Daily movement goal',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: daily movement goal.',
    'Health',
    'Perform the habit ''Daily movement goal'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: daily movement goal.',
    '👟',
    'Easy',
    '5 minutes',
    ARRAY['Improved health', 'Better wellbeing', 'Increased vitality']
  ),
  (
    'Healthy hydration',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: healthy hydration.',
    'Health',
    'Perform the habit ''Healthy hydration'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: healthy hydration.',
    '💧',
    'Easy',
    '5 minutes',
    ARRAY['Better hydration', 'Improved cognitive function', 'Increased energy']
  ),
  (
    'Replace snack with nuts',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: replace snack with nuts.',
    'Health',
    'Perform the habit ''Replace snack with nuts'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: replace snack with nuts.',
    '🥕',
    'Easy',
    '5 minutes',
    ARRAY['Improved health', 'Better wellbeing', 'Increased vitality']
  ),
  (
    'Take stairs',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: take stairs.',
    'Health',
    'Perform the habit ''Take stairs'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: take stairs.',
    '🪜',
    'Easy',
    '5 minutes',
    ARRAY['Improved health', 'Better wellbeing', 'Increased vitality']
  ),
  (
    'Practice mindful cooking',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: practice mindful cooking.',
    'Health',
    'Perform the habit ''Practice mindful cooking'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: practice mindful cooking.',
    '👨‍🍳',
    'Medium',
    '30 minutes',
    ARRAY['Improved health', 'Better wellbeing', 'Increased vitality']
  )
ON CONFLICT (name) DO NOTHING;

-- Verify the insertion
SELECT
  COUNT(*) as total_health_habits,
  COUNT(*) FILTER (WHERE difficulty = 'Easy') as easy_habits,
  COUNT(*) FILTER (WHERE difficulty = 'Medium') as medium_habits,
  COUNT(*) FILTER (WHERE difficulty = 'Hard') as hard_habits
FROM public.habits_library
WHERE category = 'Health';

-- Show sample of inserted habits
SELECT name, difficulty, time_required, emoji
FROM public.habits_library
WHERE category = 'Health'
ORDER BY created_at DESC
LIMIT 10;
