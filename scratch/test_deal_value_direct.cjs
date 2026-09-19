const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

function normalizeRefId(str) {
  return String(str || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

async function test(refId) {
  const norm = normalizeRefId(refId);

  const { data: allAllotments } = await sb
    .from('allotments')
    .select('id, user_id, metadata, unit_no');

  let matchedMeta = null;
  let unitNo = null;
  let matchedUserId = null;

  if (allAllotments && allAllotments.length > 0) {
    const match = allAllotments.find((a) => {
      const meta = a.metadata || {};
      const tId = meta.ticket_id || meta.ticketId || meta.refId || meta.ref_id || a.id;
      return normalizeRefId(String(tId)) === norm;
    });
    if (match) {
      matchedMeta = match.metadata || {};
      unitNo = match.unit_no || null;
      matchedUserId = match.user_id || null;
    }
  }

  let clientPhone = matchedMeta?.client_phone || '';
  let clientEmail = matchedMeta?.client_email || '';
  let clientAddress = matchedMeta?.client_address || matchedMeta?.address || '';

  if ((!clientPhone || !clientEmail || !clientAddress) && matchedUserId) {
    const { data: prof } = await sb
      .from('profiles')
      .select('phone, real_email, email, notes')
      .eq('id', matchedUserId)
      .maybeSingle();
    if (prof) {
      if (!clientPhone && prof.phone) clientPhone = prof.phone;
      if (!clientEmail && (prof.real_email || prof.email)) clientEmail = prof.real_email || prof.email;
      if (!clientAddress && prof.notes) {
        const matchAddr = prof.notes.match(/Address:\s*(.+)$/i);
        if (matchAddr) clientAddress = matchAddr[1].trim();
      }
    }
  }

  console.log(`Result for ${refId}:`, {
    unitNo,
    clientPhone,
    clientEmail,
    clientAddress,
    total_cost: matchedMeta?.total_cost
  });
}

async function run() {
  await test('PL2076'); // Akshat Pardeshi (from screenshot)
  await test('PL2050'); // Manish (Refund Done)
  await test('PL2081'); // Reena Nagar (Refund Done)
  await test('PL2075'); // Kundan Kumar
  await test('SVI002051'); // Rishu Mishra
  await test('SVI002134'); // Abhilasha Varma
}
run();
