-- =====================================================
-- COMPLETE SEED: PROGRAMS 11-20 WITH LESSONS & HABITS
-- =====================================================
-- Run this file to seed programs 11-20 with all their lessons and habits

-- =====================================================
-- PROGRAMS 11-20
-- =====================================================

INSERT INTO programs (id, title, description, category, difficulty, duration_days, total_lessons, tags, is_active) VALUES
('a1000011-0000-0000-0000-000000000001', 'Boundaries & Consent', 'Learn to set healthy boundaries and practice enthusiastic consent in your intimate life.', 'communication', 'beginner', 14, 5, ARRAY['couples', 'solo', 'boundaries', 'consent', 'safety'], true),
('a1000012-0000-0000-0000-000000000001', 'Trauma-Informed Intimacy', 'Navigate intimacy with awareness of past trauma and build safety together.', 'self-love', 'advanced', 28, 5, ARRAY['solo', 'couples', 'trauma', 'healing', 'safety'], true),
('a1000013-0000-0000-0000-000000000001', 'Initiation Mastery', 'Learn to initiate intimacy confidently and handle rejection gracefully.', 'communication', 'intermediate', 14, 5, ARRAY['couples', 'initiation', 'confidence', 'rejection'], true),
('a1000014-0000-0000-0000-000000000001', 'Emotional Safety & Security', 'Build a foundation of emotional safety that allows deep intimacy to flourish.', 'connection', 'intermediate', 21, 5, ARRAY['couples', 'attachment', 'security', 'trust'], true),
('a1000015-0000-0000-0000-000000000001', 'Solo Healing From Shame', 'Release sexual shame and reclaim your right to pleasure without guilt.', 'self-love', 'intermediate', 21, 5, ARRAY['solo', 'shame', 'healing', 'self-compassion'], true),
('a1000016-0000-0000-0000-000000000001', 'Sensate Focus', 'Use therapeutic touch exercises to rebuild intimacy and reduce performance anxiety.', 'exploration', 'intermediate', 21, 5, ARRAY['couples', 'sensate-focus', 'touch', 'therapy'], true),
('a1000017-0000-0000-0000-000000000001', 'Improving After-Sex Connection', 'Master the art of aftercare to deepen connection after intimacy.', 'connection', 'beginner', 7, 5, ARRAY['couples', 'aftercare', 'connection', 'bonding'], true),
('a1000018-0000-0000-0000-000000000001', 'Post-Conflict Intimacy Recovery', 'Rebuild intimacy after conflict and turn ruptures into deeper connection.', 'conflict', 'intermediate', 14, 5, ARRAY['couples', 'conflict', 'repair', 'recovery'], true),
('a1000019-0000-0000-0000-000000000001', 'Passionate Marriage Renewal', 'Reignite passion in a long-term relationship through intentional practices.', 'desire', 'intermediate', 21, 5, ARRAY['couples', 'marriage', 'passion', 'long-term'], true),
('a1000020-0000-0000-0000-000000000001', 'Navigating Desire Differences', 'Bridge the gap when you and your partner have different desire levels.', 'communication', 'intermediate', 21, 5, ARRAY['couples', 'desire-discrepancy', 'compromise', 'understanding'], true);

-- =====================================================
-- LESSONS FOR PROGRAMS 11-20
-- =====================================================

-- Program 11: Boundaries & Consent
INSERT INTO lessons (id, program_id, title, description, content, order_index, duration_minutes, lesson_type) VALUES
('l1100001-0000-0000-0000-000000000001', 'a1000011-0000-0000-0000-000000000001', 'Understanding Boundaries', 'Learn what boundaries are and why they matter', 'Boundaries define where you end and another person begins. They protect your physical, emotional, and sexual wellbeing and make true intimacy possible.', 1, 12, 'reading'),
('l1100002-0000-0000-0000-000000000001', 'a1000011-0000-0000-0000-000000000001', 'Identifying Your Boundaries', 'Discover your personal limits and needs', 'Before you can communicate boundaries, you need to know what they are. Explore your physical, emotional, and sexual boundaries.', 2, 20, 'exercise'),
('l1100003-0000-0000-0000-000000000001', 'a1000011-0000-0000-0000-000000000001', 'Communicating Limits', 'Learn to express boundaries clearly', 'Practice stating your boundaries in a clear, kind, and firm way. Use I-statements and be specific.', 3, 15, 'exercise'),
('l1100004-0000-0000-0000-000000000001', 'a1000011-0000-0000-0000-000000000001', 'Enthusiastic Consent', 'Practice ongoing, enthusiastic consent', 'Consent is not just the absence of no. Learn to check in, read signals, and ensure mutual enthusiasm.', 4, 15, 'exercise'),
('l1100005-0000-0000-0000-000000000001', 'a1000011-0000-0000-0000-000000000001', 'Respecting Partner Boundaries', 'Honor your partner limits with grace', 'Receiving a boundary gracefully builds trust. Practice responding to no without pressure or guilt.', 5, 12, 'action');

