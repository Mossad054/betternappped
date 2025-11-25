-- =====================================================
-- COMPLETE SEED: PROGRAMS 1-10 WITH LESSONS & HABITS
-- =====================================================
-- Run this file to seed programs 1-10 with all their lessons and habits

-- =====================================================
-- PROGRAMS 1-10
-- =====================================================

INSERT INTO programs (id, title, description, category, difficulty, duration_days, total_lessons, tags, is_active) VALUES
('a1000001-0000-0000-0000-000000000001', 'Emotional Connection Reset', 'Rebuild emotional intimacy and deepen your bond through daily practices and meaningful conversations.', 'connection', 'beginner', 14, 5, ARRAY['couples', 'emotional', 'connection', 'communication'], true),
('a1000002-0000-0000-0000-000000000001', 'Solo Intimacy Journey', 'Discover self-pleasure, body acceptance, and personal desire without shame or judgment.', 'self-love', 'beginner', 21, 5, ARRAY['solo', 'self-discovery', 'pleasure', 'body-positive'], true),
('a1000003-0000-0000-0000-000000000001', 'Touch & Affection Rebuilding', 'Relearn the language of touch and rebuild physical affection in your relationship.', 'connection', 'beginner', 14, 5, ARRAY['couples', 'touch', 'affection', 'physical'], true),
('a1000004-0000-0000-0000-000000000001', 'Confidence & Body Positivity', 'Build sexual confidence and embrace your body through self-compassion practices.', 'self-love', 'beginner', 21, 5, ARRAY['solo', 'confidence', 'body-image', 'self-esteem'], true),
('a1000005-0000-0000-0000-000000000001', 'Desire Re-Ignition Bootcamp', 'Reignite passion and desire in your relationship through intentional practices.', 'desire', 'intermediate', 14, 5, ARRAY['couples', 'desire', 'passion', 'spark'], true),
('a1000006-0000-0000-0000-000000000001', 'Slow Pleasure & Mindfulness', 'Learn to slow down and savor intimate moments through mindfulness techniques.', 'exploration', 'beginner', 14, 5, ARRAY['solo', 'couples', 'mindfulness', 'pleasure', 'presence'], true),
('a1000007-0000-0000-0000-000000000001', 'Communication for Intimacy', 'Master the art of talking about desires, boundaries, and needs with your partner.', 'communication', 'beginner', 14, 5, ARRAY['couples', 'communication', 'talking', 'boundaries'], true),
('a1000008-0000-0000-0000-000000000001', 'Healing Resentment', 'Release built-up resentment and restore connection after conflict or hurt.', 'conflict', 'intermediate', 21, 5, ARRAY['couples', 'healing', 'forgiveness', 'resentment'], true),
('a1000009-0000-0000-0000-000000000001', 'Arousal Discovery Lab', 'Explore and understand your unique arousal patterns and what turns you on.', 'exploration', 'intermediate', 14, 5, ARRAY['solo', 'arousal', 'discovery', 'pleasure-mapping'], true),
('a1000010-0000-0000-0000-000000000001', 'Romance & Playfulness Reboot', 'Bring back fun, flirting, and romance to your relationship.', 'connection', 'beginner', 14, 5, ARRAY['couples', 'romance', 'fun', 'playfulness', 'dating'], true);

-- =====================================================
-- LESSONS FOR PROGRAMS 1-10
-- =====================================================

-- Program 1: Emotional Connection Reset
INSERT INTO lessons (id, program_id, title, description, content, order_index, duration_minutes, lesson_type) VALUES
('l0100001-0000-0000-0000-000000000001', 'a1000001-0000-0000-0000-000000000001', 'Understanding Emotional Disconnection', 'Recognize the signs and causes of emotional distance', 'Emotional disconnection happens gradually. It starts with small moments of turning away instead of toward each other. This lesson helps you identify patterns of disconnection in your relationship.', 1, 15, 'reading'),
('l0100002-0000-0000-0000-000000000001', 'a1000001-0000-0000-0000-000000000001', 'The Emotional Bank Account', 'Learn how to make daily deposits of connection', 'Every interaction is either a deposit or withdrawal from your emotional bank account. Small moments of connection build a reserve that sustains you through difficult times.', 2, 12, 'reading'),
('l0100003-0000-0000-0000-000000000001', 'a1000001-0000-0000-0000-000000000001', 'Active Listening Practice', 'Practice deep listening without judgment', 'True listening means hearing to understand, not to respond. Practice giving your partner your full attention without planning what to say next.', 3, 20, 'exercise'),
('l0100004-0000-0000-0000-000000000001', 'a1000001-0000-0000-0000-000000000001', 'Vulnerability Exchange', 'Share something meaningful with each other', 'Vulnerability is the birthplace of connection. Take turns sharing something you have not shared before in a safe, judgment-free space.', 4, 25, 'exercise'),
('l0100005-0000-0000-0000-000000000001', 'a1000001-0000-0000-0000-000000000001', 'Daily Connection Rituals', 'Create sustainable habits for ongoing connection', 'Design rituals that keep you connected daily - morning check-ins, evening gratitude, weekly date nights. Consistency builds intimacy.', 5, 15, 'action');

