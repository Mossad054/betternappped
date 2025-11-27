-- =====================================================
-- SEED SLEEP RECOMMENDATION RULES
-- Purpose: Insert 30+ data-driven sleep recommendation rules
-- Date: 2025-11-26
-- =====================================================

-- Clear existing rules (optional - uncomment if needed)
-- TRUNCATE public.sleep_recommendation_rules CASCADE;

-- =====================================================
-- 1. DURATION-BASED RECOMMENDATIONS
-- =====================================================

INSERT INTO public.sleep_recommendation_rules (rule_name, pattern_criteria, reason_template, recommendation_text, min_confidence, priority, tags, active) VALUES

('very_low_sleep_duration',
 '{"avgSleepHours": {"min": 0, "max": 5}}'::jsonb,
 'Your average sleep is {avgSleepHours}h, well below the recommended 7-9 hours.',
 'Try getting to bed 2-3 hours earlier tonight. Chronic sleep deprivation can significantly impact your health and wellbeing.',
 0.9, 10, ARRAY['duration', 'critical'], true),

('low_sleep_duration',
 '{"avgSleepHours": {"min": 5, "max": 6.5}}'::jsonb,
 'Your average sleep is {avgSleepHours}h, below the recommended 7-9 hours.',
 'Aim to add 1-2 hours to your sleep schedule. Start by going to bed 30 minutes earlier each night.',
 0.85, 9, ARRAY['duration', 'important'], true),

('slightly_low_duration',
 '{"avgSleepHours": {"min": 6.5, "max": 7}}'::jsonb,
 'Your average sleep is {avgSleepHours}h, slightly below optimal.',
 'Try adding 30-60 minutes to reach the recommended 7-9 hours. Even small increases can improve energy levels.',
 0.7, 7, ARRAY['duration', 'moderate'], true),

('optimal_duration',
 '{"avgSleepHours": {"min": 7, "max": 9}}'::jsonb,
 'Great! Your average sleep is {avgSleepHours}h, within the optimal range.',
 'Maintain your current sleep schedule and focus on consistency to maximize the benefits of quality sleep.',
 0.8, 5, ARRAY['duration', 'positive'], true),

('excessive_sleep',
 '{"avgSleepHours": {"min": 9.5, "max": 15}}'::jsonb,
 'Your average sleep is {avgSleepHours}h, which is above the typical range.',
 'While everyone''s needs differ, consistently oversleeping may indicate poor sleep quality or underlying health issues. Consider tracking your energy levels.',
 0.75, 7, ARRAY['duration', 'concern'], true),

-- =====================================================
-- 2. CONSISTENCY-BASED RECOMMENDATIONS
-- =====================================================

('very_low_consistency',
 '{"consistencyScore": {"min": 0, "max": 40}}'::jsonb,
 'Your sleep schedule consistency is {consistencyScore}%, indicating irregular sleep patterns.',
 'Set a consistent bedtime alarm for the same time every night, including weekends, to regulate your circadian rhythm.',
 0.85, 9, ARRAY['consistency', 'schedule'], true),

('low_consistency',
 '{"consistencyScore": {"min": 40, "max": 60}}'::jsonb,
 'Your sleep consistency is {consistencyScore}%, with room for improvement.',
 'Try to go to bed within a 30-minute window each night. Consistency is key to better sleep quality.',
 0.75, 8, ARRAY['consistency', 'schedule'], true),

('moderate_consistency',
 '{"consistencyScore": {"min": 60, "max": 80}}'::jsonb,
 'Your sleep consistency is {consistencyScore}%, which is pretty good!',
 'Fine-tune your schedule by narrowing your bedtime window to ±15 minutes for even better results.',
 0.65, 6, ARRAY['consistency', 'schedule'], true),

('high_consistency',
 '{"consistencyScore": {"min": 80, "max": 100}}'::jsonb,
 'Excellent! Your sleep consistency is {consistencyScore}%.',
 'Your consistent schedule is a strong foundation for great sleep. Keep it up and focus on optimizing sleep quality.',
 0.7, 4, ARRAY['consistency', 'positive'], true),

-- =====================================================
-- 3. QUALITY-BASED RECOMMENDATIONS
-- =====================================================

('poor_sleep_quality',
 '{"avgQuality": {"min": 0, "max": 2}}'::jsonb,
 'Your average sleep quality rating is {avgQuality}/5, indicating poor sleep.',
 'Focus on creating a sleep-friendly environment: keep your room dark, cool (60-67°F), and quiet. Consider blackout curtains and white noise.',
 0.8, 9, ARRAY['quality', 'environment'], true),

('fair_sleep_quality',
 '{"avgQuality": {"min": 2, "max": 3}}'::jsonb,
 'Your average sleep quality is {avgQuality}/5, which could be better.',
 'Try a relaxing bedtime routine: dim lights 1 hour before bed, avoid screens, and try reading or gentle stretching.',
 0.75, 7, ARRAY['quality', 'routine'], true),

