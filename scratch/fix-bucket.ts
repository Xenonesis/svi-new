import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function fixBucket() {
  const { data, error } = await supabaseAdmin.storage.updateBucket('email-attachments', {
    public: true,
  });
  if (error) {
    console.error('Error updating bucket:', error);
  } else {
    console.log('Bucket successfully updated to public:', data);
  }
}

fixBucket();
