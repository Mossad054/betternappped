-- =====================================================
-- SEED RECOMMENDATION RULES
-- Purpose: Insert 30+ data-driven recommendation rules
-- Date: 2025-11-26
-- =====================================================

-- Note: This assumes programs exist. Get program IDs from the programs table first.
-- We'll use references to program titles - replace with actual UUIDs in production

-- =====================================================
-- 1. CONNECTION & EMOTIONAL INTIMACY
-- =====================================================

INSERT INTO public.recommendation_rules (rule_name, pattern_criteria, program_id, reason_template, min_confidence, priority, active) VALUES
('low_intimacy_beginner',
 '{"avgIntimacy": {"min": 0, "max": 4}, "totalCheckins": {"min": 3}}'::jsonb,
 (SELECT id FROM public.programs WHERE title = 'Rebuilding Intimacy' LIMIT 1),
 'Your intimacy level averages {avgIntimacy}/10. This beginner program can help you build stronger emotional connection.',
 0.7, 10, true),

('declining_connection',
 '{"avgIntimacy": {"min": 0, "max": 5}, "avgCommunication": {"min": 0, "max": 5}}'::jsonb,
 (SELECT id FROM public.programs WHERE title = 'Rebuilding Intimacy' LIMIT 1),
 'Both intimacy ({avgIntimacy}/10) and communication ({avgCommunication}/10) could use support. Start here to rebuild your foundation.',
 0.75, 9, true),

('good_base_next_level',
 '{"avgIntimacy": {"min": 6, "max": 8}, "totalCheckins": {"min": 10}}'::jsonb,
 (SELECT id FROM public.programs WHERE title = 'Desire Discovery' LIMIT 1),
 'Your connection is solid at {avgIntimacy}/10. Ready to explore desire and deepen intimacy further?',
 0.6, 7, true),

('communication_struggles',
 '{"avgCommunication": {"min": 0, "max": 4}}'::jsonb,
 (SELECT id FROM public.programs WHERE title = 'Conflict to Connection' LIMIT 1),
 'Communication averages {avgCommunication}/10. This program transforms difficult conversations into connection.',
 0.8, 10, true),

('moderate_communication_issues',
 '{"avgCommunication": {"min": 4, "max": 6}, "avgIntimacy": {"min": 0, "max": 6}}'::jsonb,
 (SELECT id FROM public.programs WHERE title = 'Conflict to Connection' LIMIT 1),
 'Your communication ({avgCommunication}/10) could be stronger. Better conversations lead to better intimacy.',
 0.6, 7, true),

-- =====================================================
-- 2. DESIRE & LIBIDO
-- =====================================================

('low_desire_exploration',
 '{"avgDesire": {"min": 0, "max": 4}, "totalCheckins": {"min": 5}}'::jsonb,
 (SELECT id FROM public.programs WHERE title = 'Desire Discovery' LIMIT 1),
 'Your desire levels average {avgDesire}/10. Let''s explore what ignites your passion and communicate your needs.',
 0.75, 9, true),

('moderate_desire_boost',
 '{"avgDesire": {"min": 4, "max": 6}, "avgIntimacy": {"min": 5, "max": 10}}'::jsonb,
 (SELECT id FROM public.programs WHERE title = 'Desire Discovery' LIMIT 1),
 'Desire at {avgDesire}/10 with good intimacy. Let''s unlock more passion and authentic expression.',
 0.65, 6, true),

('infrequent_intimacy',
 '{"intimacyFrequency": {"min": 0, "max": 0.2}, "totalCheckins": {"min": 10}}'::jsonb,
 (SELECT id FROM public.programs WHERE title = 'Rebuilding Intimacy' LIMIT 1),
 'Only {intimacyFrequency} of days include intimacy. This program helps rebuild consistent connection.',
 0.8, 9, true),

