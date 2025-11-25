const fs = require('fs');

// Read the new habits
const newHabits = JSON.parse(fs.readFileSync('mental_clarity_new.json', 'utf8'));

// Map difficulty and time from habit names (we'll need to infer these)
const inferDifficulty = (name) => {
  // Simple heuristics
  if (name.includes('5-minute') || name.includes('1 min') || name.includes('pause') ||
      name.includes('first thing') || name.includes('hourly')) return 'Easy';
  if (name.includes('journaling') || name.includes('visualize') ||
      name.includes('organize') || name.includes('track')) return 'Medium';
  return 'Easy'; // Default
};

const inferTimeRequired = (name) => {
  if (name.includes('5-minute')) return '5 minutes';
  if (name.includes('1 min')) return '1 minute';
  if (name.includes('hourly')) return '2 minutes';
  if (name.includes('evening') || name.includes('morning')) return '10 minutes';
  if (name.includes('journaling') || name.includes('read')) return '10 minutes';
  return '5 minutes'; // Default
};

const inferEmoji = (name) => {
  const emojiMap = {
    'breathing': '🌬️',
    'water': '💧',
    'meditation': '🧘',
    'journal': '📓',
    'read': '📖',
    'walk': '🚶',
    'workspace': '🗂️',
    'intentions': '🎯',
    'silence': '🤫',
    'breakfast': '🍳',
    'affirmation': '💪',
    'posture': '🧍',
    'sunlight': '☀️',
    'eating': '🍽️',
    'timer': '⏰',
    'visualize': '👁️',
    'apps': '📱',
    'thought': '💭',
    'grounding': '🌱',
    'evening': '🌙',
    'wins': '🏆',
    'goals': '🎯',
    'focus': '🎯',
    'priorities': '📝',
    'pause': '⏸️',
    'task': '✅',
    'detox': '📵',
    'distraction': '🚫',
    'declutter': '✨',
    'plan': '📅'
  };

  for (const [keyword, emoji] of Object.entries(emojiMap)) {
    if (name.toLowerCase().includes(keyword)) return emoji;
  }
  return '🧠'; // Default mental clarity emoji
};

const inferBenefits = (name) => {
  // Generate 3 contextual benefits
  const benefits = [];

  if (name.includes('breathing') || name.includes('meditation')) {
    benefits.push('Reduced stress', 'Better focus', 'Improved calm');
  } else if (name.includes('journal') || name.includes('write')) {
    benefits.push('Better organization', 'Clearer thoughts', 'Reduced mental clutter');
  } else if (name.includes('water') || name.includes('hydration')) {
    benefits.push('Better hydration', 'Improved cognitive function', 'Increased energy');
  } else if (name.includes('walk') || name.includes('sunlight')) {
    benefits.push('Improved mood', 'Better energy', 'Reduced stress');
  } else if (name.includes('detox') || name.includes('screen') || name.includes('notification')) {
    benefits.push('Reduced digital overwhelm', 'Better attention span', 'Improved focus');
  } else if (name.includes('plan') || name.includes('goals') || name.includes('priorities')) {
    benefits.push('Better organization', 'Improved productivity', 'Reduced decision fatigue');
  } else if (name.includes('declutter') || name.includes('organize')) {
    benefits.push('Reduced mental clutter', 'Better focus', 'Improved efficiency');
  } else {
    benefits.push('Improved mental clarity', 'Better focus', 'Reduced stress');
  }

  return benefits;
};

// Generate SQL
let sql = `-- Seed Mental Clarity Habits from habits_library.json
-- This migration adds 36 new Mental Clarity habits to the habits_library table
-- Excluding 3 habits that already exist in mockData.ts

-- First, check if the table exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'habits_library') THEN
    RAISE EXCEPTION 'Table habits_library does not exist. Please run create_habits_library.sql first.';
  END IF;
END $$;

-- Insert Mental Clarity habits
INSERT INTO public.habits_library (
  name,
  description,
  category,
  instructions,
  expected_outcome,
  emoji,
  difficulty,
  time_required,
  benefits
) VALUES\n`;

const values = [];

newHabits.forEach((habit, index) => {
  const name = habit.name.replace(/'/g, "''"); // Escape single quotes
  const description = habit.description.replace(/'/g, "''");
  const instructions = habit.instructions.replace(/'/g, "''");
  const emoji = inferEmoji(habit.name);
  const difficulty = inferDifficulty(habit.name);
  const timeRequired = inferTimeRequired(habit.name);
  const benefits = inferBenefits(habit.name);
  const benefitsArray = `ARRAY[${benefits.map(b => `'${b.replace(/'/g, "''")}'`).join(', ')}]`;

  values.push(`  (
    '${name}',
    '${description}',
    'MentalClarity',
    '${instructions}',
    '${description}',
    '${emoji}',
    '${difficulty}',
    '${timeRequired}',
    ${benefitsArray}
  )`);
});

sql += values.join(',\n');

sql += `
ON CONFLICT (name) DO NOTHING;

-- Verify the insertion
SELECT
  COUNT(*) as total_mental_clarity_habits,
  COUNT(*) FILTER (WHERE difficulty = 'Easy') as easy_habits,
  COUNT(*) FILTER (WHERE difficulty = 'Medium') as medium_habits,
  COUNT(*) FILTER (WHERE difficulty = 'Hard') as hard_habits
FROM public.habits_library
WHERE category = 'MentalClarity';

-- Show sample of inserted habits
SELECT name, difficulty, time_required, emoji
FROM public.habits_library
WHERE category = 'MentalClarity'
ORDER BY created_at DESC
LIMIT 10;
`;

// Write the SQL file
fs.writeFileSync('database/migrations/seed_mental_clarity_habits.sql', sql);
console.log('✅ SQL migration created: database/migrations/seed_mental_clarity_habits.sql');
console.log(`   Total habits to insert: ${newHabits.length}`);
