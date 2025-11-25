-- =====================================================
-- COMPLETE SEED: PROGRAMS 21-30 WITH LESSONS & HABITS
-- =====================================================
-- Run this file to seed programs 21-30 with all their lessons and habits

-- =====================================================
-- PROGRAMS 21-30
-- =====================================================

INSERT INTO programs (id, title, description, category, difficulty, duration_days, total_lessons, tags, is_active) VALUES
('a1000021-0000-0000-0000-000000000001', 'Solo Pleasure Expansion', 'Expand your self-pleasure repertoire and discover new dimensions of solo intimacy.', 'exploration', 'intermediate', 21, 5, ARRAY['solo', 'pleasure', 'exploration', 'self-discovery'], true),
('a1000022-0000-0000-0000-000000000001', 'Tantric Touch', 'Explore tantric principles and practices for deeper connection and presence.', 'exploration', 'intermediate', 21, 5, ARRAY['couples', 'tantra', 'energy', 'presence', 'spiritual'], true),
('a1000023-0000-0000-0000-000000000001', 'Low-Libido Support', 'Understand and work with low desire through compassionate practices.', 'desire', 'beginner', 21, 5, ARRAY['solo', 'couples', 'low-libido', 'desire', 'support'], true),
('a1000024-0000-0000-0000-000000000001', 'Intimacy Scheduling', 'Use intentional scheduling to prioritize and protect your intimate life.', 'communication', 'beginner', 14, 5, ARRAY['couples', 'scheduling', 'planning', 'busy-life'], true),
('a1000025-0000-0000-0000-000000000001', 'Attachment Style & Intimacy', 'Understand how attachment styles affect your intimate relationships.', 'connection', 'intermediate', 21, 5, ARRAY['couples', 'attachment', 'psychology', 'patterns'], true),
('a1000026-0000-0000-0000-000000000001', 'Mood & Arousal Optimization', 'Learn to optimize your mood and environment for better arousal.', 'desire', 'beginner', 14, 5, ARRAY['solo', 'couples', 'mood', 'arousal', 'environment'], true),
('a1000027-0000-0000-0000-000000000001', 'Intimacy for Busy Professionals', 'Maintain connection despite demanding careers and busy schedules.', 'communication', 'beginner', 14, 5, ARRAY['couples', 'busy', 'professional', 'time-management'], true),
('a1000028-0000-0000-0000-000000000001', 'Reconnecting After Kids', 'Reclaim your couple identity and intimacy after becoming parents.', 'connection', 'intermediate', 21, 5, ARRAY['couples', 'parents', 'kids', 'reconnection'], true),
('a1000029-0000-0000-0000-000000000001', 'Sexuality & Mental Health', 'Navigate intimacy while managing mental health challenges.', 'self-love', 'intermediate', 21, 5, ARRAY['solo', 'couples', 'mental-health', 'anxiety', 'depression'], true),
('a1000030-0000-0000-0000-000000000001', 'Long-Distance Intimacy', 'Stay connected and intimate despite physical distance.', 'communication', 'intermediate', 14, 5, ARRAY['couples', 'long-distance', 'ldr', 'virtual'], true);

-- =====================================================
-- LESSONS FOR PROGRAMS 21-30
-- =====================================================

-- Program 21: Solo Pleasure Expansion
INSERT INTO lessons (id, program_id, title, description, content, order_index, duration_minutes, lesson_type) VALUES
('l2100001-0000-0000-0000-000000000001', 'a1000021-0000-0000-0000-000000000001', 'Pleasure Mapping', 'Discover your pleasure zones', 'Systematically explore your body to find all your erogenous areas. You may be surprised what you discover.', 1, 20, 'exercise'),
('l2100002-0000-0000-0000-000000000001', 'a1000021-0000-0000-0000-000000000001', 'Breathing and Arousal', 'Use breath to enhance pleasure', 'Learn breathing techniques that intensify sensation and keep you present.', 2, 15, 'exercise'),
('l2100003-0000-0000-0000-000000000001', 'a1000021-0000-0000-0000-000000000001', 'Edging Techniques', 'Practice arousal control', 'Learn to build and maintain arousal without immediate release, intensifying the experience.', 3, 20, 'exercise'),
('l2100004-0000-0000-0000-000000000001', 'a1000021-0000-0000-0000-000000000001', 'Fantasy Exploration', 'Safely explore your imagination', 'Use guided exercises to discover what mentally arouses you without judgment.', 4, 15, 'reflection'),
('l2100005-0000-0000-0000-000000000001', 'a1000021-0000-0000-0000-000000000001', 'Toy Integration', 'Introduce pleasure products', 'Learn how to incorporate toys into your solo practice for expanded pleasure.', 5, 15, 'reading');

