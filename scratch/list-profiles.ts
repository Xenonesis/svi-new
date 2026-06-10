import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, email, full_name, role');
  if (error) {
    console.error('Error fetching profiles:', error);
    return;
  }
  console.log('Profiles in DB:', JSON.stringify(profiles, null, 2));
}

run();
