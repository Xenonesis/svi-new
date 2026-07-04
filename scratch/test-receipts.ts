import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function check() {
  const { data, error } = await supabase
    .from('documents')
    .select('id, document_type, created_at, form_data')
    .eq('document_type', 'payment_receipt')
    .order('created_at', { ascending: false })
    .limit(5);

  if (error) {
    console.error('Error fetching receipts:', error);
  } else {
    console.log('Latest 5 receipt records:');
    data.forEach((doc) => {
      console.log(`ID: ${doc.id}, Created At: ${doc.created_at}`);
      console.log('Form Data:', JSON.stringify(doc.form_data, null, 2));
      console.log('---');
    });
  }
}

check();
