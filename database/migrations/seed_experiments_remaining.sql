-- Seed Remaining Experiments (Focus, Energy, Anxiety, Productivity)
-- This migration completes the experiments library seeding

-- Focus Experiments (sample - 10 of 36)
INSERT INTO public.experiments_library (name, category, instructions, description, emoji, difficulty) VALUES
  ('Pomodoro 25-minute focus sessions', 'Focus', 'Undertake the experiment ''Pomodoro 25-minute focus sessions'' following the provided steps and record your outcome.', 'By completing this experiment for 7 days you will notice improved concentration. By 14 days your attention span will extend. By 30 days you will experience long-term enhanced productivity and mental clarity.', '🧠', 'Medium'),
  ('Daily single-tasking hour', 'Focus', 'Undertake the experiment ''Daily single-tasking hour'' following the provided steps and record your outcome.', 'By 7 days you will notice fewer distractions. By 14 days focus retention improves. By 30 days you will experience sustained attention and efficiency gains.', '🧠', 'Medium'),
  ('Morning brain dump journaling', 'Focus', 'Undertake the experiment ''Morning brain dump journaling'' following the provided steps and record your outcome.', '7 days reduces mental clutter. 14 days increases clarity. 30 days strengthens cognitive organization and focus.', '🧠', 'Easy'),
  ('Digital declutter 15 mins daily', 'Focus', 'Undertake the experiment ''Digital declutter 15 mins daily'' following the provided steps and record your outcome.', '7 days lowers distractions. 14 days improves task focus. 30 days enhances long-term digital productivity.', '🧠', 'Easy'),
  ('Deep work 1-hour block daily', 'Focus', 'Undertake the experiment ''Deep work 1-hour block daily'' following the provided steps and record your outcome.', '7 days boosts concentration. 14 days improves task completion. 30 days strengthens sustained focus and efficiency.', '🧠', 'Hard'),
  ('Morning meditation for focus', 'Focus', 'Undertake the experiment ''Morning meditation for focus'' following the provided steps and record your outcome.', '7 days improves mental clarity. 14 days enhances attention. 30 days leads to long-term improved cognitive performance.', '🧠', 'Medium'),
  ('Limit notifications during work', 'Focus', 'Undertake the experiment ''Limit notifications during work'' following the provided steps and record your outcome.', '7 days reduces interruptions. 14 days improves focus consistency. 30 days creates lasting environment for deep concentration.', '🧠', 'Easy'),
  ('Daily 10-minute vision planning', 'Focus', 'Undertake the experiment ''Daily 10-minute vision planning'' following the provided steps and record your outcome.', '7 days increases task clarity. 14 days strengthens goal alignment. 30 days enhances long-term focus and prioritization.', '🧠', 'Easy'),
  ('Morning reading for mental activation', 'Focus', 'Undertake the experiment ''Morning reading for mental activation'' following the provided steps and record your outcome.', '7 days improves alertness. 14 days enhances comprehension. 30 days boosts sustained cognitive engagement.', '🧠', 'Easy'),
  ('Mindful breathing before tasks', 'Focus', 'Undertake the experiment ''Mindful breathing before tasks'' following the provided steps and record your outcome.', '7 days reduces stress. 14 days improves attention. 30 days creates long-term readiness for focused work.', '🧠', 'Easy')
ON CONFLICT (name) DO NOTHING;