-- Program 12: Trauma-Informed Intimacy
INSERT INTO lessons (id, program_id, title, description, content, order_index, duration_minutes, lesson_type) VALUES
('l1200001-0000-0000-0000-000000000001', 'a1000012-0000-0000-0000-000000000001', 'Understanding Trauma Response', 'Learn how trauma affects intimacy', 'Trauma lives in the body and can be triggered during intimacy. Understanding this helps you navigate with compassion.', 1, 15, 'reading'),
('l1200002-0000-0000-0000-000000000001', 'a1000012-0000-0000-0000-000000000001', 'Creating Safety', 'Build a foundation of physical and emotional safety', 'Safety is essential for intimacy after trauma. Learn to create conditions where you feel secure.', 2, 15, 'exercise'),
('l1200003-0000-0000-0000-000000000001', 'a1000012-0000-0000-0000-000000000001', 'Recognizing Triggers', 'Identify what triggers trauma responses', 'Know your triggers so you can prepare for them and communicate about them.', 3, 20, 'reflection'),
('l1200004-0000-0000-0000-000000000001', 'a1000012-0000-0000-0000-000000000001', 'Grounding Techniques', 'Stay present during intimacy', 'Learn grounding techniques to stay in your body and in the present moment during intimacy.', 4, 20, 'exercise'),
('l1200005-0000-0000-0000-000000000001', 'a1000012-0000-0000-0000-000000000001', 'Communicating Needs', 'Talk to your partner about trauma and needs', 'Share what you need from your partner to feel safe, and what to do if you get triggered.', 5, 15, 'action');

-- Program 13: Initiation Mastery
INSERT INTO lessons (id, program_id, title, description, content, order_index, duration_minutes, lesson_type) VALUES
('l1300001-0000-0000-0000-000000000001', 'a1000013-0000-0000-0000-000000000001', 'Initiation Styles', 'Understand how you and your partner initiate', 'Everyone has a different initiation style. Some are direct, others subtle. Learn to recognize patterns.', 1, 12, 'reading'),
('l1300002-0000-0000-0000-000000000001', 'a1000013-0000-0000-0000-000000000001', 'Building Initiation Confidence', 'Overcome fear of initiating', 'Fear of rejection often stops us from initiating. Build confidence through practice and perspective.', 2, 15, 'exercise'),
('l1300003-0000-0000-0000-000000000001', 'a1000013-0000-0000-0000-000000000001', 'Low-Pressure Approaches', 'Invite without demanding', 'The best initiations feel like invitations, not demands. Learn low-pressure ways to express interest.', 3, 15, 'exercise'),
('l1300004-0000-0000-0000-000000000001', 'a1000013-0000-0000-0000-000000000001', 'Reading Signals', 'Recognize receptivity and disinterest', 'Learn to read your partner cues so you can time your initiations well.', 4, 12, 'reading'),
('l1300005-0000-0000-0000-000000000001', 'a1000013-0000-0000-0000-000000000001', 'Handling Rejection', 'Respond to no with grace', 'Rejection is not about your worth. Learn to handle no gracefully to protect the relationship.', 5, 15, 'action');

-- Program 14: Emotional Safety & Security
INSERT INTO lessons (id, program_id, title, description, content, order_index, duration_minutes, lesson_type) VALUES
('l1400001-0000-0000-0000-000000000001', 'a1000014-0000-0000-0000-000000000001', 'Attachment Theory Basics', 'Understand your attachment style', 'Your attachment style shapes how you connect. Learn about secure, anxious, avoidant, and fearful attachment.', 1, 15, 'reading'),
('l1400002-0000-0000-0000-000000000001', 'a1000014-0000-0000-0000-000000000001', 'Creating Predictability', 'Build trust through consistency', 'Emotional safety comes from predictability. Be consistent in your words and actions.', 2, 12, 'exercise'),
('l1400003-0000-0000-0000-000000000001', 'a1000014-0000-0000-0000-000000000001', 'Handling Triggers Together', 'Support each other through emotional triggers', 'Learn to recognize and respond to each other triggers with compassion rather than defensiveness.', 3, 20, 'exercise'),
('l1400004-0000-0000-0000-000000000001', 'a1000014-0000-0000-0000-000000000001', 'Repair After Rupture', 'Heal breaks in connection quickly', 'All relationships have ruptures. What matters is how quickly and thoroughly you repair.', 4, 15, 'action'),
('l1400005-0000-0000-0000-000000000001', 'a1000014-0000-0000-0000-000000000001', 'Building Secure Attachment', 'Move toward secure connection', 'Practice habits that build secure attachment over time.', 5, 15, 'action');

