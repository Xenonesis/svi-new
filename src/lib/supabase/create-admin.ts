import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env variables from .env.local
dotenv.config({ path: path.resolve(__dirname, '../../../.env.local') });

async function createAdmin() {
  console.log('=== SVI Infra Solutions: Admin Account Setup ===');
  console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);

  const { supabase } = await import('./client.js');

  const email = 'admin@sviinfra.com';
  const password = process.env.ADMIN_PASSWORD;

  if (!password) {
    console.error('\n❌ ADMIN_PASSWORD environment variable is not set.');
    console.log('Set it in .env.local before running this script.');
    process.exit(1);
  }

  console.log(`\nRegistering user ${email} via official Supabase Auth API...`);

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: 'System Admin',
      },
    },
  });

  if (error) {
    console.error('\n❌ Failed to register user:', error.message);
    if (error.message.includes('already registered') || error.message.includes('Database error')) {
      console.log(
        '\n💡 Tip: Please run the clean-up SQL query in your Supabase SQL Editor first, to remove the corrupted manually-inserted rows.'
      );
    }
    return;
  }

  console.log('\n✅ User successfully created in Supabase Auth!');
  console.log('User ID:', data.user?.id);
  console.log('Confirmation Status:', data.user?.email_confirmed_at ? 'Confirmed' : 'Pending');

  console.log('\n======================================================');
  console.log('👉 FINAL STEP: RUN THIS SQL IN YOUR SUPABASE DASHBOARD:');
  console.log('======================================================');
  console.log(`
-- 1. Ensure the profile exists and set its role to 'admin'
UPDATE public.profiles 
SET role = 'admin', 
    full_name = 'System Admin' 
WHERE email = '${email}';

-- 2. (Optional) Force-confirm their email in auth.users if needed
UPDATE auth.users 
SET email_confirmed_at = now(), 
    confirmed_at = now() 
WHERE email = '${email}';
  `);
  console.log('======================================================');
}

createAdmin();