-- Program 2: Solo Intimacy Journey
INSERT INTO lessons (id, program_id, title, description, content, order_index, duration_minutes, lesson_type) VALUES
('l0200001-0000-0000-0000-000000000001', 'a1000002-0000-0000-0000-000000000001', 'Releasing Self-Judgment', 'Let go of shame around self-pleasure', 'Self-pleasure is natural and healthy. This lesson helps you identify and release shame messages you may have absorbed about your body and desire.', 1, 15, 'reading'),
('l0200002-0000-0000-0000-000000000001', 'a1000002-0000-0000-0000-000000000001', 'Body Mapping', 'Discover your pleasure zones', 'Your body has many erogenous zones beyond the obvious ones. Explore your entire body with curiosity to discover what feels good.', 2, 20, 'exercise'),
('l0200003-0000-0000-0000-000000000001', 'a1000002-0000-0000-0000-000000000001', 'Mindful Self-Touch', 'Practice present-moment awareness during pleasure', 'Bring mindfulness to self-pleasure. Focus on sensations without rushing toward orgasm. Notice temperature, pressure, texture.', 3, 20, 'exercise'),
('l0200004-0000-0000-0000-000000000001', 'a1000002-0000-0000-0000-000000000001', 'Fantasy Exploration', 'Safely explore your imagination', 'Your fantasies are yours alone. Explore what turns you on mentally without judgment. Fantasy is a safe space to explore.', 4, 15, 'reflection'),
('l0200005-0000-0000-0000-000000000001', 'a1000002-0000-0000-0000-000000000001', 'Creating Your Practice', 'Build a sustainable self-pleasure routine', 'Design a self-pleasure practice that honors your needs and schedule. This is about ongoing self-care, not just occasional release.', 5, 12, 'action');

-- Program 3: Touch & Affection Rebuilding
INSERT INTO lessons (id, program_id, title, description, content, order_index, duration_minutes, lesson_type) VALUES
('l0300001-0000-0000-0000-000000000001', 'a1000003-0000-0000-0000-000000000001', 'The Touch Hunger', 'Understand your need for physical connection', 'Humans need touch to thrive. When couples stop touching, both partners suffer. Learn why touch matters and how to rebuild it.', 1, 12, 'reading'),
('l0300002-0000-0000-0000-000000000001', 'a1000003-0000-0000-0000-000000000001', 'Non-Sexual Touch', 'Practice affectionate touch without sexual intent', 'Not all touch needs to lead to sex. Practice holding hands, cuddling, and gentle touch that builds connection without expectation.', 2, 15, 'exercise'),
('l0300003-0000-0000-0000-000000000001', 'a1000003-0000-0000-0000-000000000001', 'Touch Preferences', 'Communicate how you like to be touched', 'Everyone has different touch preferences. Share what feels good, what does not, and what you would like more of.', 3, 20, 'exercise'),
('l0300004-0000-0000-0000-000000000001', 'a1000003-0000-0000-0000-000000000001', 'Sensate Focus Basics', 'Practice mindful, exploratory touch', 'Sensate focus exercises help rebuild comfort with touch. Take turns touching and being touched with full presence.', 4, 25, 'exercise'),
('l0300005-0000-0000-0000-000000000001', 'a1000003-0000-0000-0000-000000000001', 'Daily Touch Goals', 'Commit to regular physical affection', 'Set goals for daily touch - a 6-second kiss, 20-second hug, holding hands. Small consistent touch builds big connection.', 5, 10, 'action');

-- Program 4: Confidence & Body Positivity
INSERT INTO lessons (id, program_id, title, description, content, order_index, duration_minutes, lesson_type) VALUES
('l0400001-0000-0000-0000-000000000001', 'a1000004-0000-0000-0000-000000000001', 'Your Body Story', 'Understand your relationship with your body', 'Your body image was shaped by many messages. Identify the negative ones and begin to challenge them with truth.', 1, 15, 'reflection'),
('l0400002-0000-0000-0000-000000000001', 'a1000004-0000-0000-0000-000000000001', 'Mirror Work', 'Practice looking at yourself with kindness', 'Stand before a mirror and practice seeing yourself with compassion. Notice judgment and replace it with appreciation.', 2, 15, 'exercise'),
('l0400003-0000-0000-0000-000000000001', 'a1000004-0000-0000-0000-000000000001', 'Pleasure Over Performance', 'Focus on feeling good, not looking good', 'Shift from worrying about how you look during intimacy to how you feel. Your partner wants your presence, not perfection.', 3, 12, 'reading'),
('l0400004-0000-0000-0000-000000000001', 'a1000004-0000-0000-0000-000000000001', 'Body Gratitude Practice', 'Appreciate what your body does for you', 'Your body carries you through life. Practice gratitude for its functions rather than criticizing its form.', 4, 15, 'exercise'),
('l0400005-0000-0000-0000-000000000001', 'a1000004-0000-0000-0000-000000000001', 'Confidence Affirmations', 'Build a daily confidence practice', 'Create personalized affirmations that reinforce your worth and desirability. Repeat them daily.', 5, 10, 'action');

