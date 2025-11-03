-- Mock Data Seed Script for Betternapped
-- Run this in Supabase SQL Editor AFTER a user signs up
-- Replace 'USER_ID_HERE' with your actual user ID from auth.users

-- Step 1: Get your user ID
-- SELECT id, email FROM auth.users ORDER BY created_at DESC LIMIT 1;

-- Step 2: Set the user ID variable (replace with actual ID)
DO $$
DECLARE
  test_user_id UUID := 'USER_ID_HERE'; -- REPLACE THIS
BEGIN

-- Insert mood logs for past 30 days
INSERT INTO mood_logs (user_id, date, moods, score, emoji, notes) VALUES
  (test_user_id, CURRENT_DATE - 1, '["Happy", "Energetic"]'::jsonb, 4, '😊', 'Great day overall!'),
  (test_user_id, CURRENT_DATE - 2, '["Stressed", "Anxious"]'::jsonb, 2, '😰', 'Work was overwhelming'),
  (test_user_id, CURRENT_DATE - 3, '["Calm", "Content"]'::jsonb, 4, '😌', 'Relaxing evening'),
  (test_user_id, CURRENT_DATE - 4, '["Excited", "Motivated"]'::jsonb, 5, '🚀', 'New project started'),
  (test_user_id, CURRENT_DATE - 5, '["Tired", "Frustrated"]'::jsonb, 2, '😴', 'Long day at work'),
  (test_user_id, CURRENT_DATE - 6, '["Grateful", "Peaceful"]'::jsonb, 4, '🙏', 'Spent time with family'),
  (test_user_id, CURRENT_DATE - 7, '["Confident", "Proud"]'::jsonb, 5, '💪', 'Completed a big task'),
  (test_user_id, CURRENT_DATE - 8, '["Lonely", "Sad"]'::jsonb, 1, '😢', 'Missing friends'),
  (test_user_id, CURRENT_DATE - 9, '["Hopeful", "Optimistic"]'::jsonb, 4, '🌟', 'New opportunities ahead'),
  (test_user_id, CURRENT_DATE - 10, '["Overwhelmed", "Confused"]'::jsonb, 2, '🤯', 'Too many decisions'),
  (test_user_id, CURRENT_DATE - 11, '["Joyful", "Playful"]'::jsonb, 5, '🎉', 'Fun day with friends'),
  (test_user_id, CURRENT_DATE - 12, '["Focused", "Determined"]'::jsonb, 4, '🎯', 'Productive work session'),
  (test_user_id, CURRENT_DATE - 13, '["Relaxed", "Serene"]'::jsonb, 4, '🧘', 'Meditation helped'),
  (test_user_id, CURRENT_DATE - 14, '["Anxious", "Worried"]'::jsonb, 2, '😟', 'Upcoming presentation'),
  (test_user_id, CURRENT_DATE - 15, '["Proud", "Accomplished"]'::jsonb, 5, '🏆', 'Achieved a goal'),
  (test_user_id, CURRENT_DATE - 16, '["Grateful", "Blessed"]'::jsonb, 4, '🙏', 'Appreciating life'),
  (test_user_id, CURRENT_DATE - 17, '["Creative", "Inspired"]'::jsonb, 4, '🎨', 'Art project flowing'),
  (test_user_id, CURRENT_DATE - 18, '["Exhausted", "Drained"]'::jsonb, 1, '😵', 'Need more rest'),
  (test_user_id, CURRENT_DATE - 19, '["Excited", "Anticipating"]'::jsonb, 4, '🤩', 'Weekend plans ahead'),
  (test_user_id, CURRENT_DATE - 20, '["Peaceful", "Centered"]'::jsonb, 4, '☮️', 'Yoga session was great'),
  (test_user_id, CURRENT_DATE - 21, '["Frustrated", "Impatient"]'::jsonb, 2, '😤', 'Technology issues'),
  (test_user_id, CURRENT_DATE - 22, '["Loved", "Cherished"]'::jsonb, 5, '💕', 'Quality time with partner'),
  (test_user_id, CURRENT_DATE - 23, '["Motivated", "Driven"]'::jsonb, 4, '🔥', 'New fitness routine'),
  (test_user_id, CURRENT_DATE - 24, '["Nostalgic", "Reflective"]'::jsonb, 3, '📸', 'Looking at old photos'),
  (test_user_id, CURRENT_DATE - 25, '["Adventurous", "Curious"]'::jsonb, 4, '🗺️', 'Tried something new'),
  (test_user_id, CURRENT_DATE - 26, '["Overwhelmed", "Stressed"]'::jsonb, 2, '😫', 'Too much on plate'),
  (test_user_id, CURRENT_DATE - 27, '["Grateful", "Thankful"]'::jsonb, 4, '🙏', 'Counting blessings'),
  (test_user_id, CURRENT_DATE - 28, '["Energetic", "Vibrant"]'::jsonb, 5, '⚡', 'Great workout session'),
  (test_user_id, CURRENT_DATE - 29, '["Melancholy", "Pensive"]'::jsonb, 3, '🤔', 'Deep thoughts today'),
  (test_user_id, CURRENT_DATE - 30, '["Hopeful", "Positive"]'::jsonb, 4, '🌅', 'New month, new goals');

