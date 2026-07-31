import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;

async function run() {
  const supabase = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Try direct SQL execution via the Supabase Database REST API
  // Some Supabase projects support /sql endpoint with service_role key
  const ref = url.match(/https:\/\/(.+)\.supabase\.co/)?.[1];
  console.log('Project ref:', ref);

  // Read migration file
  const sql = fs.readFileSync(
    path.resolve(__dirname, '../supabase/migrations/20260602010000_create_contact_groups.sql'),
    'utf-8'
  );

  // Try hitting the database directly with the service role key
  // via the postgREST API with a raw function call
  // First, try creating the tables via a direct SQL approach

  // Option 1: Use the `auth` schema to execute SQL (JWT functions have access)
  // Option 2: Try the Supabase internal endpoint
  // Option 3: Use direct PG connection through pooler

  // Try direct PG connection via the pooler
  // Format: postgresql://postgres.{ref}:{password}@aws-0-{region}.pooler.supabase.com:6543/postgres
  // The service_role key can be used as the password

  const region = 'us-east-1'; // Default Supabase region
  const connectionString = `postgresql://postgres.${ref}:${encodeURIComponent(key)}@aws-0-${region}.pooler.supabase.com:6543/postgres`;

  console.log('Trying direct PG connection via pooler...');
  console.log('Connection string (hidden):', connectionString.replace(key, '***'));

  try {
    // @ts-ignore — pg is an optional runtime dep for standalone scripts
    // Use dynamic import for pg
    const { default: pg } = await import('pg');
    const client = new pg.Client({ connectionString });
    await client.connect();
    console.log('Connected!');

    // Execute the migration SQL
    await client.query(sql);
    console.log('Migration SQL executed successfully!');

    // Verify
    const { rows } = await client.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('contact_groups', 'contact_group_members')"
    );
    console.log('Created tables:', rows.map((r: any) => r.table_name).join(', '));

    await client.end();
  } catch (err: any) {
    console.error('PG connection failed:', err.message);
    console.log('\nPlease run the migration manually in Supabase SQL Editor:');
    console.log('https://supabase.com/dashboard/project/' + ref + '/sql/new');
    console.log('\nSQL to execute:\n');
    console.log(sql);
  }
}

run().catch(console.error);
