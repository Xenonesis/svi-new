const SUPABASE_URL = 'https://rfvhjgetfbalndgtkpaa.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmdmhqZ2V0ZmJhbG5kZ3RrcGFhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODk5Njc0MSwiZXhwIjoyMDk0NTcyNzQxfQ.kqsfbfNmq6oVspQ3LyEfdo97r0UixG1L2lrCPY-9zJY';

async function checkRecent() {
  const [allots, scheds, docs, profs] = await Promise.all([
    fetch(SUPABASE_URL + '/rest/v1/allotments?select=*&order=updated_at.desc', { headers: { apikey: SUPABASE_KEY, Authorization: 'Bearer ' + SUPABASE_KEY } }).then(r => r.json()),
    fetch(SUPABASE_URL + '/rest/v1/payment_schedules?select=*&order=created_at.desc', { headers: { apikey: SUPABASE_KEY, Authorization: 'Bearer ' + SUPABASE_KEY } }).then(r => r.json()),
    fetch(SUPABASE_URL + '/rest/v1/documents?select=*&order=created_at.desc&limit=20', { headers: { apikey: SUPABASE_KEY, Authorization: 'Bearer ' + SUPABASE_KEY } }).then(r => r.json()),
    fetch(SUPABASE_URL + '/rest/v1/profiles?select=*&order=updated_at.desc&limit=20', { headers: { apikey: SUPABASE_KEY, Authorization: 'Bearer ' + SUPABASE_KEY } }).then(r => r.json())
  ]);

  console.log('=== ALLOTMENTS SORTED BY UPDATED_AT ===');
  allots.forEach(a => {
    console.log(`Unit: ${a.unit_no} | updated_at: ${a.updated_at} | created_at: ${a.created_at} | ticket: ${a.metadata?.ticket_id}`);
  });

  console.log('\n=== RECENT PAYMENT SCHEDULES ===');
  scheds.slice(0, 15).forEach(s => {
    console.log(`Allotment: ${s.allotment_id} | amount: ${s.amount} | due: ${s.due_date} | created_at: ${s.created_at}`);
  });

  console.log('\n=== RECENT DOCUMENTS ===');
  docs.slice(0, 15).forEach(d => {
    console.log(`Doc ID: ${d.id} | type: ${d.document_type} | refId: ${d.form_data?.refId} | plot: ${d.form_data?.plotNo} | amount: ${d.form_data?.amount} | created_at: ${d.created_at}`);
  });
}

checkRecent().catch(console.error);