-- Program 5: Desire Re-Ignition Bootcamp
INSERT INTO lessons (id, program_id, title, description, content, order_index, duration_minutes, lesson_type) VALUES
('l0500001-0000-0000-0000-000000000001', 'a1000005-0000-0000-0000-000000000001', 'Understanding Desire Types', 'Learn about spontaneous vs responsive desire', 'Not everyone experiences spontaneous desire. Many people have responsive desire that emerges once intimacy begins. Both are normal.', 1, 15, 'reading'),
('l0500002-0000-0000-0000-000000000001', 'a1000005-0000-0000-0000-000000000001', 'Brakes and Accelerators', 'Identify what kills and builds your desire', 'Everyone has desire accelerators (turn-ons) and brakes (turn-offs). Map yours to understand what helps desire emerge.', 2, 20, 'exercise'),
('l0500003-0000-0000-0000-000000000001', 'a1000005-0000-0000-0000-000000000001', 'Creating Context for Desire', 'Set up conditions for arousal', 'Desire needs the right context. Reduce stressors, create relaxation, and build anticipation to help desire emerge.', 3, 15, 'exercise'),
('l0500004-0000-0000-0000-000000000001', 'a1000005-0000-0000-0000-000000000001', 'Novelty and Anticipation', 'Use newness to spark desire', 'Novelty triggers dopamine. Introduce new experiences, locations, or activities to reignite excitement.', 4, 15, 'action'),
('l0500005-0000-0000-0000-000000000001', 'a1000005-0000-0000-0000-000000000001', 'Desire Maintenance Plan', 'Create ongoing practices for desire', 'Desire requires ongoing attention. Build habits that keep the spark alive long-term.', 5, 12, 'action');

-- Program 6: Slow Pleasure & Mindfulness
INSERT INTO lessons (id, program_id, title, description, content, order_index, duration_minutes, lesson_type) VALUES
('l0600001-0000-0000-0000-000000000001', 'a1000006-0000-0000-0000-000000000001', 'The Rush to Finish', 'Understand why we rush through pleasure', 'We often rush through intimacy to reach orgasm. This robs us of the full experience. Learn why slowing down matters.', 1, 12, 'reading'),
('l0600002-0000-0000-0000-000000000001', 'a1000006-0000-0000-0000-000000000001', 'Breath Awareness', 'Use breath to stay present', 'Your breath anchors you to the present moment. Practice deep, slow breathing during intimacy to stay present.', 2, 15, 'exercise'),
('l0600003-0000-0000-0000-000000000001', 'a1000006-0000-0000-0000-000000000001', 'Sensation Savoring', 'Notice the full range of sensations', 'Pay attention to temperature, texture, pressure. Notice subtle sensations you usually miss when rushing.', 3, 20, 'exercise'),
('l0600004-0000-0000-0000-000000000001', 'a1000006-0000-0000-0000-000000000001', 'Edging Practice', 'Build arousal slowly and intentionally', 'Practice building arousal and backing off before orgasm. This builds intensity and presence.', 4, 20, 'exercise'),
('l0600005-0000-0000-0000-000000000001', 'a1000006-0000-0000-0000-000000000001', 'Mindful Intimacy Integration', 'Bring mindfulness to partnered intimacy', 'Apply your mindfulness skills to partnered intimacy. Stay present with your partner.', 5, 15, 'action');

-- Program 7: Communication for Intimacy
INSERT INTO lessons (id, program_id, title, description, content, order_index, duration_minutes, lesson_type) VALUES
('l0700001-0000-0000-0000-000000000001', 'a1000007-0000-0000-0000-000000000001', 'Why Talking Feels Hard', 'Overcome barriers to intimate communication', 'Many people struggle to talk about sex. Shame, fear of rejection, and lack of vocabulary all play a role.', 1, 12, 'reading'),
('l0700002-0000-0000-0000-000000000001', 'a1000007-0000-0000-0000-000000000001', 'Building Vocabulary', 'Find words that work for you', 'Develop comfortable language for body parts, desires, and boundaries. Practice using these words out loud.', 2, 15, 'exercise'),
('l0700003-0000-0000-0000-000000000001', 'a1000007-0000-0000-0000-000000000001', 'Expressing Desires', 'Learn to ask for what you want', 'Use I-statements and specific requests. Say what you want, not just what you do not want.', 3, 15, 'exercise'),
('l0700004-0000-0000-0000-000000000001', 'a1000007-0000-0000-0000-000000000001', 'Setting Boundaries', 'Communicate limits clearly and kindly', 'Boundaries protect you and improve intimacy. Learn to say no in a way that feels good to both of you.', 4, 15, 'exercise'),
('l0700005-0000-0000-0000-000000000001', 'a1000007-0000-0000-0000-000000000001', 'Ongoing Check-ins', 'Create regular communication rituals', 'Schedule regular talks about your intimate life. This normalizes the conversation and keeps you connected.', 5, 12, 'action');

