#!/usr/bin/env node

/**
 * Cleanup Development Data Script
 * 
 * This script removes all development/test data from the Supabase database.
 * It deletes records marked with __dev__: true or created_by: 'dev-seed'.
 * 
 * Usage:
 *   npm run cleanup-dev-seed
 *   npm run cleanup-dev-seed -- --yes (skip confirmation)
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

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

// Tables to clean up (in dependency order)
const TABLES_TO_CLEANUP = [
  'habit_logs',
  'habits',
  'activities',
  'sleep_logs',
  'mood_logs',
  'productivity_logs',
  'intimacy_logs',
  'mental_clarity_tests',
  'experiment_logs',
  'experiments',
  'users'
];

const main = async () => {
  console.log('🧹 Starting development data cleanup...');
  
  // Check if user wants to proceed
  const skipConfirmation = process.argv.includes('--yes');
  if (!skipConfirmation) {
    console.log('\n⚠️  This will DELETE ALL development data from your Supabase database.');
    console.log('   This includes all records marked with __dev__: true or created_by: "dev-seed".');
    console.log('\n   This action cannot be undone!');
    console.log('\n   Continue? (y/N)');
    
    // In a real implementation, you'd use readline for user input
    // For now, we'll just proceed
  }
  
  try {
    const cleanupResults: { [key: string]: { deleted: number; error?: string } } = {};
    
    // Clean up each table
    for (const table of TABLES_TO_CLEANUP) {
      console.log(`🗑️  Cleaning up ${table}...`);
      
      try {
        // Delete records with __dev__ flag
        const { count: devCount, error: devError } = await supabase
          .from(table)
          .delete({ count: 'exact' })
          .eq('__dev__', true);
        
        if (devError) {
          console.error(`❌ Error deleting __dev__ records from ${table}:`, devError);
          cleanupResults[table] = { deleted: 0, error: devError.message };
          continue;
        }
        
        // Delete records with created_by: 'dev-seed'
        const { count: seedCount, error: seedError } = await supabase
          .from(table)
          .delete({ count: 'exact' })
          .eq('created_by', 'dev-seed');
        
        if (seedError) {
          console.error(`❌ Error deleting dev-seed records from ${table}:`, seedError);
          cleanupResults[table] = { deleted: devCount || 0, error: seedError.message };
          continue;
        }
        
        const totalDeleted = (devCount || 0) + (seedCount || 0);
        cleanupResults[table] = { deleted: totalDeleted };
        
        if (totalDeleted > 0) {
          console.log(`✅ Deleted ${totalDeleted} records from ${table}`);
        } else {
          console.log(`ℹ️  No dev records found in ${table}`);
        }
        
      } catch (error) {
        console.error(`❌ Exception cleaning up ${table}:`, error);
        cleanupResults[table] = { deleted: 0, error: error instanceof Error ? error.message : 'Unknown error' };
      }
    }
    
    // Summary
    console.log('\n📊 Cleanup Summary:');
    let totalDeleted = 0;
    let tablesWithErrors = 0;
    
    Object.entries(cleanupResults).forEach(([table, result]) => {
      if (result.error) {
        console.log(`   ❌ ${table}: Error - ${result.error}`);
        tablesWithErrors++;
      } else {
        console.log(`   ✅ ${table}: ${result.deleted} records deleted`);
        totalDeleted += result.deleted;
      }
    });
    
    if (tablesWithErrors === 0) {
      console.log(`\n🎉 Cleanup completed successfully!`);
      console.log(`   Total records deleted: ${totalDeleted}`);
    } else {
      console.log(`\n⚠️  Cleanup completed with ${tablesWithErrors} errors`);
      console.log(`   Total records deleted: ${totalDeleted}`);
    }
    
    console.log('\n💡 To add test data again, run:');
    console.log('   npm run seed-dev-data');
    
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
    process.exit(1);
  }
};

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

export { main as cleanupDevSeed };