-- Program 15: Solo Healing From Shame
INSERT INTO lessons (id, program_id, title, description, content, order_index, duration_minutes, lesson_type) VALUES
('l1500001-0000-0000-0000-000000000001', 'a1000015-0000-0000-0000-000000000001', 'Origins of Shame', 'Understand where your sexual shame comes from', 'Sexual shame is learned from family, religion, culture, or trauma. Identify the sources of your shame.', 1, 15, 'reflection'),
('l1500002-0000-0000-0000-000000000001', 'a1000015-0000-0000-0000-000000000001', 'Shame vs Guilt', 'Understand the difference and why it matters', 'Guilt says I did something bad. Shame says I am bad. Learning the difference helps healing.', 2, 12, 'reading'),
('l1500003-0000-0000-0000-000000000001', 'a1000015-0000-0000-0000-000000000001', 'Rewriting Shame Stories', 'Challenge and replace shame narratives', 'Take the shame stories you tell yourself and write compassionate alternatives.', 3, 20, 'exercise'),
('l1500004-0000-0000-0000-000000000001', 'a1000015-0000-0000-0000-000000000001', 'Self-Compassion Practices', 'Treat yourself with kindness', 'Practice speaking to yourself as you would to a dear friend about sexuality.', 4, 15, 'exercise'),
('l1500005-0000-0000-0000-000000000001', 'a1000015-0000-0000-0000-000000000001', 'Embracing Desire', 'Accept your desires without shame', 'Your desires are natural. Practice accepting them as a normal part of being human.', 5, 15, 'action');

-- Program 16: Sensate Focus
INSERT INTO lessons (id, program_id, title, description, content, order_index, duration_minutes, lesson_type) VALUES
('l1600001-0000-0000-0000-000000000001', 'a1000016-0000-0000-0000-000000000001', 'Introduction to Sensate Focus', 'Learn the principles and history of sensate focus therapy', 'Sensate focus was developed by Masters and Johnson as a way to reduce performance anxiety and increase bodily awareness during intimacy.', 1, 15, 'reading'),
('l1600002-0000-0000-0000-000000000001', 'a1000016-0000-0000-0000-000000000001', 'Non-Genital Touch', 'Practice touching without sexual intent', 'The first stage focuses entirely on non-genital touch to build comfort and awareness without pressure.', 2, 20, 'exercise'),
('l1600003-0000-0000-0000-000000000001', 'a1000016-0000-0000-0000-000000000001', 'Genital Touch Introduction', 'Gradually incorporate genital touch', 'Building on previous exercises, this stage introduces genital touch while maintaining the mindful, exploratory approach.', 3, 20, 'exercise'),
('l1600004-0000-0000-0000-000000000001', 'a1000016-0000-0000-0000-000000000001', 'Mutual Touch', 'Practice simultaneous giving and receiving', 'Learn to both give and receive touch at the same time while staying present.', 4, 25, 'exercise'),
('l1600005-0000-0000-0000-000000000001', 'a1000016-0000-0000-0000-000000000001', 'Integration Practice', 'Integrate sensate focus into regular intimacy', 'Apply the principles you have learned to enhance your regular intimate experiences.', 5, 15, 'reflection');

-- Program 17: Improving After-Sex Connection
INSERT INTO lessons (id, program_id, title, description, content, order_index, duration_minutes, lesson_type) VALUES
('l1700001-0000-0000-0000-000000000001', 'a1000017-0000-0000-0000-000000000001', 'Why Aftercare Matters', 'Understand the importance of post-intimacy connection', 'Aftercare helps regulate emotions, deepen bonds, and ensure both partners feel valued after vulnerability.', 1, 10, 'reading'),
('l1700002-0000-0000-0000-000000000001', 'a1000017-0000-0000-0000-000000000001', 'Physical Aftercare', 'Learn physical ways to care for each other', 'Explore cuddling positions, temperature regulation, hydration, and gentle touch after intimacy.', 2, 15, 'exercise'),
('l1700003-0000-0000-0000-000000000001', 'a1000017-0000-0000-0000-000000000001', 'Emotional Aftercare', 'Connect emotionally after intimacy', 'Practice verbal affirmation, emotional check-ins, and gratitude expression.', 3, 15, 'exercise'),
('l1700004-0000-0000-0000-000000000001', 'a1000017-0000-0000-0000-000000000001', 'Creating Your Aftercare Ritual', 'Design a personalized routine', 'Work together to create a post-intimacy ritual that works for both of you.', 4, 20, 'action'),
('l1700005-0000-0000-0000-000000000001', 'a1000017-0000-0000-0000-000000000001', 'Aftercare Reflection', 'Review and refine your practice', 'Reflect on what has worked and adjust your aftercare approach.', 5, 10, 'reflection');

