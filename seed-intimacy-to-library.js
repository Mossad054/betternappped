const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const intimacyHabits = [
  {
    name: 'Daily Connection',
    description: 'Spend 15 minutes of focused time with your partner daily',
    category: 'Intimacy',
    instructions: 'Set aside 15 uninterrupted minutes each day to connect with your partner. Put away devices and focus completely on each other.',
    expected_outcome: 'Strengthened emotional bond and communication',
    emoji: '💕',
    difficulty: 'Easy',
    time_required: '15 minutes',
    benefits: ['Improved communication', 'Deeper emotional connection', 'Reduced relationship stress']
  },
  {
    name: 'Intimacy Journal',
    description: 'Write about your relationship experiences and feelings',
    category: 'Intimacy',
    instructions: 'Take 10 minutes to write about your relationship experiences, feelings, and observations. Optionally share with your partner.',
    expected_outcome: 'Better self-awareness and relationship understanding',
    emoji: '📝',
    difficulty: 'Medium',
    time_required: '10 minutes',
    benefits: ['Enhanced self-reflection', 'Clearer communication', 'Deeper intimacy']
  },
  {
    name: 'Share appreciation with partner',
    description: 'Express genuine appreciation to your partner daily',
    category: 'Intimacy',
    instructions: 'Tell your partner one specific thing you appreciate about them today. Be genuine and specific.',
    expected_outcome: 'By completing this habit for 7 days you will notice improved connection. By 14 days you will see measurable improvements in relationship satisfaction. By 30 days you will experience long-term bonding benefits.',
    emoji: '💝',
    difficulty: 'Easy',
    time_required: '5 minutes',
    benefits: ['Better connection', 'Increased gratitude', 'Stronger bond']
  },
  {
    name: 'Send loving message',
    description: 'Send a thoughtful loving message to your partner',
    category: 'Intimacy',
    instructions: 'Send your partner a thoughtful text, note, or message expressing your love and care.',
    expected_outcome: 'By completing this habit for 7 days you will notice improved communication. By 14 days you will see measurable improvements in connection. By 30 days you will experience long-term relationship benefits.',
    emoji: '💌',
    difficulty: 'Easy',
    time_required: '3 minutes',
    benefits: ['Better communication', 'Thoughtfulness', 'Stronger connection']
  },
  {
    name: 'Hug for 20 seconds',
    description: 'Share a 20-second hug with your partner',
    category: 'Intimacy',
    instructions: 'Give your partner a full, meaningful hug that lasts at least 20 seconds. This releases oxytocin and creates bonding.',
    expected_outcome: 'By completing this habit for 7 days you will notice increased oxytocin. By 14 days you will see measurable improvements in bonding. By 30 days you will experience long-term connection benefits.',
    emoji: '🤗',
    difficulty: 'Easy',
    time_required: '1 minute',
    benefits: ['Oxytocin release', 'Better bonding', 'Physical connection']
  },
  {
    name: 'Hold eye contact',
    description: 'Practice intentional eye contact with your partner',
    category: 'Intimacy',
    instructions: 'Look into your partner\'s eyes for 30-60 seconds with gentle, loving attention.',
    expected_outcome: 'By completing this habit for 7 days you will notice deeper connection. By 14 days you will see measurable improvements in intimacy. By 30 days you will experience long-term emotional bonding benefits.',
    emoji: '👁️',
    difficulty: 'Easy',
    time_required: '2 minutes',
    benefits: ['Deeper connection', 'Better intimacy', 'Emotional bonding']
  },
  {
    name: 'Ask partner about their day',
    description: 'Show genuine interest in your partner\'s daily experiences',
    category: 'Intimacy',
    instructions: 'Ask your partner about their day and listen actively. Show curiosity and empathy.',
    expected_outcome: 'By completing this habit for 7 days you will notice improved communication. By 14 days you will see measurable improvements in understanding. By 30 days you will experience long-term connection benefits.',
    emoji: '💬',
    difficulty: 'Easy',
    time_required: '10 minutes',
    benefits: ['Better communication', 'Increased understanding', 'Stronger connection']
  },
  {
    name: 'Plan 5-min connection ritual',
    description: 'Create a daily 5-minute connection ritual with your partner',
    category: 'Intimacy',
    instructions: 'Design and practice a daily 5-minute ritual together - it could be morning coffee, evening check-in, or bedtime routine.',
    expected_outcome: 'By completing this habit for 7 days you will notice improved routine. By 14 days you will see measurable improvements in consistency. By 30 days you will experience long-term bonding benefits.',
    emoji: '⏰',
    difficulty: 'Easy',
    time_required: '5 minutes',
    benefits: ['Consistent connection', 'Better routine', 'Stronger bond']
  },
  {
    name: 'Compliment partner',
    description: 'Give your partner a genuine compliment daily',
    category: 'Intimacy',
    instructions: 'Offer a sincere compliment about something you genuinely admire or appreciate about your partner.',
    expected_outcome: 'By completing this habit for 7 days you will notice improved positivity. By 14 days you will see measurable improvements in appreciation. By 30 days you will experience long-term relationship benefits.',
    emoji: '✨',
    difficulty: 'Easy',
    time_required: '2 minutes',
    benefits: ['Better positivity', 'Increased appreciation', 'Stronger connection']
  },
  {
    name: 'Practice active listening',
    description: 'Listen fully without interruption when your partner speaks',
    category: 'Intimacy',
    instructions: 'When your partner shares something, give them your full attention. Don\'t interrupt, plan your response, or look at your phone.',
    expected_outcome: 'By completing this habit for 7 days you will notice improved communication. By 14 days you will see measurable improvements in understanding. By 30 days you will experience long-term trust benefits.',
    emoji: '👂',
    difficulty: 'Medium',
    time_required: '10 minutes',
    benefits: ['Better listening', 'Increased understanding', 'Improved trust']
  },
  {
    name: 'Hold hands',
    description: 'Hold hands with your partner intentionally',
    category: 'Intimacy',
    instructions: 'Take your partner\'s hand and hold it intentionally for a few minutes - while walking, sitting, or relaxing.',
    expected_outcome: 'By completing this habit for 7 days you will notice increased physical connection. By 14 days you will see measurable improvements in comfort. By 30 days you will experience long-term bonding benefits.',
    emoji: '🤝',
    difficulty: 'Easy',
    time_required: '5 minutes',
    benefits: ['Physical connection', 'Better comfort', 'Stronger bond']
  },
  {
    name: 'Share emotional check-in',
    description: 'Check in with each other about emotional states',
    category: 'Intimacy',
    instructions: 'Ask "How are you feeling?" and share your own emotional state honestly. Create a safe space for vulnerability.',
    expected_outcome: 'By completing this habit for 7 days you will notice improved awareness. By 14 days you will see measurable improvements in emotional support. By 30 days you will experience long-term understanding benefits.',
    emoji: '💭',
    difficulty: 'Easy',
    time_required: '5 minutes',
    benefits: ['Better awareness', 'Emotional support', 'Improved understanding']
  },
  {
    name: 'Touch intentionally',
    description: 'Practice intentional non-sexual touch with your partner',
    category: 'Intimacy',
    instructions: 'Touch your partner intentionally - a hand on the shoulder, gentle back rub, or affectionate touch without expectation.',
    expected_outcome: 'By completing this habit for 7 days you will notice increased comfort. By 14 days you will see measurable improvements in physical connection. By 30 days you will experience long-term intimacy benefits.',
    emoji: '🤲',
    difficulty: 'Easy',
    time_required: '5 minutes',
    benefits: ['Better comfort', 'Physical connection', 'Increased intimacy']
  },
  {
    name: 'Share gratitude',
    description: 'Express gratitude for your partner and relationship',
    category: 'Intimacy',
    instructions: 'Tell your partner what you\'re grateful for about them or your relationship today.',
    expected_outcome: 'By completing this habit for 7 days you will notice improved appreciation. By 14 days you will see measurable improvements in positivity. By 30 days you will experience long-term relationship benefits.',
    emoji: '🙏',
    difficulty: 'Easy',
    time_required: '3 minutes',
    benefits: ['Better appreciation', 'Increased positivity', 'Stronger bond']
  },
  {
    name: 'Do a small act of kindness',
    description: 'Perform a thoughtful act of kindness for your partner',
    category: 'Intimacy',
    instructions: 'Do something kind for your partner without being asked - make their coffee, handle a chore, or surprise them with a small gesture.',
    expected_outcome: 'By completing this habit for 7 days you will notice improved thoughtfulness. By 14 days you will see measurable improvements in appreciation. By 30 days you will experience long-term relationship benefits.',
    emoji: '💗',
    difficulty: 'Easy',
    time_required: '10 minutes',
    benefits: ['Better thoughtfulness', 'Increased appreciation', 'Stronger connection']
  },
  {
    name: 'Ask partner needs',
    description: 'Ask your partner what they need from you',
    category: 'Intimacy',
    instructions: 'Simply ask "What do you need from me today?" or "How can I support you?" and listen to their answer.',
    expected_outcome: 'By completing this habit for 7 days you will notice improved communication. By 14 days you will see measurable improvements in support. By 30 days you will experience long-term understanding benefits.',
    emoji: '❓',
    difficulty: 'Easy',
    time_required: '5 minutes',
    benefits: ['Better communication', 'Improved support', 'Increased understanding']
  },
  {
    name: 'Sit together quietly',
    description: 'Spend quiet time together without distractions',
    category: 'Intimacy',
    instructions: 'Sit together for 10 minutes without phones, TV, or other distractions. Just be present with each other.',
    expected_outcome: 'By completing this habit for 7 days you will notice improved presence. By 14 days you will see measurable improvements in connection. By 30 days you will experience long-term peace benefits.',
    emoji: '🛋️',
    difficulty: 'Easy',
    time_required: '10 minutes',
    benefits: ['Better presence', 'Deeper connection', 'Peaceful time']
  },
  {
    name: 'Cook together',
    description: 'Prepare a meal together as a bonding activity',
    category: 'Intimacy',
    instructions: 'Choose a recipe and prepare a meal together. Share the tasks, laugh, and enjoy the process.',
    expected_outcome: 'By completing this habit for 7 days you will notice improved teamwork. By 14 days you will see measurable improvements in connection. By 30 days you will experience long-term bonding benefits.',
    emoji: '👨‍🍳',
    difficulty: 'Medium',
    time_required: '30 minutes',
    benefits: ['Better teamwork', 'Fun activity', 'Stronger bond']
  },
  {
    name: 'Plan intimacy time',
    description: 'Schedule dedicated time for physical intimacy',
    category: 'Intimacy',
    instructions: 'Set aside time on your calendars for physical intimacy. Remove pressure by making it about connection, not performance.',
    expected_outcome: 'By completing this habit for 7 days you will notice improved prioritization. By 14 days you will see measurable improvements in intimacy. By 30 days you will experience long-term connection benefits.',
    emoji: '📅',
    difficulty: 'Medium',
    time_required: '5 minutes',
    benefits: ['Better prioritization', 'Increased intimacy', 'Stronger connection']
  },
  {
    name: 'Give a gentle massage',
    description: 'Offer your partner a relaxing massage',
    category: 'Intimacy',
    instructions: 'Give your partner a gentle shoulder, back, or foot massage for 10 minutes. Focus on their comfort and relaxation.',
    expected_outcome: 'By completing this habit for 7 days you will notice improved relaxation. By 14 days you will see measurable improvements in physical connection. By 30 days you will experience long-term intimacy benefits.',
    emoji: '💆',
    difficulty: 'Easy',
    time_required: '10 minutes',
    benefits: ['Better relaxation', 'Physical connection', 'Increased intimacy']
  },
  {
    name: 'Practice breathing together',
    description: 'Synchronize your breathing with your partner',
    category: 'Intimacy',
    instructions: 'Sit or lie together and synchronize your breathing. Breathe slowly and deeply in rhythm with each other.',
    expected_outcome: 'By completing this habit for 7 days you will notice improved calm. By 14 days you will see measurable improvements in connection. By 30 days you will experience long-term bonding benefits.',
    emoji: '🌬️',
    difficulty: 'Easy',
    time_required: '5 minutes',
    benefits: ['Better calm', 'Synchronized connection', 'Deeper bond']
  },
  {
    name: 'Share personal thought',
    description: 'Share a personal thought or feeling with your partner',
    category: 'Intimacy',
    instructions: 'Share something personal - a thought, dream, fear, or hope. Practice vulnerability in a safe space.',
    expected_outcome: 'By completing this habit for 7 days you will notice improved vulnerability. By 14 days you will see measurable improvements in trust. By 30 days you will experience long-term intimacy benefits.',
    emoji: '💭',
    difficulty: 'Medium',
    time_required: '5 minutes',
    benefits: ['Better vulnerability', 'Increased trust', 'Deeper intimacy']
  },
  {
    name: 'Say something loving',
    description: 'Express love verbally to your partner',
    category: 'Intimacy',
    instructions: 'Say "I love you" or express your love in a specific, meaningful way.',
    expected_outcome: 'By completing this habit for 7 days you will notice improved expression. By 14 days you will see measurable improvements in connection. By 30 days you will experience long-term relationship benefits.',
    emoji: '❤️',
    difficulty: 'Easy',
    time_required: '2 minutes',
    benefits: ['Better expression', 'Increased love', 'Stronger connection']
  },
  {
    name: 'Laugh together',
    description: 'Share laughter and humor with your partner',
    category: 'Intimacy',
    instructions: 'Watch something funny, share jokes, or be playful together. Laughter creates strong emotional bonds.',
    expected_outcome: 'By completing this habit for 7 days you will notice improved joy. By 14 days you will see measurable improvements in connection. By 30 days you will experience long-term happiness benefits.',
    emoji: '😂',
    difficulty: 'Easy',
    time_required: '10 minutes',
    benefits: ['More joy', 'Better connection', 'Increased happiness']
  },
  {
    name: 'Share a memory',
    description: 'Reminisce about a positive shared memory',
    category: 'Intimacy',
    instructions: 'Talk about a happy memory you share together. Relive the emotions and connection from that moment.',
    expected_outcome: 'By completing this habit for 7 days you will notice improved nostalgia. By 14 days you will see measurable improvements in bonding. By 30 days you will experience long-term connection benefits.',
    emoji: '📸',
    difficulty: 'Easy',
    time_required: '10 minutes',
    benefits: ['Positive nostalgia', 'Better bonding', 'Stronger connection']
  },
  {
    name: 'Do something fun together',
    description: 'Engage in a fun activity together',
    category: 'Intimacy',
    instructions: 'Do something fun - play a game, dance, explore somewhere new, or be spontaneous together.',
    expected_outcome: 'By completing this habit for 7 days you will notice improved joy. By 14 days you will see measurable improvements in connection. By 30 days you will experience long-term bonding benefits.',
    emoji: '🎉',
    difficulty: 'Easy',
    time_required: '30 minutes',
    benefits: ['More fun', 'Better connection', 'Stronger bond']
  },
  {
    name: 'Express physical affection',
    description: 'Show physical affection through touch',
    category: 'Intimacy',
    instructions: 'Express physical affection throughout the day - kisses, hugs, gentle touches, or cuddles.',
    expected_outcome: 'By completing this habit for 7 days you will notice improved physical connection. By 14 days you will see measurable improvements in intimacy. By 30 days you will experience long-term bonding benefits.',
    emoji: '💑',
    difficulty: 'Easy',
    time_required: '5 minutes',
    benefits: ['Physical connection', 'Better intimacy', 'Stronger bond']
  },
  {
    name: 'Plan mini date',
    description: 'Plan a small date activity with your partner',
    category: 'Intimacy',
    instructions: 'Plan a simple date - coffee together, a walk, or special time at home. Keep it simple but intentional.',
    expected_outcome: 'By completing this habit for 7 days you will notice improved planning. By 14 days you will see measurable improvements in quality time. By 30 days you will experience long-term relationship benefits.',
    emoji: '💐',
    difficulty: 'Medium',
    time_required: '10 minutes',
    benefits: ['Better planning', 'Quality time', 'Stronger connection']
  },
  {
    name: 'Surprise partner',
    description: 'Surprise your partner with something thoughtful',
    category: 'Intimacy',
    instructions: 'Surprise your partner with something thoughtful - their favorite snack, a love note, or unexpected gesture.',
    expected_outcome: 'By completing this habit for 7 days you will notice improved excitement. By 14 days you will see measurable improvements in appreciation. By 30 days you will experience long-term relationship benefits.',
    emoji: '🎁',
    difficulty: 'Medium',
    time_required: '15 minutes',
    benefits: ['More excitement', 'Increased appreciation', 'Stronger bond']
  },
  {
    name: 'Have deep conversation',
    description: 'Engage in meaningful deep conversation',
    category: 'Intimacy',
    instructions: 'Have a deep conversation about life, dreams, values, or meaningful topics. Go beyond surface-level chat.',
    expected_outcome: 'By completing this habit for 7 days you will notice improved understanding. By 14 days you will see measurable improvements in connection. By 30 days you will experience long-term intimacy benefits.',
    emoji: '🗣️',
    difficulty: 'Medium',
    time_required: '20 minutes',
    benefits: ['Better understanding', 'Deeper connection', 'Increased intimacy']
  },
  {
    name: 'Discuss boundaries',
    description: 'Have open conversations about boundaries',
    category: 'Intimacy',
    instructions: 'Talk openly about boundaries - what feels good, what doesn\'t, and how to respect each other\'s needs.',
    expected_outcome: 'By completing this habit for 7 days you will notice improved clarity. By 14 days you will see measurable improvements in respect. By 30 days you will experience long-term trust benefits.',
    emoji: '🚧',
    difficulty: 'Medium',
    time_required: '15 minutes',
    benefits: ['Better clarity', 'Increased respect', 'Improved trust']
  },
  {
    name: 'Talk about desires',
    description: 'Share your desires and needs with your partner',
    category: 'Intimacy',
    instructions: 'Have an open conversation about your desires - emotional, physical, and relational needs.',
    expected_outcome: 'By completing this habit for 7 days you will notice improved openness. By 14 days you will see measurable improvements in understanding. By 30 days you will experience long-term intimacy benefits.',
    emoji: '💫',
    difficulty: 'Medium',
    time_required: '15 minutes',
    benefits: ['Better openness', 'Increased understanding', 'Deeper intimacy']
  },
  {
    name: 'Share comfort touch',
    description: 'Offer comforting touch during difficult moments',
    category: 'Intimacy',
    instructions: 'When your partner is struggling, offer comforting touch - a hug, hand hold, or gentle presence.',
    expected_outcome: 'By completing this habit for 7 days you will notice improved support. By 14 days you will see measurable improvements in comfort. By 30 days you will experience long-term trust benefits.',
    emoji: '🤲',
    difficulty: 'Easy',
    time_required: '5 minutes',
    benefits: ['Better support', 'Increased comfort', 'Improved trust']
  },
  {
    name: 'Express admiration',
    description: 'Tell your partner what you admire about them',
    category: 'Intimacy',
    instructions: 'Share something specific you admire about your partner - their character, skills, or how they handle life.',
    expected_outcome: 'By completing this habit for 7 days you will notice improved appreciation. By 14 days you will see measurable improvements in self-esteem. By 30 days you will experience long-term relationship benefits.',
    emoji: '🌟',
    difficulty: 'Easy',
    time_required: '3 minutes',
    benefits: ['Better appreciation', 'Boosted self-esteem', 'Stronger connection']
  },
  {
    name: 'Do shared hobby',
    description: 'Participate in a shared hobby together',
    category: 'Intimacy',
    instructions: 'Engage in a hobby you both enjoy - reading, gardening, sports, or any shared interest.',
    expected_outcome: 'By completing this habit for 7 days you will notice improved fun. By 14 days you will see measurable improvements in bonding. By 30 days you will experience long-term connection benefits.',
    emoji: '🎯',
    difficulty: 'Medium',
    time_required: '30 minutes',
    benefits: ['More fun', 'Better bonding', 'Stronger connection']
  },
  {
    name: 'Try intimacy exercise',
    description: 'Practice an intimacy-building exercise together',
    category: 'Intimacy',
    instructions: 'Try an intimacy exercise - eye gazing, partner yoga, tandem breathing, or guided connection practice.',
    expected_outcome: 'By completing this habit for 7 days you will notice improved connection. By 14 days you will see measurable improvements in intimacy. By 30 days you will experience long-term bonding benefits.',
    emoji: '💞',
    difficulty: 'Medium',
    time_required: '15 minutes',
    benefits: ['Better connection', 'Increased intimacy', 'Stronger bond']
  },
  {
    name: 'Talk about feelings',
    description: 'Share your feelings openly with your partner',
    category: 'Intimacy',
    instructions: 'Share how you\'re feeling - not just "good" or "fine", but real emotions and experiences.',
    expected_outcome: 'By completing this habit for 7 days you will notice improved openness. By 14 days you will see measurable improvements in understanding. By 30 days you will experience long-term trust benefits.',
    emoji: '💬',
    difficulty: 'Medium',
    time_required: '10 minutes',
    benefits: ['Better openness', 'Increased understanding', 'Improved trust']
  },
  {
    name: 'Express vulnerability',
    description: 'Be vulnerable with your partner about fears or concerns',
    category: 'Intimacy',
    instructions: 'Share something vulnerable - a fear, insecurity, or concern. Trust your partner with your authentic self.',
    expected_outcome: 'By completing this habit for 7 days you will notice improved trust. By 14 days you will see measurable improvements in intimacy. By 30 days you will experience long-term connection benefits.',
    emoji: '💗',
    difficulty: 'Hard',
    time_required: '10 minutes',
    benefits: ['Better trust', 'Deeper intimacy', 'Stronger connection']
  },
  {
    name: 'Practice sensual breathing',
    description: 'Practice slow sensual breathing together',
    category: 'Intimacy',
    instructions: 'Practice slow, synchronized breathing together with sensual awareness and presence.',
    expected_outcome: 'By completing this habit for 7 days you will notice improved relaxation. By 14 days you will see measurable improvements in connection. By 30 days you will experience long-term intimacy benefits.',
    emoji: '🌬️',
    difficulty: 'Easy',
    time_required: '5 minutes',
    benefits: ['Better relaxation', 'Sensual connection', 'Increased intimacy']
  },
  {
    name: 'Make eye contact for 1 min',
    description: 'Maintain loving eye contact for one minute',
    category: 'Intimacy',
    instructions: 'Sit face-to-face and maintain gentle, loving eye contact for one full minute without speaking.',
    expected_outcome: 'By completing this habit for 7 days you will notice deeper connection. By 14 days you will see measurable improvements in intimacy. By 30 days you will experience long-term bonding benefits.',
    emoji: '👁️',
    difficulty: 'Easy',
    time_required: '1 minute',
    benefits: ['Deeper connection', 'Better intimacy', 'Stronger bond']
  },
  {
    name: 'Kiss intentionally',
    description: 'Share an intentional meaningful kiss',
    category: 'Intimacy',
    instructions: 'Kiss your partner with full presence and intention - not a quick peck, but a meaningful expression of affection.',
    expected_outcome: 'By completing this habit for 7 days you will notice improved affection. By 14 days you will see measurable improvements in connection. By 30 days you will experience long-term intimacy benefits.',
    emoji: '💋',
    difficulty: 'Easy',
    time_required: '2 minutes',
    benefits: ['Better affection', 'Physical connection', 'Increased intimacy']
  },
  {
    name: 'Be fully present',
    description: 'Be completely present with your partner without distractions',
    category: 'Intimacy',
    instructions: 'Spend 15 minutes being completely present - no phone, no TV, no distractions. Just be together.',
    expected_outcome: 'By completing this habit for 7 days you will notice improved presence. By 14 days you will see measurable improvements in connection. By 30 days you will experience long-term relationship benefits.',
    emoji: '🧘',
    difficulty: 'Medium',
    time_required: '15 minutes',
    benefits: ['Better presence', 'Deeper connection', 'Improved relationship']
  }
];

