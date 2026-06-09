import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const EMAIL = 'admin@sviinfra.com';
const PASSWORD = 'AdminPass123!';

async function main() {
  console.log('🔧 Setting up admin user...\n');

  // Find existing user
  const { data: users } = await supabase.auth.admin.listUsers();
  const existing = users?.users.find((u) => u.email === EMAIL);

  if (existing) {
    console.log('✅ Auth user found, updating password...');
    const { error: updateError } = await supabase.auth.admin.updateUserById(existing.id, {
      password: PASSWORD,
    });
    if (updateError) throw updateError;
    console.log('✅ Password updated');
    await upsertProfile(existing.id);
  } else {
    console.log('Creating new auth user...');
    const { data, error } = await supabase.auth.admin.createUser({
      email: EMAIL,
      password: PASSWORD,
      email_confirm: true,
      user_metadata: { full_name: 'System Admin' },
    });
    if (error) throw error;
    console.log('✅ Auth user created');
    const uid = data.user?.id;
    if (!uid) {
      console.error('❌ No user ID returned');
      process.exit(1);
    }
    await upsertProfile(uid);
  }
}

async function upsertProfile(userId: string) {
  const { error } = await supabase.from('profiles').upsert(
    {
      id: userId,
      email: EMAIL,
      full_name: 'System Admin',
      role: 'admin',
    },
    { onConflict: 'id' }
  );

  if (error) {
    console.error('❌ Profile error:', error.message);
    console.log(
      '\n👉 Pehle migration.sql SQL Editor mein run karo, phir yeh script dobara chalao.'
    );
    process.exit(1);
  }

  console.log('✅ Profile created with admin role');
  console.log('\n📋 Login Credentials:');
  console.log('   Email:    admin@sviinfra.com');
  console.log('   Password: AdminPass123!');
  console.log('   Role:     admin\n');
}

main();