('rare_intimacy_desire_focus',
 '{"intimacyFrequency": {"min": 0, "max": 0.15}, "avgDesire": {"min": 0, "max": 5}}'::jsonb,
 (SELECT id FROM public.programs WHERE title = 'Desire Discovery' LIMIT 1),
 'Intimacy is rare ({intimacyFrequency}) and desire is low ({avgDesire}/10). Let''s reignite your spark.',
 0.7, 8, true),

-- =====================================================
-- 3. SELF-LOVE & FOUNDATION
-- =====================================================

('low_mood_self_love',
 '{"avgMood": {"min": 0, "max": 4}, "totalCheckins": {"min": 5}}'::jsonb,
 (SELECT id FROM public.programs WHERE title = 'Self-Love Foundation' LIMIT 1),
 'Your mood averages {avgMood}/10. Building self-love is the foundation for healthy intimacy.',
 0.8, 10, true),

('high_stress_self_care',
 '{"stressLevel": {"min": 7, "max": 10}}'::jsonb,
 (SELECT id FROM public.programs WHERE title = 'Self-Love Foundation' LIMIT 1),
 'Stress levels are high ({stressLevel}/10). Self-love and self-care can transform your intimate life.',
 0.75, 9, true),

('moderate_stress_foundation',
 '{"stressLevel": {"min": 5, "max": 7}, "avgIntimacy": {"min": 0, "max": 5}}'::jsonb,
 (SELECT id FROM public.programs WHERE title = 'Self-Love Foundation' LIMIT 1),
 'Managing stress ({stressLevel}/10) and building self-love can improve intimacy ({avgIntimacy}/10).',
 0.6, 6, true),

('self_doubt_pattern',
 '{"avgMood": {"min": 0, "max": 5}, "avgDesire": {"min": 0, "max": 4}}'::jsonb,
 (SELECT id FROM public.programs WHERE title = 'Self-Love Foundation' LIMIT 1),
 'Low mood and desire suggest it''s time to nurture yourself. Start with self-love to unlock authentic desire.',
 0.7, 8, true),

-- =====================================================
-- 4. CONFLICT & RELATIONSHIP CHALLENGES
-- =====================================================

('conflict_with_low_communication',
 '{"avgCommunication": {"min": 0, "max": 3}, "avgMood": {"min": 0, "max": 5}}'::jsonb,
 (SELECT id FROM public.programs WHERE title = 'Conflict to Connection' LIMIT 1),
 'Communication is challenging ({avgCommunication}/10) and affecting mood. Turn conflict into deeper connection.',
 0.8, 10, true),

('tension_in_intimacy',
 '{"avgIntimacy": {"min": 0, "max": 4}, "avgCommunication": {"min": 0, "max": 4}}'::jsonb,
 (SELECT id FROM public.programs WHERE title = 'Conflict to Connection' LIMIT 1),
 'Both intimacy and communication need support. This program helps navigate tension constructively.',
 0.75, 9, true),

('relationship_plateau',
 '{"avgIntimacy": {"min": 5, "max": 7}, "avgCommunication": {"min": 5, "max": 7}}'::jsonb,
 (SELECT id FROM public.programs WHERE title = 'Desire Discovery' LIMIT 1),
 'You''re at a comfortable plateau. Ready to explore new depths and break through to the next level?',
 0.5, 5, true),

('disconnection_after_conflict',
 '{"avgIntimacy": {"min": 0, "max": 4}, "stressLevel": {"min": 6, "max": 10}}'::jsonb,
 (SELECT id FROM public.programs WHERE title = 'Conflict to Connection' LIMIT 1),
 'High stress and low intimacy often follow unresolved conflict. Learn to transform disagreements.',
 0.7, 8, true),

-- =====================================================
-- 5. GROWTH & ADVANCED EXPLORATION
-- =====================================================

('thriving_ready_for_more',
 '{"avgIntimacy": {"min": 8, "max": 10}, "avgCommunication": {"min": 8, "max": 10}}'::jsonb,
 (SELECT id FROM public.programs WHERE title = 'Desire Discovery' LIMIT 1),
 'You''re thriving! With intimacy at {avgIntimacy}/10, you''re ready for advanced desire exploration.',
 0.6, 4, true),

