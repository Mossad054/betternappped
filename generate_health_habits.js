const fs = require('fs');

// All 42 Health habits from the user's selection
const healthHabits = [
  "10-minute walk",
  "Drink 1 glass of water",
  "Stretch for 5 mins",
  "Eat 1 fruit",
  "Healthy breakfast",
  "Take vitamins",
  "Walk after meals",
  "Balance meal plate",
  "Reduce sugar intake",
  "Sleep before 11pm",
  "Stand every hour",
  "Hydrate morning",
  "Healthy snack swap",
  "Limit caffeine",
  "Home-cooked meal",
  "Bodyweight workout",
  "Track water intake",
  "Take deep breaths",
  "Meal prep Sunday",
  "Avoid junk food",
  "Add veggies to meal",
  "Daily sunlight",
  "Maintain good posture",
  "Reduce late-night eating",
  "No sugary drink",
  "Drink herbal tea",
  "Healthy lunch",
  "Limit fried foods",
  "Eat slowly",
  "10 push-ups",
  "Take probiotics",
  "Warm-up stretches",
  "Healthy dessert swap",
  "Track food intake",
  "Avoid overeating",
  "Daily movement goal",
  "Healthy hydration",
  "Replace snack with nuts",
  "Take stairs",
  "Practice mindful cooking"
];

// Read full JSON to get complete data
const allData = JSON.parse(fs.readFileSync('habits_library.json', 'utf8'));
const healthFromJSON = allData.filter(h => h.category === 'Health');

console.log('Health habits from selection:', healthHabits.length);
console.log('Health habits in JSON:', healthFromJSON.length);

// Check what's in mockData.ts for Health category
const mockDataHealthHabits = [
  'Morning Stretch',
  'Hydration Goal'
];

// Filter to get only new habits (not in mockData)
const newHealthHabits = healthFromJSON.filter(h =>
  !mockDataHealthHabits.some(m => m.toLowerCase() === h.name.toLowerCase())
);

console.log('Health habits already in mockData.ts:', mockDataHealthHabits.length);
console.log('New Health habits to add:', newHealthHabits.length);

// Helper functions
const inferEmoji = (name) => {
  const emojiMap = {
    'walk': '🚶',
    'water': '💧',
    'stretch': '🤸',
    'fruit': '🍎',
    'breakfast': '🍳',
    'vitamin': '💊',
    'meal': '🍽️',
    'sugar': '🍬',
    'sleep': '🛏️',
    'stand': '🧍',
    'hydrat': '💧',
    'snack': '🥕',
    'caffeine': '☕',
    'cook': '👨‍🍳',
    'workout': '💪',
    'track': '📊',
    'breath': '🌬️',
    'prep': '📦',
    'junk': '🚫',
    'vegg': '🥦',
    'sunlight': '☀️',
    'posture': '🧍',
    'eating': '🍴',
    'drink': '🥤',
    'tea': '🍵',
    'lunch': '🥗',
    'fried': '🍟',
    'eat': '🍽️',
    'push': '🏋️',
    'probiotic': '🦠',
    'dessert': '🍓',
    'food': '📝',
    'movement': '👟',
    'nuts': '🥜',
    'stairs': '🪜'
  };

  const lowerName = name.toLowerCase();
  for (const [keyword, emoji] of Object.entries(emojiMap)) {
    if (lowerName.includes(keyword)) return emoji;
  }
  return '❤️'; // Default health emoji
};

const inferDifficulty = (name) => {
  const lowerName = name.toLowerCase();
  if (lowerName.includes('prep') || lowerName.includes('track food') ||
      lowerName.includes('workout') || lowerName.includes('cook')) return 'Medium';
  if (lowerName.includes('maintain') || lowerName.includes('balance')) return 'Medium';
  return 'Easy';
};

const inferTimeRequired = (name) => {
  if (name.includes('10-minute')) return '10 minutes';
  if (name.includes('5 mins')) return '5 minutes';
  if (name.includes('1 glass')) return '1 minute';
  if (name.includes('Sunday') || name.includes('prep')) return '60 minutes';
  if (name.includes('workout')) return '15 minutes';
  if (name.includes('meal') && name.includes('cooked')) return '30 minutes';
  if (name.includes('track')) return '5 minutes';
  if (name.includes('cooking')) return '30 minutes';
  return '5 minutes';
};

