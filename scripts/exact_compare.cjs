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

function normPlot(p) {
  let s = String(p || '').trim().toLowerCase().replace(/[-\s+_]/g, '');
  // strip leading zero if purely numeric
  if (/^0\d+$/.test(s)) s = s.replace(/^0+/, '');
  return s;
}

async function exactCompare() {
  const [allots, profs, docs, scheds] = await Promise.all([
    fetch(SUPABASE_URL + '/rest/v1/allotments?select=*,profiles:user_id(*),properties:property_id(*)', { headers: { apikey: SUPABASE_KEY, Authorization: 'Bearer ' + SUPABASE_KEY } }).then(r => r.json()),
    fetch(SUPABASE_URL + '/rest/v1/profiles?select=*', { headers: { apikey: SUPABASE_KEY, Authorization: 'Bearer ' + SUPABASE_KEY } }).then(r => r.json()),
    fetch(SUPABASE_URL + '/rest/v1/documents?select=*', { headers: { apikey: SUPABASE_KEY, Authorization: 'Bearer ' + SUPABASE_KEY } }).then(r => r.json()),
    fetch(SUPABASE_URL + '/rest/v1/payment_schedules?select=*', { headers: { apikey: SUPABASE_KEY, Authorization: 'Bearer ' + SUPABASE_KEY } }).then(r => r.json())
  ]);

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile('SVI Payment Details.xlsx');
  const ws = workbook.worksheets[0];

  console.log('=== EXACT PLOT MATCHING: EXCEL vs SUPABASE DB ===\n');

  for (let r = 2; r <= ws.rowCount; r++) {
    const row = ws.getRow(r);
    const plot = cleanStr(row.getCell(3).value); // Col 3 is Plot number
    const plId = cleanStr(row.getCell(4).value); // Col 4 is PL ID / Ticket
    const name = cleanStr(row.getCell(7).value); // Col 7 is Full Name
    const email = cleanStr(row.getCell(8).value);
    const phone = cleanStr(row.getCell(9).value);
    const address = cleanStr(row.getCell(10).value);
    const advisor = cleanStr(row.getCell(12).value);
    const dealVal = cleanStr(row.getCell(5).value);
    const totalPaid = cleanStr(row.getCell(19).value);

    if (!plot && !name) continue;

    const matchedAllot = allots.find(a => {
      const u = normPlot(a.unit_no);
      const ep = normPlot(plot);
      if (u === ep) return true;
      if (ep.includes('134') && u.includes('134')) return true;
      if (ep.includes('181') && u.includes('181')) return true;
      if (ep.includes('221') && u.includes('221')) return true;
      if (ep.includes('126') && ep.includes('127') && u.includes('126') && u.includes('127')) return true;
      return false;
    });

    console.log(`[EXCEL ROW ${r}] Plot: "${plot}" | Name: "${name}" | Ticket: "${plId}"`);
    if (!matchedAllot) {
      console.log(`   ❌ NOT FOUND IN SUPABASE!`);
    } else {
      const p = matchedAllot.profiles || {};
      const m = matchedAllot.metadata || {};
      const dbTicket = m.ticket_id || m.ticketId || '';
      console.log(`   ✓ Matched Supabase Unit "${matchedAllot.unit_no}" (Client: "${p.full_name || m.client_name}")`);
      console.log(`     DB Ticket: "${dbTicket}" | Excel Ticket: "${plId}"`);
      console.log(`     DB Email: "${p.email}" | Excel Email: "${email}"`);
      console.log(`     DB Phone: "${p.phone}" | Excel Phone: "${phone}"`);
      console.log(`     DB Advisor: "${matchedAllot.advisor_name || m.advisor_name}" | Excel Advisor: "${advisor}"`);
      console.log(`     DB Meta Cost: "${m.total_cost}" | Excel BSP/Cost: "${dealVal}"`);
    }
  }

  console.log('\n=== SUPABASE ALLOTMENTS NOT IN EXCEL ===');
  allots.forEach(a => {
    const u = normPlot(a.unit_no);
    let found = false;
    for (let r = 2; r <= ws.rowCount; r++) {
      const ep = normPlot(ws.getRow(r).getCell(3).value);
      if (u === ep || (ep.includes('134') && u.includes('134')) || (ep.includes('181') && u.includes('181')) || (ep.includes('221') && u.includes('221')) || (ep.includes('126') && ep.includes('127') && u.includes('126') && u.includes('127'))) {
        found = true;
        break;
      }
    }
    if (!found) {
      console.log(`   Unit: "${a.unit_no}" | Client: "${a.profiles?.full_name}" | Ticket: "${a.metadata?.ticket_id}"`);
    }
  });
}

exactCompare().catch(console.error);