-- Insert sleep logs for past 30 days
INSERT INTO sleep_logs (user_id, date, bedtime, wake_time, hours, quality, waking_feeling) VALUES
  (test_user_id, CURRENT_DATE - 1, '23:00', '07:00', 8.0, 4, 'refreshed'),
  (test_user_id, CURRENT_DATE - 2, '00:30', '06:30', 6.0, 2, 'tired'),
  (test_user_id, CURRENT_DATE - 3, '22:45', '07:15', 8.5, 5, 'energized'),
  (test_user_id, CURRENT_DATE - 4, '23:30', '07:30', 8.0, 4, 'rested'),
  (test_user_id, CURRENT_DATE - 5, '01:00', '08:00', 7.0, 3, 'groggy'),
  (test_user_id, CURRENT_DATE - 6, '22:30', '07:00', 8.5, 5, 'refreshed'),
  (test_user_id, CURRENT_DATE - 7, '23:15', '07:45', 8.5, 4, 'well-rested'),
  (test_user_id, CURRENT_DATE - 8, '00:00', '06:00', 6.0, 2, 'exhausted'),
  (test_user_id, CURRENT_DATE - 9, '22:00', '06:30', 8.5, 5, 'energized'),
  (test_user_id, CURRENT_DATE - 10, '23:45', '08:15', 8.5, 4, 'rested'),
  (test_user_id, CURRENT_DATE - 11, '22:15', '07:30', 9.25, 5, 'refreshed'),
  (test_user_id, CURRENT_DATE - 12, '23:30', '07:00', 7.5, 3, 'okay'),
  (test_user_id, CURRENT_DATE - 13, '22:30', '07:45', 9.25, 5, 'energized'),
  (test_user_id, CURRENT_DATE - 14, '00:15', '06:45', 6.5, 2, 'tired'),
  (test_user_id, CURRENT_DATE - 15, '22:45', '07:15', 8.5, 4, 'well-rested'),
  (test_user_id, CURRENT_DATE - 16, '23:00', '07:30', 8.5, 4, 'rested'),
  (test_user_id, CURRENT_DATE - 17, '22:30', '07:00', 8.5, 5, 'refreshed'),
  (test_user_id, CURRENT_DATE - 18, '01:30', '08:30', 7.0, 3, 'groggy'),
  (test_user_id, CURRENT_DATE - 19, '22:45', '07:45', 9.0, 5, 'energized'),
  (test_user_id, CURRENT_DATE - 20, '23:15', '07:15', 8.0, 4, 'rested'),
  (test_user_id, CURRENT_DATE - 21, '00:00', '07:00', 7.0, 3, 'okay'),
  (test_user_id, CURRENT_DATE - 22, '22:30', '07:30', 9.0, 5, 'refreshed'),
  (test_user_id, CURRENT_DATE - 23, '23:00', '07:00', 8.0, 4, 'well-rested'),
  (test_user_id, CURRENT_DATE - 24, '23:45', '08:00', 8.25, 4, 'rested'),
  (test_user_id, CURRENT_DATE - 25, '22:15', '07:15', 9.0, 5, 'energized'),
  (test_user_id, CURRENT_DATE - 26, '00:30', '07:30', 7.0, 2, 'tired'),
  (test_user_id, CURRENT_DATE - 27, '22:45', '07:45', 9.0, 5, 'refreshed'),
  (test_user_id, CURRENT_DATE - 28, '23:30', '07:30', 8.0, 4, 'rested'),
  (test_user_id, CURRENT_DATE - 29, '22:00', '07:00', 9.0, 5, 'energized'),
  (test_user_id, CURRENT_DATE - 30, '23:15', '07:45', 8.5, 4, 'well-rested');