('good_sleep_quality',
 '{"avgQuality": {"min": 3, "max": 4}}'::jsonb,
 'Your sleep quality is {avgQuality}/5, which is good!',
 'To reach excellent quality, experiment with sleep tracking to identify what improves your rest (e.g., exercise timing, meal timing).',
 0.6, 5, ARRAY['quality', 'optimization'], true),

('excellent_sleep_quality',
 '{"avgQuality": {"min": 4, "max": 5}}'::jsonb,
 'Outstanding! Your sleep quality is {avgQuality}/5.',
 'You''ve mastered quality sleep. Continue your healthy habits and consider sharing your routine with others!',
 0.7, 3, ARRAY['quality', 'positive'], true),

-- =====================================================
-- 4. WAKE TIME CONSISTENCY RECOMMENDATIONS
-- =====================================================

('low_wake_consistency',
 '{"wakeUpConsistency": "Low"}'::jsonb,
 'Your wake-up times vary significantly.',
 'Set a consistent wake-up alarm for the same time every day, including weekends. This regulates your internal clock more than bedtime.',
 0.8, 8, ARRAY['wake', 'consistency'], true),

('medium_wake_consistency',
 '{"wakeUpConsistency": "Medium"}'::jsonb,
 'Your wake-up times show moderate consistency.',
 'Try to wake up within a 15-minute window each day. Morning light exposure immediately upon waking can help solidify your schedule.',
 0.7, 6, ARRAY['wake', 'consistency'], true),

('high_wake_consistency',
 '{"wakeUpConsistency": "High"}'::jsonb,
 'Excellent! Your wake-up times are very consistent.',
 'Your consistent wake time is key to your sleep success. Pair this with morning sunlight exposure for optimal circadian rhythm.',
 0.65, 4, ARRAY['wake', 'positive'], true),

-- =====================================================
-- 5. WEEKEND VS WEEKDAY PATTERNS
-- =====================================================

('large_weekend_difference',
 '{"weekendDifference": {"min": 2, "max": 10}}'::jsonb,
 'You sleep {weekendDifference}h more on weekends than weekdays.',
 'This "social jet lag" disrupts your circadian rhythm. Try to keep weekend sleep within 1 hour of your weekday schedule.',
 0.85, 9, ARRAY['weekend', 'consistency'], true),

('moderate_weekend_difference',
 '{"weekendDifference": {"min": 1, "max": 2}}'::jsonb,
 'You sleep {weekendDifference}h more on weekends.',
 'Aim to reduce this difference to less than 1 hour. If you need more sleep, adjust your weeknight schedule earlier.',
 0.75, 7, ARRAY['weekend', 'consistency'], true),

('good_weekend_consistency',
 '{"weekendDifference": {"min": 0, "max": 1}}'::jsonb,
 'Great! Your weekend sleep is consistent with weekdays.',
 'This consistency supports a healthy circadian rhythm. Keep it up!',
 0.65, 4, ARRAY['weekend', 'positive'], true),

-- =====================================================
-- 6. BEDTIME TIMING RECOMMENDATIONS
-- =====================================================

('very_late_bedtime',
 '{"avgBedtimeHour": {"min": 2, "max": 6}}'::jsonb,
 'Your average bedtime is around {avgBedtimeHour}:00 (very late/early morning).',
 'Very late bedtimes can disrupt natural circadian rhythms. Gradually shift your bedtime earlier by 15 minutes every few days.',
 0.8, 8, ARRAY['bedtime', 'timing'], true),

('late_bedtime',
 '{"avgBedtimeHour": {"min": 0, "max": 2}}'::jsonb,
 'Your average bedtime is around {avgBedtimeHour}:00 (after midnight).',
 'Late bedtimes can affect sleep quality. Try moving your bedtime to 11 PM or earlier for better alignment with natural sleep cycles.',
 0.75, 7, ARRAY['bedtime', 'timing'], true),

('optimal_bedtime',
 '{"avgBedtimeHour": {"min": 21, "max": 23}}'::jsonb,
 'Your average bedtime around {avgBedtimeHour}:00 is well-aligned with natural rhythms.',
 'This timing supports melatonin production and deep sleep. Maintain this schedule for optimal rest.',
 0.65, 4, ARRAY['bedtime', 'positive'], true),

('very_early_bedtime',
 '{"avgBedtimeHour": {"min": 18, "max": 21}}'::jsonb,
 'Your bedtime around {avgBedtimeHour}:00 is quite early.',
 'While early bedtimes can work, ensure you''re not waking too early or experiencing sleep fragmentation. Adjust if needed.',
 0.65, 5, ARRAY['bedtime', 'timing'], true),

-- =====================================================
-- 7. COMBINED PATTERN RECOMMENDATIONS
-- =====================================================

