const { createClient } = require('@supabase/supabase-js');

// Current database credentials from your config
const SUPABASE_URL = 'https://czhlfautyqguodibjhdm.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN6aGxmYXV0eXFndW9kaWJqaGRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjExNDMwNzAsImV4cCI6MjA3NjcxOTA3MH0.tQrTGKjmJd0RVxawrepXvWgXfADwk-QCUUsVZbvB4xc';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log('🔍 Testing Authentication Flow...\n');

async function testAuthFlow() {
  try {
    // Generate unique test email
    const testEmail = `test_${Date.now()}@example.com`;
    const testPassword = 'Test123456!';

    console.log('📧 Test email:', testEmail);
    console.log('🔐 Test password:', testPassword);
    console.log('');

    // Test 1: Sign Up
    console.log('✅ Step 1: Testing Sign Up...');
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
    });

    if (signUpError) {
      console.error('❌ Sign Up Failed:', signUpError.message);
      console.error('Error details:', signUpError);
      return;
    }

    console.log('✅ Sign Up Successful!');
    console.log('   User ID:', signUpData.user?.id);
    console.log('   Email:', signUpData.user?.email);
    console.log('   Email Confirmed:', signUpData.user?.email_confirmed_at ? 'Yes' : 'No (requires confirmation)');
    console.log('   Session:', signUpData.session ? 'Created' : 'None (email confirmation required)');
    console.log('');

    // Wait a moment for trigger to execute
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Test 2: Check if user record was created
    console.log('✅ Step 2: Checking if user record was created...');
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', testEmail)
      .single();

    if (userError) {
      console.error('❌ User record NOT found in users table');
      console.error('   Error:', userError.message);
      console.error('   This means the database trigger "handle_new_user" is not working!');
    } else {
      console.log('✅ User record found in users table');
      console.log('   User ID:', userData.id);
      console.log('   Email:', userData.email);
    }
    console.log('');

    // Test 3: Check if profile was created
    console.log('✅ Step 3: Checking if profile was created...');
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', testEmail)
      .single();

    if (profileError) {
      console.error('❌ Profile record NOT found in profiles table');
      console.error('   Error:', profileError.message);
      console.error('   This means the database trigger "handle_new_user" is not creating profiles!');
    } else {
      console.log('✅ Profile record found in profiles table');
      console.log('   Profile ID:', profileData.id);
      console.log('   Email:', profileData.email);
      console.log('   Full Name:', profileData.full_name || '(not set)');
    }
    console.log('');

    // Test 4: Check if preferences were created
    console.log('✅ Step 4: Checking if user preferences were created...');
    const { data: prefsData, error: prefsError } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('id', signUpData.user?.id)
      .single();

    if (prefsError) {
      console.error('❌ User preferences NOT found');
      console.error('   Error:', prefsError.message);
      console.error('   This means the database trigger "handle_new_user" is not creating preferences!');
    } else {
      console.log('✅ User preferences found');
      console.log('   Theme:', prefsData.theme_mode);
      console.log('   Color Theme:', prefsData.color_theme);
    }
    console.log('');

    // Test 5: Test Sign In
    console.log('✅ Step 5: Testing Sign In...');
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword,
    });

    if (signInError) {
      console.error('❌ Sign In Failed:', signInError.message);
      console.error('Error details:', signInError);
      
      if (signInError.message.includes('Email not confirmed')) {
        console.log('');
        console.log('📧 NOTE: This is expected if email confirmation is required.');
        console.log('   Check your Supabase Auth settings:');
        console.log('   1. Go to: Authentication > Settings');
        console.log('   2. Look for "Email confirmation"');
        console.log('   3. If enabled, you need to confirm the email first');
        console.log('   4. For development, you can disable email confirmation');
      }
    } else {
      console.log('✅ Sign In Successful!');
      console.log('   Session:', signInData.session ? 'Created' : 'None');
      console.log('   Access Token:', signInData.session?.access_token ? 'Valid' : 'None');
    }
    console.log('');

    // Summary
    console.log('═══════════════════════════════════════════════');
    console.log('📊 TEST SUMMARY');
    console.log('═══════════════════════════════════════════════');
    console.log('Sign Up:', signUpError ? '❌ FAILED' : '✅ PASSED');
    console.log('User Record:', userError ? '❌ FAILED' : '✅ PASSED');
    console.log('Profile Record:', profileError ? '❌ FAILED' : '✅ PASSED');
    console.log('User Preferences:', prefsError ? '❌ FAILED' : '✅ PASSED');
    console.log('Sign In:', signInError ? '❌ FAILED (see notes)' : '✅ PASSED');
    console.log('═══════════════════════════════════════════════');

    if (!userError && !profileError && !prefsError) {
      console.log('');
      console.log('🎉 All database triggers are working correctly!');
      console.log('   Your schema is properly set up.');
    } else {
      console.log('');
      console.log('⚠️  ISSUE DETECTED: Database triggers are not working!');
      console.log('');
      console.log('🔧 To fix this, run the schema SQL in your Supabase SQL Editor:');
      console.log('   1. Go to: https://supabase.com/dashboard/project/ujeuntzazwtajjhoyebz/sql');
      console.log('   2. Open: database/newschema.sql');
      console.log('   3. Run the entire SQL script');
      console.log('   4. Run this test again');
    }

  } catch (error) {
    console.error('❌ Test failed with exception:', error);
  }
}

testAuthFlow();