-- Program 22: Tantric Touch
INSERT INTO lessons (id, program_id, title, description, content, order_index, duration_minutes, lesson_type) VALUES
('l2200001-0000-0000-0000-000000000001', 'a1000022-0000-0000-0000-000000000001', 'Tantric Philosophy', 'Understand tantric principles', 'Learn the basics of tantric philosophy and its approach to sacred intimacy.', 1, 15, 'reading'),
('l2200002-0000-0000-0000-000000000001', 'a1000022-0000-0000-0000-000000000001', 'Eye Gazing', 'Connect through deep eye contact', 'Practice sustained eye contact to build intimacy and presence with your partner.', 2, 15, 'exercise'),
('l2200003-0000-0000-0000-000000000001', 'a1000022-0000-0000-0000-000000000001', 'Synchronized Breathing', 'Breathe together', 'Learn to synchronize breath with your partner for deeper connection.', 3, 15, 'exercise'),
('l2200004-0000-0000-0000-000000000001', 'a1000022-0000-0000-0000-000000000001', 'Energy Circulation', 'Move energy between you', 'Practice techniques for circulating energy between partners.', 4, 20, 'exercise'),
('l2200005-0000-0000-0000-000000000001', 'a1000022-0000-0000-0000-000000000001', 'Tantric Massage', 'Give and receive sacred touch', 'Learn massage techniques rooted in tantric tradition.', 5, 25, 'exercise');

-- Program 23: Low-Libido Support
INSERT INTO lessons (id, program_id, title, description, content, order_index, duration_minutes, lesson_type) VALUES
('l2300001-0000-0000-0000-000000000001', 'a1000023-0000-0000-0000-000000000001', 'Understanding Low Libido', 'Learn causes and contributing factors', 'Explore medical, psychological, and relational factors that affect libido.', 1, 15, 'reading'),
('l2300002-0000-0000-0000-000000000001', 'a1000023-0000-0000-0000-000000000001', 'Self-Compassion Practice', 'Release shame around desire', 'Practice self-compassion exercises to reduce pressure and shame.', 2, 15, 'reflection'),
('l2300003-0000-0000-0000-000000000001', 'a1000023-0000-0000-0000-000000000001', 'Responsive Desire', 'Work with your desire style', 'Learn to create conditions that help responsive desire emerge.', 3, 15, 'reading'),
('l2300004-0000-0000-0000-000000000001', 'a1000023-0000-0000-0000-000000000001', 'Pleasure Without Pressure', 'Explore touch without expectation', 'Practice sensual experiences that do not require arousal.', 4, 20, 'exercise'),
('l2300005-0000-0000-0000-000000000001', 'a1000023-0000-0000-0000-000000000001', 'Communication with Partner', 'Talk about your experience', 'Learn to communicate about low libido with your partner.', 5, 15, 'action');

-- Program 24: Intimacy Scheduling
INSERT INTO lessons (id, program_id, title, description, content, order_index, duration_minutes, lesson_type) VALUES
('l2400001-0000-0000-0000-000000000001', 'a1000024-0000-0000-0000-000000000001', 'Why Scheduling Works', 'Debunk myths about scheduled intimacy', 'Learn why intentional scheduling can actually increase anticipation and satisfaction.', 1, 10, 'reading'),
('l2400002-0000-0000-0000-000000000001', 'a1000024-0000-0000-0000-000000000001', 'Finding Your Rhythm', 'Determine optimal timing', 'Work together to find scheduling that honors both partners needs.', 2, 15, 'action'),
('l2400003-0000-0000-0000-000000000001', 'a1000024-0000-0000-0000-000000000001', 'Building Anticipation', 'Create excitement before scheduled time', 'Learn to flirt and build desire leading up to scheduled intimacy.', 3, 15, 'exercise'),
('l2400004-0000-0000-0000-000000000001', 'a1000024-0000-0000-0000-000000000001', 'Flexibility in Scheduling', 'Handle changes gracefully', 'Develop resilience when plans need to change.', 4, 10, 'reflection'),
('l2400005-0000-0000-0000-000000000001', 'a1000024-0000-0000-0000-000000000001', 'Sustaining the Practice', 'Make scheduling a habit', 'Create systems to maintain scheduled intimacy long-term.', 5, 10, 'action');

