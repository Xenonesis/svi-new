import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkConnection() {
  console.log('Testing Supabase connection...');
  // We can just query something simple or call an RPC, but doing a simple select limit 1 is safe.
  // We don't know the table names, but checking auth or just hitting a generic endpoint can work.
  // Or we can just check 'pgmeta' if possible, or any table. Let's try to query an invalid table and expect a 4xx, not a 5xx or network error.
  const { data, error } = await supabase.from('_dummy_table_check_').select('*').limit(1);
  
  if (error) {
    if (error.code === '42P01') {
      console.log('✅ Connection successful. The database is reachable (received expected relation does not exist error).');
    } else {
      console.error('❌ Connection failed or returned unexpected error:', error);
    }
  } else {
    console.log('✅ Connection successful.');
  }
}

checkConnection();