-- Insert activities for past 30 days
INSERT INTO activities (user_id, date, category, name, duration, emoji) VALUES
  (test_user_id, CURRENT_DATE - 1, 'exercise', 'Morning Run', 30, '🏃'),
  (test_user_id, CURRENT_DATE - 1, 'social', 'Coffee with Friends', 60, '☕'),
  (test_user_id, CURRENT_DATE - 1, 'creative', 'Painting Session', 45, '🎨'),
  (test_user_id, CURRENT_DATE - 2, 'work', 'Project Meeting', 90, '💼'),
  (test_user_id, CURRENT_DATE - 2, 'wellness', 'Yoga Class', 60, '🧘'),
  (test_user_id, CURRENT_DATE - 3, 'social', 'Dinner with Family', 120, '🍽️'),
  (test_user_id, CURRENT_DATE - 3, 'learning', 'Online Course', 45, '📚'),
  (test_user_id, CURRENT_DATE - 4, 'exercise', 'Gym Workout', 75, '💪'),
  (test_user_id, CURRENT_DATE - 4, 'creative', 'Music Practice', 30, '🎵'),
  (test_user_id, CURRENT_DATE - 5, 'social', 'Movie Night', 150, '🎬'),
  (test_user_id, CURRENT_DATE - 6, 'wellness', 'Meditation', 20, '🧘'),
  (test_user_id, CURRENT_DATE - 6, 'exercise', 'Hiking', 180, '🥾'),
  (test_user_id, CURRENT_DATE - 7, 'learning', 'Language Study', 30, '🗣️'),
  (test_user_id, CURRENT_DATE - 7, 'creative', 'Writing', 60, '✍️'),
  (test_user_id, CURRENT_DATE - 8, 'work', 'Client Presentation', 120, '📊'),
  (test_user_id, CURRENT_DATE - 8, 'social', 'Game Night', 180, '🎮'),
  (test_user_id, CURRENT_DATE - 9, 'exercise', 'Swimming', 45, '🏊'),
  (test_user_id, CURRENT_DATE - 9, 'wellness', 'Spa Day', 240, '🧖'),
  (test_user_id, CURRENT_DATE - 10, 'learning', 'Coding Practice', 90, '💻'),
  (test_user_id, CURRENT_DATE - 10, 'social', 'Brunch', 90, '🥞'),
  (test_user_id, CURRENT_DATE - 11, 'exercise', 'Cycling', 60, '🚴'),
  (test_user_id, CURRENT_DATE - 11, 'creative', 'Photography', 120, '📸'),
  (test_user_id, CURRENT_DATE - 12, 'work', 'Team Building', 180, '🤝'),
  (test_user_id, CURRENT_DATE - 12, 'wellness', 'Massage', 60, '💆'),
  (test_user_id, CURRENT_DATE - 13, 'learning', 'Book Reading', 45, '📖'),
  (test_user_id, CURRENT_DATE - 13, 'social', 'Concert', 180, '🎵'),
  (test_user_id, CURRENT_DATE - 14, 'exercise', 'Pilates', 50, '🤸'),
  (test_user_id, CURRENT_DATE - 14, 'creative', 'Cooking Class', 120, '👨‍🍳'),
  (test_user_id, CURRENT_DATE - 15, 'social', 'Birthday Party', 240, '🎉'),
  (test_user_id, CURRENT_DATE - 15, 'wellness', 'Nature Walk', 90, '🌳'),
  (test_user_id, CURRENT_DATE - 16, 'exercise', 'Tennis', 90, '🎾'),
  (test_user_id, CURRENT_DATE - 16, 'learning', 'Workshop', 180, '🎓'),
  (test_user_id, CURRENT_DATE - 17, 'creative', 'Pottery', 120, '🏺'),
  (test_user_id, CURRENT_DATE - 17, 'social', 'Date Night', 180, '💕'),
  (test_user_id, CURRENT_DATE - 18, 'work', 'Conference', 480, '🎤'),
  (test_user_id, CURRENT_DATE - 18, 'wellness', 'Sauna', 30, '🧖'),
  (test_user_id, CURRENT_DATE - 19, 'exercise', 'Rock Climbing', 120, '🧗'),
  (test_user_id, CURRENT_DATE - 19, 'learning', 'Podcast', 45, '🎧'),
  (test_user_id, CURRENT_DATE - 20, 'social', 'Picnic', 180, '🧺'),
  (test_user_id, CURRENT_DATE - 20, 'creative', 'Dancing', 60, '💃'),
  (test_user_id, CURRENT_DATE - 21, 'exercise', 'Boxing', 60, '🥊'),
  (test_user_id, CURRENT_DATE - 21, 'wellness', 'Aromatherapy', 30, '🕯️'),
  (test_user_id, CURRENT_DATE - 22, 'learning', 'TED Talk', 30, '🎤'),
  (test_user_id, CURRENT_DATE - 22, 'social', 'Volunteering', 180, '🤝'),
  (test_user_id, CURRENT_DATE - 23, 'exercise', 'CrossFit', 60, '🏋️'),
  (test_user_id, CURRENT_DATE - 23, 'creative', 'Sculpting', 90, '🗿'),
  (test_user_id, CURRENT_DATE - 24, 'work', 'Networking Event', 180, '🤝'),
  (test_user_id, CURRENT_DATE - 24, 'wellness', 'Breathing Exercise', 15, '🫁'),
  (test_user_id, CURRENT_DATE - 25, 'exercise', 'Kayaking', 120, '🛶'),
  (test_user_id, CURRENT_DATE - 25, 'social', 'Beach Day', 300, '🏖️'),
  (test_user_id, CURRENT_DATE - 26, 'learning', 'Documentary', 90, '📺'),
  (test_user_id, CURRENT_DATE - 26, 'creative', 'Gardening', 120, '🌱'),
  (test_user_id, CURRENT_DATE - 27, 'exercise', 'Dance Fitness', 45, '💃'),
  (test_user_id, CURRENT_DATE - 27, 'wellness', 'Journaling', 30, '📝'),
  (test_user_id, CURRENT_DATE - 28, 'social', 'Art Gallery', 120, '🖼️'),
  (test_user_id, CURRENT_DATE - 28, 'learning', 'Online Tutorial', 60, '💻'),
  (test_user_id, CURRENT_DATE - 29, 'exercise', 'Martial Arts', 60, '🥋'),
  (test_user_id, CURRENT_DATE - 29, 'creative', 'Knitting', 90, '🧶'),
  (test_user_id, CURRENT_DATE - 30, 'wellness', 'Mindfulness', 20, '🧘'),
  (test_user_id, CURRENT_DATE - 30, 'social', 'Community Event', 180, '🎪');