-- Program 18: Post-Conflict Intimacy Recovery
INSERT INTO lessons (id, program_id, title, description, content, order_index, duration_minutes, lesson_type) VALUES
('l1800001-0000-0000-0000-000000000001', 'a1000018-0000-0000-0000-000000000001', 'Conflict and Intimacy', 'Understand how conflict affects connection', 'Learn how unresolved conflict creates barriers to intimacy and what we can do about it.', 1, 12, 'reading'),
('l1800002-0000-0000-0000-000000000001', 'a1000018-0000-0000-0000-000000000001', 'Repair Conversations', 'Learn to have healing conversations', 'Practice structured repair conversations that address hurt without blame.', 2, 20, 'exercise'),
('l1800003-0000-0000-0000-000000000001', 'a1000018-0000-0000-0000-000000000001', 'Rebuilding Physical Trust', 'Gradually restore physical connection', 'Use gentle touch exercises to rebuild comfort after conflict.', 3, 15, 'exercise'),
('l1800004-0000-0000-0000-000000000001', 'a1000018-0000-0000-0000-000000000001', 'Forgiveness Practice', 'Work through resentment', 'Engage in forgiveness exercises that help release lingering hurt.', 4, 20, 'reflection'),
('l1800005-0000-0000-0000-000000000001', 'a1000018-0000-0000-0000-000000000001', 'Prevention Strategies', 'Build resilience for future conflicts', 'Develop strategies to maintain connection even during disagreements.', 5, 15, 'action');

-- Program 19: Passionate Marriage Renewal
INSERT INTO lessons (id, program_id, title, description, content, order_index, duration_minutes, lesson_type) VALUES
('l1900001-0000-0000-0000-000000000001', 'a1000019-0000-0000-0000-000000000001', 'Rekindling Desire', 'Understand how desire works in long-term relationships', 'Learn about responsive vs spontaneous desire and how to nurture both.', 1, 15, 'reading'),
('l1900002-0000-0000-0000-000000000001', 'a1000019-0000-0000-0000-000000000001', 'Date Night Reimagined', 'Create meaningful connection time', 'Design intentional dates that build anticipation and novelty.', 2, 15, 'action'),
('l1900003-0000-0000-0000-000000000001', 'a1000019-0000-0000-0000-000000000001', 'Erotic Exploration', 'Expand your intimate repertoire', 'Safely explore new activities that interest both partners.', 3, 20, 'exercise'),
('l1900004-0000-0000-0000-000000000001', 'a1000019-0000-0000-0000-000000000001', 'Differentiation Practice', 'Maintain individuality within partnership', 'Understand how healthy self-development fuels passion.', 4, 15, 'reflection'),
('l1900005-0000-0000-0000-000000000001', 'a1000019-0000-0000-0000-000000000001', 'Sustaining Passion', 'Create lasting change', 'Develop habits that keep passion alive long-term.', 5, 12, 'action');

-- Program 20: Navigating Desire Differences
INSERT INTO lessons (id, program_id, title, description, content, order_index, duration_minutes, lesson_type) VALUES
('l2000001-0000-0000-0000-000000000001', 'a1000020-0000-0000-0000-000000000001', 'Understanding Desire Discrepancy', 'Learn why desire differences happen', 'Explore common causes of mismatched desire and how to approach them.', 1, 15, 'reading'),
('l2000002-0000-0000-0000-000000000001', 'a1000020-0000-0000-0000-000000000001', 'Empathy Exercises', 'See from your partner perspective', 'Practice stepping into your partner shoes regarding their desire experience.', 2, 20, 'exercise'),
('l2000003-0000-0000-0000-000000000001', 'a1000020-0000-0000-0000-000000000001', 'Finding Middle Ground', 'Negotiate intimate frequency', 'Learn collaborative approaches to finding a frequency that works for both.', 3, 20, 'action'),
('l2000004-0000-0000-0000-000000000001', 'a1000020-0000-0000-0000-000000000001', 'Non-Penetrative Intimacy', 'Expand your definition of intimacy', 'Explore ways to connect that satisfy both partners needs.', 4, 15, 'exercise'),
('l2000005-0000-0000-0000-000000000001', 'a1000020-0000-0000-0000-000000000001', 'Ongoing Communication', 'Maintain open dialogue', 'Create systems for checking in about desire over time.', 5, 10, 'reflection');