('low_duration_poor_quality',
 '{"avgSleepHours": {"min": 0, "max": 6.5}, "avgQuality": {"min": 0, "max": 2.5}}'::jsonb,
 'Your sleep duration ({avgSleepHours}h) and quality ({avgQuality}/5) both need improvement.',
 'Start by adding 1 hour to your sleep schedule AND improving your sleep environment (dark, cool, quiet).',
 0.9, 10, ARRAY['duration', 'quality', 'critical'], true),

('good_duration_poor_quality',
 '{"avgSleepHours": {"min": 7, "max": 10}, "avgQuality": {"min": 0, "max": 2.5}}'::jsonb,
 'You''re getting enough hours ({avgSleepHours}h) but quality is low ({avgQuality}/5).',
 'Focus on sleep hygiene: limit caffeine after 2 PM, avoid alcohol before bed, and keep your bedroom cool.',
 0.85, 9, ARRAY['quality', 'habits'], true),

('poor_duration_good_quality',
 '{"avgSleepHours": {"min": 0, "max": 6.5}, "avgQuality": {"min": 3.5, "max": 5}}'::jsonb,
 'Your sleep quality is good ({avgQuality}/5) but duration is too short ({avgSleepHours}h).',
 'You''re sleeping efficiently, but your body needs more time. Prioritize an earlier bedtime.',
 0.85, 9, ARRAY['duration', 'important'], true),

('inconsistent_with_good_duration',
 '{"avgSleepHours": {"min": 7, "max": 10}, "consistencyScore": {"min": 0, "max": 60}}'::jsonb,
 'You get enough sleep ({avgSleepHours}h) but consistency is low ({consistencyScore}%).',
 'Your irregular schedule may be reducing the benefits of adequate sleep. Set fixed bed and wake times.',
 0.8, 8, ARRAY['consistency', 'schedule'], true),

-- =====================================================
-- 8. PROGRESSIVE IMPROVEMENT RECOMMENDATIONS
-- =====================================================

('new_tracker_welcome',
 '{"totalNights": {"min": 1, "max": 3}}'::jsonb,
 'You''re just starting to track your sleep!',
 'Welcome! Track for at least 7 days to get meaningful insights. Focus on consistency in your sleep schedule.',
 0.6, 6, ARRAY['getting_started', 'motivation'], true),

('early_tracker',
 '{"totalNights": {"min": 4, "max": 7}}'::jsonb,
 'You''ve been tracking for {totalNights} nights. Great start!',
 'Continue tracking to establish baseline patterns. Pay attention to how different activities affect your sleep.',
 0.6, 5, ARRAY['progress', 'motivation'], true),

('consistent_tracker',
 '{"totalNights": {"min": 14, "max": 30}}'::jsonb,
 'You''ve logged {totalNights} nights! Patterns are emerging.',
 'Review your data to identify what improves your sleep. Consistency in tracking leads to actionable insights.',
 0.6, 4, ARRAY['progress', 'motivation'], true),

('dedicated_tracker',
 '{"totalNights": {"min": 30, "max": 1000}}'::jsonb,
 'Impressive! You''ve tracked {totalNights} nights of sleep.',
 'You''re mastering sleep awareness. Use your long-term data to fine-tune your routine seasonally.',
 0.65, 3, ARRAY['progress', 'positive'], true),

-- =====================================================
-- 9. SPECIFIC HABIT RECOMMENDATIONS
-- =====================================================

('screen_time_before_bed',
 '{"avgQuality": {"min": 0, "max": 3}, "hasLateScreenTime": true}'::jsonb,
 'Your quality is {avgQuality}/5 and you often use screens before bed.',
 'Blue light from screens suppresses melatonin. Try no screens 1 hour before bed, or use blue light filters.',
 0.8, 8, ARRAY['quality', 'habits', 'screens'], true),

('caffeine_timing',
 '{"avgQuality": {"min": 0, "max": 3}, "lateCaffeineIntake": true}'::jsonb,
 'Your sleep quality is {avgQuality}/5 and you consume caffeine late.',
 'Caffeine has a half-life of 5-6 hours. Avoid it after 2 PM to prevent sleep disruption.',
 0.85, 8, ARRAY['quality', 'habits', 'caffeine'], true),

('exercise_optimization',
 '{"avgQuality": {"min": 3, "max": 5}, "regularExercise": true}'::jsonb,
 'Your sleep quality is great and you exercise regularly!',
 'Optimize timing: morning or afternoon exercise enhances sleep, but avoid vigorous exercise within 3 hours of bedtime.',
 0.65, 5, ARRAY['quality', 'exercise', 'optimization'], true);

-- =====================================================
-- VERIFY INSERTION
-- =====================================================

SELECT COUNT(*) as total_rules,
       COUNT(CASE WHEN active = true THEN 1 END) as active_rules,
       array_agg(DISTINCT unnest(tags)) as all_tags
FROM public.sleep_recommendation_rules;

COMMENT ON TABLE public.sleep_recommendation_rules IS 'Contains 30+ data-driven rules that match user sleep patterns to personalized recommendations';