-- Insert habits
INSERT INTO habits (user_id, name, description, category, total_days, streak, reminder_enabled, reminder_time, quote) VALUES
  (test_user_id, 'Morning Meditation', '10 minutes of mindfulness practice', 'wellness', 30, 7, true, '07:00', 'Start each day with intention'),
  (test_user_id, 'Read Before Bed', '20 minutes of reading', 'learning', 30, 5, true, '21:30', 'Books are the quietest and most constant of friends'),
  (test_user_id, 'Daily Walk', '30-minute walk for fresh air', 'exercise', 30, 12, true, '18:00', 'Walking is man''s best medicine'),
  (test_user_id, 'Gratitude Journal', 'Write 3 things I''m grateful for', 'wellness', 30, 3, true, '22:00', 'Gratitude turns what we have into enough'),
  (test_user_id, 'Drink Water', '8 glasses of water daily', 'health', 30, 8, false, null, 'Water is life'),
  (test_user_id, 'No Phone Before Bed', 'No screens 1 hour before sleep', 'wellness', 30, 2, true, '22:00', 'Sleep is the golden chain that ties health and our bodies together'),
  (test_user_id, 'Practice Spanish', '15 minutes of language learning', 'learning', 30, 6, true, '19:00', 'Language is the road map of a culture'),
  (test_user_id, 'Stretch Daily', '10 minutes of stretching', 'exercise', 30, 4, true, '08:00', 'Flexibility is the key to longevity');