-- Program 25: Attachment Style & Intimacy
INSERT INTO lessons (id, program_id, title, description, content, order_index, duration_minutes, lesson_type) VALUES
('l2500001-0000-0000-0000-000000000001', 'a1000025-0000-0000-0000-000000000001', 'Attachment Theory Basics', 'Understand attachment styles', 'Learn the four attachment styles and how they affect intimacy.', 1, 15, 'reading'),
('l2500002-0000-0000-0000-000000000001', 'a1000025-0000-0000-0000-000000000001', 'Identify Your Style', 'Discover your attachment pattern', 'Complete exercises to identify your attachment style.', 2, 20, 'quiz'),
('l2500003-0000-0000-0000-000000000001', 'a1000025-0000-0000-0000-000000000001', 'Your Partner Style', 'Understand your partner pattern', 'Learn to recognize your partner attachment behaviors.', 3, 15, 'reflection'),
('l2500004-0000-0000-0000-000000000001', 'a1000025-0000-0000-0000-000000000001', 'Healing Exercises', 'Work toward secure attachment', 'Practice exercises that promote secure attachment.', 4, 20, 'exercise'),
('l2500005-0000-0000-0000-000000000001', 'a1000025-0000-0000-0000-000000000001', 'Communication Strategies', 'Communicate based on styles', 'Learn to communicate in ways that soothe each attachment style.', 5, 15, 'action');

-- Program 26: Mood & Arousal Optimization
INSERT INTO lessons (id, program_id, title, description, content, order_index, duration_minutes, lesson_type) VALUES
('l2600001-0000-0000-0000-000000000001', 'a1000026-0000-0000-0000-000000000001', 'Mood-Desire Connection', 'Understand how mood affects arousal', 'Learn the science behind mood and sexual desire.', 1, 12, 'reading'),
('l2600002-0000-0000-0000-000000000001', 'a1000026-0000-0000-0000-000000000001', 'Mood Tracking', 'Track patterns between mood and desire', 'Start tracking to identify your personal patterns.', 2, 10, 'action'),
('l2600003-0000-0000-0000-000000000001', 'a1000026-0000-0000-0000-000000000001', 'Stress Reduction', 'Lower stress to increase desire', 'Practice stress reduction techniques that boost arousal.', 3, 15, 'exercise'),
('l2600004-0000-0000-0000-000000000001', 'a1000026-0000-0000-0000-000000000001', 'Creating Optimal Conditions', 'Set the stage for desire', 'Learn to create environmental and mental conditions for arousal.', 4, 15, 'action'),
('l2600005-0000-0000-0000-000000000001', 'a1000026-0000-0000-0000-000000000001', 'Mood Boosting Rituals', 'Develop pre-intimacy rituals', 'Create rituals that transition you from daily stress to intimacy.', 5, 15, 'exercise');

-- Program 27: Intimacy for Busy Professionals
INSERT INTO lessons (id, program_id, title, description, content, order_index, duration_minutes, lesson_type) VALUES
('l2700001-0000-0000-0000-000000000001', 'a1000027-0000-0000-0000-000000000001', 'Prioritizing Intimacy', 'Make connection non-negotiable', 'Learn why busy people need to schedule intimacy as a priority.', 1, 10, 'reading'),
('l2700002-0000-0000-0000-000000000001', 'a1000027-0000-0000-0000-000000000001', 'Micro-Connections', 'Connect in small moments', 'Learn quick connection practices for busy schedules.', 2, 10, 'exercise'),
('l2700003-0000-0000-0000-000000000001', 'a1000027-0000-0000-0000-000000000001', 'Work-Life Transitions', 'Switch from work to partner mode', 'Create rituals to transition from work stress to intimate connection.', 3, 15, 'action'),
('l2700004-0000-0000-0000-000000000001', 'a1000027-0000-0000-0000-000000000001', 'Quality Over Quantity', 'Make limited time count', 'Focus on depth of connection when time is limited.', 4, 15, 'exercise'),
('l2700005-0000-0000-0000-000000000001', 'a1000027-0000-0000-0000-000000000001', 'Boundary Setting', 'Protect your intimate time', 'Learn to set boundaries that protect relationship time.', 5, 12, 'action');

