const fs = require('fs');

// Read the habits library JSON
const data = JSON.parse(fs.readFileSync('habits_library.json', 'utf8'));

// Filter Mental Clarity habits
const mentalClarity = data.filter(h => h.category === 'Mental Clarity');

// Existing habits in mockData.ts that we should skip
const existingInMock = [
  'Mind Mapping',
  'Digital Declutter',
  '5-minute deep breathing',
  'Write daily priorities',
  'Digital detox break'
];

// Filter out existing habits
const newHabits = mentalClarity.filter(h =>
  !existingInMock.some(e => e.toLowerCase() === h.name.toLowerCase())
);

console.log('Total Mental Clarity habits:', mentalClarity.length);
console.log('Already in mockData:', existingInMock.length);
console.log('New habits to add:', newHabits.length);
console.log('\n=== New Habits ===');

// Output the new habits
newHabits.forEach((habit, index) => {
  console.log(`\n${index + 1}. ${habit.name}`);
});

// Write to file for SQL generation
fs.writeFileSync('mental_clarity_new.json', JSON.stringify(newHabits, null, 2));
console.log('\n✅ New habits written to mental_clarity_new.json');
