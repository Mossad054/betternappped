-- =====================================================
-- PAST DATE HABIT COMPLETION WITH STREAK CALCULATION
-- Allows users to mark habits complete for past dates
-- Automatically calculates streaks and cycle days
-- =====================================================

-- Function to calculate habit streak based on consecutive days
CREATE OR REPLACE FUNCTION calculate_habit_streak(
  p_habit_id UUID,
  p_user_id UUID
)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_streak INTEGER := 0;
  v_current_date DATE;
  v_check_date DATE;
  v_has_log BOOLEAN;
BEGIN
  -- Get the current date
  v_current_date := CURRENT_DATE;
  v_check_date := v_current_date;
  
  -- Count consecutive days backward from today
  LOOP
    -- Check if there's a completed log for this date
    SELECT EXISTS(
      SELECT 1 FROM public.habit_logs
      WHERE habit_id = p_habit_id
        AND user_id = p_user_id
        AND date = v_check_date
        AND completed = true
    ) INTO v_has_log;
    
    -- If no log found, break the loop
    EXIT WHEN NOT v_has_log;
    
    -- Increment streak
    v_streak := v_streak + 1;
    
    -- Move to previous day
    v_check_date := v_check_date - INTERVAL '1 day';
    
    -- Safety check to prevent infinite loops (max 365 days)
    EXIT WHEN v_streak >= 365;
  END LOOP;
  
  RETURN v_streak;
END;
$$;

-- Function to calculate current day in habit cycle
CREATE OR REPLACE FUNCTION calculate_habit_cycle_day(
  p_habit_id UUID,
  p_user_id UUID
)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_completed_count INTEGER;
BEGIN
  -- Count total completed logs for this habit
  SELECT COUNT(*)
  INTO v_completed_count
  FROM public.habit_logs
  WHERE habit_id = p_habit_id
    AND user_id = p_user_id
    AND completed = true;
  
  -- Return the count + 1 as the next cycle day
  -- If no logs yet, this returns 1
  RETURN COALESCE(v_completed_count, 0) + 1;
END;
$$;

