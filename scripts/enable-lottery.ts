import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env variables from .env.local in the workspace root
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

async function enableLottery() {
  const { supabaseAdmin } = await import('../src/lib/supabase/admin.js');

  console.log('Upserting lottery_page_visible -> true in portal_settings...');
  const { data, error } = await supabaseAdmin
    .from('portal_settings')
    .upsert({ key: 'lottery_page_visible', value: true });

  if (error) {
    console.error('Error updating portal_settings:', error.code, error.message);
  } else {
    console.log('Successfully enabled lottery page visibility in remote DB!');
  }
}

enableLottery();