-- Program 28: Reconnecting After Kids
INSERT INTO lessons (id, program_id, title, description, content, order_index, duration_minutes, lesson_type) VALUES
('l2800001-0000-0000-0000-000000000001', 'a1000028-0000-0000-0000-000000000001', 'Parenthood and Intimacy', 'Understand the challenges', 'Learn how children affect couple intimacy and what to expect.', 1, 12, 'reading'),
('l2800002-0000-0000-0000-000000000001', 'a1000028-0000-0000-0000-000000000001', 'Reclaiming Couple Identity', 'Remember you are partners', 'Exercises to reconnect with your identity as a couple.', 2, 15, 'reflection'),
('l2800003-0000-0000-0000-000000000001', 'a1000028-0000-0000-0000-000000000001', 'Creative Scheduling', 'Find time despite kids', 'Strategies for finding intimate time around children schedules.', 3, 15, 'action'),
('l2800004-0000-0000-0000-000000000001', 'a1000028-0000-0000-0000-000000000001', 'Touch Without Exhaustion', 'Connect when tired', 'Low-energy ways to maintain physical connection.', 4, 15, 'exercise'),
('l2800005-0000-0000-0000-000000000001', 'a1000028-0000-0000-0000-000000000001', 'Building Support', 'Create systems for couple time', 'Develop childcare solutions that support your intimacy.', 5, 10, 'action');

-- Program 29: Sexuality & Mental Health
INSERT INTO lessons (id, program_id, title, description, content, order_index, duration_minutes, lesson_type) VALUES
('l2900001-0000-0000-0000-000000000001', 'a1000029-0000-0000-0000-000000000001', 'Mental Health and Sexuality', 'Understand the connection', 'Learn how anxiety, depression, and other conditions affect sexuality.', 1, 15, 'reading'),
('l2900002-0000-0000-0000-000000000001', 'a1000029-0000-0000-0000-000000000001', 'Medication Effects', 'Navigate medication side effects', 'Understand and communicate about medication impacts on desire.', 2, 12, 'reading'),
('l2900003-0000-0000-0000-000000000001', 'a1000029-0000-0000-0000-000000000001', 'Self-Care for Intimacy', 'Support your mental health', 'Practice self-care that supports both mental health and sexuality.', 3, 15, 'exercise'),
('l2900004-0000-0000-0000-000000000001', 'a1000029-0000-0000-0000-000000000001', 'Communicating Challenges', 'Talk to your partner about struggles', 'Learn to communicate about mental health impacts on intimacy.', 4, 15, 'action'),
('l2900005-0000-0000-0000-000000000001', 'a1000029-0000-0000-0000-000000000001', 'Adaptive Intimacy', 'Adjust to your needs', 'Develop flexible approaches to intimacy based on your mental state.', 5, 15, 'reflection');

-- Program 30: Long-Distance Intimacy
INSERT INTO lessons (id, program_id, title, description, content, order_index, duration_minutes, lesson_type) VALUES
('l3000001-0000-0000-0000-000000000001', 'a1000030-0000-0000-0000-000000000001', 'LDR Intimacy Challenges', 'Understand unique obstacles', 'Learn about the specific intimacy challenges of long-distance relationships.', 1, 12, 'reading'),
('l3000002-0000-0000-0000-000000000001', 'a1000030-0000-0000-0000-000000000001', 'Virtual Date Ideas', 'Connect across distance', 'Creative ways to have intimate dates virtually.', 2, 15, 'action'),
('l3000003-0000-0000-0000-000000000001', 'a1000030-0000-0000-0000-000000000001', 'Verbal Intimacy', 'Deepen emotional connection through words', 'Practice verbal intimacy exercises for video calls.', 3, 15, 'exercise'),
('l3000004-0000-0000-0000-000000000001', 'a1000030-0000-0000-0000-000000000001', 'Physical Intimacy Apart', 'Maintain physical connection', 'Explore ways to experience physical intimacy while apart.', 4, 20, 'exercise'),
('l3000005-0000-0000-0000-000000000001', 'a1000030-0000-0000-0000-000000000001', 'Reunion Preparation', 'Make reunions count', 'Plan for meaningful reconnection when you are together again.', 5, 15, 'action');

-- =====================================================
-- HABITS FOR PROGRAMS 21-30
-- =====================================================