-- =====================================================
-- HABITS FOR PROGRAMS 11-20
-- =====================================================

-- Program 11: Boundaries & Consent
INSERT INTO habits (id, program_id, name, description, category, frequency, is_from_program) VALUES
('h1101001-0000-0000-0000-000000000001', 'a1000011-0000-0000-0000-000000000001', 'Boundary awareness', 'Notice when a boundary is crossed and name it', 'intimacy', 'daily', true),
('h1102001-0000-0000-0000-000000000001', 'a1000011-0000-0000-0000-000000000001', 'Identify one boundary', 'Discover one new personal boundary', 'intimacy', 'weekly', true),
('h1103001-0000-0000-0000-000000000001', 'a1000011-0000-0000-0000-000000000001', 'Communicate a limit', 'Practice stating one boundary clearly', 'intimacy', 'daily', true),
('h1104001-0000-0000-0000-000000000001', 'a1000011-0000-0000-0000-000000000001', 'Check-in during intimacy', 'Ask for consent during intimate moments', 'intimacy', 'daily', true),
('h1105001-0000-0000-0000-000000000001', 'a1000011-0000-0000-0000-000000000001', 'Graceful acceptance', 'Accept a no from partner without guilt', 'intimacy', 'daily', true);

-- Program 12: Trauma-Informed Intimacy
INSERT INTO habits (id, program_id, name, description, category, frequency, is_from_program) VALUES
('h1201001-0000-0000-0000-000000000001', 'a1000012-0000-0000-0000-000000000001', 'Safety check', 'Assess your sense of safety before intimacy', 'intimacy', 'daily', true),
('h1202001-0000-0000-0000-000000000001', 'a1000012-0000-0000-0000-000000000001', 'Create safe conditions', 'Set up the environment for safety', 'intimacy', 'daily', true),
('h1203001-0000-0000-0000-000000000001', 'a1000012-0000-0000-0000-000000000001', 'Trigger awareness', 'Notice triggers as they arise', 'intimacy', 'daily', true),
('h1204001-0000-0000-0000-000000000001', 'a1000012-0000-0000-0000-000000000001', 'Grounding practice', '5 minutes of grounding before intimacy', 'intimacy', 'daily', true),
('h1205001-0000-0000-0000-000000000001', 'a1000012-0000-0000-0000-000000000001', 'Share one need', 'Communicate one safety need to partner', 'intimacy', 'weekly', true);

-- Program 13: Initiation Mastery
INSERT INTO habits (id, program_id, name, description, category, frequency, is_from_program) VALUES
('h1301001-0000-0000-0000-000000000001', 'a1000013-0000-0000-0000-000000000001', 'Notice initiation patterns', 'Observe how you and partner initiate', 'intimacy', 'daily', true),
('h1302001-0000-0000-0000-000000000001', 'a1000013-0000-0000-0000-000000000001', 'Practice one initiation', 'Make one low-pressure initiation', 'intimacy', 'daily', true),
('h1303001-0000-0000-0000-000000000001', 'a1000013-0000-0000-0000-000000000001', 'Soft approach', 'Use inviting rather than demanding language', 'intimacy', 'daily', true),
('h1304001-0000-0000-0000-000000000001', 'a1000013-0000-0000-0000-000000000001', 'Read cues', 'Pay attention to partner receptivity signals', 'intimacy', 'daily', true),
('h1305001-0000-0000-0000-000000000001', 'a1000013-0000-0000-0000-000000000001', 'Graceful response', 'Respond to rejection without pressure', 'intimacy', 'daily', true);

-- Program 14: Emotional Safety & Security
INSERT INTO habits (id, program_id, name, description, category, frequency, is_from_program) VALUES
('h1401001-0000-0000-0000-000000000001', 'a1000014-0000-0000-0000-000000000001', 'Attachment awareness', 'Notice your attachment patterns', 'intimacy', 'daily', true),
('h1402001-0000-0000-0000-000000000001', 'a1000014-0000-0000-0000-000000000001', 'Be consistent', 'Follow through on one promise', 'intimacy', 'daily', true),
('h1403001-0000-0000-0000-000000000001', 'a1000014-0000-0000-0000-000000000001', 'Trigger response', 'Respond to partner trigger with compassion', 'intimacy', 'daily', true),
('h1404001-0000-0000-0000-000000000001', 'a1000014-0000-0000-0000-000000000001', 'Quick repair', 'Initiate repair within 24 hours of rupture', 'intimacy', 'daily', true),
('h1405001-0000-0000-0000-000000000001', 'a1000014-0000-0000-0000-000000000001', 'Secure behavior', 'Practice one secure attachment behavior', 'intimacy', 'daily', true);