async function seedIntimacyHabitsToLibrary() {
  console.log('🌱 Starting to seed intimacy habits to library...');
  console.log(`📊 Total habits to insert: ${intimacyHabits.length}\n`);

  try {
    // First, check if habits_library table exists
    console.log('🔍 Checking if habits_library table exists...');
    const { data: checkData, error: checkError } = await supabase
      .from('habits_library')
      .select('id')
      .limit(1);

    if (checkError) {
      if (checkError.code === 'PGRST205') {
        console.error('❌ Table habits_library does not exist!');
        console.log('\n📝 Please run the migration first:');
        console.log('   database/migrations/create_habits_library.sql\n');
        return;
      }
      console.error('❌ Error checking table:', checkError);
      return;
    }

    console.log('✅ Table exists!\n');

    // Check if intimacy habits already exist
    const { data: existing, error: existingError } = await supabase
      .from('habits_library')
      .select('name')
      .eq('category', 'Intimacy');

    if (existingError) {
      console.error('❌ Error checking existing habits:', existingError);
      return;
    }

    if (existing && existing.length > 0) {
      console.log(`⚠️  Found ${existing.length} existing Intimacy habits in library`);
      console.log('   Delete them first if you want to re-seed\n');
      return;
    }

    console.log('📝 Inserting habits in batches...\n');

    // Insert in batches of 10
    const batchSize = 10;
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < intimacyHabits.length; i += batchSize) {
      const batch = intimacyHabits.slice(i, i + batchSize);
      const { data, error } = await supabase
        .from('habits_library')
        .insert(batch)
        .select();

      if (error) {
        console.error(`❌ Error inserting batch ${i / batchSize + 1}:`, error);
        errorCount += batch.length;
      } else {
        successCount += data.length;
        console.log(`✅ Batch ${i / batchSize + 1}: Inserted ${data.length} habits`);
      }
    }

    console.log(`\n✨ Seeding complete!`);
    console.log(`   ✅ Successfully inserted: ${successCount} habits`);
    if (errorCount > 0) {
      console.log(`   ❌ Failed to insert: ${errorCount} habits`);
    }

    // Verify final count
    const { data: finalCount, error: countError } = await supabase
      .from('habits_library')
      .select('id', { count: 'exact' })
      .eq('category', 'Intimacy');

    if (!countError) {
      console.log(`\n📊 Total Intimacy habits in library: ${finalCount.length}`);
    }

  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

seedIntimacyHabitsToLibrary();
