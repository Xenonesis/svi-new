const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const { Resend } = require('resend');

// Load environment variables from .env.local
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let value = match[2] ? match[2].trim() : '';
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.substring(1, value.length - 1);
    }
    env[match[1]] = value;
  }
});

const supabaseUrl = env['NEXT_PUBLIC_SUPABASE_URL'];
const serviceRoleKey = env['SUPABASE_SERVICE_ROLE_KEY'];
const resendApiKey = env['RESEND_API_KEY'];

console.log('Supabase URL:', supabaseUrl);
console.log('Resend Key exists:', !!resendApiKey);

async function test() {
  const supabase = createClient(supabaseUrl, serviceRoleKey);
  const resend = new Resend(resendApiKey);

  console.log('\n--- FETCHING FROM SUPABASE (email_inbox) ---');
  const { data: dbEmails, error: dbError } = await supabase
    .from('email_inbox')
    .select('id, email_id, subject, from_email, received_at')
    .order('received_at', { ascending: false });

  if (dbError) {
    console.error('Supabase error:', dbError);
  } else {
    console.log(`Found ${dbEmails.length} emails in Supabase email_inbox table:`);
    dbEmails.forEach(e => {
      console.log(`- DB ID: ${e.id} | Email ID: ${e.email_id} | From: ${e.from_email} | Subject: ${e.subject} | Received At: ${e.received_at}`);
    });
  }

  console.log('\n--- FETCHING FROM RESEND (receiving.list) ---');
  try {
    const resendEmails = await resend.emails.receiving.list();
    if (resendEmails.error) {
      console.error('Resend error:', resendEmails.error);
    } else {
      const data = resendEmails.data?.data || resendEmails.data || [];
      console.log(`Found ${data.length} emails in Resend receiving:`);
      data.forEach(e => {
        console.log(`- Resend ID: ${e.id} | From: ${e.from} | Subject: ${e.subject} | Created At: ${e.created_at}`);
      });
    }
  } catch (err) {
    console.error('Resend exception:', err);
  }
}

test().catch(console.error);
