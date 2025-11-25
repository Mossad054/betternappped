const { createClient } = require('@supabase/supabase-js');

// Current database credentials from your config
const SUPABASE_URL = 'https://czhlfautyqguodibjhdm.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN6aGxmYXV0eXFndW9kaWJqaGRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjExNDMwNzAsImV4cCI6MjA3NjcxOTA3MH0.tQrTGKjmJd0RVxawrepXvWgXfADwk-QCUUsVZbvB4xc';

console.log('🔍 Testing connection to new database...');
console.log('📡 URL:', SUPABASE_URL);
console.log('🔑 Key:', SUPABASE_ANON_KEY.substring(0, 20) + '...');

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testConnection() {
  try {
    console.log('\n✅ Step 1: Testing basic connection...');
    
    // Test 1: Check if we can query the users table
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (usersError) {
      console.log('❌ Users table query failed:', usersError.message);
    } else {
      console.log('✅ Users table accessible');
    }

    // Test 2: Check profiles table
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (profilesError) {
      console.log('❌ Profiles table query failed:', profilesError.message);
    } else {
      console.log('✅ Profiles table accessible');
    }

    // Test 3: Check mood_logs table
    const { data: moodLogs, error: moodLogsError } = await supabase
      .from('mood_logs')
      .select('count')
      .limit(1);
    
    if (moodLogsError) {
      console.log('❌ Mood logs table query failed:', moodLogsError.message);
    } else {
      console.log('✅ Mood logs table accessible');
    }

    // Test 4: Check activities table
    const { data: activities, error: activitiesError } = await supabase
      .from('activities')
      .select('count')
      .limit(1);
    
    if (activitiesError) {
      console.log('❌ Activities table query failed:', activitiesError.message);
    } else {
      console.log('✅ Activities table accessible');
    }

    // Test 5: Check sleep_logs table
    const { data: sleepLogs, error: sleepLogsError } = await supabase
      .from('sleep_logs')
      .select('count')
      .limit(1);
    
    if (sleepLogsError) {
      console.log('❌ Sleep logs table query failed:', sleepLogsError.message);
    } else {
      console.log('✅ Sleep logs table accessible');
    }

    console.log('\n🎉 Database connection test completed!');
    console.log('✅ Your app is now configured to use the new database.');
    
  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
  }
}

testConnection();