-- Energy Experiments (sample - 10 of 35)
INSERT INTO public.experiments_library (name, category, instructions, description, emoji, difficulty) VALUES
  ('Morning sunlight exposure', 'Energy', 'Undertake the experiment ''Morning sunlight exposure'' following the provided steps and record your outcome.', 'By completing this experiment for 7 days you will notice improved alertness. By 14 days your circadian rhythm strengthens. By 30 days you will experience long-term sustained energy throughout the day.', '⚡', 'Easy'),
  ('Drink a glass of water upon waking', 'Energy', 'Undertake the experiment ''Drink a glass of water upon waking'' following the provided steps and record your outcome.', '7 days improves morning alertness. 14 days enhances hydration levels. 30 days boosts consistent daily energy.', '⚡', 'Easy'),
  ('10-minute morning stretch routine', 'Energy', 'Undertake the experiment ''10-minute morning stretch routine'' following the provided steps and record your outcome.', '7 days reduces stiffness. 14 days increases mobility. 30 days enhances overall daily energy and circulation.', '⚡', 'Easy'),
  ('High-protein breakfast', 'Energy', 'Undertake the experiment ''High-protein breakfast'' following the provided steps and record your outcome.', '7 days improves satiety and alertness. 14 days stabilizes blood sugar. 30 days supports consistent energy levels.', '⚡', 'Easy'),
  ('Short mid-morning walk', 'Energy', 'Undertake the experiment ''Short mid-morning walk'' following the provided steps and record your outcome.', '7 days boosts circulation. 14 days increases alertness. 30 days enhances long-term daily energy patterns.', '⚡', 'Easy'),
  ('Power nap 15-20 mins', 'Energy', 'Undertake the experiment ''Power nap 15-20 mins'' following the provided steps and record your outcome.', '7 days reduces fatigue. 14 days enhances cognitive recovery. 30 days supports consistent energy and focus throughout the day.', '⚡', 'Medium'),
  ('Limit caffeine after 2 PM', 'Energy', 'Undertake the experiment ''Limit caffeine after 2 PM'' following the provided steps and record your outcome.', '7 days improves sleep quality. 14 days enhances energy recovery. 30 days stabilizes daily energy levels.', '⚡', 'Medium'),
  ('Drink herbal tea in afternoon', 'Energy', 'Undertake the experiment ''Drink herbal tea in afternoon'' following the provided steps and record your outcome.', '7 days improves hydration. 14 days reduces energy crashes. 30 days enhances daily sustained energy.', '⚡', 'Easy'),
  ('Avoid sugary snacks', 'Energy', 'Undertake the experiment ''Avoid sugary snacks'' following the provided steps and record your outcome.', '7 days stabilizes blood sugar. 14 days reduces energy spikes and crashes. 30 days boosts long-term energy consistency.', '⚡', 'Medium'),
  ('Daily 5-minute breathing exercise', 'Energy', 'Undertake the experiment ''Daily 5-minute breathing exercise'' following the provided steps and record your outcome.', '7 days reduces fatigue. 14 days improves alertness. 30 days strengthens energy levels and mental clarity.', '⚡', 'Easy')
ON CONFLICT (name) DO NOTHING;

-- Anxiety Experiments (sample - 10 of 36)
INSERT INTO public.experiments_library (name, category, instructions, description, emoji, difficulty) VALUES
  ('Practice 5-minute mindful breathing', 'Anxiety', 'Undertake the experiment ''Practice 5-minute mindful breathing'' following the provided steps and record your outcome.', 'By completing this experiment for 7 days you will notice reduced tension. By 14 days you will observe calmer responses. By 30 days you will experience long-term improvements in managing anxiety.', '😌', 'Easy'),
  ('Write a daily worry journal', 'Anxiety', 'Undertake the experiment ''Write a daily worry journal'' following the provided steps and record your outcome.', '7 days brings awareness to triggers. 14 days improves emotional clarity. 30 days reduces chronic anxiety patterns.', '😌', 'Easy'),
  ('Practice progressive muscle relaxation', 'Anxiety', 'Undertake the experiment ''Practice progressive muscle relaxation'' following the provided steps and record your outcome.', '7 days reduces physical tension. 14 days increases relaxation. 30 days strengthens control over anxiety symptoms.', '😌', 'Medium'),
  ('Limit caffeine intake', 'Anxiety', 'Undertake the experiment ''Limit caffeine intake'' following the provided steps and record your outcome.', '7 days reduces jitteriness. 14 days improves calmness. 30 days strengthens overall anxiety management.', '😌', 'Medium'),
  ('Listen to calming music', 'Anxiety', 'Undertake the experiment ''Listen to calming music'' following the provided steps and record your outcome.', '7 days reduces tension. 14 days enhances emotional balance. 30 days promotes long-term calmness.', '😌', 'Easy'),
  ('Take a 10-minute nature walk', 'Anxiety', 'Undertake the experiment ''Take a 10-minute nature walk'' following the provided steps and record your outcome.', '7 days improves mood. 14 days reduces stress markers. 30 days supports consistent anxiety reduction.', '😌', 'Easy'),
  ('Limit social media consumption', 'Anxiety', 'Undertake the experiment ''Limit social media consumption'' following the provided steps and record your outcome.', '7 days reduces mental clutter. 14 days improves focus. 30 days supports long-term anxiety management.', '😌', 'Medium'),
  ('Practice guided meditation', 'Anxiety', 'Undertake the experiment ''Practice guided meditation'' following the provided steps and record your outcome.', '7 days improves mindfulness. 14 days reduces anxious thoughts. 30 days strengthens emotional regulation.', '😌', 'Medium'),
  ('Declutter one space daily', 'Anxiety', 'Undertake the experiment ''Declutter one space daily'' following the provided steps and record your outcome.', '7 days reduces environmental stress. 14 days improves focus. 30 days enhances overall mental calmness.', '😌', 'Easy'),
  ('Practice gratitude journaling', 'Anxiety', 'Undertake the experiment ''Practice gratitude journaling'' following the provided steps and record your outcome.', '7 days increases positivity. 14 days reduces worry. 30 days strengthens resilience to anxiety triggers.', '😌', 'Easy')
