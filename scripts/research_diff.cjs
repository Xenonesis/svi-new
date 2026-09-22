const ExcelJS = require('exceljs');
const SUPABASE_URL = 'https://rfvhjgetfbalndgtkpaa.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmdmhqZ2V0ZmJhbG5kZ3RrcGFhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODk5Njc0MSwiZXhwIjoyMDk0NTcyNzQxfQ.kqsfbfNmq6oVspQ3LyEfdo97r0UixG1L2lrCPY-9zJY';

function cleanStr(val) {
  if (val === null || val === undefined) return '';
  if (typeof val === 'object') {
    if (val.result !== undefined) return String(val.result).trim();
    if (val.richText) return val.richText.map(t => t.text).join('').trim();
    if (val.text !== undefined) return String(val.text).trim();
  }
  return String(val).trim();
}

async function research() {
  const [allots, profs, docs, scheds] = await Promise.all([
    fetch(SUPABASE_URL + '/rest/v1/allotments?select=*,profiles:user_id(*),properties:property_id(*)', { headers: { apikey: SUPABASE_KEY, Authorization: 'Bearer ' + SUPABASE_KEY } }).then(r => r.json()),
    fetch(SUPABASE_URL + '/rest/v1/profiles?select=*', { headers: { apikey: SUPABASE_KEY, Authorization: 'Bearer ' + SUPABASE_KEY } }).then(r => r.json()),
    fetch(SUPABASE_URL + '/rest/v1/documents?select=*', { headers: { apikey: SUPABASE_KEY, Authorization: 'Bearer ' + SUPABASE_KEY } }).then(r => r.json()),
    fetch(SUPABASE_URL + '/rest/v1/payment_schedules?select=*', { headers: { apikey: SUPABASE_KEY, Authorization: 'Bearer ' + SUPABASE_KEY } }).then(r => r.json())
  ]);

  console.log('=== CURRENT SUPABASE ALLOTMENTS (Total: ' + allots.length + ') ===');
  for (const a of allots) {
    const p = a.profiles || {};
    const meta = a.metadata || {};
    console.log(JSON.stringify({
      id: a.id,
      unit_no: a.unit_no,
      status: a.status,
      client_name: p.full_name || meta.client_name,
      email: p.email,
      phone: p.phone,
      total_cost: a.total_cost,
      ticket_id: meta.ticket_id || meta.ticketId,
      advisor: meta.advisor_name || a.advisor_name,
      notes: p.notes,
      booking_date: a.allotted_date || meta.booking_date
    }));
  }

  // Load Excel
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile('SVI Payment Details.xlsx');
  const ws = workbook.worksheets[0];
  console.log('\n=== SVI PAYMENT DETAILS.XLSX (Sheet: ' + ws.name + ', Rows: ' + ws.rowCount + ') ===');

  const excelRows = [];
  ws.eachRow((row, rowNumber) => {
    const vals = row.values;
    excelRows.push({
      rowNumber,
      sr: cleanStr(vals[1]),
      name: cleanStr(vals[2]),
      plot: cleanStr(vals[3]),
      size: cleanStr(vals[4]),
      dealValue: cleanStr(vals[5]),
      rate: cleanStr(vals[6]),
      advisor: cleanStr(vals[7]),
      email: cleanStr(vals[8]),
      phone: cleanStr(vals[9]),
      address: cleanStr(vals[10]),
      bookingDate: cleanStr(vals[11]),
      mode: cleanStr(vals[12]),
      drawDate: cleanStr(vals[13]),
      allotmentDate: cleanStr(vals[14]),
      totalPaid: cleanStr(vals[19]),
      ticketId: cleanStr(vals[20])
    });
  });

  console.log('Total rows parsed:', excelRows.length);
  console.log('First 5 excel rows:', JSON.stringify(excelRows.slice(0, 5), null, 2));

  // Also inspect payment schedules in DB
  console.log('\n=== CURRENT SUPABASE PAYMENT SCHEDULES (Total: ' + scheds.length + ') ===');
  const schedsByAllotment = {};
  for (const s of scheds) {
    if (!schedsByAllotment[s.allotment_id]) schedsByAllotment[s.allotment_id] = [];
    schedsByAllotment[s.allotment_id].push(s);
  }
  for (const [allotId, slist] of Object.entries(schedsByAllotment)) {
    const allot = allots.find(a => a.id === allotId);
    console.log('Allotment ' + (allot ? allot.unit_no : allotId) + ' has ' + slist.length + ' schedules:');
    for (const s of slist) {
      console.log('   milestone:', s.milestone_name || s.installment_number, 'amount:', s.amount, 'due:', s.due_date, 'status:', s.status, 'paid_at:', s.paid_at);
    }
  }
}

research().catch(console.error);
