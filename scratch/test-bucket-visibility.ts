import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function checkBucketVisibility() {
  const { data, error } = await supabaseAdmin.storage.getBucket('email-attachments');
  if (error) {
    console.error('Error fetching bucket:', error);
  } else {
    console.log('Bucket public status:', data.public);
  }
}

checkBucketVisibility();