-- Insert habit logs for the past 30 days
INSERT INTO habit_logs (habit_id, user_id, date, completed, feedback) 
SELECT h.id, test_user_id, CURRENT_DATE - (n || ' days')::interval, 
       CASE WHEN random() > 0.3 THEN true ELSE false END,
       CASE WHEN random() > 0.3 THEN 
         CASE WHEN random() > 0.5 THEN 'good' ELSE 'neutral' END 
       ELSE 'bad' END
FROM habits h, generate_series(1, 30) n
WHERE h.user_id = test_user_id;

-- Insert experiments
INSERT INTO experiments (user_id, activity_name, activity_emoji, outcomes, start_date, end_date, duration, status, current_day, baseline_data, results_data, insights) VALUES
  (test_user_id, 'Morning Meditation', '🧘', '["mood", "focus", "stress"]'::jsonb, CURRENT_DATE - 14, CURRENT_DATE + 16, 30, 'active', 15, 
   '{"mood_before": 3.2, "focus_score": 2.8, "stress_level": 4.1}'::jsonb,
   '{"mood_improvement": 0.8, "focus_improvement": 1.2, "stress_reduction": 1.5}'::jsonb,
   'Meditation is showing consistent positive impact on daily mood and focus levels'),
  (test_user_id, 'Digital Detox', '📱', '["sleep_quality", "anxiety", "productivity"]'::jsonb, CURRENT_DATE - 7, CURRENT_DATE + 23, 30, 'active', 8,
   '{"sleep_hours": 6.5, "anxiety_level": 3.8, "productivity_score": 3.2}'::jsonb,
   '{"sleep_improvement": 1.2, "anxiety_reduction": 0.9, "productivity_boost": 0.7}'::jsonb,
   'Reducing screen time is improving sleep quality and reducing evening anxiety'),
  (test_user_id, 'Cold Showers', '🚿', '["energy", "mood", "immunity"]'::jsonb, CURRENT_DATE - 21, CURRENT_DATE + 9, 30, 'active', 22,
   '{"morning_energy": 2.5, "mood_score": 3.1, "sick_days": 2}'::jsonb,
   '{"energy_boost": 1.8, "mood_improvement": 1.4, "sick_days_reduction": 1}'::jsonb,
   'Cold showers are providing significant energy boost and mood improvement');

-- Insert experiment logs
INSERT INTO experiment_logs (experiment_id, user_id, date, completed, skipped, outcome_scores, notes)
SELECT e.id, test_user_id, CURRENT_DATE - (n || ' days')::interval,
       CASE WHEN random() > 0.1 THEN true ELSE false END,
       CASE WHEN random() > 0.9 THEN true ELSE false END,
       '{"mood": 3.5, "energy": 4.0, "focus": 3.8}'::jsonb,
       CASE WHEN random() > 0.5 THEN 'Feeling good today' ELSE null END
FROM experiments e, generate_series(1, 30) n
WHERE e.user_id = test_user_id AND n <= e.current_day;

