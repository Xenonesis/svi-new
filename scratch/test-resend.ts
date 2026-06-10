import { Resend } from 'resend';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const apiKey = process.env.RESEND_API_KEY;
if (!apiKey) {
  console.error('No RESEND_API_KEY found in .env.local');
  process.exit(1);
}

const resend = new Resend(apiKey);

async function main() {
  console.log('Fetching inbound emails via resend.emails.receiving.list()...');
  const resendEmails = await resend.emails.receiving.list();
  console.log('Response status/keys:', Object.keys(resendEmails));
  console.log('Full response:', JSON.stringify(resendEmails, null, 2));
}

main().catch(console.error);
