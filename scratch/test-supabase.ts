import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('Missing Supabase credentials in env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

async function main() {
  console.log('Querying email_inbox table...');
  const { data, error } = await supabase
    .from('email_inbox')
    .select('id, email_id, thread_id, subject, from_email, from_name, to_emails, received_at')
    .order('received_at', { ascending: false });

  if (error) {
    console.error('Error querying email_inbox:', error);
  } else {
    console.log('Total records in database email_inbox:', data.length);
    console.log('Records:', JSON.stringify(data, null, 2));
  }
}

main().catch(console.error);
