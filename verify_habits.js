const fs = require('fs');

// Read the SQL file
const sql = fs.readFileSync('database/migrations/seed_mental_clarity_habits.sql', 'utf8');

// Extract habit names from SQL using regex
const sqlMatches = sql.match(/'([^']+)',\s*\n\s*'By completing this habit/g);
const sqlHabits = sqlMatches ? sqlMatches.map(m => {
  const match = m.match(/'([^']+)',/);
  return match ? match[1] : null;
}).filter(Boolean) : [];

// List of habits from user's selection (39 total from habits_library.json)
const expectedHabits = [
  "5-minute deep breathing",
  "Write daily priorities",
  "Digital detox break",
  "Mindful pause every hour",
  "Brain dump journaling",
  "Read 2 pages of a book",
  "Practice gratitude list",
  "Cold water face splash",
  "Stand and stretch break",
  "Focus on single task",
  "Avoid multitasking session",
  "5-minute meditation",
  "Limit notifications",
  "Plan tomorrow tonight",
  "Review goals daily",
  "Do one hard thing first",
  "Mental reset walk",
  "Declutter workspace",
  "Set clear intentions",
  "Drink water first thing",
  "Practice silence for 1 min",
  "No-screen breakfast",
  "Slow breathing count",
  "Positive affirmation",
  "Reset posture hourly",
  "Avoid doom scrolling",
  "Tidy desk end of day",
  "Reflect on wins",
  "Set hourly focus timer",
  "Visualize your day",
  "5-minute sunlight exposure",
  "Track distractions",
  "Practice mindful eating",
  "Plan breaks intentionally",
  "Organize work apps",
  "Create thought boundary",
  "Practice mini grounding",
  "Single-task meal",
  "Evening mental review"
];

console.log('Expected habits from JSON:', expectedHabits.length);
console.log('Habits in SQL file:', sqlHabits.length);
console.log('\n=== COMPARISON ===\n');

// Find missing habits
const missing = expectedHabits.filter(h =>
  !sqlHabits.some(s => s.toLowerCase() === h.toLowerCase())
);

// Find extra habits (in SQL but not expected)
const extra = sqlHabits.filter(s =>
  !expectedHabits.some(h => h.toLowerCase() === s.toLowerCase())
);

if (missing.length > 0) {
  console.log('❌ MISSING from SQL file:');
  missing.forEach((h, i) => console.log(`   ${i + 1}. ${h}`));
  console.log('');
} else {
  console.log('✅ All expected habits are present in SQL file\n');
}

if (extra.length > 0) {
  console.log('⚠️  EXTRA in SQL file (not in expected list):');
  extra.forEach((h, i) => console.log(`   ${i + 1}. ${h}`));
  console.log('');
}

// Save detailed report
const report = {
  expected: expectedHabits.length,
  inSQL: sqlHabits.length,
  missing: missing,
  extra: extra,
  allHabitsInSQL: sqlHabits
};

fs.writeFileSync('habits_verification_report.json', JSON.stringify(report, null, 2));
console.log('📄 Detailed report saved to: habits_verification_report.json');