-- Program 8: Healing Resentment
INSERT INTO lessons (id, program_id, title, description, content, order_index, duration_minutes, lesson_type) VALUES
('l0800001-0000-0000-0000-000000000001', 'a1000008-0000-0000-0000-000000000001', 'Recognizing Resentment', 'Identify where resentment lives in you', 'Resentment builds from unmet needs and unhealed hurts. Name the specific resentments you carry toward your partner.', 1, 15, 'reflection'),
('l0800002-0000-0000-0000-000000000001', 'a1000008-0000-0000-0000-000000000001', 'The Cost of Holding On', 'Understand how resentment damages connection', 'Resentment is poison to intimacy. See clearly how it affects your relationship and your own wellbeing.', 2, 12, 'reading'),
('l0800003-0000-0000-0000-000000000001', 'a1000008-0000-0000-0000-000000000001', 'The Repair Conversation', 'Have a structured healing conversation', 'Use a framework to discuss hurts: share impact, take responsibility, make amends, rebuild trust.', 3, 25, 'exercise'),
('l0800004-0000-0000-0000-000000000001', 'a1000008-0000-0000-0000-000000000001', 'Forgiveness Practice', 'Begin the process of letting go', 'Forgiveness is a process, not an event. Practice releasing resentment for your own freedom.', 4, 20, 'reflection'),
('l0800005-0000-0000-0000-000000000001', 'a1000008-0000-0000-0000-000000000001', 'Preventing Future Resentment', 'Build habits that prevent buildup', 'Address issues before they become resentments. Create agreements for ongoing communication.', 5, 15, 'action');

-- Program 9: Arousal Discovery Lab
INSERT INTO lessons (id, program_id, title, description, content, order_index, duration_minutes, lesson_type) VALUES
('l0900001-0000-0000-0000-000000000001', 'a1000009-0000-0000-0000-000000000001', 'Arousal Basics', 'Understand how arousal works', 'Arousal involves physical, mental, and emotional components. All three must align for full arousal.', 1, 12, 'reading'),
('l0900002-0000-0000-0000-000000000001', 'a1000009-0000-0000-0000-000000000001', 'Mental Arousal Mapping', 'Discover what turns your mind on', 'Fantasies, scenarios, words - what mentally arouses you? Explore without judgment.', 2, 20, 'exercise'),
('l0900003-0000-0000-0000-000000000001', 'a1000009-0000-0000-0000-000000000001', 'Physical Arousal Mapping', 'Find your body responsive zones', 'Beyond genitals, where does touch arouse you? Neck, ears, inner thighs - discover your map.', 3, 20, 'exercise'),
('l0900004-0000-0000-0000-000000000001', 'a1000009-0000-0000-0000-000000000001', 'Emotional Context', 'Understand the emotional conditions for arousal', 'Safety, trust, playfulness - what emotional states help you feel aroused?', 4, 15, 'reflection'),
('l0900005-0000-0000-0000-000000000001', 'a1000009-0000-0000-0000-000000000001', 'Sharing Your Map', 'Communicate your arousal needs', 'Share what you have learned with your partner. Guide them to what works for you.', 5, 15, 'action');

-- Program 10: Romance & Playfulness Reboot
INSERT INTO lessons (id, program_id, title, description, content, order_index, duration_minutes, lesson_type) VALUES
('l1000001-0000-0000-0000-000000000001', 'a1000010-0000-0000-0000-000000000001', 'Where Did the Fun Go?', 'Understand why relationships lose playfulness', 'Life responsibilities crowd out play. Reclaiming fun requires intentional effort.', 1, 12, 'reading'),
('l1000002-0000-0000-0000-000000000001', 'a1000010-0000-0000-0000-000000000001', 'The Flirtation Revival', 'Bring back flirting', 'Remember how you flirted when you first met? Bring that energy back with intentional flirtation.', 2, 15, 'exercise'),
('l1000003-0000-0000-0000-000000000001', 'a1000010-0000-0000-0000-000000000001', 'Playful Touch', 'Add playfulness to physical connection', 'Tickling, wrestling, dancing - add play to your physical connection. Laughter builds bonds.', 3, 20, 'exercise'),
('l1000004-0000-0000-0000-000000000001', 'a1000010-0000-0000-0000-000000000001', 'Date Night Reinvention', 'Design exciting date experiences', 'Go beyond dinner and a movie. Create novel experiences that spark excitement and connection.', 4, 15, 'action'),
('l1000005-0000-0000-0000-000000000001', 'a1000010-0000-0000-0000-000000000001', 'Sustaining Playfulness', 'Build ongoing habits of fun', 'Schedule play into your life. Protect time for fun as you would any important appointment.', 5, 12, 'action');

