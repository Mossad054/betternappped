const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read environment variables
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const intimacyHabits = [
  { category: 'Intimacy', name: 'Share appreciation with partner', instructions: 'Perform the habit \'Share appreciation with partner\' consistently as part of your daily routine.', description: 'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: share appreciation with partner.' },
  { category: 'Intimacy', name: 'Send loving message', instructions: 'Perform the habit \'Send loving message\' consistently as part of your daily routine.', description: 'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: send loving message.' },
  { category: 'Intimacy', name: 'Hug for 20 seconds', instructions: 'Perform the habit \'Hug for 20 seconds\' consistently as part of your daily routine.', description: 'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: hug for 20 seconds.' },
  { category: 'Intimacy', name: 'Hold eye contact', instructions: 'Perform the habit \'Hold eye contact\' consistently as part of your daily routine.', description: 'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: hold eye contact.' },
  { category: 'Intimacy', name: 'Ask partner about their day', instructions: 'Perform the habit \'Ask partner about their day\' consistently as part of your daily routine.', description: 'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: ask partner about their day.' },
  { category: 'Intimacy', name: 'Plan 5-min connection ritual', instructions: 'Perform the habit \'Plan 5-min connection ritual\' consistently as part of your daily routine.', description: 'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: plan 5-min connection ritual.' },
  { category: 'Intimacy', name: 'Compliment partner', instructions: 'Perform the habit \'Compliment partner\' consistently as part of your daily routine.', description: 'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: compliment partner.' },
  { category: 'Intimacy', name: 'Practice active listening', instructions: 'Perform the habit \'Practice active listening\' consistently as part of your daily routine.', description: 'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: practice active listening.' },
  { category: 'Intimacy', name: 'Hold hands', instructions: 'Perform the habit \'Hold hands\' consistently as part of your daily routine.', description: 'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: hold hands.' },
  { category: 'Intimacy', name: 'Share emotional check-in', instructions: 'Perform the habit \'Share emotional check-in\' consistently as part of your daily routine.', description: 'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: share emotional check-in.' },
  { category: 'Intimacy', name: 'Touch intentionally', instructions: 'Perform the habit \'Touch intentionally\' consistently as part of your daily routine.', description: 'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: touch intentionally.' },
  { category: 'Intimacy', name: 'Share gratitude', instructions: 'Perform the habit \'Share gratitude\' consistently as part of your daily routine.', description: 'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: share gratitude.' },
  { category: 'Intimacy', name: 'Do a small act of kindness', instructions: 'Perform the habit \'Do a small act of kindness\' consistently as part of your daily routine.', description: 'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: do a small act of kindness.' },
  { category: 'Intimacy', name: 'Ask partner needs', instructions: 'Perform the habit \'Ask partner needs\' consistently as part of your daily routine.', description: 'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: ask partner needs.' },
  { category: 'Intimacy', name: 'Sit together quietly', instructions: 'Perform the habit \'Sit together quietly\' consistently as part of your daily routine.', description: 'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: sit together quietly.' },
  { category: 'Intimacy', name: 'Cook together', instructions: 'Perform the habit \'Cook together\' consistently as part of your daily routine.', description: 'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: cook together.' },
  { category: 'Intimacy', name: 'Plan intimacy time', instructions: 'Perform the habit \'Plan intimacy time\' consistently as part of your daily routine.', description: 'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: plan intimacy time.' },
  { category: 'Intimacy', name: 'Give a gentle massage', instructions: 'Perform the habit \'Give a gentle massage\' consistently as part of your daily routine.', description: 'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: give a gentle massage.' },
  { category: 'Intimacy', name: 'Practice breathing together', instructions: 'Perform the habit \'Practice breathing together\' consistently as part of your daily routine.', description: 'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: practice breathing together.' },
  { category: 'Intimacy', name: 'Share personal thought', instructions: 'Perform the habit \'Share personal thought\' consistently as part of your daily routine.', description: 'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: share personal thought.' },
  { category: 'Intimacy', name: 'Say something loving', instructions: 'Perform the habit \'Say something loving\' consistently as part of your daily routine.', description: 'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: say something loving.' },
  { category: 'Intimacy', name: 'Laugh together', instructions: 'Perform the habit \'Laugh together\' consistently as part of your daily routine.', description: 'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: laugh together.' },
  { category: 'Intimacy', name: 'Share a memory', instructions: 'Perform the habit \'Share a memory\' consistently as part of your daily routine.', description: 'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: share a memory.' },
  { category: 'Intimacy', name: 'Do something fun together', instructions: 'Perform the habit \'Do something fun together\' consistently as part of your daily routine.', description: 'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: do something fun together.' },
  { category: 'Intimacy', name: 'Express physical affection', instructions: 'Perform the habit \'Express physical affection\' consistently as part of your daily routine.', description: 'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: express physical affection.' },
  { category: 'Intimacy', name: 'Plan mini date', instructions: 'Perform the habit \'Plan mini date\' consistently as part of your daily routine.', description: 'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: plan mini date.' },
  { category: 'Intimacy', name: 'Surprise partner', instructions: 'Perform the habit \'Surprise partner\' consistently as part of your daily routine.', description: 'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: surprise partner.' },
  { category: 'Intimacy', name: 'Have deep conversation', instructions: 'Perform the habit \'Have deep conversation\' consistently as part of your daily routine.', description: 'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: have deep conversation.' },
  { category: 'Intimacy', name: 'Discuss boundaries', instructions: 'Perform the habit \'Discuss boundaries\' consistently as part of your daily routine.', description: 'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: discuss boundaries.' },
  { category: 'Intimacy', name: 'Talk about desires', instructions: 'Perform the habit \'Talk about desires\' consistently as part of your daily routine.', description: 'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: talk about desires.' },
  { category: 'Intimacy', name: 'Share comfort touch', instructions: 'Perform the habit \'Share comfort touch\' consistently as part of your daily routine.', description: 'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: share comfort touch.' },
  { category: 'Intimacy', name: 'Express admiration', instructions: 'Perform the habit \'Express admiration\' consistently as part of your daily routine.', description: 'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: express admiration.' },
  { category: 'Intimacy', name: 'Do shared hobby', instructions: 'Perform the habit \'Do shared hobby\' consistently as part of your daily routine.', description: 'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: do shared hobby.' },
  { category: 'Intimacy', name: 'Try intimacy exercise', instructions: 'Perform the habit \'Try intimacy exercise\' consistently as part of your daily routine.', description: 'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: try intimacy exercise.' },
  { category: 'Intimacy', name: 'Talk about feelings', instructions: 'Perform the habit \'Talk about feelings\' consistently as part of your daily routine.', description: 'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: talk about feelings.' },
  { category: 'Intimacy', name: 'Express vulnerability', instructions: 'Perform the habit \'Express vulnerability\' consistently as part of your daily routine.', description: 'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: express vulnerability.' },
  { category: 'Intimacy', name: 'Practice sensual breathing', instructions: 'Perform the habit \'Practice sensual breathing\' consistently as part of your daily routine.', description: 'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: practice sensual breathing.' },
  { category: 'Intimacy', name: 'Make eye contact for 1 min', instructions: 'Perform the habit \'Make eye contact for 1 min\' consistently as part of your daily routine.', description: 'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: make eye contact for 1 min.' },
  { category: 'Intimacy', name: 'Kiss intentionally', instructions: 'Perform the habit \'Kiss intentionally\' consistently as part of your daily routine.', description: 'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: kiss intentionally.' },
  { category: 'Intimacy', name: 'Be fully present', instructions: 'Perform the habit \'Be fully present\' consistently as part of your daily routine.', description: 'By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: be fully present.' }
];

