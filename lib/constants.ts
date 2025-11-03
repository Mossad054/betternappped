import Constants from 'expo-constants';

console.log('📝 Debug - Expo Config:', Constants.expoConfig?.extra);
export const SUPABASE_URL = Constants.expoConfig?.extra?.supabaseUrl || process.env.EXPO_PUBLIC_SUPABASE_URL;
export const SUPABASE_ANON_KEY = Constants.expoConfig?.extra?.supabaseAnonKey || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
console.log('🔑 Debug - SUPABASE_URL:', SUPABASE_URL);
console.log('🔑 Debug - SUPABASE_ANON_KEY:', SUPABASE_ANON_KEY?.substring(0, 10) + '...');

// Configuration flags
export const IS_SUPABASE_CONFIGURED = 
  SUPABASE_URL !== 'https://your-project-id.supabase.co' &&
  SUPABASE_ANON_KEY !== 'YOUR_ACTUAL_ANON_KEY_HERE' &&
  !!SUPABASE_URL && 
  !!SUPABASE_ANON_KEY;

export const USE_MOCK_DATA = !IS_SUPABASE_CONFIGURED;

if (!IS_SUPABASE_CONFIGURED) {
  console.warn('⚠️ Supabase environment variables not configured. Using mock data mode.');
  console.warn('To enable Supabase:');
  console.warn('1. Create a Supabase project at https://supabase.com/dashboard');
  console.warn('2. Update app.json with your Supabase URL and anon key');
  console.warn('3. Run the database schema from database/schema.sql in your Supabase SQL editor');
} else {
  console.log('✅ Supabase configuration detected');
}
