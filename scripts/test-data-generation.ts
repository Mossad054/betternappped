#!/usr/bin/env ts-node

/**
 * Test Data Generation Script
 * 
 * This script tests the data generation functions without connecting to Supabase.
 * Useful for debugging and verifying the generated data looks realistic.
 */

import { readFileSync } from 'fs';
import { join } from 'path';

// Load the same data generation logic from the main script
const getRandomElement = <T>(array: T[]): T => array[Math.floor(Math.random() * array.length)];
const getRandomInRange = (min: number, max: number): number => Math.random() * (max - min) + min;
const getRandomInt = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min;

const formatDate = (daysAgo: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split('T')[0];
};

const isWeekend = (daysAgo: number): boolean => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  const dayOfWeek = date.getDay();
  return dayOfWeek === 0 || dayOfWeek === 6;
};

const isMonday = (daysAgo: number): boolean => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.getDay() === 1;
};

// Mood data (simplified version)
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
  }
};

const generateMoodData = (userId: string, days: number) => {
  const moodLogs = [];
  
  for (let i = 0; i < days; i++) {
    let score: number;
    
    if (isWeekend(i)) {
      score = getRandomInt(3, 5);
    } else if (isMonday(i)) {
      score = getRandomInt(2, 4);
    } else {
      const rand = Math.random();
      if (rand < 0.1) score = 1;
      else if (rand < 0.25) score = 2;
      else if (rand < 0.6) score = 3;
      else if (rand < 0.9) score = 4;
      else score = 5;
    }
    
    const moods = moodData.moods[score as keyof typeof moodData.moods];
    const emojis = moodData.emojis[score as keyof typeof moodData.emojis];
    
    moodLogs.push({
      user_id: userId,
      date: formatDate(i),
      moods: [getRandomElement(moods)],
      score,
      emoji: getRandomElement(emojis),
      isWeekend: isWeekend(i),
      isMonday: isMonday(i)
    });
  }
  
  return moodLogs;
};

const generateSleepData = (userId: string, days: number) => {
  const sleepLogs = [];
  
  for (let i = 0; i < days; i++) {
    let hours: number;
    
    if (isWeekend(i)) {
      hours = getRandomInRange(7.5, 10);
    } else {
      hours = getRandomInRange(6, 8.5);
    }
    
    let quality: number;
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
    
    sleepLogs.push({
      user_id: userId,
      date: formatDate(i),
      hours: Math.round(hours * 10) / 10,
      quality,
      isWeekend: isWeekend(i)
    });
  }
  
  return sleepLogs;
};

const activityData = {
  categories: {
    exercise: ['Morning Run', 'Gym Workout', 'Yoga Session', 'Swimming'],
    social: ['Coffee with Friends', 'Dinner Party', 'Movie Night', 'Game Night'],
    work: ['Team Meeting', 'Project Work', 'Email Review', 'Presentation Prep'],
    hobbies: ['Reading', 'Painting', 'Cooking', 'Gardening'],
    relaxation: ['Meditation', 'Bath Time', 'Nature Walk', 'Journaling'],
    outdoor: ['Beach Walk', 'Park Visit', 'Picnic', 'Camping']
  }
};

const generateActivityData = (userId: string, days: number) => {
  const activities = [];
  
  for (let i = 0; i < days; i++) {
    const isWeekendDay = isWeekend(i);
    const numActivities = isWeekendDay ? getRandomInt(2, 4) : getRandomInt(1, 3);
    
    const usedCategories = new Set();
    
    for (let j = 0; j < numActivities; j++) {
      let availableCategories = isWeekendDay 
        ? ['social', 'outdoor', 'exercise', 'hobbies', 'relaxation']
        : ['work', 'exercise', 'hobbies', 'relaxation'];
      
      availableCategories = availableCategories.filter(cat => !usedCategories.has(cat));
      
      if (availableCategories.length === 0) break;
      
      const category = getRandomElement(availableCategories);
      usedCategories.add(category);
      
      const categoryActivities = activityData.categories[category as keyof typeof activityData.categories];
      
      activities.push({
        user_id: userId,
        date: formatDate(i),
        category,
        name: getRandomElement(categoryActivities),
        isWeekend: isWeekendDay
      });
    }
  }
  
  return activities;
};

// Test the data generation
const testUserId = 'test-user-123';
const testDays = 7;

console.log('🧪 Testing Data Generation Functions\n');

console.log('📝 Mood Data (7 days):');
const moodLogs = generateMoodData(testUserId, testDays);
moodLogs.forEach((log, index) => {
  console.log(`  Day ${index + 1} (${log.date}): ${log.emoji} Score ${log.score} - ${log.moods[0]} ${log.isWeekend ? '(Weekend)' : log.isMonday ? '(Monday)' : '(Weekday)'}`);
});

console.log('\n😴 Sleep Data (7 days):');
const sleepLogs = generateSleepData(testUserId, testDays);
sleepLogs.forEach((log, index) => {
  console.log(`  Day ${index + 1} (${log.date}): ${log.hours}h sleep, Quality ${log.quality} ${log.isWeekend ? '(Weekend)' : '(Weekday)'}`);
});

console.log('\n🎯 Activity Data (7 days):');
const activities = generateActivityData(testUserId, testDays);
activities.forEach((activity, index) => {
  console.log(`  Day ${index + 1} (${activity.date}): ${activity.category} - ${activity.name} ${activity.isWeekend ? '(Weekend)' : '(Weekday)'}`);
});

console.log('\n📊 Summary:');
console.log(`  Mood logs: ${moodLogs.length}`);
console.log(`  Sleep logs: ${sleepLogs.length}`);
console.log(`  Activities: ${activities.length}`);

// Analyze patterns
const weekendMoods = moodLogs.filter(log => log.isWeekend).map(log => log.score);
const weekdayMoods = moodLogs.filter(log => !log.isWeekend).map(log => log.score);
const weekendSleep = sleepLogs.filter(log => log.isWeekend).map(log => log.hours);
const weekdaySleep = sleepLogs.filter(log => !log.isWeekend).map(log => log.hours);

console.log('\n📈 Pattern Analysis:');
console.log(`  Weekend mood average: ${(weekendMoods.reduce((a, b) => a + b, 0) / weekendMoods.length).toFixed(2)}`);
console.log(`  Weekday mood average: ${(weekdayMoods.reduce((a, b) => a + b, 0) / weekdayMoods.length).toFixed(2)}`);
console.log(`  Weekend sleep average: ${(weekendSleep.reduce((a, b) => a + b, 0) / weekendSleep.length).toFixed(2)}h`);
console.log(`  Weekday sleep average: ${(weekdaySleep.reduce((a, b) => a + b, 0) / weekdaySleep.length).toFixed(2)}h`);

console.log('\n✅ Data generation test completed!');