-- =====================================================
-- HABITS FOR PROGRAMS 1-10
-- =====================================================

-- Program 1: Emotional Connection Reset
INSERT INTO habits (id, program_id, name, description, category, frequency, is_from_program) VALUES
('h0101001-0000-0000-0000-000000000001', 'a1000001-0000-0000-0000-000000000001', 'Daily check-in conversation', 'Have a 10-minute check-in about how you are each feeling', 'intimacy', 'daily', true),
('h0102001-0000-0000-0000-000000000001', 'a1000001-0000-0000-0000-000000000001', 'Make emotional deposits', 'Do something small that shows appreciation', 'intimacy', 'daily', true),
('h0103001-0000-0000-0000-000000000001', 'a1000001-0000-0000-0000-000000000001', 'Active listening session', 'Practice listening without interrupting for 5 minutes', 'intimacy', 'daily', true),
('h0104001-0000-0000-0000-000000000001', 'a1000001-0000-0000-0000-000000000001', 'Share one vulnerable thing', 'Share something you have not shared before', 'intimacy', 'weekly', true),
('h0105001-0000-0000-0000-000000000001', 'a1000001-0000-0000-0000-000000000001', 'Connection ritual', 'Complete your chosen daily connection ritual', 'intimacy', 'daily', true);

-- Program 2: Solo Intimacy Journey
INSERT INTO habits (id, program_id, name, description, category, frequency, is_from_program) VALUES
('h0201001-0000-0000-0000-000000000001', 'a1000002-0000-0000-0000-000000000001', 'Self-compassion moment', 'Speak kindly to yourself about your body', 'intimacy', 'daily', true),
('h0202001-0000-0000-0000-000000000001', 'a1000002-0000-0000-0000-000000000001', 'Body exploration', 'Explore a new area of your body with curiosity', 'intimacy', 'weekly', true),
('h0203001-0000-0000-0000-000000000001', 'a1000002-0000-0000-0000-000000000001', 'Mindful self-touch session', 'Practice present-moment awareness during self-pleasure', 'intimacy', 'weekly', true),
('h0204001-0000-0000-0000-000000000001', 'a1000002-0000-0000-0000-000000000001', 'Fantasy journaling', 'Write about your fantasies without judgment', 'intimacy', 'weekly', true),
('h0205001-0000-0000-0000-000000000001', 'a1000002-0000-0000-0000-000000000001', 'Self-pleasure practice', 'Dedicated time for your self-pleasure routine', 'intimacy', 'weekly', true);

-- Program 3: Touch & Affection Rebuilding
INSERT INTO habits (id, program_id, name, description, category, frequency, is_from_program) VALUES
('h0301001-0000-0000-0000-000000000001', 'a1000003-0000-0000-0000-000000000001', 'Morning touch', 'Start the day with physical affection', 'intimacy', 'daily', true),
('h0302001-0000-0000-0000-000000000001', 'a1000003-0000-0000-0000-000000000001', 'Non-sexual cuddling', 'Cuddle for 10 minutes without sexual intent', 'intimacy', 'daily', true),
('h0303001-0000-0000-0000-000000000001', 'a1000003-0000-0000-0000-000000000001', 'Touch preference share', 'Share one touch preference with your partner', 'intimacy', 'weekly', true),
('h0304001-0000-0000-0000-000000000001', 'a1000003-0000-0000-0000-000000000001', 'Sensate focus practice', 'Practice mindful touch exercises', 'intimacy', 'weekly', true),
('h0305001-0000-0000-0000-000000000001', 'a1000003-0000-0000-0000-000000000001', '20-second hug', 'Hug your partner for a full 20 seconds', 'intimacy', 'daily', true);

-- Program 4: Confidence & Body Positivity
INSERT INTO habits (id, program_id, name, description, category, frequency, is_from_program) VALUES
('h0401001-0000-0000-0000-000000000001', 'a1000004-0000-0000-0000-000000000001', 'Body story reflection', 'Reflect on one body belief and challenge it', 'intimacy', 'weekly', true),
('h0402001-0000-0000-0000-000000000001', 'a1000004-0000-0000-0000-000000000001', 'Mirror practice', 'Look at yourself with kindness for 2 minutes', 'intimacy', 'daily', true),
('h0403001-0000-0000-0000-000000000001', 'a1000004-0000-0000-0000-000000000001', 'Pleasure focus', 'Focus on how something feels, not how it looks', 'intimacy', 'daily', true),
('h0404001-0000-0000-0000-000000000001', 'a1000004-0000-0000-0000-000000000001', 'Body gratitude', 'Thank your body for something it did today', 'intimacy', 'daily', true),
('h0405001-0000-0000-0000-000000000001', 'a1000004-0000-0000-0000-000000000001', 'Confidence affirmation', 'Repeat your personalized confidence affirmation', 'intimacy', 'daily', true);

