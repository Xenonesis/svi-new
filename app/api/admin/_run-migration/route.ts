import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/src/lib/supabase/admin';
import { verifyAdmin } from '@/src/lib/supabase/verifyAdmin';

export async function GET(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const statements = [
      `CREATE TABLE IF NOT EXISTS contact_groups (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        description TEXT DEFAULT '',
        created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
      )`,
      `CREATE TABLE IF NOT EXISTS contact_group_members (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        group_id UUID REFERENCES contact_groups(id) ON DELETE CASCADE NOT NULL,
        contact_email TEXT NOT NULL,
        added_at TIMESTAMPTZ DEFAULT now(),
        UNIQUE(group_id, contact_email)
      )`,
      `ALTER TABLE contact_groups ENABLE ROW LEVEL SECURITY`,
      `ALTER TABLE contact_group_members ENABLE ROW LEVEL SECURITY`,
      `CREATE POLICY IF NOT EXISTS "Admins can manage groups"
        ON contact_groups FOR ALL
        USING (auth.jwt() ->> 'role' IN ('admin', 'service_role'))`,
      `CREATE POLICY IF NOT EXISTS "Admins can manage group members"
        ON contact_group_members FOR ALL
        USING (auth.jwt() ->> 'role' IN ('admin', 'service_role'))`,
    ];

    const results: { sql: string; ok: boolean; error?: string }[] = [];

    for (const sql of statements) {
      // Use raw query via supabaseAdmin (this uses service_role key)
      const { error } = await supabaseAdmin.from('_sql_migration').insert({ sql }).maybeSingle();

      // If table doesn't exist, try direct SQL via the JS client's .rpc
      if (error && error.code === '42P01') {
        // Try via rpc
        const rpcResult = await supabaseAdmin.rpc('exec_sql' as any, { query: sql }).maybeSingle();
        results.push({
          sql: sql.substring(0, 80),
          ok: !rpcResult.error,
          error: rpcResult.error?.message,
        });
      } else {
        results.push({
          sql: sql.substring(0, 80),
          ok: !error,
          error: error?.message,
        });
      }
    }

    // Try to create tables directly using the .from() API as a table existence test
    const { error: testErr } = await supabaseAdmin
      .from('contact_groups')
      .insert({ name: '_test', description: 'test' })
      .maybeSingle();

    // Cleanup test entry
    if (!testErr) {
      await supabaseAdmin.from('contact_groups').delete().eq('name', '_test');
      return NextResponse.json({
        ok: true,
        message: 'Tables created successfully',
        results,
      });
    }

    // If test insert failed, try running raw SQL via custom approach
    // Some Supabase projects have auto_exec_sql function
    const { error: rawErr } = await supabaseAdmin
      .rpc('exec_sql' as any, {
        query: `
        CREATE TABLE IF NOT EXISTS contact_groups (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name TEXT NOT NULL, description TEXT DEFAULT '', created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE, created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now());
        CREATE TABLE IF NOT EXISTS contact_group_members (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), group_id UUID REFERENCES contact_groups(id) ON DELETE CASCADE NOT NULL, contact_email TEXT NOT NULL, added_at TIMESTAMPTZ DEFAULT now(), UNIQUE(group_id, contact_email));
        ALTER TABLE contact_groups ENABLE ROW LEVEL SECURITY;
        ALTER TABLE contact_group_members ENABLE ROW LEVEL SECURITY;
      `,
      })
      .maybeSingle();

    return NextResponse.json({
      ok: !rawErr || !testErr,
      error: rawErr?.message || testErr?.message,
      results,
      rawError: rawErr?.message,
      testError: testErr?.message,
      manualSql: `
-- Run this in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/rfvhjgetfbalndgtkpaa/sql/new

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

ALTER TABLE contact_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_group_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Admins can manage groups"
  ON contact_groups FOR ALL
  USING (auth.jwt() ->> 'role' IN ('admin', 'service_role'));

CREATE POLICY IF NOT EXISTS "Admins can manage group members"
  ON contact_group_members FOR ALL
  USING (auth.jwt() ->> 'role' IN ('admin', 'service_role'));
`,
    });
  } catch (err: any) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
