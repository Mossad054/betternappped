-- Migration: Seed Intimacy Learning Programs
-- This populates the database with sample learning programs and lessons

-- Insert sample programs
INSERT INTO public.intimacy_programs (title, description, category, difficulty, duration_weeks, total_lessons, learning_outcomes, icon, color, featured, order_index) VALUES

-- Program 1: Communication Mastery
(
  'Communication Mastery',
  'Transform your relationship through better communication. Learn to express yourself clearly, listen deeply, and navigate difficult conversations with grace.',
  'communication',
  'beginner',
  2,
  6,
  ARRAY[
    'Express needs clearly without blame',
    'Listen actively without judgment',
    'Navigate difficult conversations',
    'Build emotional safety through words'
  ],
  '💬',
  '#3B82F6',
  true,
  1
),

-- Program 2: Emotional Intimacy Building
(
  'Emotional Intimacy Building',
  'Deepen your emotional connection through vulnerability, trust, and authentic sharing. Create a safe space for true intimacy.',
  'emotional',
  'beginner',
  2,
  5,
  ARRAY[
    'Practice vulnerability safely',
    'Build trust through consistency',
    'Share emotions authentically',
    'Create emotional safety together'
  ],
  '💕',
  '#EC4899',
  true,
  2
),

-- Program 3: Physical Connection Exploration
(
  'Physical Connection Exploration',
  'Rediscover the power of touch, presence, and physical intimacy. Move beyond routine to create meaningful physical connection.',
  'physical',
  'intermediate',
  1,
  4,
  ARRAY[
    'Practice mindful touch',
    'Build anticipation and desire',
    'Communicate physical needs',
    'Explore sensual connection'
  ],
  '💑',
  '#F59E0B',
  true,
  3
),

-- Program 4: Conflict Resolution Skills
(
  'Conflict Resolution Skills',
  'Turn disagreements into opportunities for growth. Learn to fight fair, repair ruptures, and strengthen your bond through conflict.',
  'conflict',
  'intermediate',
  2,
  5,
  ARRAY[
    'Fight fair without damaging trust',
    'Repair after conflicts',
    'Identify conflict patterns',
    'Turn fights into connection'
  ],
  '🤝',
  '#8B5CF6',
  true,
  4
),

-- Program 5: Self-Love & Self-Intimacy
(
  'Self-Love & Self-Intimacy',
  'Build a deeper relationship with yourself. Discover self-compassion, self-awareness, and the foundation of all intimate connections.',
  'self-awareness',
  'beginner',
  2,
  4,
  ARRAY[
    'Practice self-compassion',
    'Understand your intimacy patterns',
    'Build self-worth',
    'Cultivate self-pleasure'
  ],
  '🧘',
  '#10B981',
  false,
  5
);

-- Get program IDs for inserting lessons
DO $$
DECLARE
  comm_prog_id UUID;
  emot_prog_id UUID;
  phys_prog_id UUID;
  conf_prog_id UUID;
  self_prog_id UUID;