-- Program 5: Desire Re-Ignition Bootcamp
INSERT INTO habits (id, program_id, name, description, category, frequency, is_from_program) VALUES
('h0501001-0000-0000-0000-000000000001', 'a1000005-0000-0000-0000-000000000001', 'Desire type awareness', 'Notice if your desire is spontaneous or responsive', 'intimacy', 'daily', true),
('h0502001-0000-0000-0000-000000000001', 'a1000005-0000-0000-0000-000000000001', 'Remove a brake', 'Identify and reduce one thing killing your desire', 'intimacy', 'daily', true),
('h0503001-0000-0000-0000-000000000001', 'a1000005-0000-0000-0000-000000000001', 'Create context', 'Set up conditions that help desire emerge', 'intimacy', 'daily', true),
('h0504001-0000-0000-0000-000000000001', 'a1000005-0000-0000-0000-000000000001', 'Try something new', 'Introduce novelty to spark excitement', 'intimacy', 'weekly', true),
('h0505001-0000-0000-0000-000000000001', 'a1000005-0000-0000-0000-000000000001', 'Desire maintenance', 'Complete one desire-building activity', 'intimacy', 'daily', true);

-- Program 6: Slow Pleasure & Mindfulness
INSERT INTO habits (id, program_id, name, description, category, frequency, is_from_program) VALUES
('h0601001-0000-0000-0000-000000000001', 'a1000006-0000-0000-0000-000000000001', 'Notice rushing', 'Catch yourself rushing and slow down', 'intimacy', 'daily', true),
('h0602001-0000-0000-0000-000000000001', 'a1000006-0000-0000-0000-000000000001', 'Breath practice', '5 minutes of deep breathing', 'intimacy', 'daily', true),
('h0603001-0000-0000-0000-000000000001', 'a1000006-0000-0000-0000-000000000001', 'Savor sensations', 'Focus on subtle sensations during intimacy', 'intimacy', 'daily', true),
('h0604001-0000-0000-0000-000000000001', 'a1000006-0000-0000-0000-000000000001', 'Edging session', 'Practice building and backing off from arousal', 'intimacy', 'weekly', true),
('h0605001-0000-0000-0000-000000000001', 'a1000006-0000-0000-0000-000000000001', 'Mindful partnered intimacy', 'Stay fully present during partnered intimacy', 'intimacy', 'weekly', true);

-- Program 7: Communication for Intimacy
INSERT INTO habits (id, program_id, name, description, category, frequency, is_from_program) VALUES
('h0701001-0000-0000-0000-000000000001', 'a1000007-0000-0000-0000-000000000001', 'Notice avoidance', 'Notice when you avoid talking about intimacy', 'intimacy', 'daily', true),
('h0702001-0000-0000-0000-000000000001', 'a1000007-0000-0000-0000-000000000001', 'Use intimate vocabulary', 'Practice using comfortable words for intimate topics', 'intimacy', 'daily', true),
('h0703001-0000-0000-0000-000000000001', 'a1000007-0000-0000-0000-000000000001', 'Express one desire', 'Share one thing you want with your partner', 'intimacy', 'daily', true),
('h0704001-0000-0000-0000-000000000001', 'a1000007-0000-0000-0000-000000000001', 'Set one boundary', 'Communicate one limit clearly', 'intimacy', 'weekly', true),
('h0705001-0000-0000-0000-000000000001', 'a1000007-0000-0000-0000-000000000001', 'Weekly intimacy check-in', 'Have your scheduled intimacy conversation', 'intimacy', 'weekly', true);

-- Program 8: Healing Resentment
INSERT INTO habits (id, program_id, name, description, category, frequency, is_from_program) VALUES
('h0801001-0000-0000-0000-000000000001', 'a1000008-0000-0000-0000-000000000001', 'Resentment awareness', 'Notice when resentment arises and name it', 'intimacy', 'daily', true),
('h0802001-0000-0000-0000-000000000001', 'a1000008-0000-0000-0000-000000000001', 'Cost reflection', 'Reflect on how resentment is affecting you', 'intimacy', 'weekly', true),
('h0803001-0000-0000-0000-000000000001', 'a1000008-0000-0000-0000-000000000001', 'Repair conversation', 'Address one issue before it becomes resentment', 'intimacy', 'weekly', true),
('h0804001-0000-0000-0000-000000000001', 'a1000008-0000-0000-0000-000000000001', 'Forgiveness practice', 'Spend 5 minutes on releasing resentment', 'intimacy', 'daily', true),
('h0805001-0000-0000-0000-000000000001', 'a1000008-0000-0000-0000-000000000001', 'Address issues early', 'Bring up concerns before they build', 'intimacy', 'daily', true);