('consistent_but_routine',
 '{"intimacyFrequency": {"min": 0.4, "max": 1}, "avgIntimacy": {"min": 6, "max": 8}}'::jsonb,
 (SELECT id FROM public.programs WHERE title = 'Desire Discovery' LIMIT 1),
 'Intimacy is consistent ({intimacyFrequency}) but could use more spark. Explore new dimensions of desire.',
 0.55, 5, true),

('great_connection_boost_desire',
 '{"avgIntimacy": {"min": 7, "max": 10}, "avgDesire": {"min": 4, "max": 6}}'::jsonb,
 (SELECT id FROM public.programs WHERE title = 'Desire Discovery' LIMIT 1),
 'Strong intimacy ({avgIntimacy}/10) with room to boost desire. Ready to unlock deeper passion?',
 0.6, 6, true),

-- =====================================================
-- 6. FREQUENCY & CONSISTENCY PATTERNS
-- =====================================================

('very_low_frequency',
 '{"intimacyFrequency": {"min": 0, "max": 0.1}}'::jsonb,
 (SELECT id FROM public.programs WHERE title = 'Rebuilding Intimacy' LIMIT 1),
 'Intimacy happens rarely. This gentle program helps rebuild regular, meaningful connection.',
 0.85, 10, true),

('sporadic_intimacy',
 '{"intimacyFrequency": {"min": 0.1, "max": 0.3}, "avgDesire": {"min": 3, "max": 7}}'::jsonb,
 (SELECT id FROM public.programs WHERE title = 'Rebuilding Intimacy' LIMIT 1),
 'Intimacy is sporadic. Build consistency and deeper emotional connection.',
 0.65, 7, true),

('good_frequency_low_satisfaction',
 '{"intimacyFrequency": {"min": 0.3, "max": 1}, "avgIntimacy": {"min": 0, "max": 5}}'::jsonb,
 (SELECT id FROM public.programs WHERE title = 'Conflict to Connection' LIMIT 1),
 'Regular intimacy but low satisfaction. Better communication can transform quality.',
 0.7, 8, true),

-- =====================================================
-- 7. BEGINNER & FOUNDATION PATTERNS
-- =====================================================

('new_user_low_confidence',
 '{"totalCheckins": {"min": 1, "max": 5}, "avgIntimacy": {"min": 0, "max": 5}}'::jsonb,
 (SELECT id FROM public.programs WHERE title = 'Self-Love Foundation' LIMIT 1),
 'Welcome! Start with self-love as the foundation for all intimate growth.',
 0.6, 7, true),

('new_user_communication_focus',
 '{"totalCheckins": {"min": 1, "max": 5}, "avgCommunication": {"min": 0, "max": 5}}'::jsonb,
 (SELECT id FROM public.programs WHERE title = 'Conflict to Connection' LIMIT 1),
 'Just starting out? Strong communication skills are essential for intimacy.',
 0.6, 7, true),

('first_time_explorer',
 '{"totalCheckins": {"min": 3, "max": 7}, "avgDesire": {"min": 5, "max": 10}}'::jsonb,
 (SELECT id FROM public.programs WHERE title = 'Desire Discovery' LIMIT 1),
 'You have curiosity and desire. Let''s explore what truly ignites your passion.',
 0.5, 5, true),

-- =====================================================
-- 8. MIXED PATTERNS & COMPLEX SITUATIONS
-- =====================================================

('high_desire_low_action',
 '{"avgDesire": {"min": 7, "max": 10}, "intimacyFrequency": {"min": 0, "max": 0.3}}'::jsonb,
 (SELECT id FROM public.programs WHERE title = 'Conflict to Connection' LIMIT 1),
 'High desire ({avgDesire}/10) but low intimacy frequency. Communication barriers may be the issue.',
 0.7, 8, true),