-- Program 15: Solo Healing From Shame
INSERT INTO habits (id, program_id, name, description, category, frequency, is_from_program) VALUES
('h1501001-0000-0000-0000-000000000001', 'a1000015-0000-0000-0000-000000000001', 'Shame tracking', 'Notice when shame arises and name its source', 'intimacy', 'daily', true),
('h1502001-0000-0000-0000-000000000001', 'a1000015-0000-0000-0000-000000000001', 'Challenge shame', 'Reframe one shame thought with compassion', 'intimacy', 'daily', true),
('h1503001-0000-0000-0000-000000000001', 'a1000015-0000-0000-0000-000000000001', 'Rewrite story', 'Write a compassionate version of a shame story', 'intimacy', 'weekly', true),
('h1504001-0000-0000-0000-000000000001', 'a1000015-0000-0000-0000-000000000001', 'Self-kindness moment', 'Speak kindly to yourself about sexuality', 'intimacy', 'daily', true),
('h1505001-0000-0000-0000-000000000001', 'a1000015-0000-0000-0000-000000000001', 'Accept desire', 'Notice desire without judgment', 'intimacy', 'daily', true);

-- Program 16: Sensate Focus
INSERT INTO habits (id, program_id, name, description, category, frequency, is_from_program) VALUES
('h1601001-0000-0000-0000-000000000001', 'a1000016-0000-0000-0000-000000000001', 'Review principles', 'Spend 5 minutes reading about sensate focus', 'intimacy', 'daily', true),
('h1602001-0000-0000-0000-000000000001', 'a1000016-0000-0000-0000-000000000001', 'Non-genital practice', 'Practice 15-20 minutes of non-genital touch', 'intimacy', 'weekly', true),
('h1603001-0000-0000-0000-000000000001', 'a1000016-0000-0000-0000-000000000001', 'Genital touch session', 'Practice mindful genital touch exploration', 'intimacy', 'weekly', true),
('h1604001-0000-0000-0000-000000000001', 'a1000016-0000-0000-0000-000000000001', 'Mutual touch', 'Practice simultaneous giving and receiving', 'intimacy', 'weekly', true),
('h1605001-0000-0000-0000-000000000001', 'a1000016-0000-0000-0000-000000000001', 'Integration', 'Apply sensate principles during regular intimacy', 'intimacy', 'weekly', true);

-- Program 17: Improving After-Sex Connection
INSERT INTO habits (id, program_id, name, description, category, frequency, is_from_program) VALUES
('h1701001-0000-0000-0000-000000000001', 'a1000017-0000-0000-0000-000000000001', 'Aftercare check-in', 'Ask partner what they need after intimacy', 'intimacy', 'daily', true),
('h1702001-0000-0000-0000-000000000001', 'a1000017-0000-0000-0000-000000000001', 'Post-intimacy cuddling', 'Spend 10+ minutes cuddling after intimacy', 'intimacy', 'daily', true),
('h1703001-0000-0000-0000-000000000001', 'a1000017-0000-0000-0000-000000000001', 'Emotional affirmation', 'Share 3 things you appreciate after intimacy', 'intimacy', 'daily', true),
('h1704001-0000-0000-0000-000000000001', 'a1000017-0000-0000-0000-000000000001', 'Aftercare ritual', 'Complete your personalized aftercare routine', 'intimacy', 'daily', true),
('h1705001-0000-0000-0000-000000000001', 'a1000017-0000-0000-0000-000000000001', 'Aftercare reflection', 'Journal about what worked in your aftercare', 'intimacy', 'weekly', true);

-- Program 18: Post-Conflict Intimacy Recovery
INSERT INTO habits (id, program_id, name, description, category, frequency, is_from_program) VALUES
('h1801001-0000-0000-0000-000000000001', 'a1000018-0000-0000-0000-000000000001', 'Conflict awareness', 'Notice when unresolved conflict blocks intimacy', 'intimacy', 'daily', true),
('h1802001-0000-0000-0000-000000000001', 'a1000018-0000-0000-0000-000000000001', 'Repair conversation', 'Have a structured repair conversation', 'intimacy', 'weekly', true),
('h1803001-0000-0000-0000-000000000001', 'a1000018-0000-0000-0000-000000000001', 'Gentle touch', 'Use gentle touch to rebuild physical comfort', 'intimacy', 'daily', true),
('h1804001-0000-0000-0000-000000000001', 'a1000018-0000-0000-0000-000000000001', 'Forgiveness work', 'Practice letting go of resentment', 'intimacy', 'weekly', true),
('h1805001-0000-0000-0000-000000000001', 'a1000018-0000-0000-0000-000000000001', 'Prevention strategy', 'Stay connected during disagreements', 'intimacy', 'daily', true);

