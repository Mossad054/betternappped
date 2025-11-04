/**
 * Supabase Database Function: On Event Create
 * Date: 2025-11-05
 * Purpose: Database trigger to evaluate events and queue notifications
 * 
 * This is a PostgreSQL function that runs on database triggers.
 * Deploy via Supabase SQL Editor or migration file.
 */

-- Function to handle notification logic when events are created
CREATE OR REPLACE FUNCTION public.on_event_create_notification()
RETURNS TRIGGER AS $$
DECLARE
  v_user_id UUID;
  v_notification_type TEXT;
  v_preference RECORD;
  v_priority TEXT;
  v_should_notify BOOLEAN;
BEGIN
  -- Extract user_id from the new row
  v_user_id := NEW.user_id;
  
  -- Determine notification type based on table
  CASE TG_TABLE_NAME
    WHEN 'habit_logs' THEN
      -- Check for streak milestones
      IF NEW.completed THEN
        -- Get habit streak
        SELECT streak INTO v_notification_type
        FROM habits
        WHERE id = NEW.habit_id;
        
        -- Check if milestone
        IF (SELECT streak FROM habits WHERE id = NEW.habit_id) IN (7, 30, 60, 100) THEN
          v_notification_type := 'streak_alert';
          v_priority := 'high';
          v_should_notify := TRUE;
        END IF;
      END IF;
    
    WHEN 'experiments' THEN
      -- New experiment created
      v_notification_type := 'experiment_reminder';
      v_priority := 'normal';
      v_should_notify := TRUE;
    
    WHEN 'mood_logs' THEN
      -- Check for low mood patterns (could trigger insight)
      IF NEW.score <= 2 THEN
        v_notification_type := 'activity_insight';
        v_priority := 'normal';
        v_should_notify := TRUE;
      END IF;
    
    ELSE
      RETURN NEW;
  END CASE;
  
  -- If no notification needed, exit early
  IF NOT v_should_notify THEN
    RETURN NEW;
  END IF;
  
  -- Get user's notification preferences
  SELECT * INTO v_preference
  FROM notification_preferences
  WHERE user_id = v_user_id
    AND type = v_notification_type
    AND enabled = TRUE
  LIMIT 1;
  
  -- If user has this notification type disabled, exit
  IF v_preference IS NULL THEN
    RETURN NEW;
  END IF;
  
  -- Check quiet hours (only for normal priority)
  IF v_priority = 'normal' AND v_preference.quiet_hours_start IS NOT NULL THEN
    -- TODO: Implement quiet hours check
    -- For now, queue for later delivery if in quiet hours
  END IF;
  
  -- Queue notification for each enabled channel
  IF v_preference.frequency = 'immediate' THEN
    -- Create notification immediately for each channel
    FOR i IN SELECT jsonb_array_elements_text(v_preference.channels) AS channel
    LOOP
      INSERT INTO notifications (
        user_id,
        type,
        channel,
        status,
        payload,
        send_after
      ) VALUES (
        v_user_id,
        v_notification_type,
        i.channel,
        'queued',
        jsonb_build_object(
          'title', 'New Activity',
          'body', 'You have a new wellness event',
          'data', jsonb_build_object('source', TG_TABLE_NAME, 'event_id', NEW.id)
        ),
        NOW()
      );
    END LOOP;
  ELSIF v_preference.frequency IN ('daily_digest', 'weekly_digest') THEN
    -- Add to digest queue (will be processed by schedule function)
    -- For now, just log
    RAISE NOTICE 'Event will be included in % for user %', v_preference.frequency, v_user_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers on relevant tables
DROP TRIGGER IF EXISTS trigger_habit_log_notification ON habit_logs;
CREATE TRIGGER trigger_habit_log_notification
  AFTER INSERT ON habit_logs
  FOR EACH ROW
  EXECUTE FUNCTION on_event_create_notification();

DROP TRIGGER IF EXISTS trigger_experiment_notification ON experiments;
CREATE TRIGGER trigger_experiment_notification
  AFTER INSERT ON experiments
  FOR EACH ROW
  EXECUTE FUNCTION on_event_create_notification();

DROP TRIGGER IF EXISTS trigger_mood_log_notification ON mood_logs;
CREATE TRIGGER trigger_mood_log_notification
  AFTER INSERT ON mood_logs
  FOR EACH ROW
  EXECUTE FUNCTION on_event_create_notification();

-- Comments
COMMENT ON FUNCTION public.on_event_create_notification() IS 
  'Evaluates new events against user notification preferences and queues appropriate notifications';

/*
 * DEPLOYMENT:
 * Run this SQL in Supabase SQL Editor or as a migration file
 * 
 * ENHANCEMENT IDEAS:
 * 1. Add more sophisticated quiet hours logic
 * 2. Implement flood control (max notifications per day)
 * 3. Add priority-based batching logic
 * 4. Create digest accumulation table
 * 5. Add unsubscribe token generation
 */
