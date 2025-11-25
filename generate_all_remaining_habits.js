const fs = require('fs');

// Read the full habits library
const allData = JSON.parse(fs.readFileSync('habits_library.json', 'utf8'));

// Filter by remaining categories
const moodHabits = allData.filter(h => h.category === 'Mood');
const intimacyHabits = allData.filter(h => h.category === 'Intimacy');
const anxietyHabits = allData.filter(h => h.category === 'Anxiety');

console.log('=== Remaining Categories ===');
console.log('Mood:', moodHabits.length);
console.log('Intimacy:', intimacyHabits.length);
console.log('Anxiety:', anxietyHabits.length);
console.log('Total:', moodHabits.length + intimacyHabits.length + anxietyHabits.length);

// Helper functions
const getEmojiForCategory = (category, name) => {
  const lowerName = name.toLowerCase();

  if (category === 'Mood') {
    if (lowerName.includes('gratitude')) return '🙏';
    if (lowerName.includes('compliment')) return '💬';
    if (lowerName.includes('breathing') || lowerName.includes('breath')) return '🌬️';
    if (lowerName.includes('walk')) return '🚶';
    if (lowerName.includes('journal')) return '📓';
    if (lowerName.includes('friend') || lowerName.includes('talk')) return '👥';
    if (lowerName.includes('music')) return '🎵';
    if (lowerName.includes('funny') || lowerName.includes('laugh')) return '😂';
    if (lowerName.includes('stretch')) return '🧘';
    if (lowerName.includes('water')) return '💧';
    if (lowerName.includes('news')) return '📰';
    if (lowerName.includes('kindness')) return '💝';
    if (lowerName.includes('hug')) return '🤗';
    if (lowerName.includes('affirmation')) return '💪';
    if (lowerName.includes('creative')) return '🎨';
    if (lowerName.includes('nature')) return '🌳';
    return '😊';
  }

  if (category === 'Intimacy') {
    if (lowerName.includes('appreciation') || lowerName.includes('gratitude')) return '💝';
    if (lowerName.includes('message') || lowerName.includes('text')) return '💌';
    if (lowerName.includes('hug')) return '🤗';
    if (lowerName.includes('eye')) return '👁️';
    if (lowerName.includes('listen')) return '👂';
    if (lowerName.includes('hand')) return '🤝';
    if (lowerName.includes('check-in') || lowerName.includes('emotion')) return '💭';
    if (lowerName.includes('touch')) return '🤲';
    if (lowerName.includes('cook')) return '👨‍🍳';
    if (lowerName.includes('massage')) return '💆';
    if (lowerName.includes('breathing')) return '🌬️';
    if (lowerName.includes('thought') || lowerName.includes('feeling')) return '💭';
    if (lowerName.includes('loving')) return '❤️';
    if (lowerName.includes('laugh')) return '😂';
    if (lowerName.includes('memory')) return '📸';
    if (lowerName.includes('fun')) return '🎉';
    if (lowerName.includes('affection')) return '💑';
    if (lowerName.includes('date')) return '💐';
    if (lowerName.includes('surprise')) return '🎁';
    if (lowerName.includes('conversation')) return '🗣️';
    if (lowerName.includes('boundaries')) return '🚧';
    if (lowerName.includes('desires')) return '💫';
    if (lowerName.includes('admiration')) return '🌟';
    if (lowerName.includes('hobby')) return '🎯';
    if (lowerName.includes('exercise')) return '💞';
    if (lowerName.includes('vulnerability')) return '💗';
    if (lowerName.includes('kiss')) return '💋';
    if (lowerName.includes('present')) return '🧘';
    return '💕';
  }

  if (category === 'Anxiety') {
    if (lowerName.includes('breathing')) return '🫁';
    if (lowerName.includes('grounding')) return '🌱';
    return '🧘';
  }

  return '✨';
};

const getDifficulty = (category, name) => {
  const lowerName = name.toLowerCase();

  if (category === 'Intimacy') {
    if (lowerName.includes('vulnerability') || lowerName.includes('boundaries') ||
        lowerName.includes('desires') || lowerName.includes('deep conversation')) return 'Hard';
    if (lowerName.includes('listen') || lowerName.includes('cook') ||
        lowerName.includes('plan') || lowerName.includes('exercise')) return 'Medium';
  }

  if (category === 'Mood') {
    if (lowerName.includes('avoid news')) return 'Medium';
  }

  return 'Easy';
};

const getTimeRequired = (category, name) => {
  const lowerName = name.toLowerCase();

  if (lowerName.includes('1 min') || lowerName.includes('1-min')) return '1 minute';
  if (lowerName.includes('2-minute') || lowerName.includes('2 min')) return '2 minutes';
  if (lowerName.includes('3 min')) return '3 minutes';
  if (lowerName.includes('5 min') || lowerName.includes('5-min')) return '5 minutes';
  if (lowerName.includes('10 min') || lowerName.includes('10-minute')) return '10 minutes';
  if (lowerName.includes('15 min')) return '15 minutes';
  if (lowerName.includes('20 min')) return '20 minutes';
  if (lowerName.includes('30 min')) return '30 minutes';

  if (category === 'Intimacy') {
    if (lowerName.includes('cook') || lowerName.includes('fun') || lowerName.includes('hobby')) return '30 minutes';
    if (lowerName.includes('conversation') || lowerName.includes('boundaries')) return '15 minutes';
    if (lowerName.includes('massage') || lowerName.includes('plan')) return '10 minutes';
  }

  return '5 minutes';
};