-- Program 19: Passionate Marriage Renewal
INSERT INTO habits (id, program_id, name, description, category, frequency, is_from_program) VALUES
('h1901001-0000-0000-0000-000000000001', 'a1000019-0000-0000-0000-000000000001', 'Desire cultivation', 'Do one thing to cultivate desire', 'intimacy', 'daily', true),
('h1902001-0000-0000-0000-000000000001', 'a1000019-0000-0000-0000-000000000001', 'Intentional date', 'Plan or execute an intentional date', 'intimacy', 'weekly', true),
('h1903001-0000-0000-0000-000000000001', 'a1000019-0000-0000-0000-000000000001', 'Erotic exploration', 'Try something new in your intimate life', 'intimacy', 'weekly', true),
('h1904001-0000-0000-0000-000000000001', 'a1000019-0000-0000-0000-000000000001', 'Self-development', 'Pursue a personal interest', 'intimacy', 'daily', true),
('h1905001-0000-0000-0000-000000000001', 'a1000019-0000-0000-0000-000000000001', 'Passion habit', 'Complete one passion-sustaining activity', 'intimacy', 'daily', true);

-- Program 20: Navigating Desire Differences
INSERT INTO habits (id, program_id, name, description, category, frequency, is_from_program) VALUES
('h2001001-0000-0000-0000-000000000001', 'a1000020-0000-0000-0000-000000000001', 'Desire awareness', 'Notice your desire levels without judgment', 'intimacy', 'daily', true),
('h2002001-0000-0000-0000-000000000001', 'a1000020-0000-0000-0000-000000000001', 'Empathy practice', 'Imagine partner perspective on desire', 'intimacy', 'weekly', true),
('h2003001-0000-0000-0000-000000000001', 'a1000020-0000-0000-0000-000000000001', 'Middle ground check-in', 'Check in about frequency that works', 'intimacy', 'weekly', true),
('h2004001-0000-0000-0000-000000000001', 'a1000020-0000-0000-0000-000000000001', 'Non-penetrative connection', 'Practice intimacy without penetration', 'intimacy', 'weekly', true),
('h2005001-0000-0000-0000-000000000001', 'a1000020-0000-0000-0000-000000000001', 'Desire communication', 'Share openly about your desire state', 'intimacy', 'daily', true);

-- =====================================================
-- LESSON-HABITS JUNCTION FOR PROGRAMS 11-20
-- =====================================================

