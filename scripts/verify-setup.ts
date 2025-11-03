#!/usr/bin/env node

/**
 * Supabase Setup Verification Script
 * 
 * This script verifies that your Supabase integration is properly configured
 * and can connect to your database.
 * 
 * Usage: npx ts-node scripts/verify-setup.ts
 */

import { createClient } from '@supabase/supabase-js';

// Configuration - update these with your actual values
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://your-project-id.supabase.co';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key-here';

interface VerificationResult {
  step: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  details?: any;
}

const results: VerificationResult[] = [];

function addResult(step: string, status: 'pass' | 'fail' | 'warning', message: string, details?: any) {
  results.push({ step, status, message, details });
}

async function verifySupabaseSetup() {
  console.log('🔍 Verifying Supabase Setup...\n');

  // Step 1: Check environment variables
  console.log('1️⃣ Checking environment variables...');
  if (SUPABASE_URL === 'https://your-project-id.supabase.co' || SUPABASE_ANON_KEY === 'your-anon-key-here') {
    addResult('Environment Variables', 'fail', 'Placeholder credentials detected. Update app.json with real Supabase URL and key.');
  } else {
    addResult('Environment Variables', 'pass', 'Credentials are configured (not placeholders).');
  }

  // Step 2: Test Supabase connection
  console.log('2️⃣ Testing Supabase connection...');
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // Test basic connection
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      addResult('Connection Test', 'fail', `Connection failed: ${error.message}`);
    } else {
      addResult('Connection Test', 'pass', 'Successfully connected to Supabase');
    }
  } catch (err) {
    addResult('Connection Test', 'fail', `Connection error: ${err}`);
  }

  // Step 3: Check database schema
  console.log('3️⃣ Checking database schema...');
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // Test if key tables exist by trying to query them
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    const { data: moodLogs, error: moodError } = await supabase
      .from('mood_logs')
      .select('count')
      .limit(1);
    
    if (usersError || moodError) {
      addResult('Database Schema', 'fail', 'Database schema not found. Run database/schema.sql in Supabase SQL Editor.');
    } else {
      addResult('Database Schema', 'pass', 'Database schema is properly set up');
    }
  } catch (err) {
    addResult('Database Schema', 'fail', `Schema check error: ${err}`);
  }

  // Step 4: Test authentication
  console.log('4️⃣ Testing authentication...');
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // Try to sign up a test user (this will fail if user exists, which is expected)
    const { data, error } = await supabase.auth.signUp({
      email: 'test@example.com',
      password: 'testpassword123'
    });
    
    if (error && error.message.includes('already registered')) {
      addResult('Authentication', 'pass', 'Authentication is working (test user already exists)');
    } else if (error) {
      addResult('Authentication', 'warning', `Authentication test: ${error.message}`);
    } else {
      addResult('Authentication', 'pass', 'Authentication is working (test user created)');
    }
  } catch (err) {
    addResult('Authentication', 'fail', `Authentication error: ${err}`);
  }

  // Step 5: Check for mock data
  console.log('5️⃣ Checking for sample data...');
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    const { data: moodCount, error: moodError } = await supabase
      .from('mood_logs')
      .select('*', { count: 'exact', head: true });
    
    const { data: habitCount, error: habitError } = await supabase
      .from('habits')
      .select('*', { count: 'exact', head: true });
    
    if (moodError || habitError) {
      addResult('Sample Data', 'warning', 'Could not check for sample data. Run database/seed-mock-data.sql to add test data.');
    } else {
      const hasData = (moodCount?.length || 0) > 0 || (habitCount?.length || 0) > 0;
      if (hasData) {
        addResult('Sample Data', 'pass', 'Sample data found in database');
      } else {
        addResult('Sample Data', 'warning', 'No sample data found. Run database/seed-mock-data.sql to add test data.');
      }
    }
  } catch (err) {
    addResult('Sample Data', 'warning', `Could not check sample data: ${err}`);
  }

  // Print results
  console.log('\n📊 Verification Results:');
  console.log('='.repeat(50));
  
  results.forEach((result, index) => {
    const icon = result.status === 'pass' ? '✅' : result.status === 'fail' ? '❌' : '⚠️';
    console.log(`${icon} ${result.step}: ${result.message}`);
    if (result.details) {
      console.log(`   Details: ${JSON.stringify(result.details, null, 2)}`);
    }
  });

  // Summary
  const passCount = results.filter(r => r.status === 'pass').length;
  const failCount = results.filter(r => r.status === 'fail').length;
  const warningCount = results.filter(r => r.status === 'warning').length;

  console.log('\n📈 Summary:');
  console.log(`✅ Passed: ${passCount}`);
  console.log(`⚠️  Warnings: ${warningCount}`);
  console.log(`❌ Failed: ${failCount}`);

  if (failCount === 0) {
    console.log('\n🎉 All critical checks passed! Your Supabase setup is ready.');
  } else {
    console.log('\n🔧 Please fix the failed checks before proceeding.');
    console.log('\n📚 Next steps:');
    console.log('1. Update app.json with your real Supabase URL and key');
    console.log('2. Run database/schema.sql in Supabase SQL Editor');
    console.log('3. Run database/auto-seed-new-user.sql for automatic data seeding');
    console.log('4. Test signup/signin in your app');
  }

  process.exit(failCount > 0 ? 1 : 0);
}

// Run the verification
verifySupabaseSetup().catch(console.error);

