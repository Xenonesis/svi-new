import { Resend } from 'resend';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const resend = new Resend(process.env.RESEND_API_KEY);

async function main() {
  try {
    const response = await resend.emails.receiving.list();
    console.log('Receiving emails:', JSON.stringify(response, null, 2));
  } catch (error) {
    console.error('Error calling list:', error);
  }
}

main();
