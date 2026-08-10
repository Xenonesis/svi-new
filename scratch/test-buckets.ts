import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function checkBuckets() {
  const { data, error } = await supabaseAdmin.storage.listBuckets();
  if (error) {
    console.error('Error fetching buckets:', error);
  } else {
    console.log(
      'Buckets:',
      data.map((b) => b.name)
    );
  }
}

checkBuckets();