-- Function to log habit completion for any date (past or present)
CREATE OR REPLACE FUNCTION log_habit_for_date(
  p_habit_id UUID,
  p_user_id UUID,
  p_date DATE,
  p_completed BOOLEAN DEFAULT true,
  p_feedback TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  v_log_id UUID;
  v_streak INTEGER;
  v_cycle_day INTEGER;
  v_habit_name TEXT;
  v_habit_total_days INTEGER;
  v_result JSONB;
BEGIN
  -- Validate that the date is not in the future
  IF p_date > CURRENT_DATE THEN
    RAISE EXCEPTION 'Cannot log habits for future dates';
  END IF;
  
  -- Validate that the date is within the last 3 months
  IF p_date < (CURRENT_DATE - INTERVAL '3 months')::DATE THEN
    RAISE EXCEPTION 'Cannot log habits for dates more than 3 months in the past';
  END IF;
  
  -- Get habit details
  SELECT name, total_days
  INTO v_habit_name, v_habit_total_days
  FROM public.habits
  WHERE id = p_habit_id AND user_id = p_user_id;
  
  IF v_habit_name IS NULL THEN
    RAISE EXCEPTION 'Habit not found or access denied';
  END IF;
  
  -- Insert or update habit log
  INSERT INTO public.habit_logs (
    habit_id,
    user_id,
    date,
    completed,
    feedback
  )
  VALUES (
    p_habit_id,
    p_user_id,
    p_date,
    p_completed,
    p_feedback
  )
  ON CONFLICT (habit_id, date)
  DO UPDATE SET
    completed = EXCLUDED.completed,
    feedback = EXCLUDED.feedback
  RETURNING id INTO v_log_id;
  
  -- Calculate streak (only if marking as completed)
  IF p_completed THEN
    v_streak := calculate_habit_streak(p_habit_id, p_user_id);
    
    -- Update habit with new streak
    UPDATE public.habits
    SET streak = v_streak,
        updated_at = NOW()
    WHERE id = p_habit_id AND user_id = p_user_id;
  ELSE
    -- If marking as incomplete, recalculate streak
    v_streak := calculate_habit_streak(p_habit_id, p_user_id);
    
    UPDATE public.habits
    SET streak = v_streak,
        updated_at = NOW()
    WHERE id = p_habit_id AND user_id = p_user_id;
  END IF;
  
  -- Calculate current cycle day
  v_cycle_day := calculate_habit_cycle_day(p_habit_id, p_user_id);
  
  -- Build result JSON
  v_result := jsonb_build_object(
    'log_id', v_log_id,
    'habit_id', p_habit_id,
    'habit_name', v_habit_name,
    'date', p_date,
    'completed', p_completed,
    'streak', v_streak,
    'cycle_day', v_cycle_day - 1, -- Subtract 1 because we already counted the new log
    'total_days', v_habit_total_days,
    'feedback', p_feedback
  );
  
  RETURN v_result;
END;
$$;

-- Function to get habits with their completion status for a specific date
CREATE OR REPLACE FUNCTION get_habits_for_date(
  p_user_id UUID,
  p_date DATE
)
RETURNS TABLE (
  habit_id UUID,
  habit_name TEXT,
  habit_emoji TEXT,
  habit_description TEXT,
  habit_category TEXT,
  habit_streak INTEGER,
  habit_total_days INTEGER,
  completed BOOLEAN,
  feedback TEXT,
  cycle_day INTEGER
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    h.id AS habit_id,
    h.name AS habit_name,
    h.emoji AS habit_emoji,
    h.description AS habit_description,
    h.category AS habit_category,
    h.streak AS habit_streak,
    h.total_days AS habit_total_days,
    COALESCE(hl.completed, false) AS completed,
    hl.feedback,
    (
      SELECT COUNT(*)::INTEGER
      FROM public.habit_logs hl2
      WHERE hl2.habit_id = h.id
        AND hl2.user_id = p_user_id
        AND hl2.completed = true
        AND hl2.date <= p_date
    ) AS cycle_day
  FROM public.habits h
  LEFT JOIN public.habit_logs hl 
    ON hl.habit_id = h.id 
    AND hl.date = p_date
    AND hl.user_id = p_user_id
  WHERE h.user_id = p_user_id
  ORDER BY h.created_at DESC;
END;
$$;

-- Function to bulk mark multiple habits for a date
CREATE OR REPLACE FUNCTION bulk_log_habits_for_date(
  p_user_id UUID,
  p_date DATE,
  p_habit_logs JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  v_habit_log JSONB;
  v_results JSONB := '[]'::jsonb;
  v_result JSONB;
BEGIN
  -- Validate date
  IF p_date > CURRENT_DATE THEN
    RAISE EXCEPTION 'Cannot log habits for future dates';
  END IF;
  
  IF p_date < (CURRENT_DATE - INTERVAL '3 months')::DATE THEN
    RAISE EXCEPTION 'Cannot log habits for dates more than 3 months in the past';
  END IF;
  
  -- Loop through each habit log entry
  FOR v_habit_log IN SELECT * FROM jsonb_array_elements(p_habit_logs)
  LOOP
    -- Log the habit
    v_result := log_habit_for_date(
      (v_habit_log->>'habit_id')::UUID,
      p_user_id,
      p_date,
      (v_habit_log->>'completed')::BOOLEAN,
      v_habit_log->>'feedback'
    );
    
    -- Add to results array
    v_results := v_results || jsonb_build_array(v_result);
  END LOOP;
  
  RETURN jsonb_build_object(
    'success', true,
    'date', p_date,
    'results', v_results
  );
END;
$$;

-- Add index for better performance on streak calculations
CREATE INDEX IF NOT EXISTS idx_habit_logs_habit_user_date_completed 
  ON public.habit_logs(habit_id, user_id, date DESC, completed)
  WHERE completed = true;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION calculate_habit_streak(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_habit_cycle_day(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION log_habit_for_date(UUID, UUID, DATE, BOOLEAN, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_habits_for_date(UUID, DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION bulk_log_habits_for_date(UUID, DATE, JSONB) TO authenticated;
-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Past date habit completion system created successfully!';
  RAISE NOTICE 'Functions created:';
  RAISE NOTICE '  - calculate_habit_streak: Calculates consecutive day streaks';
  RAISE NOTICE '  - calculate_habit_cycle_day: Calculates current day in habit cycle';
  RAISE NOTICE '  - log_habit_for_date: Logs habit completion for any date';
  RAISE NOTICE '  - get_habits_for_date: Gets all habits with completion status for a date';
  RAISE NOTICE '  - bulk_log_habits_for_date: Logs multiple habits at once';
END $$;