BEGIN
  -- Get program IDs
  SELECT id INTO comm_prog_id FROM public.intimacy_programs WHERE title = 'Communication Mastery';
  SELECT id INTO emot_prog_id FROM public.intimacy_programs WHERE title = 'Emotional Intimacy Building';
  SELECT id INTO phys_prog_id FROM public.intimacy_programs WHERE title = 'Physical Connection Exploration';
  SELECT id INTO conf_prog_id FROM public.intimacy_programs WHERE title = 'Conflict Resolution Skills';
  SELECT id INTO self_prog_id FROM public.intimacy_programs WHERE title = 'Self-Love & Self-Intimacy';

  -- Communication Mastery Lessons
  INSERT INTO public.program_lessons (program_id, title, order_index, lesson_type, content, duration_minutes, key_takeaways, reflection_prompts, action_items) VALUES
  (comm_prog_id, 'The Art of Listening', 1, 'reading',
   E'# The Art of Listening\n\nTrue intimacy begins with being heard. Active listening is the foundation of all meaningful communication.\n\n## What is Active Listening?\n\nActive listening means listening to understand, not to respond. It requires:\n- Full presence and attention\n- Curiosity without judgment\n- Reflecting back what you hear\n- Asking clarifying questions\n\n## Why It Matters\n\nWhen your partner feels truly heard, they feel safe. When they feel safe, they open up. When they open up, intimacy deepens.\n\n## The Practice\n\n**Listen with your whole body:**\n- Put down your phone\n- Make eye contact\n- Nod and affirm\n- Don''t interrupt\n\n**Reflect back:**\n"So what I''m hearing is..."\n"It sounds like you''re feeling..."\n\n**Ask, don''t assume:**\n"Tell me more about that"\n"What do you need from me right now?"\n\n## Common Mistakes\n\n1. **Waiting to talk** - Planning your response while they speak\n2. **Problem-solving too soon** - Fixing before understanding\n3. **Dismissing emotions** - "You shouldn''t feel that way"\n4. **Making it about you** - "Oh, that happened to me too..."\n\nRemember: Your partner doesn''t always need solutions. Sometimes they just need to be heard.',
   15,
   ARRAY['Listen to understand, not to respond', 'Reflect back what you hear', 'Ask clarifying questions', 'Presence is the greatest gift'],
   '[{"id": 1, "question": "When was the last time you truly felt heard?", "type": "text"}, {"id": 2, "question": "What makes it hard for you to listen without planning your response?", "type": "text"}]'::jsonb,
   '[{"id": 1, "title": "Practice 10-minute listening session", "description": "Set a timer. Let your partner talk. Only listen and reflect back.", "frequency": "daily", "convertible_to_habit": true}]'::jsonb
  ),

  (comm_prog_id, 'Speaking Your Truth', 2, 'reading',
   E'# Speaking Your Truth\n\nYour needs, desires, and feelings matter. Learning to express them clearly is essential for intimacy.\n\n## Why We Hold Back\n\n- Fear of rejection\n- Fear of hurting others\n- Shame about our needs\n- Not knowing what we want\n\n## The "I" Statement Formula\n\nInstead of: "You never listen to me"\nTry: "I feel unheard when I''m talking and you''re on your phone. I need your full attention sometimes."\n\n**Structure:**\n- I feel [emotion]\n- When [specific situation]\n- Because [impact]\n- I need [request]\n\n## Practice Vulnerability\n\nVulnerability isn''t weakness - it''s courage. Sharing your inner world invites intimacy.\n\nStart small:\n- "I''m feeling anxious about..."\n- "I''ve been wanting to share..."\n- "Can I tell you something vulnerable?"\n\n## Permission to Need\n\nYou are allowed to:\n- Have desires\n- Ask for what you want\n- Change your mind\n- Say no\n- Need time alone\n- Need connection\n\nYour needs are not burdens. They''re invitations to deeper intimacy.',
   15,
   ARRAY['Use "I" statements', 'Name your emotions', 'Make clear requests', 'Vulnerability creates intimacy'],
   '[{"id": 1, "question": "What''s one need you''ve been afraid to express?", "type": "text"}, {"id": 2, "question": "What would make it easier to be vulnerable?", "type": "text"}]'::jsonb,
   '[{"id": 1, "title": "Share one vulnerable feeling", "description": "Tell your partner something you''ve been holding back", "frequency": "once", "convertible_to_habit": false}]'::jsonb
  ),

  (comm_prog_id, 'Navigating Conflict', 3, 'reading',
   E'# Navigating Conflict\n\nDisagreements are inevitable. How you handle them determines the health of your relationship.\n\n## The Goal of Conflict\n\nNot to win. Not to be right. But to:\n- Understand each other\n- Solve problems together\n- Strengthen your bond\n\n## Rules for Fair Fighting\n\n1. **No name-calling or contempt**\n2. **Stick to the current issue**\n3. **Take breaks when flooded**\n4. **Own your part**\n5. **Seek to understand first**\n\n## The Pause Button\n\nWhen things get heated:\n"I need a 20-minute break to calm down. Let''s come back to this."\n\nThis isn''t running away - it''s protecting the relationship.\n\n## After the Storm\n\nRepair is everything:\n- "I''m sorry I raised my voice"\n- "Thank you for hanging in there with me"\n- "I love you even when we disagree"\n- "What do you need from me right now?"\n\n## The 5:1 Ratio\n\nResearch shows healthy relationships have 5 positive interactions for every 1 negative. During conflict:\n- Remember what you love about them\n- Express appreciation\n- Touch gently if appropriate\n- Take responsibility quickly',
   20,
   ARRAY['Conflict can strengthen bonds', 'Take breaks when flooded', 'Repair quickly after fights', 'Seek to understand, not to win'],
   '[{"id": 1, "question": "How did your family handle conflict growing up?", "type": "text"}, {"id": 2, "question": "What triggers you most during disagreements?", "type": "text"}]'::jsonb,
   '[{"id": 1, "title": "Practice repair after conflict", "description": "After your next disagreement, initiate repair within 24 hours", "frequency": "as-needed", "convertible_to_habit": false}]'::jsonb
  ),

  (comm_prog_id, 'Non-Verbal Communication', 4, 'reading',
   E'# Non-Verbal Communication\n\n93% of communication is non-verbal. Your body speaks before your words do.\n\n## What Your Body Says\n\n**Open posture:**\n- Face toward partner\n- Uncrossed arms\n- Soft eyes\n- Nodding\n\n**Closed posture:**\n- Turned away\n- Arms crossed\n- Tight jaw\n- Eye rolling\n\n## The Power of Touch\n\nNon-sexual touch builds connection:\n- Hold hands\n- Hug for 20 seconds\n- Gentle back rubs\n- Sitting close\n\nPhysical closeness releases oxytocin - the bonding hormone.\n\n## Reading Your Partner\n\nNotice:\n- Facial expressions\n- Tone of voice\n- Body tension\n- Breathing patterns\n\nAsk: "I notice you seem tense. Want to talk about it?"\n\n## Your Energy Matters\n\nYou bring an energy to every interaction:\n- Rushed vs present\n- Defensive vs open\n- Critical vs curious\n- Distant vs warm\n\nYour partner feels this before you speak a word.',
   10,
   ARRAY['Body language speaks loudly', 'Non-sexual touch builds bonds', 'Notice your partner''s cues', 'Energy matters more than words'],
   '[{"id": 1, "question": "What does your body language communicate to your partner?", "type": "text"}]'::jsonb,
   '[{"id": 1, "title": "Daily 20-second hug", "description": "Hug your partner for a full 20 seconds daily", "frequency": "daily", "convertible_to_habit": true}]'::jsonb
  ),

  (comm_prog_id, 'Asking for What You Want', 5, 'reading',
   E'# Asking for What You Want\n\nYour partner cannot read your mind. Clear requests create clear intimacy.\n\n## Why We Don''t Ask\n\n- "They should just know"\n- "It doesn''t count if I have to ask"\n- "I don''t want to be needy"\n- "What if they say no?"\n\n## The Truth\n\nAsking for what you want is:\n- Respectful\n- Clear\n- Kind\n- Vulnerable\n- Intimate\n\n## How to Ask\n\n**Vague:** "I wish you were more affectionate"\n**Clear:** "I''d love it if you''d kiss me goodbye in the morning"\n\n**Vague:** "You never initiate anymore"\n**Clear:** "I''d like you to initiate intimacy at least once a week. Would that work for you?"\n\n## The Power of Specificity\n\n- "Can we have a date night Friday?"\n- "I need 10 minutes to decompress when I get home"\n- "I''d love more physical affection during the day"\n- "Can we talk about our sex life this weekend?"\n\n## When They Say No\n\nA "no" to your request is not:\n- Rejection of you\n- End of discussion\n- Proof you''re unlovable\n\nIt''s information. Ask:\n"What would work better for you?"\n"Is there a compromise?"\n"What do you need right now?"',
   12,
   ARRAY['Specificity creates clarity', 'Your needs are valid', 'No doesn''t mean rejection', 'Ask directly and kindly'],
   '[{"id": 1, "question": "What''s one thing you want but haven''t asked for?", "type": "text"}]'::jsonb,
   '[{"id": 1, "title": "Make one specific request", "description": "Ask your partner for something specific you want this week", "frequency": "once", "convertible_to_habit": false}]'::jsonb
  ),

  (comm_prog_id, 'Daily Connection Rituals', 6, 'action',
   E'# Daily Connection Rituals\n\nIntimacy isn''t built in grand gestures. It''s built in small, consistent moments.\n\n## Morning Rituals\n\n- 6-second kiss goodbye\n- "I love you" + one thing you appreciate\n- Morning coffee together (even 5 min)\n- Check-in: "How are you feeling today?"\n\n## Evening Rituals\n\n- Greeting hug (20 seconds)\n- "How was your day?" with full attention\n- Device-free dinner\n- Evening walk together\n- Bedtime appreciation exchange\n\n## Weekly Rituals\n\n- Sunday planning session\n- Friday date night\n- Saturday morning intimacy\n- Weekly relationship check-in\n\n## The 2-Minute Connection\n\nWhen time is tight:\n1. Stop what you''re doing\n2. Make eye contact\n3. Touch (hug, hold hands, forehead touch)\n4. Breathe together\n5. Share one thing\n\n## Your Turn\n\nDesign one ritual that feels right for your relationship. Commit to it for 30 days.\n\nExamples:\n- Morning gratitude exchange\n- Evening phone-free hour\n- Weekly dream-sharing\n- Daily 10-minute check-in\n\nConsistency beats intensity. Small daily deposits create a full connection account.',
   15,
   ARRAY['Rituals create safety', 'Consistency builds intimacy', 'Small moments matter most', 'Quality over quantity'],
   '[{"id": 1, "question": "What''s one ritual you''d like to start?", "type": "text"}, {"id": 2, "question": "When will you practice it?", "type": "text"}]'::jsonb,
   '[{"id": 1, "title": "Start one daily ritual", "description": "Choose and commit to one connection ritual for 30 days", "frequency": "daily", "convertible_to_habit": true}]'::jsonb
  );

  -- Emotional Intimacy Building Lessons (5 lessons)
  INSERT INTO public.program_lessons (program_id, title, order_index, lesson_type, content, duration_minutes, key_takeaways) VALUES
  (emot_prog_id, 'Understanding Emotional Intimacy', 1, 'reading', E'# Understanding Emotional Intimacy\n\nEmotional intimacy is the foundation of all deep connections...', 15, ARRAY['Emotional safety is essential', 'Vulnerability creates bonds', 'Trust is built slowly']),
  (emot_prog_id, 'Building Trust', 2, 'reading', E'# Building Trust\n\nTrust is earned through consistency and reliability...', 15, ARRAY['Consistency builds trust', 'Actions speak louder', 'Repair breaks quickly']),
  (emot_prog_id, 'The Practice of Vulnerability', 3, 'exercise', E'# The Practice of Vulnerability\n\nShare something you''ve never shared before...', 20, ARRAY['Start with small shares', 'Receive vulnerability with care', 'Honor what''s shared']),
  (emot_prog_id, 'Emotional Attunement', 4, 'reading', E'# Emotional Attunement\n\nNoticing and responding to your partner''s emotional state...', 12, ARRAY['Notice subtle cues', 'Validate before fixing', 'Presence is powerful']),
  (emot_prog_id, 'Creating Emotional Safety', 5, 'action', E'# Creating Emotional Safety\n\nHow to build a relationship where both feel safe to be fully themselves...', 15, ARRAY['No judgment zone', 'Accept emotions', 'Predictable responses matter']);

  -- Update program total_lessons count
  UPDATE public.intimacy_programs SET total_lessons = 6 WHERE title = 'Communication Mastery';
  UPDATE public.intimacy_programs SET total_lessons = 5 WHERE title = 'Emotional Intimacy Building';

END $$;

COMMENT ON TABLE public.intimacy_programs IS 'Seeded with 5 sample learning programs';
COMMENT ON TABLE public.program_lessons IS 'Seeded with Communication Mastery lessons (6) and Emotional Intimacy lessons (5)';
