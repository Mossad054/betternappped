#!/usr/bin/env ts-node

/**
 * Supabase Data Seeding Script
 * 
 * This script connects to your Supabase instance and generates realistic mock data
 * for testing your Betternapped app UI and analytics features.
 * 
 * Usage:
 *   npm run seed-data                    # Seed 30 days of data
 *   npm run seed-data -- --days 90      # Seed 90 days of data
 *   npm run seed-data -- --user-id "uuid" # Seed for specific user
 *   npm run seed-data -- --dry-run      # Preview data without inserting
 *   npm run seed-data -- --clear        # Clear existing data first
 * 
 * Requirements:
 *   - Supabase credentials configured in app.json
 *   - User must exist in auth.users table
 *   - Database tables must be created (run database/schema.sql)
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

// Parse command line arguments
const args = process.argv.slice(2);
const days = parseInt(args.find(arg => arg.startsWith('--days='))?.split('=')[1] || '30');
const userId = args.find(arg => arg.startsWith('--user-id='))?.split('=')[1];
const dryRun = args.includes('--dry-run');
const clearData = args.includes('--clear');

// Load Supabase credentials from app.json
const appConfig = JSON.parse(readFileSync(join(__dirname, '../app.json'), 'utf8'));
const supabaseUrl = appConfig.expo.extra?.supabaseUrl;
const supabaseAnonKey = appConfig.expo.extra?.supabaseAnonKey;

if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'https://your-project-id.supabase.co') {
  console.error('❌ Supabase credentials not configured in app.json');
  console.error('Please update app.json with your Supabase URL and anon key');
  process.exit(1);
}

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Data generation utilities
const getRandomElement = <T>(array: T[]): T => array[Math.floor(Math.random() * array.length)];
const getRandomInRange = (min: number, max: number): number => Math.random() * (max - min) + min;
const getRandomInt = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min;

// Format date for database
const formatDate = (daysAgo: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split('T')[0];
};

// Check if it's a weekend
const isWeekend = (daysAgo: number): boolean => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  const dayOfWeek = date.getDay();
  return dayOfWeek === 0 || dayOfWeek === 6; // Sunday or Saturday
};

// Check if it's Monday
const isMonday = (daysAgo: number): boolean => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.getDay() === 1;
};

// Mood data generation
const moodData = {
  scores: [1, 2, 3, 4, 5],
  moods: {
    1: ['Sad', 'Depressed', 'Hopeless', 'Lonely', 'Overwhelmed'],
    2: ['Frustrated', 'Anxious', 'Stressed', 'Tired', 'Worried'],
    3: ['Neutral', 'Calm', 'Content', 'Okay', 'Fine'],
    4: ['Happy', 'Energetic', 'Confident', 'Grateful', 'Excited'],
    5: ['Joyful', 'Ecstatic', 'Proud', 'Elated', 'Blissful']
  },
  emojis: {
    1: ['😢', '😔', '😞', '😰', '😭'],
    2: ['😟', '😕', '😤', '😰', '😴'],
    3: ['😐', '😌', '🙂', '🤔', '😊'],
    4: ['😊', '😄', '😃', '🙂', '😁'],
    5: ['😄', '🤩', '🥳', '😍', '🤗']
  },
  notes: {
    1: ['Having a tough day', 'Feeling overwhelmed', 'Need some support', 'Struggling today'],
    2: ['Work is stressful', 'Feeling anxious', 'Not my best day', 'Tired and frustrated'],
    3: ['Average day', 'Nothing special', 'Feeling okay', 'Just getting by'],
    4: ['Great day overall!', 'Feeling good', 'Productive day', 'Things are going well'],
    5: ['Amazing day!', 'Everything is perfect', 'On top of the world', 'Best day ever!']
  }
};

const generateMoodData = (userId: string, days: number) => {
  const moodLogs = [];
  
  for (let i = 0; i < days; i++) {
    // Generate mood score with realistic patterns
    let score: number;
    
    if (isWeekend(i)) {
      // Weekends tend to be more positive
      score = getRandomInt(3, 5);
    } else if (isMonday(i)) {
      // Monday blues
      score = getRandomInt(2, 4);
    } else {
      // Regular weekday - more 3-4 scores
      const rand = Math.random();
      if (rand < 0.1) score = 1; // 10% chance of very bad
      else if (rand < 0.25) score = 2; // 15% chance of bad
      else if (rand < 0.6) score = 3; // 35% chance of neutral
      else if (rand < 0.9) score = 4; // 30% chance of good
      else score = 5; // 10% chance of very good
    }
    
    const moods = moodData.moods[score as keyof typeof moodData.moods];
    const emojis = moodData.emojis[score as keyof typeof moodData.emojis];
    const notes = moodData.notes[score as keyof typeof moodData.notes];
    
    moodLogs.push({
      user_id: userId,
      date: formatDate(i),
      moods: [getRandomElement(moods)],
      triggers: {},
      score,
      emoji: getRandomElement(emojis),
      notes: Math.random() < 0.7 ? getRandomElement(notes) : null
    });
  }
  
  return moodLogs;
};

// Sleep data generation
const sleepData = {
  wakingFeelings: ['refreshed', 'tired', 'groggy', 'energetic', 'rested', 'exhausted', 'alert', 'drowsy'],
  qualityFactors: {
    excellent: { minHours: 8, maxHours: 9.5, quality: 5 },
    good: { minHours: 7, maxHours: 8.5, quality: 4 },
    fair: { minHours: 6, maxHours: 7.5, quality: 3 },
    poor: { minHours: 5, maxHours: 6.5, quality: 2 },
    terrible: { minHours: 4, maxHours: 5.5, quality: 1 }
  }
};

const generateSleepData = (userId: string, days: number) => {
  const sleepLogs = [];
  
  for (let i = 0; i < days; i++) {
    // Generate sleep hours with realistic patterns
    let hours: number;
    let quality: number;
    
    if (isWeekend(i)) {
      // Weekend sleep tends to be longer
      hours = getRandomInRange(7.5, 10);
    } else {
      // Weekday sleep more consistent
      hours = getRandomInRange(6, 8.5);
    }
    
    // Determine quality based on hours
    if (hours >= 8 && hours <= 9.5) {
      quality = 5;
    } else if (hours >= 7 && hours < 8) {
      quality = 4;
    } else if (hours >= 6 && hours < 7) {
      quality = 3;
    } else if (hours >= 5 && hours < 6) {
      quality = 2;
    } else {
      quality = 1;
    }
    
    // Calculate bedtime and wake time
    const wakeTime = 7; // 7 AM default
    const bedtime = wakeTime - hours;
    const bedtimeHour = Math.floor(bedtime);
    const bedtimeMinute = Math.floor((bedtime - bedtimeHour) * 60);
    const wakeTimeHour = Math.floor(wakeTime);
    const wakeTimeMinute = Math.floor((wakeTime - wakeTimeHour) * 60);
    
    const bedtimeStr = `${bedtimeHour.toString().padStart(2, '0')}:${bedtimeMinute.toString().padStart(2, '0')}`;
    const wakeTimeStr = `${wakeTimeHour.toString().padStart(2, '0')}:${wakeTimeMinute.toString().padStart(2, '0')}`;
    
    sleepLogs.push({
      user_id: userId,
      date: formatDate(i),
      bedtime: bedtimeStr,
      wake_time: wakeTimeStr,
      hours: Math.round(hours * 10) / 10, // Round to 1 decimal
      quality,
      waking_feeling: getRandomElement(sleepData.wakingFeelings)
    });
  }
  
  return sleepLogs;
};

// Activity data generation
const activityData = {
  categories: {
    exercise: {
      names: ['Morning Run', 'Gym Workout', 'Yoga Session', 'Swimming', 'Cycling', 'Hiking', 'Dance Class', 'Weight Training'],
      emojis: ['🏃‍♂️', '💪', '🧘‍♀️', '🏊‍♂️', '🚴‍♂️', '🥾', '💃', '🏋️‍♂️'],
      duration: { min: 30, max: 120 }
    },
    social: {
      names: ['Coffee with Friends', 'Dinner Party', 'Movie Night', 'Game Night', 'Phone Call', 'Video Chat', 'Date Night', 'Family Time'],
      emojis: ['☕', '🍽️', '🎬', '🎮', '📞', '💻', '💕', '👨‍👩‍👧‍👦'],
      duration: { min: 60, max: 240 }
    },
    work: {
      names: ['Team Meeting', 'Project Work', 'Email Review', 'Presentation Prep', 'Client Call', 'Code Review', 'Research', 'Planning'],
      emojis: ['👥', '💼', '📧', '📊', '📞', '💻', '🔍', '📋'],
      duration: { min: 30, max: 180 }
    },
    hobbies: {
      names: ['Reading', 'Painting', 'Cooking', 'Gardening', 'Photography', 'Writing', 'Music Practice', 'Crafting'],
      emojis: ['📚', '🎨', '👨‍🍳', '🌱', '📸', '✍️', '🎵', '✂️'],
      duration: { min: 45, max: 180 }
    },
    relaxation: {
      names: ['Meditation', 'Bath Time', 'Nature Walk', 'Journaling', 'Listening to Music', 'Stargazing', 'Tea Time', 'Nap'],
      emojis: ['🧘‍♂️', '🛁', '🌿', '📝', '🎧', '⭐', '🍵', '😴'],
      duration: { min: 15, max: 90 }
    },
    outdoor: {
      names: ['Beach Walk', 'Park Visit', 'Picnic', 'Camping', 'Fishing', 'Skiing', 'Surfing', 'Rock Climbing'],
      emojis: ['🏖️', '🌳', '🧺', '⛺', '🎣', '⛷️', '🏄‍♂️', '🧗‍♂️'],
      duration: { min: 60, max: 300 }
    }
  }
};

const generateActivityData = (userId: string, days: number) => {
  const activities = [];
  
  for (let i = 0; i < days; i++) {
    const isWeekendDay = isWeekend(i);
    const isWeekday = !isWeekendDay;
    
    // Determine how many activities per day (1-4)
    const numActivities = isWeekendDay ? getRandomInt(2, 4) : getRandomInt(1, 3);
    
    const usedCategories = new Set();
    
    for (let j = 0; j < numActivities; j++) {
      // Select category based on day type
      let availableCategories = Object.keys(activityData.categories);
      
      if (isWeekday) {
        // More work activities on weekdays
        availableCategories = ['work', 'exercise', 'hobbies', 'relaxation'];
      } else {
        // More social and outdoor activities on weekends
        availableCategories = ['social', 'outdoor', 'exercise', 'hobbies', 'relaxation'];
      }
      
      // Remove already used categories for this day
      availableCategories = availableCategories.filter(cat => !usedCategories.has(cat));
      
      if (availableCategories.length === 0) break;
      
      const category = getRandomElement(availableCategories);
      usedCategories.add(category);
      
      const categoryData = activityData.categories[category as keyof typeof activityData.categories];
      const duration = getRandomInt(categoryData.duration.min, categoryData.duration.max);
      
      activities.push({
        user_id: userId,
        date: formatDate(i),
        category,
        name: getRandomElement(categoryData.names),
        duration,
        emoji: getRandomElement(categoryData.emojis),
        follow_up_answer: Math.random() < 0.3 ? 'Great activity!' : null
      });
    }
  }
  
  return activities;
};

// Main execution function
const main = async () => {
  console.log('🌱 Starting Supabase data seeding...\n');
  
  try {
    // Test connection
    console.log('🔌 Testing Supabase connection...');
    const { data: testData, error: testError } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.error('❌ Failed to connect to Supabase:', testError.message);
      process.exit(1);
    }
    console.log('✅ Connected to Supabase successfully\n');
    
    // Get or validate user ID
    let targetUserId = userId;
    
    if (!targetUserId) {
      console.log('👤 Getting user ID from auth.users...');
      const { data: users, error: userError } = await supabase.auth.getUser();
      
      if (userError || !users.user) {
        console.error('❌ No authenticated user found. Please:');
        console.error('   1. Sign in to your app first, or');
        console.error('   2. Use --user-id="your-user-id" to specify a user ID');
        process.exit(1);
      }
      
      targetUserId = users.user.id;
      console.log(`✅ Using user ID: ${targetUserId}\n`);
    } else {
      // Validate the provided user ID exists
      const { data: userExists, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('id', targetUserId)
        .single();
      
      if (userError || !userExists) {
        console.error(`❌ User ID ${targetUserId} not found in users table`);
        process.exit(1);
      }
      console.log(`✅ Using provided user ID: ${targetUserId}\n`);
    }
    
    // Clear existing data if requested
    if (clearData) {
      console.log('🗑️  Clearing existing data...');
      
      if (!dryRun) {
        const { error: moodError } = await supabase
          .from('mood_logs')
          .delete()
          .eq('user_id', targetUserId);
        
        const { error: sleepError } = await supabase
          .from('sleep_logs')
          .delete()
          .eq('user_id', targetUserId);
        
        const { error: activityError } = await supabase
          .from('activities')
          .delete()
          .eq('user_id', targetUserId);
        
        if (moodError || sleepError || activityError) {
          console.error('❌ Error clearing data:', { moodError, sleepError, activityError });
          process.exit(1);
        }
      }
      
      console.log('✅ Existing data cleared\n');
    }
    
    // Generate data
    console.log(`📊 Generating ${days} days of mock data...`);
    const moodLogs = generateMoodData(targetUserId, days);
    const sleepLogs = generateSleepData(targetUserId, days);
    const activities = generateActivityData(targetUserId, days);
    
    console.log(`   📝 Mood logs: ${moodLogs.length}`);
    console.log(`   😴 Sleep logs: ${sleepLogs.length}`);
    console.log(`   🎯 Activities: ${activities.length}\n`);
    
    if (dryRun) {
      console.log('🔍 DRY RUN - Preview of generated data:');
      console.log('\n📝 Sample Mood Log:');
      console.log(JSON.stringify(moodLogs[0], null, 2));
      console.log('\n😴 Sample Sleep Log:');
      console.log(JSON.stringify(sleepLogs[0], null, 2));
      console.log('\n🎯 Sample Activities:');
      console.log(JSON.stringify(activities.slice(0, 3), null, 2));
      console.log('\n✅ Dry run complete. Use without --dry-run to insert data.');
      return;
    }
    
    // Insert data
    console.log('💾 Inserting data into Supabase...');
    
    // Insert mood logs
    console.log('   📝 Inserting mood logs...');
    const { error: moodError } = await supabase
      .from('mood_logs')
      .insert(moodLogs);
    
    if (moodError) {
      console.error('❌ Error inserting mood logs:', moodError);
      process.exit(1);
    }
    
    // Insert sleep logs
    console.log('   😴 Inserting sleep logs...');
    const { error: sleepError } = await supabase
      .from('sleep_logs')
      .insert(sleepLogs);
    
    if (sleepError) {
      console.error('❌ Error inserting sleep logs:', sleepError);
      process.exit(1);
    }
    
    // Insert activities
    console.log('   🎯 Inserting activities...');
    const { error: activityError } = await supabase
      .from('activities')
      .insert(activities);
    
    if (activityError) {
      console.error('❌ Error inserting activities:', activityError);
      process.exit(1);
    }
    
    console.log('\n🎉 Data seeding completed successfully!');
    console.log(`📊 Summary:`);
    console.log(`   📝 Mood logs: ${moodLogs.length} inserted`);
    console.log(`   😴 Sleep logs: ${sleepLogs.length} inserted`);
    console.log(`   🎯 Activities: ${activities.length} inserted`);
    console.log(`   👤 User ID: ${targetUserId}`);
    console.log(`   📅 Days: ${days}`);
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  }
};

// Run the script
main();