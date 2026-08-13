// Script to apply the quotation document_type DB migration
// Usage: node scripts/apply-quotation-migration.mjs

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const SQL_UP = `
  ALTER TABLE public.documents DROP CONSTRAINT IF EXISTS documents_document_type_check;
  ALTER TABLE public.documents ADD CONSTRAINT documents_document_type_check 
    CHECK (document_type IN ('allotment_letter', 'payment_receipt', 'payment_plan', 'offer_letter', 'bba', 'quotation'));
`;

async function run() {
  console.log('Applying migration: adding quotation to documents_document_type_check...');
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/execute_ddl`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_SERVICE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ sql: SQL_UP }),
  });

  const body = await res.text();
  if (!res.ok) {
    // Try alternative using the Supabase Management API
    console.log('RPC failed, trying test insert to verify current constraint state...');
    const testRes = await fetch(`${SUPABASE_URL}/rest/v1/documents`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_SERVICE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
      },
      body: JSON.stringify({
        document_type: 'quotation',
        user_id: '00000000-0000-0000-0000-000000000001',
      }),
    });
    const testBody = await testRes.json();
    if (testRes.ok) {
      console.log('✅ Quotation document type already accepted. Cleaning up test record...');
      const id = testBody[0].id;
      await fetch(`${SUPABASE_URL}/rest/v1/documents?id=eq.${id}`, {
        method: 'DELETE',
        headers: { apikey: SUPABASE_SERVICE_KEY, Authorization: `Bearer ${SUPABASE_SERVICE_KEY}` },
      });
    } else {
      console.log('❌ Quotation still rejected by constraint:', testBody.message);
      console.log('Please apply the migration manually through Supabase SQL editor:');
      console.log(SQL_UP);
    }
    return;
  }

  console.log('✅ Migration applied successfully:', body || 'OK');
}

run().catch(console.error);
