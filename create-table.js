const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

console.log('⚠️  Note: The anon key may not have permissions to create tables.');
console.log('    You may need to run the SQL migration manually in the Supabase dashboard.');
console.log('    File: database/migrations/create_habits_library.sql\n');

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTable() {
  console.log('🔍 Checking if habits_library table exists...\n');

  const { data, error } = await supabase
    .from('habits_library')
    .select('id')
    .limit(1);

  if (error) {
    if (error.code === 'PGRST205') {
      console.log('❌ Table does NOT exist');
      console.log('\n📋 Steps to create the table:');
      console.log('   1. Go to Supabase Dashboard > SQL Editor');
      console.log('   2. Copy the contents of: database/migrations/create_habits_library.sql');
      console.log('   3. Paste and run the SQL');
      console.log('   4. Then run: node seed-intimacy-to-library.js\n');
      return false;
    }
    console.error('Error:', error);
    return false;
  }

  console.log('✅ Table exists!');
  console.log('   You can now run: node seed-intimacy-to-library.js\n');
  return true;
}

checkTable();