-- Program 21: Solo Pleasure Expansion
INSERT INTO habits (id, program_id, name, description, category, frequency, is_from_program) VALUES
('h2101001-0000-0000-0000-000000000001', 'a1000021-0000-0000-0000-000000000001', 'Body exploration', 'Explore a new erogenous zone', 'intimacy', 'weekly', true),
('h2102001-0000-0000-0000-000000000001', 'a1000021-0000-0000-0000-000000000001', 'Breathwork practice', 'Practice arousal-enhancing breathing', 'intimacy', 'daily', true),
('h2103001-0000-0000-0000-000000000001', 'a1000021-0000-0000-0000-000000000001', 'Edging session', 'Practice building and maintaining arousal', 'intimacy', 'weekly', true),
('h2104001-0000-0000-0000-000000000001', 'a1000021-0000-0000-0000-000000000001', 'Fantasy journaling', 'Write about what mentally arouses you', 'intimacy', 'weekly', true),
('h2105001-0000-0000-0000-000000000001', 'a1000021-0000-0000-0000-000000000001', 'Toy exploration', 'Experiment with a pleasure product', 'intimacy', 'weekly', true);

-- Program 22: Tantric Touch
INSERT INTO habits (id, program_id, name, description, category, frequency, is_from_program) VALUES
('h2201001-0000-0000-0000-000000000001', 'a1000022-0000-0000-0000-000000000001', 'Tantric reading', 'Read about tantric principles', 'intimacy', 'daily', true),
('h2202001-0000-0000-0000-000000000001', 'a1000022-0000-0000-0000-000000000001', 'Eye gazing practice', 'Practice 5 minutes of eye gazing', 'intimacy', 'daily', true),
('h2203001-0000-0000-0000-000000000001', 'a1000022-0000-0000-0000-000000000001', 'Breath sync', 'Synchronize breathing with partner', 'intimacy', 'daily', true),
('h2204001-0000-0000-0000-000000000001', 'a1000022-0000-0000-0000-000000000001', 'Energy circulation', 'Practice moving energy between you', 'intimacy', 'weekly', true),
('h2205001-0000-0000-0000-000000000001', 'a1000022-0000-0000-0000-000000000001', 'Tantric massage', 'Give or receive a tantric massage', 'intimacy', 'weekly', true);

-- Program 23: Low-Libido Support
INSERT INTO habits (id, program_id, name, description, category, frequency, is_from_program) VALUES
('h2301001-0000-0000-0000-000000000001', 'a1000023-0000-0000-0000-000000000001', 'Libido factor tracking', 'Track factors that affect your libido', 'intimacy', 'daily', true),
('h2302001-0000-0000-0000-000000000001', 'a1000023-0000-0000-0000-000000000001', 'Self-compassion moment', 'Practice self-compassion about desire', 'intimacy', 'daily', true),
('h2303001-0000-0000-0000-000000000001', 'a1000023-0000-0000-0000-000000000001', 'Desire conditions', 'Create conditions that help desire emerge', 'intimacy', 'daily', true),
('h2304001-0000-0000-0000-000000000001', 'a1000023-0000-0000-0000-000000000001', 'Pressure-free sensuality', 'Enjoy sensual experience without expectation', 'intimacy', 'weekly', true),
('h2305001-0000-0000-0000-000000000001', 'a1000023-0000-0000-0000-000000000001', 'Partner communication', 'Share honestly about your experience', 'intimacy', 'weekly', true);

-- Program 24: Intimacy Scheduling
INSERT INTO habits (id, program_id, name, description, category, frequency, is_from_program) VALUES
('h2401001-0000-0000-0000-000000000001', 'a1000024-0000-0000-0000-000000000001', 'Schedule review', 'Review and confirm scheduled times', 'intimacy', 'daily', true),
('h2402001-0000-0000-0000-000000000001', 'a1000024-0000-0000-0000-000000000001', 'Rhythm adjustment', 'Check if schedule works for both', 'intimacy', 'weekly', true),
('h2403001-0000-0000-0000-000000000001', 'a1000024-0000-0000-0000-000000000001', 'Anticipation building', 'Flirt before scheduled time', 'intimacy', 'daily', true),
('h2404001-0000-0000-0000-000000000001', 'a1000024-0000-0000-0000-000000000001', 'Flexibility practice', 'Gracefully reschedule when needed', 'intimacy', 'weekly', true),
('h2405001-0000-0000-0000-000000000001', 'a1000024-0000-0000-0000-000000000001', 'System maintenance', 'Maintain scheduling system', 'intimacy', 'weekly', true);

