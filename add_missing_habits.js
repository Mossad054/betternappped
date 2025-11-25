const fs = require('fs');

// The 3 missing habits that need to be added
const missingHabits = [
  {
    name: "5-minute deep breathing",
    instructions: "Perform the habit '5-minute deep breathing' consistently as part of your daily routine.",
    description: "By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: 5-minute deep breathing.",
    emoji: "🌬️",
    difficulty: "Easy",
    timeRequired: "5 minutes",
    benefits: ["Reduced stress", "Improved focus", "Better oxygen flow to brain"]
  },
  {
    name: "Write daily priorities",
    instructions: "Perform the habit 'Write daily priorities' consistently as part of your daily routine.",
    description: "By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: write daily priorities.",
    emoji: "📝",
    difficulty: "Easy",
    timeRequired: "5 minutes",
    benefits: ["Better organization", "Improved productivity", "Reduced decision fatigue"]
  },
  {
    name: "Digital detox break",
    instructions: "Perform the habit 'Digital detox break' consistently as part of your daily routine.",
    description: "By completing this habit for 7 days you will notice early positive changes. By 14 days you will see measurable improvements. By 30 days you will experience long-term results related to: digital detox break.",
    emoji: "📵",
    difficulty: "Easy",
    timeRequired: "10 minutes",
    benefits: ["Reduced digital overwhelm", "Better attention span", "Improved focus"]
  }
];

// Generate SQL for the missing habits
let sql = `-- Add the 3 Missing Mental Clarity Habits
-- These habits were initially excluded because they existed in mockData.ts
-- However, they should also be in the database for completeness

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

const values = missingHabits.map(habit => {
  const name = habit.name.replace(/'/g, "''");
  const description = habit.description.replace(/'/g, "''");
  const instructions = habit.instructions.replace(/'/g, "''");
  const benefitsArray = `ARRAY[${habit.benefits.map(b => `'${b.replace(/'/g, "''")}'`).join(', ')}]`;

  return `  (
    '${name}',
    '${description}',
    'MentalClarity',
    '${instructions}',
    '${description}',
    '${habit.emoji}',
    '${habit.difficulty}',
    '${habit.timeRequired}',
    ${benefitsArray}
  )`;
});

sql += values.join(',\n');
sql += `\nON CONFLICT (name) DO NOTHING;\n\n`;
sql += `-- Verify insertion\n`;
sql += `SELECT name, emoji, difficulty FROM public.habits_library\n`;
sql += `WHERE name IN ('5-minute deep breathing', 'Write daily priorities', 'Digital detox break');\n`;

// Write to file
fs.writeFileSync('database/migrations/seed_mental_clarity_habits_missing.sql', sql);

console.log('✅ Created SQL file: database/migrations/seed_mental_clarity_habits_missing.sql');
console.log(`   Contains ${missingHabits.length} missing Mental Clarity habits`);
console.log('\nMissing habits to be added:');
missingHabits.forEach((h, i) => {
  console.log(`   ${i + 1}. ${h.name} ${h.emoji}`);
});
