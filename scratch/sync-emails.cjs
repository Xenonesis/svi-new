const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const { Resend } = require('resend');

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

async function sync() {
  const supabase = createClient(supabaseUrl, serviceRoleKey);
  const resend = new Resend(resendApiKey);

  console.log('Fetching receiving list from Resend...');
  const resendEmails = await resend.emails.receiving.list();
  if (resendEmails.error) {
    console.error('Resend error:', resendEmails.error);
    return;
  }

  const emails = resendEmails.data?.data || resendEmails.data || [];
  console.log(`Found ${emails.length} emails in Resend receiving.`);

  for (const e of emails) {
    const emailId = e.id;
    console.log(`Checking email ${emailId} (${e.subject})...`);

    // Check duplicate
    const { data: existing, error: checkError } = await supabase
      .from('email_inbox')
      .select('id')
      .eq('email_id', emailId)
      .maybeSingle();

    if (checkError) {
      console.error(`Error checking duplicate for ${emailId}:`, checkError);
      continue;
    }

    if (existing) {
      console.log(`Email ${emailId} already exists in database.`);
      continue;
    }

    console.log(`Email ${emailId} is missing. Fetching full content from Resend...`);
    const { data: emailData, error: fetchError } = await resend.emails.receiving.get(emailId);
    if (fetchError) {
      console.error(`Error fetching email details for ${emailId}:`, fetchError);
      continue;
    }

    // Extract sender name and email
    const fromRaw = emailData.from || '';
    let fromEmail = fromRaw;
    let fromName = '';
    const nameMatch = fromRaw.match(/^"?([^"<]*)"?\s*<([^>]+)>/);
    if (nameMatch) {
      fromName = nameMatch[1].trim();
      fromEmail = nameMatch[2].trim();
    }

    // Extract recipient emails
    const toEmails = [];
    const rawTo = emailData.to || [];
    (Array.isArray(rawTo) ? rawTo : [rawTo]).forEach((addr) => {
      const m = addr.match(/<([^>]+)>/);
      toEmails.push(m ? m[1] : addr);
    });

    const insertData = {
      email_id: emailId,
      thread_id: emailData.thread_id || emailData.message_id || emailId,
      subject: emailData.subject || '(No Subject)',
      from_email: fromEmail,
      from_name: fromName || null,
      to_emails: toEmails,
      html_content: emailData.html || null,
      text_content: emailData.text || null,
      received_at: emailData.created_at || new Date().toISOString(),
      status: 'received',
    };

    console.log(`Inserting email ${emailId} into database...`);
    const { error: insertError } = await supabase.from('email_inbox').insert(insertData);
    if (insertError) {
      console.error(`Failed to insert email ${emailId}:`, insertError);
      if (insertError.message?.includes('column "from_name" of relation')) {
        console.log('Retrying without from_name...');
        const { error: insertError2 } = await supabase.from('email_inbox').insert({
          ...insertData,
          from_name: undefined,
        });
        if (insertError2) {
          console.error(`Failed to insert email ${emailId} without from_name:`, insertError2);
        } else {
          console.log(`Successfully inserted email ${emailId} without from_name.`);
        }
      }
    } else {
      console.log(`Successfully inserted email ${emailId}.`);
    }
  }
}

sync().catch(console.error);
