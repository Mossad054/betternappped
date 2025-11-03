const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://czhlfautyqguodibjhdm.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN6aGxmYXV0eXFndW9kaWJqaGRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjExNDMwNzAsImV4cCI6MjA3NjcxOTA3MH0.tQrTGKjmJd0RVxawrepXvWgXfADwk-QCUUsVZbvB4xc';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function runTest() {
  console.log('🧪 Starting authentication and database test...\n');

  // Generate a unique test email
  const testEmail = `test.${Date.now()}@example.com`;
  const testPassword = 'Test123!@#';

  try {
    // 1. Test Sign Up
    console.log('📝 Testing user registration...');
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword
    });

    if (signUpError) throw signUpError;
    console.log('✅ User registration successful');
    console.log('👤 User ID:', signUpData.user.id);

    // 2. Test Sign In
    console.log('\n🔐 Testing user login...');
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    });

    if (signInError) throw signInError;
    console.log('✅ Login successful');

    // 3. Test Database Write
    console.log('\n💾 Testing database write...');
    const moodEntry = {
      user_id: signInData.user.id,
      date: new Date().toISOString().split('T')[0],
      moods: ['happy', 'energetic'],
      triggers: { food: true, sleep: true },
      score: 4,
      emoji: '😊',
      notes: 'Test mood entry'
    };

    const { data: insertData, error: insertError } = await supabase
      .from('mood_logs')
      .insert([moodEntry])
      .select();

    if (insertError) throw insertError;
    console.log('✅ Database write successful');
    console.log('📝 Created mood entry:', insertData[0].id);

    // 4. Test Database Read
    console.log('\n📖 Testing database read...');
    const { data: readData, error: readError } = await supabase
      .from('mood_logs')
      .select('*')
      .eq('id', insertData[0].id)
      .single();

    if (readError) throw readError;
    console.log('✅ Database read successful');
    console.log('📄 Retrieved mood entry:', {
      id: readData.id,
      date: readData.date,
      score: readData.score,
      emoji: readData.emoji
    });

    // 5. Clean up - Delete test data
    console.log('\n🧹 Cleaning up test data...');
    const { error: deleteError } = await supabase
      .from('mood_logs')
      .delete()
      .eq('id', insertData[0].id);

    if (deleteError) throw deleteError;
    console.log('✅ Test data cleaned up');

    // Sign out
    await supabase.auth.signOut();
    console.log('\n👋 Signed out test user');

    console.log('\n🎉 All tests passed successfully!');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  }
}

runTest();