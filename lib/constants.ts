import Constants from 'expo-constants';

export const SUPABASE_URL = Constants.expoConfig?.extra?.supabaseUrl || process.env.EXPO_PUBLIC_SUPABASE_URL;
export const SUPABASE_ANON_KEY = Constants.expoConfig?.extra?.supabaseAnonKey || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY || SUPABASE_URL === 'https://your-project-id.supabase.co' || SUPABASE_ANON_KEY === 'your-anon-key-here') {
  console.warn('⚠️ Supabase environment variables not configured. Using mock data mode.');
  console.warn('To enable Supabase:');
  console.warn('1. Create a Supabase project at https://supabase.com/dashboard');
  console.warn('2. Update app.json with your Supabase URL and anon key');
  console.warn('3. Run the database schema from database/schema.sql in your Supabase SQL editor');
}