const getBenefits = (category, name) => {
  const lowerName = name.toLowerCase();

  if (category === 'Mood') {
    if (lowerName.includes('gratitude')) return ['Better perspective', 'Increased positivity', 'Reduced negativity'];
    if (lowerName.includes('breathing')) return ['Reduced stress', 'Better calm', 'Improved focus'];
    if (lowerName.includes('walk')) return ['Better mood', 'Fresh air', 'Improved energy'];
    if (lowerName.includes('journal')) return ['Emotional processing', 'Better awareness', 'Reduced stress'];
    if (lowerName.includes('friend') || lowerName.includes('talk')) return ['Social connection', 'Better mood', 'Reduced loneliness'];
    if (lowerName.includes('music')) return ['Better mood', 'Emotional uplift', 'Stress relief'];
    if (lowerName.includes('creative')) return ['Creative expression', 'Better mood', 'Stress relief'];
    if (lowerName.includes('nature')) return ['Improved calm', 'Better mood', 'Stress reduction'];
    return ['Better mood', 'Improved wellbeing', 'Increased happiness'];
  }

  if (category === 'Intimacy') {
    if (lowerName.includes('appreciation') || lowerName.includes('compliment')) return ['Better connection', 'Increased gratitude', 'Stronger bond'];
    if (lowerName.includes('communication') || lowerName.includes('talk')) return ['Better communication', 'Increased understanding', 'Stronger connection'];
    if (lowerName.includes('touch') || lowerName.includes('hug') || lowerName.includes('affection')) return ['Physical connection', 'Better intimacy', 'Stronger bond'];
    if (lowerName.includes('listen')) return ['Better listening', 'Increased understanding', 'Improved trust'];
    if (lowerName.includes('fun') || lowerName.includes('laugh')) return ['More fun', 'Better connection', 'Stronger bond'];
    return ['Better connection', 'Deeper intimacy', 'Stronger relationship'];
  }

  if (category === 'Anxiety') {
    return ['Reduced anxiety', 'Better calm', 'Improved mindfulness'];
  }

  return ['Improved wellbeing', 'Better health', 'Increased happiness'];
};

// Generate SQL for each category
const generateSQL = (habits, category) => {
  let sql = `-- Seed ${category} Habits from habits_library.json\n`;
  sql += `-- This migration adds ${habits.length} ${category} habits to the habits_library table\n\n`;
  sql += `INSERT INTO public.habits_library (\n`;
  sql += `  name,\n  description,\n  category,\n  instructions,\n  expected_outcome,\n`;
  sql += `  emoji,\n  difficulty,\n  time_required,\n  benefits\n) VALUES\n`;

  const values = habits.map(habit => {
    const name = habit.name.replace(/'/g, "''");
    const description = habit.description.replace(/'/g, "''");
    const instructions = habit.instructions.replace(/'/g, "''");
    const emoji = getEmojiForCategory(category, habit.name);
    const difficulty = getDifficulty(category, habit.name);
    const timeRequired = getTimeRequired(category, habit.name);
    const benefits = getBenefits(category, habit.name);
    const benefitsArray = `ARRAY[${benefits.map(b => `'${b.replace(/'/g, "''")}'`).join(', ')}]`;

    return `  (\n    '${name}',\n    '${description}',\n    '${category}',\n` +
           `    '${instructions}',\n    '${description}',\n` +
           `    '${emoji}',\n    '${difficulty}',\n    '${timeRequired}',\n    ${benefitsArray}\n  )`;
  });

  sql += values.join(',\n');
  sql += `\nON CONFLICT (name) DO NOTHING;\n\n`;
  sql += `-- Verify the insertion\n`;
  sql += `SELECT COUNT(*) as total_${category.toLowerCase()}_habits FROM public.habits_library WHERE category = '${category}';\n\n`;
  sql += `-- Show sample of inserted habits\n`;
  sql += `SELECT name, difficulty, time_required, emoji FROM public.habits_library\n`;
  sql += `WHERE category = '${category}' ORDER BY created_at DESC LIMIT 10;\n`;

  return sql;
};

// Generate SQL files
const moodSQL = generateSQL(moodHabits, 'Mood');
const intimacySQL = generateSQL(intimacyHabits, 'Intimacy');
const anxietySQL = generateSQL(anxietyHabits, 'Anxiety');

fs.writeFileSync('database/migrations/seed_mood_habits.sql', moodSQL);
fs.writeFileSync('database/migrations/seed_intimacy_habits.sql', intimacySQL);
fs.writeFileSync('database/migrations/seed_anxiety_habits.sql', anxietySQL);

console.log('\n✅ Generated SQL files:');
console.log(`   database/migrations/seed_mood_habits.sql (${moodHabits.length} habits)`);
console.log(`   database/migrations/seed_intimacy_habits.sql (${intimacyHabits.length} habits)`);
console.log(`   database/migrations/seed_anxiety_habits.sql (${anxietyHabits.length} habits)`);

console.log('\n📊 Summary:');
console.log(`   Total new habits: ${moodHabits.length + intimacyHabits.length + anxietyHabits.length}`);
console.log(`   Grand total (all categories): ${39 + 40 + moodHabits.length + intimacyHabits.length + anxietyHabits.length}`);
