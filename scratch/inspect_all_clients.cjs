const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
  const { data: allotments } = await sb.from('allotments').select('id, user_id, unit_no, metadata');
  const { data: profiles } = await sb.from('profiles').select('id, full_name, email, real_email, phone, notes');
  const profMap = new Map(profiles.map(p => [p.id, p]));

  const clientList = [
    'PL2075', 'PL2077', 'PL2076', 'PL2050', 'PL2066', 'PL2065', 'PL2080',
    'SVI002023', 'PL2081', 'PL2078', 'PL2006', 'PL2126', 'PL2221',
    'SVI002025', 'SVI002106', 'PL2181', 'SVI002050', 'SVI002051', 'SVI002134'
  ];

  console.log('Total allotments:', allotments?.length);
  for (const ref of clientList) {
    const norm = ref.toLowerCase().replace(/[^a-z0-9]/g, '');
    const matched = allotments.filter(a => {
      const meta = a.metadata || {};
      const tid = String(meta.ticket_id || meta.ticketId || meta.refId || meta.ref_id || a.id).toLowerCase().replace(/[^a-z0-9]/g, '');
      return tid === norm;
    });

    console.log(`\n--- Ref: ${ref} (Matches: ${matched.length}) ---`);
    for (const m of matched) {
      const p = profMap.get(m.user_id);
      console.log('Allotment ID:', m.id, 'Unit:', m.unit_no);
      console.log('Allotment meta:', {
        client_name: m.metadata?.client_name,
        client_phone: m.metadata?.client_phone,
        client_email: m.metadata?.client_email,
        client_address: m.metadata?.client_address || m.metadata?.address,
      });
      console.log('Profile:', p ? {
        id: p.id,
        full_name: p.full_name,
        email: p.email,
        real_email: p.real_email,
        phone: p.phone,
        notes: p.notes
      } : 'NO PROFILE');
    }
  }
}
check();