async function seedIntimacyHabits() {
  console.log('Starting to seed intimacy habits...');
  console.log(`Total habits to insert: ${intimacyHabits.length}`);

  try {
    // Check if habits_library table exists and has the right structure
    const { data: existingHabits, error: checkError } = await supabase
      .from('habits_library')
      .select('name')
      .eq('category', 'Intimacy')
      .limit(1);

    if (checkError) {
      console.error('Error checking habits_library table:', checkError);
      return;
    }

    console.log('Table check passed. Inserting habits...');

    // Insert all habits in one batch
    const { data, error } = await supabase
      .from('habits_library')
      .insert(intimacyHabits)
      .select();

    if (error) {
      console.error('Error inserting habits:', error);
      return;
    }

    console.log(`✓ Successfully inserted ${data.length} intimacy habits`);

    // Verify the count
    const { data: countData, error: countError } = await supabase
      .from('habits_library')
      .select('id', { count: 'exact' })
      .eq('category', 'Intimacy');

    if (countError) {
      console.error('Error counting habits:', countError);
      return;
    }

    console.log(`\n✓ Total intimacy habits in database: ${countData.length}`);

    // List all intimacy habit names
    const { data: allIntimacyHabits, error: listError } = await supabase
      .from('habits_library')
      .select('name')
      .eq('category', 'Intimacy')
      .order('name');

    if (!listError && allIntimacyHabits) {
      console.log('\nIntimacy habits in database:');
      allIntimacyHabits.forEach((habit, index) => {
        console.log(`  ${index + 1}. ${habit.name}`);
      });
    }

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

seedIntimacyHabits();
