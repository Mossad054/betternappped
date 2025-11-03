// Simple test to verify Supabase connection
// Run this with: node test-supabase-connection.js

const { createClient } = require('@supabase/supabase-js');

// Your Supabase credentials
const SUPABASE_URL = 'https://czhlfautyqguodibjhdm.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN6aGxmYXV0eXFndW9kaWJqaGRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjExNDMwNzAsImV4cCI6MjA3NjcxOTA3MH0.tQrTGKjmJd0RVxawrepXvWgXfADwk-QCUUsVZbvB4xc';

async function testConnection() {
  console.log('🧪 Testing Supabase Connection...');
  console.log('📡 URL:', SUPABASE_URL);
  console.log('🔑 Anon Key:', SUPABASE_ANON_KEY ? `${SUPABASE_ANON_KEY.substring(0, 20)}...` : 'NOT SET');
  
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // Test basic connection
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('❌ Connection test failed:', error.message);
      return false;
    }
    
    console.log('✅ Supabase connection successful!');
    console.log('📊 Session data:', data?.session ? 'Session exists' : 'No active session');
    
    // Test database access
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (usersError) {
      console.log('⚠️ Database schema not found. Run database/schema.sql in Supabase SQL Editor.');
    } else {
      console.log('✅ Database schema is properly set up');
    }
    
    return true;
  } catch (err) {
    console.error('💥 Connection test exception:', err);
    return false;
  }
}

testConnection().then(success => {
  if (success) {
    console.log('\n🎉 Supabase connection is working!');
  } else {
    console.log('\n🔧 Please fix the connection issues.');
    console.log('\n📚 Next steps:');
    console.log('1. Get your real anon key from Supabase dashboard → Settings → API');
    console.log('2. Replace YOUR_ACTUAL_ANON_KEY_HERE in app.json');
    console.log('3. Run database/schema.sql in Supabase SQL Editor');
    console.log('4. Test again');
  }
});

