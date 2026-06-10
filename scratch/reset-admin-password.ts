import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
  const email = 'admin@sviinfra.com';
  const newPassword = 'admin123';

  // Find user by email
  const { data: usersData, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) {
    console.error('Error listing users:', listError);
    return;
  }

  const user = usersData.users.find(u => u.email === email);
  if (!user) {
    console.log(`User ${email} not found in auth.users. Creating user...`);
    const { data: createData, error: createError } = await supabase.auth.admin.createUser({
      email,
      password: newPassword,
      email_confirm: true,
    });
    if (createError) {
      console.error('Error creating user:', createError);
      return;
    }
    console.log('User created:', createData.user?.id);
    
    // Check if profile exists
    const { data: profile } = await supabase.from('profiles').select('id').eq('email', email).maybeSingle();
    if (!profile) {
      const { error: profileError } = await supabase.from('profiles').insert({
        id: createData.user?.id,
        email,
        full_name: 'System Admin',
        role: 'admin'
      });
      if (profileError) {
        console.error('Error creating profile:', profileError);
      } else {
        console.log('Profile created successfully.');
      }
    }
  } else {
    console.log(`Found user ${email} with ID ${user.id}. Updating password...`);
    const { data: updateData, error: updateError } = await supabase.auth.admin.updateUserById(
      user.id,
      { password: newPassword }
    );
    if (updateError) {
      console.error('Error updating password:', updateError);
      return;
    }
    console.log('Password updated successfully.');
  }
}

run();