-- Program 25: Attachment Style & Intimacy
INSERT INTO habits (id, program_id, name, description, category, frequency, is_from_program) VALUES
('h2501001-0000-0000-0000-000000000001', 'a1000025-0000-0000-0000-000000000001', 'Attachment awareness', 'Notice attachment patterns', 'intimacy', 'daily', true),
('h2502001-0000-0000-0000-000000000001', 'a1000025-0000-0000-0000-000000000001', 'Style reflection', 'Reflect on how style shows up', 'intimacy', 'weekly', true),
('h2503001-0000-0000-0000-000000000001', 'a1000025-0000-0000-0000-000000000001', 'Partner pattern recognition', 'Notice partner attachment behaviors', 'intimacy', 'daily', true),
('h2504001-0000-0000-0000-000000000001', 'a1000025-0000-0000-0000-000000000001', 'Secure behavior', 'Practice one secure attachment behavior', 'intimacy', 'daily', true),
('h2505001-0000-0000-0000-000000000001', 'a1000025-0000-0000-0000-000000000001', 'Style-aware communication', 'Communicate to soothe partner style', 'intimacy', 'daily', true);

-- Program 26: Mood & Arousal Optimization
INSERT INTO habits (id, program_id, name, description, category, frequency, is_from_program) VALUES
('h2601001-0000-0000-0000-000000000001', 'a1000026-0000-0000-0000-000000000001', 'Mood-desire tracking', 'Track mood and desire levels', 'intimacy', 'daily', true),
('h2602001-0000-0000-0000-000000000001', 'a1000026-0000-0000-0000-000000000001', 'Pattern analysis', 'Review mood-desire patterns', 'intimacy', 'weekly', true),
('h2603001-0000-0000-0000-000000000001', 'a1000026-0000-0000-0000-000000000001', 'Stress reduction', '10 minutes of stress reduction', 'intimacy', 'daily', true),
('h2604001-0000-0000-0000-000000000001', 'a1000026-0000-0000-0000-000000000001', 'Optimal conditions', 'Set up environment for arousal', 'intimacy', 'daily', true),
('h2605001-0000-0000-0000-000000000001', 'a1000026-0000-0000-0000-000000000001', 'Pre-intimacy ritual', 'Complete mood-boosting ritual', 'intimacy', 'daily', true);

-- Program 27: Intimacy for Busy Professionals
INSERT INTO habits (id, program_id, name, description, category, frequency, is_from_program) VALUES
('h2701001-0000-0000-0000-000000000001', 'a1000027-0000-0000-0000-000000000001', 'Priority check', 'Confirm intimacy is scheduled', 'intimacy', 'daily', true),
('h2702001-0000-0000-0000-000000000001', 'a1000027-0000-0000-0000-000000000001', 'Micro-connection', 'Brief connection with partner', 'intimacy', 'daily', true),
('h2703001-0000-0000-0000-000000000001', 'a1000027-0000-0000-0000-000000000001', 'Work-home transition', 'Complete transition ritual', 'intimacy', 'daily', true),
('h2704001-0000-0000-0000-000000000001', 'a1000027-0000-0000-0000-000000000001', 'Quality focus', 'Be fully present during time together', 'intimacy', 'daily', true),
('h2705001-0000-0000-0000-000000000001', 'a1000027-0000-0000-0000-000000000001', 'Boundary protection', 'Protect intimate time from work', 'intimacy', 'daily', true);

-- Program 28: Reconnecting After Kids
INSERT INTO habits (id, program_id, name, description, category, frequency, is_from_program) VALUES
('h2801001-0000-0000-0000-000000000001', 'a1000028-0000-0000-0000-000000000001', 'Impact awareness', 'Notice how parenting affects intimacy', 'intimacy', 'daily', true),
('h2802001-0000-0000-0000-000000000001', 'a1000028-0000-0000-0000-000000000001', 'Couple identity moment', 'Remember you are partners', 'intimacy', 'daily', true),
('h2803001-0000-0000-0000-000000000001', 'a1000028-0000-0000-0000-000000000001', 'Kid-schedule intimacy', 'Find a connection window', 'intimacy', 'weekly', true),
('h2804001-0000-0000-0000-000000000001', 'a1000028-0000-0000-0000-000000000001', 'Low-energy connection', 'Connect when exhausted', 'intimacy', 'daily', true),
('h2805001-0000-0000-0000-000000000001', 'a1000028-0000-0000-0000-000000000001', 'Childcare planning', 'Arrange childcare for couple time', 'intimacy', 'weekly', true);