-- Program 9: Arousal Discovery Lab
INSERT INTO habits (id, program_id, name, description, category, frequency, is_from_program) VALUES
('h0901001-0000-0000-0000-000000000001', 'a1000009-0000-0000-0000-000000000001', 'Arousal awareness', 'Notice what triggers your arousal today', 'intimacy', 'daily', true),
('h0902001-0000-0000-0000-000000000001', 'a1000009-0000-0000-0000-000000000001', 'Mental arousal exploration', 'Explore one mental turn-on', 'intimacy', 'weekly', true),
('h0903001-0000-0000-0000-000000000001', 'a1000009-0000-0000-0000-000000000001', 'Physical exploration', 'Explore one physical zone for arousal', 'intimacy', 'weekly', true),
('h0904001-0000-0000-0000-000000000001', 'a1000009-0000-0000-0000-000000000001', 'Emotional context reflection', 'Notice what emotional state helps arousal', 'intimacy', 'daily', true),
('h0905001-0000-0000-0000-000000000001', 'a1000009-0000-0000-0000-000000000001', 'Share arousal map', 'Share one arousal discovery with your partner', 'intimacy', 'weekly', true);

-- Program 10: Romance & Playfulness Reboot
INSERT INTO habits (id, program_id, name, description, category, frequency, is_from_program) VALUES
('h1001001-0000-0000-0000-000000000001', 'a1000010-0000-0000-0000-000000000001', 'Notice seriousness', 'Catch when things get too serious and lighten up', 'intimacy', 'daily', true),
('h1002001-0000-0000-0000-000000000001', 'a1000010-0000-0000-0000-000000000001', 'Flirt with partner', 'Flirt intentionally like when you first met', 'intimacy', 'daily', true),
('h1003001-0000-0000-0000-000000000001', 'a1000010-0000-0000-0000-000000000001', 'Playful touch', 'Add playfulness to physical connection', 'intimacy', 'daily', true),
('h1004001-0000-0000-0000-000000000001', 'a1000010-0000-0000-0000-000000000001', 'Plan creative date', 'Plan or execute a novel date experience', 'intimacy', 'weekly', true),
('h1005001-0000-0000-0000-000000000001', 'a1000010-0000-0000-0000-000000000001', 'Protect fun time', 'Keep your scheduled time for play', 'intimacy', 'weekly', true);

-- =====================================================
-- LESSON-HABITS JUNCTION FOR PROGRAMS 1-10
-- =====================================================

