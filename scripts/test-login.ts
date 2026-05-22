import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env variables from .env.local in the workspace root
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

async function runTest() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  console.log('Initializing Supabase client...');
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
    },
  });

  console.log('Attempting authentication with sviiinfrasolutions@gmail.com...');
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'sviiinfrasolutions@gmail.com',
    password: 'Admin@2026Secure!',
  });

  if (authError) {
    console.error('Authentication FAILED:', authError.message);
    return;
  }

  const session = authData.session;
  if (!session) {
    console.error('Authentication succeeded, but no session returned!');
    return;
  }

  console.log('Authentication SUCCESSFUL!');
  console.log(`User ID: ${session.user.id}`);
  console.log(`Email: ${session.user.email}`);

  const token = session.access_token;
  const ports = ['38744', '3000'];

  for (const port of ports) {
    const localApiUrl = `http://localhost:${port}/api/admin/settings?key=company_info`;
    console.log(`\nFetching local portal settings from ${localApiUrl} using Bearer token...`);

    try {
      const res = await fetch(localApiUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errText = await res.text();
        console.error(
          `Request to port ${port} FAILED with status ${res.status}:`,
          errText.substring(0, 100)
        );
        continue;
      }

      const settingsData = await res.json();
      console.log(`SUCCESS ON PORT ${port}!`);
      console.log('Settings Value Returned:', JSON.stringify(settingsData, null, 2));
      return;
    } catch (err: any) {
      console.error(`Failed to connect to port ${port}:`, err.message);
    }
  }
}

runTest();