-- Program 29: Sexuality & Mental Health
INSERT INTO habits (id, program_id, name, description, category, frequency, is_from_program) VALUES
('h2901001-0000-0000-0000-000000000001', 'a1000029-0000-0000-0000-000000000001', 'Mental health check', 'Notice how mental state affects desire', 'intimacy', 'daily', true),
('h2902001-0000-0000-0000-000000000001', 'a1000029-0000-0000-0000-000000000001', 'Medication awareness', 'Track medication effects', 'intimacy', 'daily', true),
('h2903001-0000-0000-0000-000000000001', 'a1000029-0000-0000-0000-000000000001', 'Self-care for intimacy', 'Do self-care that supports sexuality', 'intimacy', 'daily', true),
('h2904001-0000-0000-0000-000000000001', 'a1000029-0000-0000-0000-000000000001', 'Challenge communication', 'Share mental health impacts', 'intimacy', 'weekly', true),
('h2905001-0000-0000-0000-000000000001', 'a1000029-0000-0000-0000-000000000001', 'Adaptive approach', 'Adjust intimacy based on mental state', 'intimacy', 'daily', true);

-- Program 30: Long-Distance Intimacy
INSERT INTO habits (id, program_id, name, description, category, frequency, is_from_program) VALUES
('h3001001-0000-0000-0000-000000000001', 'a1000030-0000-0000-0000-000000000001', 'Connection planning', 'Plan how to stay connected today', 'intimacy', 'daily', true),
('h3002001-0000-0000-0000-000000000001', 'a1000030-0000-0000-0000-000000000001', 'Virtual date', 'Have a virtual date with partner', 'intimacy', 'weekly', true),
('h3003001-0000-0000-0000-000000000001', 'a1000030-0000-0000-0000-000000000001', 'Verbal intimacy', 'Practice verbal intimacy on a call', 'intimacy', 'daily', true),
('h3004001-0000-0000-0000-000000000001', 'a1000030-0000-0000-0000-000000000001', 'Physical intimacy apart', 'Experience physical intimacy while apart', 'intimacy', 'weekly', true),
('h3005001-0000-0000-0000-000000000001', 'a1000030-0000-0000-0000-000000000001', 'Reunion planning', 'Plan for next reunion', 'intimacy', 'weekly', true);

-- =====================================================
-- LESSON-HABITS JUNCTION FOR PROGRAMS 21-30
-- =====================================================

