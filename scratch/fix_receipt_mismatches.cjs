const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function cleanAndFix() {
  console.log('--- 1. FIXING SHYAM MOHAN SHARMA RECEIPTS ---');
  // Re-assign SVI-PL2221-1 and SVI-PL2221-2
  const { data: shyamRecs } = await supabase.from('documents').select('id, form_data').in('id', [
    'bf40084b-8f50-4535-99b2-e813f5e950f4',
    '11eaf34f-e17d-4805-8a97-3f22fbce673a'
  ]);

  for (const doc of shyamRecs || []) {
    const fd = {
      ...doc.form_data,
      refId: 'PL2221',
      name: 'Shyam mohan sharma',
      plotNo: 'A-221 and A-222',
      advisorName: 'Ananya + Knowledge'
    };
    await supabase.from('documents').update({
      form_data: fd,
      metadata: { ticket_id: 'PL2221', client_name: 'Shyam mohan sharma', installment_type: fd.installmentType }
    }).eq('id', doc.id);
    console.log(`Updated Shyam receipt ${doc.id}`);
  }

  console.log('\n--- 2. FIXING SUNIL BHATNAGAR 10% RECEIPT ---');
  // Re-assign 36d465ec-1c60-4f2e-ae1e-e0f147e02851 to Sunil Bhatnagar PL2006
  const { data: sunilDoc } = await supabase.from('documents').select('id, form_data').eq('id', '36d465ec-1c60-4f2e-ae1e-e0f147e02851').single();
  if (sunilDoc) {
    const fd = {
      ...sunilDoc.form_data,
      refId: 'PL2006',
      name: 'Sunil Bhatnagar',
      plotNo: '6',
      advisorName: 'Akash yadav+ Arwaz'
    };
    await supabase.from('documents').update({
      form_data: fd,
      metadata: { ticket_id: 'PL2006', client_name: 'Sunil Bhatnagar', installment_type: '10% Payment' }
    }).eq('id', sunilDoc.id);
    console.log(`Updated Sunil receipt ${sunilDoc.id}`);
  }

  console.log('\n--- 3. REMOVING DUPLICATE/ORPHANED OLD TEST RECEIPTS ---');
  const duplicateDocIds = [
    '3bf749c2-f16e-4fac-8eed-eeef9750e971', // old partial EMI 24063 for Shantanu Joshi
    '8a140284-f629-4787-bf33-b48c3940467e', // old duplicate EMI 13125 for Akshat Pardeshi
    'e2a8a21a-59d7-4fc0-ad73-22b3fbe79dd6', // old duplicate EMI 13125 for Akshat Pardeshi
    'bd5ba976-24b0-4f78-953e-c5f84951ebc3', // old duplicate EMI 16042 for Piyush Sharma
    'bb67597b-a743-4b96-8ea2-a53325203728', // old duplicate EMI 16042 for Rishu Mishra
  ];

  for (const id of duplicateDocIds) {
    const { error: delErr } = await supabase.from('documents').delete().eq('id', id);
    if (!delErr) console.log(`Deleted duplicate receipt: ${id}`);
  }

  console.log('\nFix complete. Running verification next.');
}

cleanAndFix().catch(console.error);
