const SUPABASE_URL = 'https://rfvhjgetfbalndgtkpaa.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmdmhqZ2V0ZmJhbG5kZ3RrcGFhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODk5Njc0MSwiZXhwIjoyMDk0NTcyNzQxfQ.kqsfbfNmq6oVspQ3LyEfdo97r0UixG1L2lrCPY-9zJY';

async function printAllAllotments() {
  const [allots, profs] = await Promise.all([
    fetch(SUPABASE_URL + '/rest/v1/allotments?select=*,profiles:user_id(*),properties:property_id(*)', { headers: { apikey: SUPABASE_KEY, Authorization: 'Bearer ' + SUPABASE_KEY } }).then(r => r.json()),
    fetch(SUPABASE_URL + '/rest/v1/profiles?select=*', { headers: { apikey: SUPABASE_KEY, Authorization: 'Bearer ' + SUPABASE_KEY } }).then(r => r.json())
  ]);

  console.log('Total allotments:', allots.length);
  allots.forEach((a, idx) => {
    const p = a.profiles || {};
    const meta = a.metadata || {};
    console.log(`\n[${idx + 1}] ID: ${a.id} | Unit: ${a.unit_no}`);
    console.log(`    Client Name: ${p.full_name || meta.client_name}`);
    console.log(`    Ticket ID: ${meta.ticket_id || meta.ticketId || 'NONE'}`);
    console.log(`    Status: ${a.status} | Mode: ${meta.allotment_mode || meta.allotmentMode || a.booking_type || meta.sale_type}`);
    console.log(`    Booking Date: ${a.allotted_date || meta.booking_date || a.booking_date} | Draw Date: ${meta.draw_date || meta.drawDate}`);
    console.log(`    Allotment Date: ${meta.allotment_date || meta.allotmentDate}`);
    console.log(`    Total Cost: ${a.total_cost} | Meta Cost: ${meta.total_cost} | Area: ${a.area || meta.area}`);
    console.log(`    Email: ${p.email} | Phone: ${p.phone}`);
    console.log(`    Advisor: ${a.advisor_name || meta.advisor_name || meta.advisorName}`);
    console.log(`    Notes/Address: ${p.notes || meta.address}`);
  });
}

printAllAllotments().catch(console.error);