INSERT INTO lesson_habits (id, lesson_id, habit_id, order_index) VALUES
-- Program 21
('lh2100101', 'l2100001-0000-0000-0000-000000000001', 'h2101001-0000-0000-0000-000000000001', 1),
('lh2100201', 'l2100002-0000-0000-0000-000000000001', 'h2102001-0000-0000-0000-000000000001', 1),
('lh2100301', 'l2100003-0000-0000-0000-000000000001', 'h2103001-0000-0000-0000-000000000001', 1),
('lh2100401', 'l2100004-0000-0000-0000-000000000001', 'h2104001-0000-0000-0000-000000000001', 1),
('lh2100501', 'l2100005-0000-0000-0000-000000000001', 'h2105001-0000-0000-0000-000000000001', 1),
-- Program 22
('lh2200101', 'l2200001-0000-0000-0000-000000000001', 'h2201001-0000-0000-0000-000000000001', 1),
('lh2200201', 'l2200002-0000-0000-0000-000000000001', 'h2202001-0000-0000-0000-000000000001', 1),
('lh2200301', 'l2200003-0000-0000-0000-000000000001', 'h2203001-0000-0000-0000-000000000001', 1),
('lh2200401', 'l2200004-0000-0000-0000-000000000001', 'h2204001-0000-0000-0000-000000000001', 1),
('lh2200501', 'l2200005-0000-0000-0000-000000000001', 'h2205001-0000-0000-0000-000000000001', 1),
-- Program 23
('lh2300101', 'l2300001-0000-0000-0000-000000000001', 'h2301001-0000-0000-0000-000000000001', 1),
('lh2300201', 'l2300002-0000-0000-0000-000000000001', 'h2302001-0000-0000-0000-000000000001', 1),
('lh2300301', 'l2300003-0000-0000-0000-000000000001', 'h2303001-0000-0000-0000-000000000001', 1),
('lh2300401', 'l2300004-0000-0000-0000-000000000001', 'h2304001-0000-0000-0000-000000000001', 1),
('lh2300501', 'l2300005-0000-0000-0000-000000000001', 'h2305001-0000-0000-0000-000000000001', 1),
-- Program 24
('lh2400101', 'l2400001-0000-0000-0000-000000000001', 'h2401001-0000-0000-0000-000000000001', 1),
('lh2400201', 'l2400002-0000-0000-0000-000000000001', 'h2402001-0000-0000-0000-000000000001', 1),
('lh2400301', 'l2400003-0000-0000-0000-000000000001', 'h2403001-0000-0000-0000-000000000001', 1),
('lh2400401', 'l2400004-0000-0000-0000-000000000001', 'h2404001-0000-0000-0000-000000000001', 1),
('lh2400501', 'l2400005-0000-0000-0000-000000000001', 'h2405001-0000-0000-0000-000000000001', 1),
-- Program 25
('lh2500101', 'l2500001-0000-0000-0000-000000000001', 'h2501001-0000-0000-0000-000000000001', 1),
('lh2500201', 'l2500002-0000-0000-0000-000000000001', 'h2502001-0000-0000-0000-000000000001', 1),
('lh2500301', 'l2500003-0000-0000-0000-000000000001', 'h2503001-0000-0000-0000-000000000001', 1),
('lh2500401', 'l2500004-0000-0000-0000-000000000001', 'h2504001-0000-0000-0000-000000000001', 1),
('lh2500501', 'l2500005-0000-0000-0000-000000000001', 'h2505001-0000-0000-0000-000000000001', 1),
-- Program 26
('lh2600101', 'l2600001-0000-0000-0000-000000000001', 'h2601001-0000-0000-0000-000000000001', 1),
('lh2600201', 'l2600002-0000-0000-0000-000000000001', 'h2602001-0000-0000-0000-000000000001', 1),
('lh2600301', 'l2600003-0000-0000-0000-000000000001', 'h2603001-0000-0000-0000-000000000001', 1),
('lh2600401', 'l2600004-0000-0000-0000-000000000001', 'h2604001-0000-0000-0000-000000000001', 1),
('lh2600501', 'l2600005-0000-0000-0000-000000000001', 'h2605001-0000-0000-0000-000000000001', 1),
-- Program 27
('lh2700101', 'l2700001-0000-0000-0000-000000000001', 'h2701001-0000-0000-0000-000000000001', 1),
('lh2700201', 'l2700002-0000-0000-0000-000000000001', 'h2702001-0000-0000-0000-000000000001', 1),
('lh2700301', 'l2700003-0000-0000-0000-000000000001', 'h2703001-0000-0000-0000-000000000001', 1),
('lh2700401', 'l2700004-0000-0000-0000-000000000001', 'h2704001-0000-0000-0000-000000000001', 1),
('lh2700501', 'l2700005-0000-0000-0000-000000000001', 'h2705001-0000-0000-0000-000000000001', 1),
-- Program 28
('lh2800101', 'l2800001-0000-0000-0000-000000000001', 'h2801001-0000-0000-0000-000000000001', 1),
('lh2800201', 'l2800002-0000-0000-0000-000000000001', 'h2802001-0000-0000-0000-000000000001', 1),
('lh2800301', 'l2800003-0000-0000-0000-000000000001', 'h2803001-0000-0000-0000-000000000001', 1),
('lh2800401', 'l2800004-0000-0000-0000-000000000001', 'h2804001-0000-0000-0000-000000000001', 1),
('lh2800501', 'l2800005-0000-0000-0000-000000000001', 'h2805001-0000-0000-0000-000000000001', 1),
-- Program 29
('lh2900101', 'l2900001-0000-0000-0000-000000000001', 'h2901001-0000-0000-0000-000000000001', 1),
('lh2900201', 'l2900002-0000-0000-0000-000000000001', 'h2902001-0000-0000-0000-000000000001', 1),
('lh2900301', 'l2900003-0000-0000-0000-000000000001', 'h2903001-0000-0000-0000-000000000001', 1),
('lh2900401', 'l2900004-0000-0000-0000-000000000001', 'h2904001-0000-0000-0000-000000000001', 1),
('lh2900501', 'l2900005-0000-0000-0000-000000000001', 'h2905001-0000-0000-0000-000000000001', 1),
-- Program 30
('lh3000101', 'l3000001-0000-0000-0000-000000000001', 'h3001001-0000-0000-0000-000000000001', 1),
('lh3000201', 'l3000002-0000-0000-0000-000000000001', 'h3002001-0000-0000-0000-000000000001', 1),
('lh3000301', 'l3000003-0000-0000-0000-000000000001', 'h3003001-0000-0000-0000-000000000001', 1),
('lh3000401', 'l3000004-0000-0000-0000-000000000001', 'h3004001-0000-0000-0000-000000000001', 1),
('lh3000501', 'l3000005-0000-0000-0000-000000000001', 'h3005001-0000-0000-0000-000000000001', 1);
