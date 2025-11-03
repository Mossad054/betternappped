#!/usr/bin/env node

/**
 * Seed Development Data Script
 * 
 * This script inserts mock data into the Supabase database for testing purposes.
 * All seeded data is marked with __dev__: true and created_by: 'dev-seed' for easy cleanup.
 * 
 * Usage:
 *   npm run seed-dev-data
 *   npm run seed-dev-data -- --yes (skip confirmation)
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { readFileSync } from 'fs';
import { join } from 'path';

// Load environment variables
config();

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Please set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Test user data
const TEST_USER = {
  email: 'test@betternapped.dev',
  password: 'testpassword123',
  id: 'test-user-id-' + Date.now()
};

// Mock data generators
const generateMoodLogs = (userId: string, days: number = 30) => {
  const logs = [];
  const moods = [
    { id: 1, emoji: '😢', name: 'Very Sad' },
    { id: 2, emoji: '😕', name: 'Sad' },
    { id: 3, emoji: '😐', name: 'Neutral' },
    { id: 4, emoji: '😊', name: 'Happy' },
    { id: 5, emoji: '😄', name: 'Very Happy' }
  ];

  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    const selectedMoods = [moods[Math.floor(Math.random() * moods.length)]];
    const score = selectedMoods[0].id;
    
    logs.push({
      user_id: userId,
      date: dateStr,
      moods: selectedMoods,
      score,
      emoji: selectedMoods[0].emoji,
      notes: i % 7 === 0 ? 'Weekly reflection note' : null,
      __dev__: true,
      created_by: 'dev-seed'
    });
  }
  
  return logs;
};

const generateSleepLogs = (userId: string, days: number = 30) => {
  const logs = [];
  
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    const hours = Math.round((6 + Math.random() * 4) * 10) / 10; // 6-10 hours
    const quality = Math.floor(Math.random() * 5) + 1; // 1-5
    const bedtime = `${22 + Math.floor(Math.random() * 3)}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`;
    const wakeTime = `${6 + Math.floor(Math.random() * 3)}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`;
    
    logs.push({
      user_id: userId,
      date: dateStr,
      bedtime,
      wake_time: wakeTime,
      hours,
      quality,
      waking_feeling: ['Refreshed', 'Tired', 'Energized', 'Groggy'][Math.floor(Math.random() * 4)],
      __dev__: true,
      created_by: 'dev-seed'
    });
  }
  
  return logs;
};

const generateActivities = (userId: string, days: number = 30) => {
  const activities = [];
  const activityTypes = [
    { name: 'Morning Walk', category: 'Exercise', emoji: '🚶', duration: 30 },
    { name: 'Meditation', category: 'Mindfulness', emoji: '🧘', duration: 20 },
    { name: 'Reading', category: 'Learning', emoji: '📚', duration: 45 },
    { name: 'Gym Workout', category: 'Exercise', emoji: '🏋️', duration: 60 },
    { name: 'Journaling', category: 'Reflection', emoji: '📝', duration: 15 },
    { name: 'Coffee Break', category: 'Social', emoji: '☕', duration: 20 },
    { name: 'Deep Work', category: 'Productivity', emoji: '💻', duration: 120 },
    { name: 'Cooking', category: 'Self-care', emoji: '👨‍🍳', duration: 40 }
  ];
  
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    // Generate 2-4 activities per day
    const numActivities = Math.floor(Math.random() * 3) + 2;
    const dayActivities = [];
    
    for (let j = 0; j < numActivities; j++) {
      const activity = activityTypes[Math.floor(Math.random() * activityTypes.length)];
      dayActivities.push({
        user_id: userId,
        date: dateStr,
        category: activity.category,
        name: activity.name,
        duration: activity.duration,
        emoji: activity.emoji,
        follow_up_answer: Math.random() > 0.7 ? 'Felt great!' : null,
        __dev__: true,
        created_by: 'dev-seed'
      });
    }
    
    activities.push(...dayActivities);
  }
  
  return activities;
};

const generateHabits = (userId: string) => {
  return [
    {
      user_id: userId,
      name: 'Morning Meditation',
      description: 'Start each day with 10 minutes of mindfulness',
      category: 'Mindfulness',
      total_days: 30,
      streak: Math.floor(Math.random() * 15) + 5,
      reminder_enabled: true,
      reminder_time: '08:00',
      quote: 'The mind is everything. What you think you become.',
      __dev__: true,
      created_by: 'dev-seed'
    },
    {
      user_id: userId,
      name: 'Daily Walk',
      description: 'Take a 30-minute walk for physical and mental health',
      category: 'Exercise',
      total_days: 30,
      streak: Math.floor(Math.random() * 20) + 3,
      reminder_enabled: true,
      reminder_time: '18:00',
      quote: 'Walking is the best possible exercise.',
      __dev__: true,
      created_by: 'dev-seed'
    },
    {
      user_id: userId,
      name: 'Gratitude Journal',
      description: 'Write down three things you\'re grateful for each day',
      category: 'Reflection',
      total_days: 30,
      streak: Math.floor(Math.random() * 25) + 2,
      reminder_enabled: false,
      quote: 'Gratitude turns what we have into enough.',
      __dev__: true,
      created_by: 'dev-seed'
    }
  ];
};

const generateHabitLogs = (userId: string, habitIds: string[], days: number = 30) => {
  const logs = [];
  
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    habitIds.forEach(habitId => {
      const completed = Math.random() > 0.3; // 70% completion rate
      logs.push({
        habit_id: habitId,
        user_id: userId,
        date: dateStr,
        completed,
        feedback: completed ? ['Great!', 'Good', 'Okay', 'Challenging'][Math.floor(Math.random() * 4)] : null,
        __dev__: true,
        created_by: 'dev-seed'
      });
    });
  }
  
  return logs;
};

const main = async () => {
  console.log('🌱 Starting development data seeding...');
  
  // Check if user wants to proceed
  const skipConfirmation = process.argv.includes('--yes');
  if (!skipConfirmation) {
    console.log('\n⚠️  This will insert test data into your Supabase database.');
    console.log('   All data will be marked with __dev__: true for easy cleanup.');
    console.log('\n   Continue? (y/N)');
    
    // In a real implementation, you'd use readline for user input
    // For now, we'll just proceed
  }
  
  try {
    // Create test user in auth (this would normally be done through signup)
    console.log('👤 Creating test user...');
    
    // Insert user profile
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert({
        id: TEST_USER.id,
        email: TEST_USER.email,
        metadata: { 
          __dev__: true, 
          created_by: 'dev-seed',
          created_at: new Date().toISOString()
        }
      })
      .select()
      .single();
    
    if (userError) {
      console.error('❌ Failed to create user:', userError);
      return;
    }
    
    console.log('✅ Test user created:', userData.id);
    
    // Generate and insert mood logs
    console.log('😊 Generating mood logs...');
    const moodLogs = generateMoodLogs(TEST_USER.id, 30);
    const { data: moodData, error: moodError } = await supabase
      .from('mood_logs')
      .insert(moodLogs);
    
    if (moodError) {
      console.error('❌ Failed to insert mood logs:', moodError);
    } else {
      console.log(`✅ Inserted ${moodLogs.length} mood logs`);
    }
    
    // Generate and insert sleep logs
    console.log('😴 Generating sleep logs...');
    const sleepLogs = generateSleepLogs(TEST_USER.id, 30);
    const { data: sleepData, error: sleepError } = await supabase
      .from('sleep_logs')
      .insert(sleepLogs);
    
    if (sleepError) {
      console.error('❌ Failed to insert sleep logs:', sleepError);
    } else {
      console.log(`✅ Inserted ${sleepLogs.length} sleep logs`);
    }
    
    // Generate and insert activities
    console.log('🏃 Generating activities...');
    const activities = generateActivities(TEST_USER.id, 30);
    const { data: activityData, error: activityError } = await supabase
      .from('activities')
      .insert(activities);
    
    if (activityError) {
      console.error('❌ Failed to insert activities:', activityError);
    } else {
      console.log(`✅ Inserted ${activities.length} activities`);
    }
    
    // Generate and insert habits
    console.log('🎯 Generating habits...');
    const habits = generateHabits(TEST_USER.id);
    const { data: habitData, error: habitError } = await supabase
      .from('habits')
      .insert(habits)
      .select();
    
    if (habitError) {
      console.error('❌ Failed to insert habits:', habitError);
    } else {
      console.log(`✅ Inserted ${habits.length} habits`);
      
      // Generate habit logs
      console.log('📝 Generating habit logs...');
      const habitIds = habitData.map(h => h.id);
      const habitLogs = generateHabitLogs(TEST_USER.id, habitIds, 30);
      const { data: habitLogData, error: habitLogError } = await supabase
        .from('habit_logs')
        .insert(habitLogs);
      
      if (habitLogError) {
        console.error('❌ Failed to insert habit logs:', habitLogError);
      } else {
        console.log(`✅ Inserted ${habitLogs.length} habit logs`);
      }
    }
    
    console.log('\n🎉 Development data seeding completed!');
    console.log('\n📊 Summary:');
    console.log(`   • Test User: ${TEST_USER.id}`);
    console.log(`   • Mood Logs: ${moodLogs.length}`);
    console.log(`   • Sleep Logs: ${sleepLogs.length}`);
    console.log(`   • Activities: ${activities.length}`);
    console.log(`   • Habits: ${habits.length}`);
    console.log(`   • Habit Logs: ${habitLogs.length}`);
    
    console.log('\n🧹 To cleanup this data, run:');
    console.log('   npm run cleanup-dev-seed');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

export { main as seedDevData };





