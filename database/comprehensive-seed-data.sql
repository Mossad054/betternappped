-- Comprehensive Seed Data Script for Betternapped Demo User
-- This script creates 60 days of realistic demo data for testing and guest mode
-- 
-- SETUP INSTRUCTIONS:
-- 1. Sign up demo@betternapped.com via the app
-- 2. Get the user ID from Supabase dashboard: SELECT id FROM auth.users WHERE email = 'demo@betternapped.com';
-- 3. Replace DEMO_USER_ID below with the actual user ID
-- 4. Run this script in Supabase SQL Editor
-- 5. Verify data appears in all tables

DO $$
DECLARE
  demo_user_id UUID := 'DEMO_USER_ID'; -- REPLACE THIS WITH ACTUAL USER ID
  current_date DATE := CURRENT_DATE;
  i INTEGER;
  mood_score INTEGER;
  sleep_hours DECIMAL(3,1);
  sleep_quality INTEGER;
  activity_count INTEGER;
  habit_completion BOOLEAN;
  productivity_score INTEGER;
  intimacy_score INTEGER;
  mental_clarity_score INTEGER;
BEGIN
  -- Verify demo user exists
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = demo_user_id) THEN
    RAISE EXCEPTION 'Demo user with ID % not found. Please sign up demo@betternapped.com first.', demo_user_id;
  END IF;

  RAISE NOTICE 'Seeding demo data for user: %', demo_user_id;

  -- Insert 60 days of mood logs
  FOR i IN 0..59 LOOP
    -- Generate realistic mood patterns
    mood_score := CASE 
      WHEN i % 7 = 0 THEN 4 + (random() * 2)::INTEGER -- Sundays tend to be good
      WHEN i % 7 = 1 THEN 3 + (random() * 2)::INTEGER -- Mondays vary
      WHEN i % 7 = 2 THEN 3 + (random() * 2)::INTEGER -- Tuesdays vary
      WHEN i % 7 = 3 THEN 3 + (random() * 2)::INTEGER -- Wednesdays vary
      WHEN i % 7 = 4 THEN 3 + (random() * 2)::INTEGER -- Thursdays vary
      WHEN i % 7 = 5 THEN 4 + (random() * 2)::INTEGER -- Fridays tend to be good
      WHEN i % 7 = 6 THEN 4 + (random() * 2)::INTEGER -- Saturdays tend to be good
    END;
    
    -- Ensure mood score is between 1-5
    mood_score := GREATEST(1, LEAST(5, mood_score));

    INSERT INTO mood_logs (user_id, date, moods, score, emoji, notes) VALUES (
      demo_user_id,
      current_date - i,
      CASE mood_score
        WHEN 1 THEN '["Sad", "Frustrated"]'::jsonb
        WHEN 2 THEN '["Tired", "Stressed"]'::jsonb
        WHEN 3 THEN '["Neutral", "Calm"]'::jsonb
        WHEN 4 THEN '["Happy", "Content"]'::jsonb
        WHEN 5 THEN '["Excited", "Joyful"]'::jsonb
      END,
      mood_score,
      CASE mood_score
        WHEN 1 THEN '😢'
        WHEN 2 THEN '😰'
        WHEN 3 THEN '😐'
        WHEN 4 THEN '😊'
        WHEN 5 THEN '😄'
      END,
      CASE 
        WHEN mood_score >= 4 THEN 'Feeling great today!'
        WHEN mood_score = 3 THEN 'Pretty average day'
        ELSE 'Having a tough day'
      END
    );
  END LOOP;

  -- Insert 60 days of sleep logs
  FOR i IN 0..59 LOOP
    -- Generate realistic sleep patterns
    sleep_hours := CASE 
      WHEN i % 7 = 0 THEN 8.0 + (random() * 2.0) -- Sundays: longer sleep
      WHEN i % 7 = 1 THEN 6.5 + (random() * 1.5) -- Mondays: shorter
      WHEN i % 7 = 2 THEN 7.0 + (random() * 1.5) -- Tuesdays: average
      WHEN i % 7 = 3 THEN 7.0 + (random() * 1.5) -- Wednesdays: average
      WHEN i % 7 = 4 THEN 7.0 + (random() * 1.5) -- Thursdays: average
      WHEN i % 7 = 5 THEN 7.5 + (random() * 2.0) -- Fridays: longer
      WHEN i % 7 = 6 THEN 8.0 + (random() * 2.0) -- Saturdays: longest
    END;
    
    sleep_quality := CASE 
      WHEN sleep_hours >= 8.0 THEN 4 + (random() * 2)::INTEGER
      WHEN sleep_hours >= 7.0 THEN 3 + (random() * 2)::INTEGER
      ELSE 2 + (random() * 2)::INTEGER
    END;
    
    sleep_quality := GREATEST(1, LEAST(5, sleep_quality));

    INSERT INTO sleep_logs (user_id, date, bedtime, wake_time, hours, quality, waking_feeling) VALUES (
      demo_user_id,
      current_date - i,
      CASE 
        WHEN i % 7 IN (0, 6) THEN '23:30' -- Weekends: later bedtime
        ELSE '22:30' -- Weekdays: earlier bedtime
      END,
      CASE 
        WHEN i % 7 IN (0, 6) THEN '08:00' -- Weekends: later wake
        ELSE '06:30' -- Weekdays: earlier wake
      END,
      sleep_hours,
      sleep_quality,
      CASE sleep_quality
        WHEN 1 THEN 'exhausted'
        WHEN 2 THEN 'tired'
        WHEN 3 THEN 'okay'
        WHEN 4 THEN 'refreshed'
        WHEN 5 THEN 'energized'
      END
    );
  END LOOP;

  -- Insert activities (multiple per day)
  FOR i IN 0..59 LOOP
    activity_count := 2 + (random() * 4)::INTEGER; -- 2-6 activities per day
    
    FOR j IN 1..activity_count LOOP
      INSERT INTO activities (user_id, date, activity_type, duration_minutes, intensity, notes) VALUES (
        demo_user_id,
        current_date - i,
        CASE (random() * 8)::INTEGER
          WHEN 0 THEN 'Exercise'
          WHEN 1 THEN 'Work'
          WHEN 2 THEN 'Social'
          WHEN 3 THEN 'Hobby'
          WHEN 4 THEN 'Reading'
          WHEN 5 THEN 'Cooking'
          WHEN 6 THEN 'Walking'
          WHEN 7 THEN 'Meditation'
        END,
        15 + (random() * 120)::INTEGER, -- 15-135 minutes
        CASE (random() * 3)::INTEGER
          WHEN 0 THEN 'Low'
          WHEN 1 THEN 'Medium'
          WHEN 2 THEN 'High'
        END,
        CASE (random() * 3)::INTEGER
          WHEN 0 THEN 'Great session!'
          WHEN 1 THEN 'Felt good'
          WHEN 2 THEN 'Could be better'
        END
      );
    END LOOP;
  END LOOP;

  -- Insert habits (8 habits with 60 days of tracking)
  INSERT INTO habits (user_id, name, description, category, total_days, streak, reminder_enabled) VALUES
    (demo_user_id, 'Morning Meditation', '10 minutes of mindfulness meditation', 'wellness', 60, 0, true),
    (demo_user_id, 'Daily Walk', '30-minute walk outside', 'fitness', 60, 0, true),
    (demo_user_id, 'Read Books', 'Read for at least 30 minutes', 'learning', 60, 0, false),
    (demo_user_id, 'Drink Water', 'Drink 8 glasses of water', 'health', 60, 0, true),
    (demo_user_id, 'Journal Writing', 'Write in journal for 15 minutes', 'mindfulness', 60, 0, false),
    (demo_user_id, 'No Phone Before Bed', 'No phone 1 hour before sleep', 'digital-wellness', 60, 0, true),
    (demo_user_id, 'Eat Vegetables', 'Include vegetables in every meal', 'nutrition', 60, 0, false),
    (demo_user_id, 'Practice Gratitude', 'Write down 3 things I am grateful for', 'mindfulness', 60, 0, false);

  -- Insert habit completions for each habit
  FOR i IN 0..59 LOOP
    -- Get all habit IDs for this user
    FOR habit_rec IN (SELECT id FROM habits WHERE user_id = demo_user_id) LOOP
      -- 70% completion rate on average
      habit_completion := (random() < 0.7);
      
      INSERT INTO habit_completions (habit_id, user_id, date, completed, notes) VALUES (
        habit_rec.id,
        demo_user_id,
        current_date - i,
        habit_completion,
        CASE 
          WHEN habit_completion THEN 'Completed successfully'
          ELSE 'Missed today'
        END
      );
    END LOOP;
  END LOOP;

  -- Insert experiments (4 experiments: 2 active, 2 completed)
  INSERT INTO experiments (user_id, title, description, hypothesis, start_date, end_date, status, metrics) VALUES
    (demo_user_id, 'Early Morning Exercise', 'Test if morning workouts improve energy throughout the day', 'Morning exercise will increase energy levels and mood', current_date - 30, current_date + 30, 'active', '["energy_level", "mood_score", "productivity"]'::jsonb),
    (demo_user_id, 'Digital Detox', 'Reduce screen time before bed to improve sleep quality', 'Less screen time before bed will improve sleep quality', current_date - 20, current_date + 40, 'active', '["sleep_quality", "sleep_hours"]'::jsonb),
    (demo_user_id, 'Meditation Impact', 'Daily meditation effects on stress and focus', 'Daily meditation reduces stress and improves focus', current_date - 60, current_date - 10, 'completed', '["stress_level", "focus_score", "mood_score"]'::jsonb),
    (demo_user_id, 'Hydration Challenge', 'Drink more water to improve overall wellness', 'Increased water intake improves energy and skin health', current_date - 45, current_date - 15, 'completed', '["energy_level", "skin_condition", "mood_score"]'::jsonb);

  -- Insert experiment tracking data
  FOR i IN 0..59 LOOP
    -- For active experiments (last 30 days)
    IF i <= 30 THEN
      INSERT INTO experiment_tracking (experiment_id, user_id, date, metrics_data, notes) VALUES
        ((SELECT id FROM experiments WHERE user_id = demo_user_id AND title = 'Early Morning Exercise'), demo_user_id, current_date - i, '{"energy_level": 4, "mood_score": 4, "productivity": 3}'::jsonb, 'Morning workout completed'),
        ((SELECT id FROM experiments WHERE user_id = demo_user_id AND title = 'Digital Detox'), demo_user_id, current_date - i, '{"sleep_quality": 4, "sleep_hours": 7.5}'::jsonb, 'Reduced screen time before bed');
    END IF;
    
    -- For completed experiments (historical data)
    IF i >= 10 AND i <= 60 THEN
      INSERT INTO experiment_tracking (experiment_id, user_id, date, metrics_data, notes) VALUES
        ((SELECT id FROM experiments WHERE user_id = demo_user_id AND title = 'Meditation Impact'), demo_user_id, current_date - i, '{"stress_level": 2, "focus_score": 4, "mood_score": 4}'::jsonb, 'Daily meditation session'),
        ((SELECT id FROM experiments WHERE user_id = demo_user_id AND title = 'Hydration Challenge'), demo_user_id, current_date - i, '{"energy_level": 4, "skin_condition": 4, "mood_score": 4}'::jsonb, 'Drank 8 glasses of water');
    END IF;
  END LOOP;

  -- Insert productivity logs
  FOR i IN 0..59 LOOP
    productivity_score := 3 + (random() * 2)::INTEGER; -- 3-5 range
    
    INSERT INTO productivity_logs (user_id, date, focus_score, tasks_completed, distractions, notes) VALUES (
      demo_user_id,
      current_date - i,
      productivity_score,
      3 + (random() * 7)::INTEGER, -- 3-10 tasks
      CASE (random() * 3)::INTEGER
        WHEN 0 THEN 'Low'
        WHEN 1 THEN 'Medium'
        WHEN 2 THEN 'High'
      END,
      CASE productivity_score
        WHEN 5 THEN 'Highly productive day!'
        WHEN 4 THEN 'Good focus and output'
        WHEN 3 THEN 'Average productivity'
        ELSE 'Struggled to focus'
      END
    );
  END LOOP;

  -- Insert intimacy logs (20 entries over 60 days)
  FOR i IN 0..19 LOOP
    intimacy_score := 3 + (random() * 2)::INTEGER; -- 3-5 range
    
    INSERT INTO intimacy_logs (user_id, date, type, quality_score, duration_minutes, notes) VALUES (
      demo_user_id,
      current_date - (i * 3), -- Every 3 days
      CASE (random() * 2)::INTEGER
        WHEN 0 THEN 'solo'
        WHEN 1 THEN 'partner'
      END,
      intimacy_score,
      15 + (random() * 45)::INTEGER, -- 15-60 minutes
      CASE intimacy_score
        WHEN 5 THEN 'Amazing experience'
        WHEN 4 THEN 'Very satisfying'
        WHEN 3 THEN 'Good overall'
        ELSE 'Could be better'
      END
    );
  END LOOP;

  -- Insert mental clarity tests (10 tests over 60 days)
  FOR i IN 0..9 LOOP
    mental_clarity_score := 3 + (random() * 2)::INTEGER; -- 3-5 range
    
    INSERT INTO mental_clarity_tests (user_id, date, score, test_type, notes) VALUES (
      demo_user_id,
      current_date - (i * 6), -- Every 6 days
      mental_clarity_score,
      CASE (random() * 3)::INTEGER
        WHEN 0 THEN 'focus'
        WHEN 1 THEN 'memory'
        WHEN 2 THEN 'creativity'
      END,
      CASE mental_clarity_score
        WHEN 5 THEN 'Excellent mental clarity'
        WHEN 4 THEN 'Good mental state'
        WHEN 3 THEN 'Average clarity'
        ELSE 'Feeling foggy'
      END
    );
  END LOOP;

  RAISE NOTICE 'Demo data seeding completed successfully!';
  RAISE NOTICE 'Created:';
  RAISE NOTICE '- 60 mood logs';
  RAISE NOTICE '- 60 sleep logs';
  RAISE NOTICE '- ~300 activity entries';
  RAISE NOTICE '- 8 habits with 60 days of tracking';
  RAISE NOTICE '- 4 experiments (2 active, 2 completed)';
  RAISE NOTICE '- 60 productivity logs';
  RAISE NOTICE '- 20 intimacy logs';
  RAISE NOTICE '- 10 mental clarity tests';

END $$;

