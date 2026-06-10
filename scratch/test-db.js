import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function main() {
  const { data, error } = await supabase
    .from('email_inbox')
    .select('*')
    .order('received_at', { ascending: false });

  if (error) {
    console.error('Error fetching email_inbox:', error);
  } else {
    console.log('Total emails in local DB:', data.length);
    console.log('Emails:', data.map(d => ({
      email_id: d.email_id,
      from: d.from_email,
      subject: d.subject,
      received_at: d.received_at
    })));
  }
}

main();
