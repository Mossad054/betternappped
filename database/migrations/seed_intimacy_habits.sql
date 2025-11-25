-- Seed Intimacy Habits from habits_library.json
-- This migration adds 40 Intimacy habits to the habits_library table

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
    'Share appreciation with partner',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: share appreciation with partner.',
    'Intimacy',
    'Perform the habit ''Share appreciation with partner'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: share appreciation with partner.',
    '💝',
    'Easy',
    '5 minutes',
    ARRAY['Better connection', 'Increased gratitude', 'Stronger bond']
  ),
  (
    'Send loving message',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: send loving message.',
    'Intimacy',
    'Perform the habit ''Send loving message'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: send loving message.',
    '💌',
    'Easy',
    '5 minutes',
    ARRAY['Better connection', 'Deeper intimacy', 'Stronger relationship']
  ),
  (
    'Hug for 20 seconds',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: hug for 20 seconds.',
    'Intimacy',
    'Perform the habit ''Hug for 20 seconds'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: hug for 20 seconds.',
    '🤗',
    'Easy',
    '5 minutes',
    ARRAY['Physical connection', 'Better intimacy', 'Stronger bond']
  ),
  (
    'Hold eye contact',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: hold eye contact.',
    'Intimacy',
    'Perform the habit ''Hold eye contact'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: hold eye contact.',
    '👁️',
    'Easy',
    '5 minutes',
    ARRAY['Better connection', 'Deeper intimacy', 'Stronger relationship']
  ),
  (
    'Ask partner about their day',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: ask partner about their day.',
    'Intimacy',
    'Perform the habit ''Ask partner about their day'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: ask partner about their day.',
    '💕',
    'Easy',
    '5 minutes',
    ARRAY['Better connection', 'Deeper intimacy', 'Stronger relationship']
  ),
  (
    'Plan 5-min connection ritual',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: plan 5-min connection ritual.',
    'Intimacy',
    'Perform the habit ''Plan 5-min connection ritual'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: plan 5-min connection ritual.',
    '💕',
    'Medium',
    '5 minutes',
    ARRAY['Better connection', 'Deeper intimacy', 'Stronger relationship']
  ),
  (
    'Compliment partner',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: compliment partner.',
    'Intimacy',
    'Perform the habit ''Compliment partner'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: compliment partner.',
    '💕',
    'Easy',
    '5 minutes',
    ARRAY['Better connection', 'Increased gratitude', 'Stronger bond']
  ),
  (
    'Practice active listening',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: practice active listening.',
    'Intimacy',
    'Perform the habit ''Practice active listening'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: practice active listening.',
    '👂',
    'Medium',
    '5 minutes',
    ARRAY['Better listening', 'Increased understanding', 'Improved trust']
  ),
  (
    'Hold hands',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: hold hands.',
    'Intimacy',
    'Perform the habit ''Hold hands'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: hold hands.',
    '🤝',
    'Easy',
    '5 minutes',
    ARRAY['Better connection', 'Deeper intimacy', 'Stronger relationship']
  ),
  (
    'Share emotional check-in',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: share emotional check-in.',
    'Intimacy',
    'Perform the habit ''Share emotional check-in'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: share emotional check-in.',
    '💭',
    'Easy',
    '5 minutes',
    ARRAY['Better connection', 'Deeper intimacy', 'Stronger relationship']
  ),
  (
    'Touch intentionally',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: touch intentionally.',
    'Intimacy',
    'Perform the habit ''Touch intentionally'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: touch intentionally.',
    '🤲',
    'Easy',
    '5 minutes',
    ARRAY['Physical connection', 'Better intimacy', 'Stronger bond']
  ),
  (
    'Share gratitude',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: share gratitude.',
    'Intimacy',
    'Perform the habit ''Share gratitude'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: share gratitude.',
    '💝',
    'Easy',
    '5 minutes',
    ARRAY['Better connection', 'Deeper intimacy', 'Stronger relationship']
  ),
  (
    'Do a small act of kindness',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: do a small act of kindness.',
    'Intimacy',
    'Perform the habit ''Do a small act of kindness'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: do a small act of kindness.',
    '💕',
    'Easy',
    '5 minutes',
    ARRAY['Better connection', 'Deeper intimacy', 'Stronger relationship']
  ),
  (
    'Ask partner needs',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: ask partner needs.',
    'Intimacy',
    'Perform the habit ''Ask partner needs'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: ask partner needs.',
    '💕',
    'Easy',
    '5 minutes',
    ARRAY['Better connection', 'Deeper intimacy', 'Stronger relationship']
  ),
  (
    'Sit together quietly',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: sit together quietly.',
    'Intimacy',
    'Perform the habit ''Sit together quietly'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: sit together quietly.',
    '💕',
    'Easy',
    '5 minutes',
    ARRAY['Better connection', 'Deeper intimacy', 'Stronger relationship']
  ),
  (
    'Cook together',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: cook together.',
    'Intimacy',
    'Perform the habit ''Cook together'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: cook together.',
    '👨‍🍳',
    'Medium',
    '30 minutes',
    ARRAY['Better connection', 'Deeper intimacy', 'Stronger relationship']
  ),
  (
    'Plan intimacy time',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: plan intimacy time.',
    'Intimacy',
    'Perform the habit ''Plan intimacy time'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: plan intimacy time.',
    '💕',
    'Medium',
    '10 minutes',
    ARRAY['Better connection', 'Deeper intimacy', 'Stronger relationship']
  ),
  (
    'Give a gentle massage',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: give a gentle massage.',
    'Intimacy',
    'Perform the habit ''Give a gentle massage'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: give a gentle massage.',
    '💆',
    'Easy',
    '10 minutes',
    ARRAY['Better connection', 'Deeper intimacy', 'Stronger relationship']
  ),
  (
    'Practice breathing together',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: practice breathing together.',
    'Intimacy',
    'Perform the habit ''Practice breathing together'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: practice breathing together.',
    '🌬️',
    'Easy',
    '5 minutes',
    ARRAY['Better connection', 'Deeper intimacy', 'Stronger relationship']
  ),
  (
    'Share personal thought',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: share personal thought.',
    'Intimacy',
    'Perform the habit ''Share personal thought'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: share personal thought.',
    '💭',
    'Easy',
    '5 minutes',
    ARRAY['Better connection', 'Deeper intimacy', 'Stronger relationship']
  ),
  (
    'Say something loving',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: say something loving.',
    'Intimacy',
    'Perform the habit ''Say something loving'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: say something loving.',
    '❤️',
    'Easy',
    '5 minutes',
    ARRAY['Better connection', 'Deeper intimacy', 'Stronger relationship']
  ),
  (
    'Laugh together',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: laugh together.',
    'Intimacy',
    'Perform the habit ''Laugh together'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: laugh together.',
    '😂',
    'Easy',
    '5 minutes',
    ARRAY['More fun', 'Better connection', 'Stronger bond']
  ),
  (
    'Share a memory',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: share a memory.',
    'Intimacy',
    'Perform the habit ''Share a memory'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: share a memory.',
    '📸',
    'Easy',
    '5 minutes',
    ARRAY['Better connection', 'Deeper intimacy', 'Stronger relationship']
  ),
  (
    'Do something fun together',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: do something fun together.',
    'Intimacy',
    'Perform the habit ''Do something fun together'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: do something fun together.',
    '🎉',
    'Easy',
    '30 minutes',
    ARRAY['More fun', 'Better connection', 'Stronger bond']
  ),
  (
    'Express physical affection',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: express physical affection.',
    'Intimacy',
    'Perform the habit ''Express physical affection'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: express physical affection.',
    '💑',
    'Easy',
    '5 minutes',
    ARRAY['Physical connection', 'Better intimacy', 'Stronger bond']
  ),
  (
    'Plan mini date',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: plan mini date.',
    'Intimacy',
    'Perform the habit ''Plan mini date'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: plan mini date.',
    '💐',
    'Medium',
    '10 minutes',
    ARRAY['Better connection', 'Deeper intimacy', 'Stronger relationship']
  ),
  (
    'Surprise partner',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: surprise partner.',
    'Intimacy',
    'Perform the habit ''Surprise partner'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: surprise partner.',
    '🎁',
    'Easy',
    '5 minutes',
    ARRAY['Better connection', 'Deeper intimacy', 'Stronger relationship']
  ),
  (
    'Have deep conversation',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: have deep conversation.',
    'Intimacy',
    'Perform the habit ''Have deep conversation'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: have deep conversation.',
    '🗣️',
    'Hard',
    '15 minutes',
    ARRAY['Better connection', 'Deeper intimacy', 'Stronger relationship']
  ),
  (
    'Discuss boundaries',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: discuss boundaries.',
    'Intimacy',
    'Perform the habit ''Discuss boundaries'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: discuss boundaries.',
    '🚧',
    'Hard',
    '15 minutes',
    ARRAY['Better connection', 'Deeper intimacy', 'Stronger relationship']
  ),
  (
    'Talk about desires',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: talk about desires.',
    'Intimacy',
    'Perform the habit ''Talk about desires'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: talk about desires.',
    '💫',
    'Hard',
    '5 minutes',
    ARRAY['Better communication', 'Increased understanding', 'Stronger connection']
  ),
  (
    'Share comfort touch',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: share comfort touch.',
    'Intimacy',
    'Perform the habit ''Share comfort touch'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: share comfort touch.',
    '🤲',
    'Easy',
    '5 minutes',
    ARRAY['Physical connection', 'Better intimacy', 'Stronger bond']
  ),
  (
    'Express admiration',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: express admiration.',
    'Intimacy',
    'Perform the habit ''Express admiration'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: express admiration.',
    '🌟',
    'Easy',
    '5 minutes',
    ARRAY['Better connection', 'Deeper intimacy', 'Stronger relationship']
  ),
  (
    'Do shared hobby',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: do shared hobby.',
    'Intimacy',
    'Perform the habit ''Do shared hobby'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: do shared hobby.',
    '🎯',
    'Easy',
    '30 minutes',
    ARRAY['Better connection', 'Deeper intimacy', 'Stronger relationship']
  ),
  (
    'Try intimacy exercise',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: try intimacy exercise.',
    'Intimacy',
    'Perform the habit ''Try intimacy exercise'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: try intimacy exercise.',
    '💞',
    'Medium',
    '5 minutes',
    ARRAY['Better connection', 'Deeper intimacy', 'Stronger relationship']
  ),
  (
    'Talk about feelings',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: talk about feelings.',
    'Intimacy',
    'Perform the habit ''Talk about feelings'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: talk about feelings.',
    '💭',
    'Easy',
    '5 minutes',
    ARRAY['Better communication', 'Increased understanding', 'Stronger connection']
  ),
  (
    'Express vulnerability',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: express vulnerability.',
    'Intimacy',
    'Perform the habit ''Express vulnerability'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: express vulnerability.',
    '💗',
    'Hard',
    '5 minutes',
    ARRAY['Better connection', 'Deeper intimacy', 'Stronger relationship']
  ),
  (
    'Practice sensual breathing',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: practice sensual breathing.',
    'Intimacy',
    'Perform the habit ''Practice sensual breathing'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: practice sensual breathing.',
    '🌬️',
    'Easy',
    '5 minutes',
    ARRAY['Better connection', 'Deeper intimacy', 'Stronger relationship']
  ),
  (
    'Make eye contact for 1 min',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: make eye contact for 1 min.',
    'Intimacy',
    'Perform the habit ''Make eye contact for 1 min'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: make eye contact for 1 min.',
    '👁️',
    'Easy',
    '1 minute',
    ARRAY['Better connection', 'Deeper intimacy', 'Stronger relationship']
  ),
  (
    'Kiss intentionally',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: kiss intentionally.',
    'Intimacy',
    'Perform the habit ''Kiss intentionally'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: kiss intentionally.',
    '💋',
    'Easy',
    '5 minutes',
    ARRAY['Better connection', 'Deeper intimacy', 'Stronger relationship']
  ),
  (
    'Be fully present',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: be fully present.',
    'Intimacy',
    'Perform the habit ''Be fully present'' consistently as part of your daily routine.',
    'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: be fully present.',
    '🧘',
    'Easy',
    '5 minutes',
    ARRAY['Better connection', 'Deeper intimacy', 'Stronger relationship']
  )
ON CONFLICT (name) DO NOTHING;

-- Verify the insertion
SELECT COUNT(*) as total_intimacy_habits FROM public.habits_library WHERE category = 'Intimacy';

-- Show sample of inserted habits
SELECT name, difficulty, time_required, emoji FROM public.habits_library
WHERE category = 'Intimacy' ORDER BY created_at DESC LIMIT 10;
