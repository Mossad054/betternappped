#!/usr/bin/env node

/**
 * Demo Seeding Script
 * 
 * This script demonstrates how to use the main seeding script
 * with different options and shows the expected output.
 */

console.log('🌱 Betternapped Data Seeding Demo\n');

console.log('This demo shows how to use the Supabase data seeding script.\n');

console.log('📋 Available Commands:');
console.log('');
console.log('1. Basic seeding (30 days):');
console.log('   npm run seed-data');
console.log('');
console.log('2. Extended seeding (90 days):');
console.log('   npm run seed-data:90');
console.log('');
console.log('3. Preview data without inserting:');
console.log('   npm run seed-data:dry');
console.log('');
console.log('4. Clear existing data first:');
console.log('   npm run seed-data:clear');
console.log('');
console.log('5. Advanced options:');
console.log('   npm run seed-data -- --days=60 --user-id="your-user-id" --dry-run');
console.log('');

console.log('📊 What gets generated:');
console.log('');
console.log('📝 Mood Logs:');
console.log('   - Mood scores (1-5) with realistic patterns');
console.log('   - Weekend moods tend to be more positive');
console.log('   - Monday blues effect');
console.log('   - Varied mood arrays and emojis');
console.log('   - Optional notes');
console.log('');

console.log('😴 Sleep Logs:');
console.log('   - Sleep duration (5-10 hours)');
console.log('   - Realistic bedtime/wake time calculations');
console.log('   - Quality scores correlating with duration');
console.log('   - Weekend sleep tends to be longer');
console.log('   - Various waking feelings');
console.log('');

console.log('🎯 Activities:');
console.log('   - Categories: exercise, social, work, hobbies, relaxation, outdoor');
console.log('   - Realistic activity names and durations');
console.log('   - Appropriate emojis per activity');
console.log('   - More work activities on weekdays');
console.log('   - More social/outdoor activities on weekends');
console.log('');

console.log('🔧 Prerequisites:');
console.log('');
console.log('1. Supabase credentials configured in app.json');
console.log('2. Database schema created (run database/schema.sql)');
console.log('3. User must exist in auth.users table');
console.log('');

console.log('📈 Data Patterns:');
console.log('');
console.log('The script uses realistic patterns to make data feel authentic:');
console.log('- Weekends: More positive moods, longer sleep, more social activities');
console.log('- Weekdays: More work activities, consistent sleep patterns');
console.log('- Monday: Slight mood dip (Monday blues)');
console.log('- Sleep Quality: Correlates with sleep duration');
console.log('- Activity Frequency: 1-4 activities per day, varies by day type');
console.log('');

console.log('🚀 Quick Start:');
console.log('');
console.log('1. Make sure your Supabase is set up');
console.log('2. Sign in to your app (or use --user-id)');
console.log('3. Run: npm run seed-data:dry (preview first)');
console.log('4. Run: npm run seed-data (insert data)');
console.log('');

console.log('✅ Ready to seed your Betternapped app with realistic data!');



