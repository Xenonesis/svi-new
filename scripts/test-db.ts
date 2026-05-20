import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env variables from .env.local in the workspace root
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

async function runDiagnostics() {
  console.log('--- Database Diagnostics ---');
  console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
  console.log(
    'Supabase Publishable Key:',
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ? 'Present' : 'Missing'
  );
  console.log(
    'Supabase Anon Key:',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Present' : 'Missing'
  );

  // Dynamically import client.ts AFTER dotenv has loaded the env variables
  const { supabase } = await import('../src/lib/supabase/client.js');

  try {
    // 1. Try to query public.profiles
    console.log('\nQuerying public.profiles...');
    const { data: profiles, error: pError } = await supabase.from('profiles').select('*').limit(5);

    if (pError) {
      console.error('Error querying profiles:', pError);
    } else {
      console.log('Profiles query successful! Found profiles:', profiles?.length || 0);
      console.log(JSON.stringify(profiles, null, 2));
    }

    // 2. Try to list standard Auth configuration status
    console.log('\nTesting Auth client session...');
    const { data: sessionData, error: sError } = await supabase.auth.getSession();
    if (sError) {
      console.error('Error getting session:', sError);
    } else {
      console.log(
        'Session fetched successfully! Current user:',
        sessionData.session?.user?.email || 'None (No active session)'
      );
    }
  } catch (err) {
    console.error('Unexpected exception during diagnostics:', err);
  }
}

runDiagnostics();
