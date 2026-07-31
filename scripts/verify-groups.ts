import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: require('path').resolve(__dirname, '../.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const { data, error } = await supabase
  .from('contact_groups')
  .insert({ name: 'verify-migration' })
  .select()
  .maybeSingle();
if (error) {
  console.log('❌ FAILED:', error.message);
  process.exit(1);
}
console.log('✅ contact_groups table working!');
await supabase.from('contact_groups').delete().eq('id', data.id);
console.log('✅ Migration verified. Groups feature ready.');
