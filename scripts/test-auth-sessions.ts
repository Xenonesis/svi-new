import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env variables from .env.local in the workspace root
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

async function checkSessions() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

  const authClient = createClient(supabaseUrl, supabaseServiceKey, {
    db: {
      schema: 'auth',
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  console.log('Querying auth.sessions table...');
  const { data, error } = await authClient.from('sessions').select('*');

  if (error) {
    console.error('Error querying auth.sessions:', error.code, error.message);
  } else {
    console.log('Successfully queried auth.sessions! Found sessions:', data);
  }
}

checkSessions();