-- Insert productivity logs
INSERT INTO productivity_logs (user_id, date, rating, focused_hours, factors, other_factor) VALUES
  (test_user_id, CURRENT_DATE - 1, 4, 6.5, '["good_sleep", "exercise", "healthy_meals"]'::jsonb, null),
  (test_user_id, CURRENT_DATE - 2, 2, 3.0, '["distractions", "meetings"]'::jsonb, 'Too many interruptions'),
  (test_user_id, CURRENT_DATE - 3, 5, 8.0, '["quiet_environment", "caffeine", "clear_goals"]'::jsonb, null),
  (test_user_id, CURRENT_DATE - 4, 3, 4.5, '["exercise", "good_sleep"]'::jsonb, 'Some focus issues'),
  (test_user_id, CURRENT_DATE - 5, 1, 2.0, '["stress", "distractions"]'::jsonb, 'Very difficult day'),
  (test_user_id, CURRENT_DATE - 6, 4, 6.0, '["exercise", "healthy_meals", "music"]'::jsonb, null),
  (test_user_id, CURRENT_DATE - 7, 3, 5.0, '["good_sleep"]'::jsonb, 'Average productivity'),
  (test_user_id, CURRENT_DATE - 8, 2, 3.5, '["distractions", "stress"]'::jsonb, 'Hard to concentrate'),
  (test_user_id, CURRENT_DATE - 9, 4, 7.0, '["exercise", "quiet_environment"]'::jsonb, null),
  (test_user_id, CURRENT_DATE - 10, 5, 8.5, '["good_sleep", "exercise", "caffeine", "clear_goals"]'::jsonb, null),
  (test_user_id, CURRENT_DATE - 11, 3, 4.0, '["healthy_meals"]'::jsonb, 'Some focus challenges'),
  (test_user_id, CURRENT_DATE - 12, 4, 6.5, '["exercise", "good_sleep", "music"]'::jsonb, null),
  (test_user_id, CURRENT_DATE - 13, 2, 3.0, '["distractions", "meetings"]'::jsonb, 'Too many meetings'),
  (test_user_id, CURRENT_DATE - 14, 4, 7.0, '["exercise", "quiet_environment", "caffeine"]'::jsonb, null),
  (test_user_id, CURRENT_DATE - 15, 3, 5.5, '["good_sleep", "healthy_meals"]'::jsonb, 'Decent day'),
  (test_user_id, CURRENT_DATE - 16, 5, 8.0, '["exercise", "good_sleep", "clear_goals", "music"]'::jsonb, null),
  (test_user_id, CURRENT_DATE - 17, 2, 3.5, '["stress", "distractions"]'::jsonb, 'Stress affecting focus'),
  (test_user_id, CURRENT_DATE - 18, 4, 6.0, '["exercise", "healthy_meals"]'::jsonb, null),
  (test_user_id, CURRENT_DATE - 19, 3, 4.5, '["good_sleep"]'::jsonb, 'Moderate productivity'),
  (test_user_id, CURRENT_DATE - 20, 4, 7.0, '["exercise", "quiet_environment", "caffeine"]'::jsonb, null),
  (test_user_id, CURRENT_DATE - 21, 1, 2.5, '["stress", "distractions", "meetings"]'::jsonb, 'Very challenging day'),
  (test_user_id, CURRENT_DATE - 22, 4, 6.5, '["exercise", "good_sleep", "healthy_meals"]'::jsonb, null),
  (test_user_id, CURRENT_DATE - 23, 3, 5.0, '["good_sleep", "music"]'::jsonb, 'Average focus'),
  (test_user_id, CURRENT_DATE - 24, 4, 6.0, '["exercise", "caffeine", "clear_goals"]'::jsonb, null),
  (test_user_id, CURRENT_DATE - 25, 5, 8.5, '["exercise", "good_sleep", "quiet_environment", "caffeine"]'::jsonb, null),
  (test_user_id, CURRENT_DATE - 26, 2, 3.0, '["distractions", "stress"]'::jsonb, 'Hard to stay focused'),
  (test_user_id, CURRENT_DATE - 27, 4, 7.0, '["exercise", "healthy_meals", "music"]'::jsonb, null),
  (test_user_id, CURRENT_DATE - 28, 3, 4.5, '["good_sleep"]'::jsonb, 'Some focus issues'),
  (test_user_id, CURRENT_DATE - 29, 4, 6.5, '["exercise", "quiet_environment"]'::jsonb, null),
  (test_user_id, CURRENT_DATE - 30, 4, 7.0, '["exercise", "good_sleep", "caffeine"]'::jsonb, null);

