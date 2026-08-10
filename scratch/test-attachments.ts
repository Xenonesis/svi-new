import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function checkAttachments() {
  const { data, error } = await supabaseAdmin
    .from('email_attachments')
    .select('*')
    .ilike('filename', '%Bhawna Kapoor%');
  if (error) {
    console.error('Error fetching attachments:', error);
  } else {
    console.log('Found attachments:', data);
  }
}

checkAttachments();
