-- Function to auto-seed data for new users
-- Run this in Supabase SQL Editor to enable automatic data seeding

CREATE OR REPLACE FUNCTION seed_new_user_data()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert sample mood logs for the past 7 days
  INSERT INTO mood_logs (user_id, date, moods, score, emoji, notes)
  SELECT NEW.id, CURRENT_DATE - (n || ' days')::interval, 
         CASE 
           WHEN n = 1 THEN '["Happy", "Energetic"]'::jsonb
           WHEN n = 2 THEN '["Calm", "Content"]'::jsonb
           WHEN n = 3 THEN '["Stressed", "Anxious"]'::jsonb
           WHEN n = 4 THEN '["Excited", "Motivated"]'::jsonb
           WHEN n = 5 THEN '["Tired", "Frustrated"]'::jsonb
           WHEN n = 6 THEN '["Grateful", "Peaceful"]'::jsonb
           ELSE '["Confident", "Proud"]'::jsonb
         END,
         CASE 
           WHEN n IN (1, 4, 6, 7) THEN 4
           WHEN n IN (2, 3) THEN 3
           ELSE 2
         END,
         CASE 
           WHEN n = 1 THEN '😊'
           WHEN n = 2 THEN '😌'
           WHEN n = 3 THEN '😰'
           WHEN n = 4 THEN '🚀'
           WHEN n = 5 THEN '😴'
           WHEN n = 6 THEN '🙏'
           ELSE '💪'
         END,
         CASE 
           WHEN n = 1 THEN 'Great day overall!'
           WHEN n = 2 THEN 'Relaxing evening'
           WHEN n = 3 THEN 'Work was overwhelming'
           WHEN n = 4 THEN 'New project started'
           WHEN n = 5 THEN 'Long day at work'
           WHEN n = 6 THEN 'Spent time with family'
           ELSE 'Completed a big task'
         END
  FROM generate_series(1, 7) n;
  
  -- Insert sample sleep logs for the past 7 days
  INSERT INTO sleep_logs (user_id, date, bedtime, wake_time, hours, quality, waking_feeling)
  SELECT NEW.id, CURRENT_DATE - (n || ' days')::interval,
         CASE 
           WHEN n = 1 THEN '23:00'
           WHEN n = 2 THEN '22:45'
           WHEN n = 3 THEN '00:30'
           WHEN n = 4 THEN '23:30'
           WHEN n = 5 THEN '01:00'
           WHEN n = 6 THEN '22:30'
           ELSE '23:15'
         END,
         CASE 
           WHEN n = 1 THEN '07:00'
           WHEN n = 2 THEN '07:15'
           WHEN n = 3 THEN '06:30'
           WHEN n = 4 THEN '07:30'
           WHEN n = 5 THEN '08:00'
           WHEN n = 6 THEN '07:00'
           ELSE '07:45'
         END,
         CASE 
           WHEN n = 1 THEN 8.0
           WHEN n = 2 THEN 8.5
           WHEN n = 3 THEN 6.0
           WHEN n = 4 THEN 8.0
           WHEN n = 5 THEN 7.0
           WHEN n = 6 THEN 8.5
           ELSE 8.5
         END,
         CASE 
           WHEN n IN (1, 2, 6, 7) THEN 4
           WHEN n = 3 THEN 2
           WHEN n = 4 THEN 4
           ELSE 3
         END,
         CASE 
           WHEN n IN (1, 2, 6, 7) THEN 'refreshed'
           WHEN n = 3 THEN 'tired'
           WHEN n = 4 THEN 'rested'
           ELSE 'groggy'
         END
  FROM generate_series(1, 7) n;
  
  -- Insert sample activities for the past 7 days
  INSERT INTO activities (user_id, date, category, name, duration, emoji)
  SELECT NEW.id, CURRENT_DATE - (n || ' days')::interval,
         CASE 
           WHEN n = 1 THEN 'exercise'
           WHEN n = 2 THEN 'social'
           WHEN n = 3 THEN 'work'
           WHEN n = 4 THEN 'wellness'
           WHEN n = 5 THEN 'creative'
           WHEN n = 6 THEN 'learning'
           ELSE 'social'
         END,
         CASE 
           WHEN n = 1 THEN 'Morning Run'
           WHEN n = 2 THEN 'Coffee with Friends'
           WHEN n = 3 THEN 'Project Meeting'
           WHEN n = 4 THEN 'Yoga Class'
           WHEN n = 5 THEN 'Painting Session'
           WHEN n = 6 THEN 'Online Course'
           ELSE 'Dinner with Family'
         END,
         CASE 
           WHEN n = 1 THEN 30
           WHEN n = 2 THEN 60
           WHEN n = 3 THEN 90
           WHEN n = 4 THEN 60
           WHEN n = 5 THEN 45
           WHEN n = 6 THEN 45
           ELSE 120
         END,
         CASE 
           WHEN n = 1 THEN '🏃'
           WHEN n = 2 THEN '☕'
           WHEN n = 3 THEN '💼'
           WHEN n = 4 THEN '🧘'
           WHEN n = 5 THEN '🎨'
           WHEN n = 6 THEN '📚'
           ELSE '🍽️'
         END
  FROM generate_series(1, 7) n;
  
  -- Insert sample habits
  INSERT INTO habits (user_id, name, description, category, total_days, streak, reminder_enabled, reminder_time, quote) VALUES
    (NEW.id, 'Morning Meditation', '10 minutes of mindfulness practice', 'wellness', 30, 3, true, '07:00', 'Start each day with intention'),
    (NEW.id, 'Read Before Bed', '20 minutes of reading', 'learning', 30, 2, true, '21:30', 'Books are the quietest and most constant of friends'),
    (NEW.id, 'Daily Walk', '30-minute walk for fresh air', 'exercise', 30, 5, true, '18:00', 'Walking is man''s best medicine'),
    (NEW.id, 'Gratitude Journal', 'Write 3 things I''m grateful for', 'wellness', 30, 1, true, '22:00', 'Gratitude turns what we have into enough'),
    (NEW.id, 'Drink Water', '8 glasses of water daily', 'health', 30, 4, false, null, 'Water is life');
  
  -- Insert habit logs for the past 7 days
  INSERT INTO habit_logs (habit_id, user_id, date, completed, feedback)
  SELECT h.id, NEW.id, CURRENT_DATE - (n || ' days')::interval,
         CASE WHEN random() > 0.3 THEN true ELSE false END,
         CASE WHEN random() > 0.3 THEN 
           CASE WHEN random() > 0.5 THEN 'good' ELSE 'neutral' END 
         ELSE 'bad' END
  FROM habits h, generate_series(1, 7) n
  WHERE h.user_id = NEW.id;
  
  -- Insert a sample experiment
  INSERT INTO experiments (user_id, activity_name, activity_emoji, outcomes, start_date, end_date, duration, status, current_day, baseline_data, results_data, insights) VALUES
    (NEW.id, 'Morning Meditation', '🧘', '["mood", "focus", "stress"]'::jsonb, CURRENT_DATE - 3, CURRENT_DATE + 27, 30, 'active', 4, 
     '{"mood_before": 3.2, "focus_score": 2.8, "stress_level": 4.1}'::jsonb,
     '{"mood_improvement": 0.5, "focus_improvement": 0.8, "stress_reduction": 0.9}'::jsonb,
     'Early results show meditation is helping with daily mood and focus');
  
  -- Insert experiment logs for the past 3 days
  INSERT INTO experiment_logs (experiment_id, user_id, date, completed, skipped, outcome_scores, notes)
  SELECT e.id, NEW.id, CURRENT_DATE - (n || ' days')::interval,
         CASE WHEN random() > 0.1 THEN true ELSE false END,
         CASE WHEN random() > 0.9 THEN true ELSE false END,
         '{"mood": 3.5, "energy": 4.0, "focus": 3.8}'::jsonb,
         CASE WHEN random() > 0.5 THEN 'Feeling good today' ELSE null END
  FROM experiments e, generate_series(1, 3) n
  WHERE e.user_id = NEW.id;
  
  -- Insert sample productivity logs for the past 7 days
  INSERT INTO productivity_logs (user_id, date, rating, focused_hours, factors, other_factor) VALUES
    (NEW.id, CURRENT_DATE - 1, 4, 6.5, '["good_sleep", "exercise", "healthy_meals"]'::jsonb, null),
    (NEW.id, CURRENT_DATE - 2, 2, 3.0, '["distractions", "meetings"]'::jsonb, 'Too many interruptions'),
    (NEW.id, CURRENT_DATE - 3, 5, 8.0, '["quiet_environment", "caffeine", "clear_goals"]'::jsonb, null),
    (NEW.id, CURRENT_DATE - 4, 3, 4.5, '["exercise", "good_sleep"]'::jsonb, 'Some focus issues'),
    (NEW.id, CURRENT_DATE - 5, 1, 2.0, '["stress", "distractions"]'::jsonb, 'Very difficult day'),
    (NEW.id, CURRENT_DATE - 6, 4, 6.0, '["exercise", "healthy_meals", "music"]'::jsonb, null),
    (NEW.id, CURRENT_DATE - 7, 3, 5.0, '["good_sleep"]'::jsonb, 'Average productivity');
  
  -- Insert sample mental clarity test results
  INSERT INTO mental_clarity_tests (user_id, date, score, factors) VALUES
    (NEW.id, CURRENT_DATE - 1, 8, '["good_sleep", "exercise", "meditation"]'::jsonb),
    (NEW.id, CURRENT_DATE - 3, 6, '["exercise", "caffeine"]'::jsonb),
    (NEW.id, CURRENT_DATE - 5, 4, '["stress", "poor_sleep"]'::jsonb),
    (NEW.id, CURRENT_DATE - 7, 9, '["excellent_sleep", "exercise", "meditation", "healthy_meals"]'::jsonb);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to auto-seed on user creation
CREATE TRIGGER trigger_seed_new_user
AFTER INSERT ON public.users
FOR EACH ROW
EXECUTE FUNCTION seed_new_user_data();

-- Verify the function and trigger were created
SELECT 'Auto-seed function and trigger created successfully' as status;

