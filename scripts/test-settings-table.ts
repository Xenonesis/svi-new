import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env variables from .env.local in the workspace root
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

async function checkSettingsTable() {
  const { supabaseAdmin } = await import('../src/lib/supabase/admin.js');

  console.log('Checking portal_settings table status...');
  const { data, error } = await supabaseAdmin.from('portal_settings').select('*').limit(1);

  if (error) {
    console.error('Error querying portal_settings:', error.code, error.message);
    if (error.message?.includes('does not exist')) {
      console.log(
        '\nResult: The "portal_settings" table DOES NOT exist on the remote database yet.'
      );
    } else {
      console.log('\nResult: Query failed but table might exist or there is another issue.');
    }
  } else {
    console.log('Result: The "portal_settings" table exists and is fully accessible!');
    console.log('Data sample:', data);
  }
}

checkSettingsTable();
