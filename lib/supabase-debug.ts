import { supabase } from './supabase';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './constants';

export async function testSupabaseConnection() {
  console.log('🧪 Testing Supabase Connection...');
  console.log('📡 URL:', SUPABASE_URL);
  console.log('🔑 Anon Key:', SUPABASE_ANON_KEY ? `${SUPABASE_ANON_KEY.substring(0, 20)}...` : 'NOT SET');
  
  try {
    // Test basic connection
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('❌ Connection test failed:', error.message);
      return { success: false, error: error.message };
    }
    
    console.log('✅ Supabase connection successful');
    console.log('📊 Session data:', data?.session ? 'Session exists' : 'No active session');
    
    return { success: true, data };
  } catch (err) {
    console.error('💥 Connection test exception:', err);
    return { success: false, error: 'Network error or invalid configuration' };
  }
}

export function logAuthAttempt(type: 'signup' | 'signin', email: string) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🔐 AUTH ATTEMPT: ${type.toUpperCase()}`);
  console.log(`📧 Email: ${email}`);
  console.log(`⏰ Time: ${new Date().toISOString()}`);
  console.log(`📡 Supabase URL: ${SUPABASE_URL}`);
  console.log(`${'='.repeat(60)}\n`);
}

export function logAuthResult(type: 'signup' | 'signin', success: boolean, error?: string, data?: any) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`${success ? '✅' : '❌'} AUTH RESULT: ${type.toUpperCase()}`);
  console.log(`Success: ${success}`);
  if (error) console.log(`Error: ${error}`);
  if (data) console.log(`Data:`, JSON.stringify(data, null, 2));
  console.log(`${'='.repeat(60)}\n`);
}