const inferBenefits = (name) => {
  const lowerName = name.toLowerCase();

  if (lowerName.includes('walk')) {
    return ['Better circulation', 'Improved mood', 'Increased energy'];
  } else if (lowerName.includes('water') || lowerName.includes('hydrat')) {
    return ['Better hydration', 'Improved cognitive function', 'Increased energy'];
  } else if (lowerName.includes('stretch')) {
    return ['Better flexibility', 'Reduced tension', 'Improved posture'];
  } else if (lowerName.includes('fruit') || lowerName.includes('vegg')) {
    return ['Better nutrition', 'Natural vitamins', 'Improved digestion'];
  } else if (lowerName.includes('breakfast') || lowerName.includes('lunch')) {
    return ['Better energy', 'Improved focus', 'Stable blood sugar'];
  } else if (lowerName.includes('vitamin') || lowerName.includes('probiotic')) {
    return ['Nutrient support', 'Better immunity', 'Improved health'];
  } else if (lowerName.includes('sugar') || lowerName.includes('junk') || lowerName.includes('fried')) {
    return ['Stable blood sugar', 'Better energy', 'Improved health'];
  } else if (lowerName.includes('sleep')) {
    return ['Better sleep', 'Improved recovery', 'More energy'];
  } else if (lowerName.includes('workout') || lowerName.includes('push')) {
    return ['Better strength', 'Improved fitness', 'Increased energy'];
  } else if (lowerName.includes('posture') || lowerName.includes('stand')) {
    return ['Better alignment', 'Reduced pain', 'Improved breathing'];
  } else if (lowerName.includes('sunlight')) {
    return ['Vitamin D', 'Better mood', 'Improved sleep'];
  } else if (lowerName.includes('track')) {
    return ['Better awareness', 'Improved nutrition', 'Accountability'];
  } else if (lowerName.includes('breath')) {
    return ['Reduced stress', 'Better oxygenation', 'Improved calm'];
  } else {
    return ['Improved health', 'Better wellbeing', 'Increased vitality'];
  }
};

// Generate SQL
let sql = `-- Seed Health Habits from habits_library.json
-- This migration adds ${newHealthHabits.length} Health habits to the habits_library table

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

const values = newHealthHabits.map(habit => {
  const name = habit.name.replace(/'/g, "''");
  const description = habit.description.replace(/'/g, "''");
  const instructions = habit.instructions.replace(/'/g, "''");
  const emoji = inferEmoji(habit.name);
  const difficulty = inferDifficulty(habit.name);
  const timeRequired = inferTimeRequired(habit.name);
  const benefits = inferBenefits(habit.name);
  const benefitsArray = `ARRAY[${benefits.map(b => `'${b.replace(/'/g, "''")}'`).join(', ')}]`;

  return `  (
    '${name}',
    '${description}',
    'Health',
    '${instructions}',
    '${description}',
    '${emoji}',
    '${difficulty}',
    '${timeRequired}',
    ${benefitsArray}
  )`;
});

sql += values.join(',\n');
sql += `\nON CONFLICT (name) DO NOTHING;\n\n`;
sql += `-- Verify the insertion\n`;
sql += `SELECT\n`;
sql += `  COUNT(*) as total_health_habits,\n`;
sql += `  COUNT(*) FILTER (WHERE difficulty = 'Easy') as easy_habits,\n`;
sql += `  COUNT(*) FILTER (WHERE difficulty = 'Medium') as medium_habits,\n`;
sql += `  COUNT(*) FILTER (WHERE difficulty = 'Hard') as hard_habits\n`;
sql += `FROM public.habits_library\n`;
sql += `WHERE category = 'Health';\n\n`;
sql += `-- Show sample of inserted habits\n`;
sql += `SELECT name, difficulty, time_required, emoji\n`;
sql += `FROM public.habits_library\n`;
sql += `WHERE category = 'Health'\n`;
sql += `ORDER BY created_at DESC\n`;
sql += `LIMIT 10;\n`;

// Write to file
fs.writeFileSync('database/migrations/seed_health_habits.sql', sql);

console.log('\n✅ Created: database/migrations/seed_health_habits.sql');
console.log(`   Total habits: ${newHealthHabits.length}`);
console.log('\nFirst 5 habits:');
newHealthHabits.slice(0, 5).forEach((h, i) => {
  console.log(`   ${i + 1}. ${h.name} ${inferEmoji(h.name)}`);
});