INSERT INTO lesson_habits (id, lesson_id, habit_id, order_index) VALUES
-- Program 1
('lh0100101', 'l0100001-0000-0000-0000-000000000001', 'h0101001-0000-0000-0000-000000000001', 1),
('lh0100201', 'l0100002-0000-0000-0000-000000000001', 'h0102001-0000-0000-0000-000000000001', 1),
('lh0100301', 'l0100003-0000-0000-0000-000000000001', 'h0103001-0000-0000-0000-000000000001', 1),
('lh0100401', 'l0100004-0000-0000-0000-000000000001', 'h0104001-0000-0000-0000-000000000001', 1),
('lh0100501', 'l0100005-0000-0000-0000-000000000001', 'h0105001-0000-0000-0000-000000000001', 1),
-- Program 2
('lh0200101', 'l0200001-0000-0000-0000-000000000001', 'h0201001-0000-0000-0000-000000000001', 1),
('lh0200201', 'l0200002-0000-0000-0000-000000000001', 'h0202001-0000-0000-0000-000000000001', 1),
('lh0200301', 'l0200003-0000-0000-0000-000000000001', 'h0203001-0000-0000-0000-000000000001', 1),
('lh0200401', 'l0200004-0000-0000-0000-000000000001', 'h0204001-0000-0000-0000-000000000001', 1),
('lh0200501', 'l0200005-0000-0000-0000-000000000001', 'h0205001-0000-0000-0000-000000000001', 1),
-- Program 3
('lh0300101', 'l0300001-0000-0000-0000-000000000001', 'h0301001-0000-0000-0000-000000000001', 1),
('lh0300201', 'l0300002-0000-0000-0000-000000000001', 'h0302001-0000-0000-0000-000000000001', 1),
('lh0300301', 'l0300003-0000-0000-0000-000000000001', 'h0303001-0000-0000-0000-000000000001', 1),
('lh0300401', 'l0300004-0000-0000-0000-000000000001', 'h0304001-0000-0000-0000-000000000001', 1),
('lh0300501', 'l0300005-0000-0000-0000-000000000001', 'h0305001-0000-0000-0000-000000000001', 1),
-- Program 4
('lh0400101', 'l0400001-0000-0000-0000-000000000001', 'h0401001-0000-0000-0000-000000000001', 1),
('lh0400201', 'l0400002-0000-0000-0000-000000000001', 'h0402001-0000-0000-0000-000000000001', 1),
('lh0400301', 'l0400003-0000-0000-0000-000000000001', 'h0403001-0000-0000-0000-000000000001', 1),
('lh0400401', 'l0400004-0000-0000-0000-000000000001', 'h0404001-0000-0000-0000-000000000001', 1),
('lh0400501', 'l0400005-0000-0000-0000-000000000001', 'h0405001-0000-0000-0000-000000000001', 1),
-- Program 5
('lh0500101', 'l0500001-0000-0000-0000-000000000001', 'h0501001-0000-0000-0000-000000000001', 1),
('lh0500201', 'l0500002-0000-0000-0000-000000000001', 'h0502001-0000-0000-0000-000000000001', 1),
('lh0500301', 'l0500003-0000-0000-0000-000000000001', 'h0503001-0000-0000-0000-000000000001', 1),
('lh0500401', 'l0500004-0000-0000-0000-000000000001', 'h0504001-0000-0000-0000-000000000001', 1),
('lh0500501', 'l0500005-0000-0000-0000-000000000001', 'h0505001-0000-0000-0000-000000000001', 1),
-- Program 6
('lh0600101', 'l0600001-0000-0000-0000-000000000001', 'h0601001-0000-0000-0000-000000000001', 1),
('lh0600201', 'l0600002-0000-0000-0000-000000000001', 'h0602001-0000-0000-0000-000000000001', 1),
('lh0600301', 'l0600003-0000-0000-0000-000000000001', 'h0603001-0000-0000-0000-000000000001', 1),
('lh0600401', 'l0600004-0000-0000-0000-000000000001', 'h0604001-0000-0000-0000-000000000001', 1),
('lh0600501', 'l0600005-0000-0000-0000-000000000001', 'h0605001-0000-0000-0000-000000000001', 1),
-- Program 7
('lh0700101', 'l0700001-0000-0000-0000-000000000001', 'h0701001-0000-0000-0000-000000000001', 1),
('lh0700201', 'l0700002-0000-0000-0000-000000000001', 'h0702001-0000-0000-0000-000000000001', 1),
('lh0700301', 'l0700003-0000-0000-0000-000000000001', 'h0703001-0000-0000-0000-000000000001', 1),
('lh0700401', 'l0700004-0000-0000-0000-000000000001', 'h0704001-0000-0000-0000-000000000001', 1),
('lh0700501', 'l0700005-0000-0000-0000-000000000001', 'h0705001-0000-0000-0000-000000000001', 1),
-- Program 8
('lh0800101', 'l0800001-0000-0000-0000-000000000001', 'h0801001-0000-0000-0000-000000000001', 1),
('lh0800201', 'l0800002-0000-0000-0000-000000000001', 'h0802001-0000-0000-0000-000000000001', 1),
('lh0800301', 'l0800003-0000-0000-0000-000000000001', 'h0803001-0000-0000-0000-000000000001', 1),
('lh0800401', 'l0800004-0000-0000-0000-000000000001', 'h0804001-0000-0000-0000-000000000001', 1),
('lh0800501', 'l0800005-0000-0000-0000-000000000001', 'h0805001-0000-0000-0000-000000000001', 1),
-- Program 9
('lh0900101', 'l0900001-0000-0000-0000-000000000001', 'h0901001-0000-0000-0000-000000000001', 1),
('lh0900201', 'l0900002-0000-0000-0000-000000000001', 'h0902001-0000-0000-0000-000000000001', 1),
('lh0900301', 'l0900003-0000-0000-0000-000000000001', 'h0903001-0000-0000-0000-000000000001', 1),
('lh0900401', 'l0900004-0000-0000-0000-000000000001', 'h0904001-0000-0000-0000-000000000001', 1),
('lh0900501', 'l0900005-0000-0000-0000-000000000001', 'h0905001-0000-0000-0000-000000000001', 1),
-- Program 10
('lh1000101', 'l1000001-0000-0000-0000-000000000001', 'h1001001-0000-0000-0000-000000000001', 1),
('lh1000201', 'l1000002-0000-0000-0000-000000000001', 'h1002001-0000-0000-0000-000000000001', 1),
('lh1000301', 'l1000003-0000-0000-0000-000000000001', 'h1003001-0000-0000-0000-000000000001', 1),
('lh1000401', 'l1000004-0000-0000-0000-000000000001', 'h1004001-0000-0000-0000-000000000001', 1),
('lh1000501', 'l1000005-0000-0000-0000-000000000001', 'h1005001-0000-0000-0000-000000000001', 1);