-- Insert intimacy logs (sample data)
INSERT INTO intimacy_logs (user_id, date, type, orgasm, location, toy_used, time_to_sleep, mood_before, mood_after) VALUES
  (test_user_id, CURRENT_DATE - 3, 'solo', true, 'bedroom', false, 15, 3, 5),
  (test_user_id, CURRENT_DATE - 7, 'partner', true, 'bedroom', false, 10, 4, 5),
  (test_user_id, CURRENT_DATE - 10, 'solo', true, 'bedroom', true, 20, 2, 4),
  (test_user_id, CURRENT_DATE - 14, 'partner', true, 'bedroom', false, 5, 4, 5),
  (test_user_id, CURRENT_DATE - 17, 'solo', false, 'bedroom', false, 30, 3, 3),
  (test_user_id, CURRENT_DATE - 21, 'partner', true, 'bedroom', false, 12, 4, 5),
  (test_user_id, CURRENT_DATE - 24, 'solo', true, 'bedroom', true, 18, 3, 4),
  (test_user_id, CURRENT_DATE - 28, 'partner', true, 'bedroom', false, 8, 4, 5);

-- Insert mental clarity test results
INSERT INTO mental_clarity_tests (user_id, date, score, factors) VALUES
  (test_user_id, CURRENT_DATE - 1, 8, '["good_sleep", "exercise", "meditation"]'::jsonb),
  (test_user_id, CURRENT_DATE - 3, 6, '["exercise", "caffeine"]'::jsonb),
  (test_user_id, CURRENT_DATE - 5, 4, '["stress", "poor_sleep"]'::jsonb),
  (test_user_id, CURRENT_DATE - 7, 9, '["excellent_sleep", "exercise", "meditation", "healthy_meals"]'::jsonb),
  (test_user_id, CURRENT_DATE - 10, 7, '["good_sleep", "exercise"]'::jsonb),
  (test_user_id, CURRENT_DATE - 12, 5, '["stress", "distractions"]'::jsonb),
  (test_user_id, CURRENT_DATE - 14, 8, '["exercise", "meditation", "quiet_environment"]'::jsonb),
  (test_user_id, CURRENT_DATE - 17, 6, '["exercise", "caffeine"]'::jsonb),
  (test_user_id, CURRENT_DATE - 20, 9, '["excellent_sleep", "exercise", "meditation"]'::jsonb),
  (test_user_id, CURRENT_DATE - 23, 7, '["good_sleep", "exercise"]'::jsonb),
  (test_user_id, CURRENT_DATE - 26, 5, '["stress", "poor_sleep"]'::jsonb),
  (test_user_id, CURRENT_DATE - 28, 8, '["exercise", "meditation", "healthy_meals"]'::jsonb),
  (test_user_id, CURRENT_DATE - 30, 7, '["good_sleep", "exercise", "caffeine"]'::jsonb);

END $$;

-- Verify data was inserted
SELECT 'Mood Logs' as table_name, COUNT(*) as count FROM mood_logs WHERE user_id = 'USER_ID_HERE'
UNION ALL
SELECT 'Sleep Logs', COUNT(*) FROM sleep_logs WHERE user_id = 'USER_ID_HERE'
UNION ALL
SELECT 'Activities', COUNT(*) FROM activities WHERE user_id = 'USER_ID_HERE'
UNION ALL
SELECT 'Habits', COUNT(*) FROM habits WHERE user_id = 'USER_ID_HERE'
UNION ALL
SELECT 'Habit Logs', COUNT(*) FROM habit_logs WHERE user_id = 'USER_ID_HERE'
UNION ALL
SELECT 'Experiments', COUNT(*) FROM experiments WHERE user_id = 'USER_ID_HERE'
UNION ALL
SELECT 'Experiment Logs', COUNT(*) FROM experiment_logs WHERE user_id = 'USER_ID_HERE'
UNION ALL
SELECT 'Productivity Logs', COUNT(*) FROM productivity_logs WHERE user_id = 'USER_ID_HERE'
UNION ALL
SELECT 'Intimacy Logs', COUNT(*) FROM intimacy_logs WHERE user_id = 'USER_ID_HERE'
UNION ALL
SELECT 'Mental Clarity Tests', COUNT(*) FROM mental_clarity_tests WHERE user_id = 'USER_ID_HERE';