('good_mood_low_intimacy',
 '{"avgMood": {"min": 7, "max": 10}, "avgIntimacy": {"min": 0, "max": 4}}'::jsonb,
 (SELECT id FROM public.programs WHERE title = 'Rebuilding Intimacy' LIMIT 1),
 'You feel good overall but intimacy is low. Let''s align your wellbeing with intimate connection.',
 0.65, 6, true),

('stressed_but_connected',
 '{"stressLevel": {"min": 7, "max": 10}, "avgIntimacy": {"min": 6, "max": 10}}'::jsonb,
 (SELECT id FROM public.programs WHERE title = 'Self-Love Foundation' LIMIT 1),
 'Stress is high despite strong intimacy. Self-care will protect and enhance your connection.',
 0.6, 6, true),

('inconsistent_patterns',
 '{"avgIntimacy": {"min": 4, "max": 7}, "avgCommunication": {"min": 4, "max": 7}, "avgDesire": {"min": 4, "max": 7}}'::jsonb,
 (SELECT id FROM public.programs WHERE title = 'Rebuilding Intimacy' LIMIT 1),
 'Your patterns show inconsistency across the board. A foundational reset can create stability.',
 0.55, 5, true),

-- =====================================================
-- 9. ENGAGEMENT PATTERNS
-- =====================================================

('engaged_user_next_level',
 '{"totalCheckins": {"min": 20}, "avgIntimacy": {"min": 6, "max": 10}}'::jsonb,
 (SELECT id FROM public.programs WHERE title = 'Desire Discovery' LIMIT 1),
 'You''re committed to growth! With {totalCheckins} check-ins, you''re ready for advanced exploration.',
 0.65, 6, true),

('active_tracker_communication',
 '{"totalCheckins": {"min": 15}, "avgCommunication": {"min": 0, "max": 6}}'::jsonb,
 (SELECT id FROM public.programs WHERE title = 'Conflict to Connection' LIMIT 1),
 'Your dedication shows with {totalCheckins} check-ins. Let''s focus on communication to match that commitment.',
 0.6, 6, true),

('consistent_logger_self_focus',
 '{"totalCheckins": {"min": 20}, "stressLevel": {"min": 5, "max": 10}}'::jsonb,
 (SELECT id FROM public.programs WHERE title = 'Self-Love Foundation' LIMIT 1),
 'You''re tracking consistently. Now prioritize self-love to sustain your journey long-term.',
 0.55, 5, true),

-- =====================================================
-- 10. SPECIAL SITUATIONS
-- =====================================================

('pre_checkin_user',
 '{"hasPreCheckins": true, "avgIntimacy": {"min": 5, "max": 10}}'::jsonb,
 (SELECT id FROM public.programs WHERE title = 'Desire Discovery' LIMIT 1),
 'You''re using pre-intimacy check-ins! Deepen your understanding of desire with this program.',
 0.6, 6, true),

('post_checkin_user',
 '{"hasPostCheckins": true, "avgIntimacy": {"min": 6, "max": 10}}'::jsonb,
 (SELECT id FROM public.programs WHERE title = 'Desire Discovery' LIMIT 1),
 'Post-intimacy reflection shows mindfulness. Ready to explore what amplifies your satisfaction?',
 0.6, 6, true),

('balanced_explorer',
 '{"avgMood": {"min": 7, "max": 10}, "avgIntimacy": {"min": 7, "max": 10}, "avgCommunication": {"min": 7, "max": 10}}'::jsonb,
 (SELECT id FROM public.programs WHERE title = 'Desire Discovery' LIMIT 1),
 'You''re doing great across all areas! Continue your growth journey with advanced desire exploration.',
 0.5, 4, true);

-- =====================================================
-- VERIFY INSERTION
-- =====================================================

SELECT COUNT(*) as total_rules,
       COUNT(CASE WHEN active = true THEN 1 END) as active_rules
FROM public.recommendation_rules;

COMMENT ON TABLE public.recommendation_rules IS 'Contains 30+ data-driven rules that match user patterns to program recommendations';