INSERT INTO lesson_habits (id, lesson_id, habit_id, order_index) VALUES
-- Program 11
('lh1100101', 'l1100001-0000-0000-0000-000000000001', 'h1101001-0000-0000-0000-000000000001', 1),
('lh1100201', 'l1100002-0000-0000-0000-000000000001', 'h1102001-0000-0000-0000-000000000001', 1),
('lh1100301', 'l1100003-0000-0000-0000-000000000001', 'h1103001-0000-0000-0000-000000000001', 1),
('lh1100401', 'l1100004-0000-0000-0000-000000000001', 'h1104001-0000-0000-0000-000000000001', 1),
('lh1100501', 'l1100005-0000-0000-0000-000000000001', 'h1105001-0000-0000-0000-000000000001', 1),
-- Program 12
('lh1200101', 'l1200001-0000-0000-0000-000000000001', 'h1201001-0000-0000-0000-000000000001', 1),
('lh1200201', 'l1200002-0000-0000-0000-000000000001', 'h1202001-0000-0000-0000-000000000001', 1),
('lh1200301', 'l1200003-0000-0000-0000-000000000001', 'h1203001-0000-0000-0000-000000000001', 1),
('lh1200401', 'l1200004-0000-0000-0000-000000000001', 'h1204001-0000-0000-0000-000000000001', 1),
('lh1200501', 'l1200005-0000-0000-0000-000000000001', 'h1205001-0000-0000-0000-000000000001', 1),
-- Program 13
('lh1300101', 'l1300001-0000-0000-0000-000000000001', 'h1301001-0000-0000-0000-000000000001', 1),
('lh1300201', 'l1300002-0000-0000-0000-000000000001', 'h1302001-0000-0000-0000-000000000001', 1),
('lh1300301', 'l1300003-0000-0000-0000-000000000001', 'h1303001-0000-0000-0000-000000000001', 1),
('lh1300401', 'l1300004-0000-0000-0000-000000000001', 'h1304001-0000-0000-0000-000000000001', 1),
('lh1300501', 'l1300005-0000-0000-0000-000000000001', 'h1305001-0000-0000-0000-000000000001', 1),
-- Program 14
('lh1400101', 'l1400001-0000-0000-0000-000000000001', 'h1401001-0000-0000-0000-000000000001', 1),
('lh1400201', 'l1400002-0000-0000-0000-000000000001', 'h1402001-0000-0000-0000-000000000001', 1),
('lh1400301', 'l1400003-0000-0000-0000-000000000001', 'h1403001-0000-0000-0000-000000000001', 1),
('lh1400401', 'l1400004-0000-0000-0000-000000000001', 'h1404001-0000-0000-0000-000000000001', 1),
('lh1400501', 'l1400005-0000-0000-0000-000000000001', 'h1405001-0000-0000-0000-000000000001', 1),
-- Program 15
('lh1500101', 'l1500001-0000-0000-0000-000000000001', 'h1501001-0000-0000-0000-000000000001', 1),
('lh1500201', 'l1500002-0000-0000-0000-000000000001', 'h1502001-0000-0000-0000-000000000001', 1),
('lh1500301', 'l1500003-0000-0000-0000-000000000001', 'h1503001-0000-0000-0000-000000000001', 1),
('lh1500401', 'l1500004-0000-0000-0000-000000000001', 'h1504001-0000-0000-0000-000000000001', 1),
('lh1500501', 'l1500005-0000-0000-0000-000000000001', 'h1505001-0000-0000-0000-000000000001', 1),
-- Program 16
('lh1600101', 'l1600001-0000-0000-0000-000000000001', 'h1601001-0000-0000-0000-000000000001', 1),
('lh1600201', 'l1600002-0000-0000-0000-000000000001', 'h1602001-0000-0000-0000-000000000001', 1),
('lh1600301', 'l1600003-0000-0000-0000-000000000001', 'h1603001-0000-0000-0000-000000000001', 1),
('lh1600401', 'l1600004-0000-0000-0000-000000000001', 'h1604001-0000-0000-0000-000000000001', 1),
('lh1600501', 'l1600005-0000-0000-0000-000000000001', 'h1605001-0000-0000-0000-000000000001', 1),
-- Program 17
('lh1700101', 'l1700001-0000-0000-0000-000000000001', 'h1701001-0000-0000-0000-000000000001', 1),
('lh1700201', 'l1700002-0000-0000-0000-000000000001', 'h1702001-0000-0000-0000-000000000001', 1),
('lh1700301', 'l1700003-0000-0000-0000-000000000001', 'h1703001-0000-0000-0000-000000000001', 1),
('lh1700401', 'l1700004-0000-0000-0000-000000000001', 'h1704001-0000-0000-0000-000000000001', 1),
('lh1700501', 'l1700005-0000-0000-0000-000000000001', 'h1705001-0000-0000-0000-000000000001', 1),
-- Program 18
('lh1800101', 'l1800001-0000-0000-0000-000000000001', 'h1801001-0000-0000-0000-000000000001', 1),
('lh1800201', 'l1800002-0000-0000-0000-000000000001', 'h1802001-0000-0000-0000-000000000001', 1),
('lh1800301', 'l1800003-0000-0000-0000-000000000001', 'h1803001-0000-0000-0000-000000000001', 1),
('lh1800401', 'l1800004-0000-0000-0000-000000000001', 'h1804001-0000-0000-0000-000000000001', 1),
('lh1800501', 'l1800005-0000-0000-0000-000000000001', 'h1805001-0000-0000-0000-000000000001', 1),
-- Program 19
('lh1900101', 'l1900001-0000-0000-0000-000000000001', 'h1901001-0000-0000-0000-000000000001', 1),
('lh1900201', 'l1900002-0000-0000-0000-000000000001', 'h1902001-0000-0000-0000-000000000001', 1),
('lh1900301', 'l1900003-0000-0000-0000-000000000001', 'h1903001-0000-0000-0000-000000000001', 1),
('lh1900401', 'l1900004-0000-0000-0000-000000000001', 'h1904001-0000-0000-0000-000000000001', 1),
('lh1900501', 'l1900005-0000-0000-0000-000000000001', 'h1905001-0000-0000-0000-000000000001', 1),
-- Program 20
('lh2000101', 'l2000001-0000-0000-0000-000000000001', 'h2001001-0000-0000-0000-000000000001', 1),
('lh2000201', 'l2000002-0000-0000-0000-000000000001', 'h2002001-0000-0000-0000-000000000001', 1),
('lh2000301', 'l2000003-0000-0000-0000-000000000001', 'h2003001-0000-0000-0000-000000000001', 1),
('lh2000401', 'l2000004-0000-0000-0000-000000000001', 'h2004001-0000-0000-0000-000000000001', 1),
('lh2000501', 'l2000005-0000-0000-0000-000000000001', 'h2005001-0000-0000-0000-000000000001', 1);
