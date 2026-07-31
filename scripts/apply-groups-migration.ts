import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const sql = `
-- Contact groups for email distribution lists
CREATE TABLE IF NOT EXISTS contact_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS contact_group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES contact_groups(id) ON DELETE CASCADE NOT NULL,
  contact_email TEXT NOT NULL,
  added_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(group_id, contact_email)
);

-- RLS
ALTER TABLE contact_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_group_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Admins can manage groups"
  ON contact_groups FOR ALL
  USING (auth.jwt() ->> 'role' IN ('admin', 'service_role'));

CREATE POLICY IF NOT EXISTS "Admins can manage group members"
  ON contact_group_members FOR ALL
  USING (auth.jwt() ->> 'role' IN ('admin', 'service_role'));
`;

async function main() {
  if (!supabaseUrl || !serviceRoleKey) {
    console.error('Missing env vars: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Execute SQL via rpc (requires pg_net extension or direct SQL)
  // Fallback: execute each statement individually through the REST API
  const statements = sql
    .split(';')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  for (const stmt of statements) {
    const { error } = await supabase.rpc('exec_sql' as any, { query: stmt + ';' }).maybeSingle();
    if (error) {
      // Try direct table creation approach instead
      console.log('RPC failed, trying direct approach...');
    }
  }

  // Direct approach: use REST API to create tables
  console.log('Creating contact_groups table...');
  const { error: err1 } = await supabase.from('contact_groups').insert({
    name: '_migration_test',
    description: 'temp entry to verify table exists',
  });

  if (err1 && err1.code === '42P01') {
    console.log('Table does not exist. Please run the migration SQL manually in Supabase Studio.');
    console.log('\nOpen: https://supabase.com/dashboard/project/rfvhjgetfbalndgtkpaa/sql/new');
    console.log('\nPaste this SQL:\n');
    console.log(sql);
  } else if (err1 && err1.code === '23505') {
    console.log('Migration already applied (table exists).');
  } else if (!err1) {
    console.log('Migration successful! Cleaning up test entry...');
    await supabase.from('contact_groups').delete().eq('name', '_migration_test');
    console.log('Done. Contact groups feature is ready.');
  } else {
    console.log('Unexpected error:', err1);
    console.log('\nManual migration SQL:\n', sql);
  }
}

main().catch(console.error);