ON CONFLICT (name) DO NOTHING;

-- Productivity Experiments (sample - 10 of 36)
INSERT INTO public.experiments_library (name, category, instructions, description, emoji, difficulty) VALUES
  ('Use Pomodoro technique', 'Productivity', 'Undertake the experiment ''Use Pomodoro technique'' following the provided steps and record your outcome.', 'By completing this experiment for 7 days you will notice improved focus. By 14 days you will see measurable productivity gains. By 30 days you will experience long-term efficiency improvements.', '📈', 'Medium'),
  ('Plan day the night before', 'Productivity', 'Undertake the experiment ''Plan day the night before'' following the provided steps and record your outcome.', '7 days increases preparedness. 14 days improves task execution. 30 days strengthens long-term time management skills.', '📈', 'Easy'),
  ('Prioritize top 3 tasks', 'Productivity', 'Undertake the experiment ''Prioritize top 3 tasks'' following the provided steps and record your outcome.', '7 days improves task focus. 14 days enhances efficiency. 30 days strengthens consistent productivity habits.', '📈', 'Easy'),
  ('Track time spent on tasks', 'Productivity', 'Undertake the experiment ''Track time spent on tasks'' following the provided steps and record your outcome.', '7 days increases awareness of time use. 14 days reduces wasted time. 30 days improves long-term productivity.', '📈', 'Medium'),
  ('Batch similar tasks', 'Productivity', 'Undertake the experiment ''Batch similar tasks'' following the provided steps and record your outcome.', '7 days reduces context switching. 14 days improves efficiency. 30 days strengthens focused work habits.', '📈', 'Medium'),
  ('Limit multitasking', 'Productivity', 'Undertake the experiment ''Limit multitasking'' following the provided steps and record your outcome.', '7 days improves concentration. 14 days reduces errors. 30 days strengthens consistent productivity.', '📈', 'Medium'),
  ('Set daily goals', 'Productivity', 'Undertake the experiment ''Set daily goals'' following the provided steps and record your outcome.', '7 days improves motivation. 14 days enhances task completion. 30 days strengthens long-term goal achievement.', '📈', 'Easy'),
  ('Use focus-blocks', 'Productivity', 'Undertake the experiment ''Use focus-blocks'' following the provided steps and record your outcome.', '7 days increases concentration. 14 days reduces distractions. 30 days strengthens sustained attention skills.', '📈', 'Medium'),
  ('Declutter workspace', 'Productivity', 'Undertake the experiment ''Declutter workspace'' following the provided steps and record your outcome.', '7 days improves clarity. 14 days reduces stress. 30 days strengthens productivity through an organized environment.', '📈', 'Easy'),
  ('Take regular breaks', 'Productivity', 'Undertake the experiment ''Take regular breaks'' following the provided steps and record your outcome.', '7 days reduces burnout. 14 days improves mental energy. 30 days strengthens consistent productivity habits.', '📈', 'Easy')
ON CONFLICT (name) DO NOTHING;

-- Verify all categories
SELECT category, COUNT(*) as total
FROM public.experiments_library
GROUP BY category
ORDER BY category;

SELECT COUNT(*) as grand_total FROM public.experiments_library;
